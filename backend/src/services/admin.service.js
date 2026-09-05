import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { sanitizeUser } from '../utils/userSerializer.js';
import { getPaginationParams, formatPaginatedMeta, getSortParams } from '../utils/queryParser.js';
import { validatePasswordComplexity } from '../utils/validators.js';

const ALLOWED_ROLES = ['ADMIN', 'USER', 'STORE_OWNER'];
const ALLOWED_USER_SORT_FIELDS = ['name', 'email', 'address', 'role', 'createdAt'];
const ALLOWED_STORE_SORT_FIELDS = ['name', 'email', 'address', 'createdAt'];

export class AdminService {
  /**
   * Admin creates a new user of any valid system role (USER, ADMIN, STORE_OWNER).
   * @param {Object} payload - { name, email, address, password, role }
   */
  static async createUserByAdmin(payload) {
    const { name, email, address, password, role } = payload || {};
    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Name is required');
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      errors.push('Valid email address is required');
    }
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      errors.push('Address is required');
    }
    if (!role || !ALLOWED_ROLES.includes(role)) {
      errors.push(`Role must be one of: ${ALLOWED_ROLES.join(', ')}`);
    }

    validatePasswordComplexity(password, errors);

    if (errors.length > 0) {
      throw ApiError.unprocessableEntity('Admin user creation validation failed', errors);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate email
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw ApiError.conflict('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        address: address.trim(),
        passwordHash,
        role,
      },
    });

    return sanitizeUser(newUser);
  }

  /**
   * Admin lists users with filtering, sorting, and pagination.
   * @param {Object} query - Express request query parameters
   */
  static async getUsers(query) {
    const { page, limit, skip, take } = getPaginationParams(query);
    const { orderBy } = getSortParams(query, ALLOWED_USER_SORT_FIELDS, 'createdAt', 'desc');

    // Build filter conditions
    const where = {};

    if (query.name) {
      where.name = { contains: String(query.name).trim(), mode: 'insensitive' };
    }
    if (query.email) {
      where.email = { contains: String(query.email).trim(), mode: 'insensitive' };
    }
    if (query.address) {
      where.address = { contains: String(query.address).trim(), mode: 'insensitive' };
    }
    if (query.role && ALLOWED_ROLES.includes(query.role)) {
      where.role = query.role;
    }
    if (query.search) {
      const searchTerm = String(query.search).trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [totalCount, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
    ]);

    const sanitizedUsers = sanitizeUser(users);
    const meta = formatPaginatedMeta(totalCount, page, limit);

    return { items: sanitizedUsers, meta };
  }

  /**
   * Retrieves single user details by ID.
   * @param {string} userId - User ID
   */
  static async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedStores: {
          select: { id: true, name: true, address: true },
        },
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return sanitizeUser(user);
  }

  /**
   * Admin creates a new store assigned to a Store Owner.
   * @param {Object} payload - { name, email, address, description, ownerId }
   */
  static async createStoreByAdmin(payload) {
    const { name, email, address, description, ownerId } = payload || {};
    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Store name is required');
    }
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      errors.push('Store address is required');
    }
    if (!ownerId || typeof ownerId !== 'string') {
      errors.push('Store Owner ID is required');
    }

    if (errors.length > 0) {
      throw ApiError.unprocessableEntity('Store creation validation failed', errors);
    }

    // Verify owner exists and is a STORE_OWNER
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
    });

    if (!owner) {
      throw ApiError.badRequest('Specified Store Owner does not exist');
    }

    if (owner.role !== 'STORE_OWNER' && owner.role !== 'ADMIN') {
      throw ApiError.badRequest('Assigned user must have STORE_OWNER or ADMIN role');
    }

    const store = await prisma.store.create({
      data: {
        name: name.trim(),
        email: email ? email.trim() : null,
        address: address.trim(),
        description: description ? description.trim() : null,
        ownerId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return { ...store, averageRating: 0, ratingCount: 0 };
  }

  /**
   * Admin lists stores with calculated average rating, search, filters, and pagination.
   * @param {Object} query - Express request query
   */
  static async getStoresByAdmin(query) {
    const { page, limit, skip, take } = getPaginationParams(query);
    const { orderBy } = getSortParams(query, ALLOWED_STORE_SORT_FIELDS, 'createdAt', 'desc');

    // Build filter conditions
    const where = {};
    if (query.name) {
      where.name = { contains: String(query.name).trim(), mode: 'insensitive' };
    }
    if (query.email) {
      where.email = { contains: String(query.email).trim(), mode: 'insensitive' };
    }
    if (query.address) {
      where.address = { contains: String(query.address).trim(), mode: 'insensitive' };
    }
    if (query.search) {
      const searchTerm = String(query.search).trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Fetch stores and count
    const [totalCount, stores] = await Promise.all([
      prisma.store.count({ where }),
      prisma.store.findMany({
        where,
        orderBy,
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          ratings: {
            select: { rating: true },
          },
        },
        skip,
        take,
      }),
    ]);

    // Calculate overall average rating for each store
    const formattedStores = stores.map((store) => {
      const ratings = store.ratings || [];
      const ratingCount = ratings.length;
      const avg = ratingCount > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratingCount : 0;
      const averageRating = parseFloat(avg.toFixed(2));

      // eslint-disable-next-line no-unused-vars
      const { ratings: _rawRatings, ...storeData } = store;
      return {
        ...storeData,
        averageRating,
        ratingCount,
      };
    });

    // In-memory sorting for averageRating if requested
    if (query.sortBy === 'rating') {
      const isAsc = (query.sortOrder || '').toLowerCase() === 'asc';
      formattedStores.sort((a, b) => (isAsc ? a.averageRating - b.averageRating : b.averageRating - a.averageRating));
    }

    const meta = formatPaginatedMeta(totalCount, page, limit);
    return { items: formattedStores, meta };
  }

  /**
   * Admin dashboard summary metrics.
   * @returns {Promise<Object>} Count metrics
   */
  static async getAdminDashboardStats() {
    const [totalUsers, totalStores, totalRatings, adminCount, userCount, ownerCount] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'STORE_OWNER' } }),
    ]);

    return {
      totalUsers,
      totalStores,
      totalRatings,
      roleCounts: {
        ADMIN: adminCount,
        USER: userCount,
        STORE_OWNER: ownerCount,
      },
    };
  }
}
