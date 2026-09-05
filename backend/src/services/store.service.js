import prisma from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { getPaginationParams, formatPaginatedMeta } from '../utils/queryParser.js';

export class StoreService {
  /**
   * Retrieves registered stores for normal users, including overall average rating
   * and current user's submitted rating.
   * @param {string} userId - Authenticated user ID
   * @param {Object} query - Express request query parameters
   */
  static async getStoresForUser(userId, query) {
    const { page, limit, skip, take } = getPaginationParams(query);

    // Build filter criteria
    const where = {};
    if (query.name) {
      where.name = { contains: String(query.name).trim(), mode: 'insensitive' };
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

    const [totalCount, stores] = await Promise.all([
      prisma.store.count({ where }),
      prisma.store.findMany({
        where,
        include: {
          ratings: {
            select: { id: true, rating: true, comment: true, userId: true },
          },
        },
        skip,
        take,
      }),
    ]);

    // Format stores with overall average rating and current user's personal rating
    const formattedStores = stores.map((store) => {
      const ratings = store.ratings || [];
      const ratingCount = ratings.length;
      const avg = ratingCount > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratingCount : 0;
      const averageRating = parseFloat(avg.toFixed(2));

      // Find current user's rating
      const userRatingRecord = ratings.find((r) => r.userId === userId);
      const myRating = userRatingRecord
        ? { id: userRatingRecord.id, rating: userRatingRecord.rating, comment: userRatingRecord.comment }
        : null;

      // eslint-disable-next-line no-unused-vars
      const { ratings: _rawRatings, ...storeData } = store;
      return {
        ...storeData,
        averageRating,
        ratingCount,
        myRating,
      };
    });

    // In-memory sorting for averageRating or myRating
    if (query.sortBy === 'rating') {
      const isAsc = (query.sortOrder || '').toLowerCase() === 'asc';
      formattedStores.sort((a, b) => (isAsc ? a.averageRating - b.averageRating : b.averageRating - a.averageRating));
    } else if (query.sortBy === 'name') {
      const isAsc = (query.sortOrder || '').toLowerCase() !== 'desc';
      formattedStores.sort((a, b) => (isAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
    }

    const meta = formatPaginatedMeta(totalCount, page, limit);
    return { items: formattedStores, meta };
  }

  /**
   * Submits or updates a rating for a store (1-5 integer score).
   * Upsert behavior: updates existing rating if found for (userId, storeId), else creates one.
   * @param {string} userId - User ID
   * @param {string} storeId - Store ID
   * @param {Object} payload - { rating, comment }
   */
  static async submitOrUpdateRating(userId, storeId, payload) {
    const { rating, comment } = payload || {};

    const ratingVal = parseInt(rating, 10);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      throw ApiError.unprocessableEntity('Rating score must be an integer between 1 and 5');
    }

    // Verify store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw ApiError.notFound('Store not found');
    }

    // Perform upsert for unique (userId, storeId) constraint
    const updatedRating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      update: {
        rating: ratingVal,
        comment: comment ? String(comment).trim() : null,
      },
      create: {
        userId,
        storeId,
        rating: ratingVal,
        comment: comment ? String(comment).trim() : null,
      },
    });

    // Calculate new store average rating
    const avgAggregate = await prisma.rating.aggregate({
      where: { storeId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const averageRating = parseFloat((avgAggregate._avg.rating || 0).toFixed(2));
    const ratingCount = avgAggregate._count.rating || 0;

    return {
      rating: updatedRating,
      storeStats: {
        storeId,
        averageRating,
        ratingCount,
      },
    };
  }

  /**
   * Retrieves the current user's submitted rating for a specific store.
   * @param {string} userId - User ID
   * @param {string} storeId - Store ID
   */
  static async getUserRatingForStore(userId, storeId) {
    const userRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
    });

    return userRating || null;
  }
}
