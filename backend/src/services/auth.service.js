import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { sanitizeUser } from '../utils/userSerializer.js';
import { validateRegistrationInput, validatePasswordComplexity, validateLoginInput } from '../utils/validators.js';

export class AuthService {
  /**
   * Registers a new public USER account. Role cannot be escalated.
   * @param {Object} payload - { name, email, address, password }
   * @returns {Promise<{ user: Object, token: string }>}
   */
  static async registerPublicUser(payload) {
    // 1. Validate registration input rules
    validateRegistrationInput(payload);

    const { name, email, address, password } = payload;
    const normalizedEmail = email.trim().toLowerCase();

    // 2. Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Create User (Strictly role USER)
    const newDbUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        address: address.trim(),
        passwordHash,
        role: 'USER', // Enforce normal USER role
      },
    });

    // 5. Generate JWT token
    const token = this.generateToken(newDbUser);
    const safeUser = sanitizeUser(newDbUser);

    return { user: safeUser, token };
  }

  /**
   * Authenticates user credentials and generates JWT token.
   * @param {Object} credentials - { email, password }
   * @returns {Promise<{ user: Object, token: string }>}
   */
  static async loginUser(credentials) {
    validateLoginInput(credentials);

    const { email, password } = credentials;
    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email address or password');
    }

    // Verify password match
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email address or password');
    }

    // Generate JWT token
    const token = this.generateToken(user);
    const safeUser = sanitizeUser(user);

    return { user: safeUser, token };
  }

  /**
   * Fetches user profile by ID.
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Safe user profile
   */
  static async getUserProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User profile not found');
    }

    return sanitizeUser(user);
  }

  /**
   * Updates an authenticated user's password.
   * @param {string} userId - ID of authenticated user
   * @param {Object} payload - { currentPassword, newPassword, confirmPassword }
   */
  static async changePassword(userId, payload) {
    const { currentPassword, newPassword, confirmPassword } = payload || {};
    const errors = [];

    if (!currentPassword) errors.push('Current password is required');
    if (!newPassword) errors.push('New password is required');
    if (!confirmPassword) errors.push('Password confirmation is required');
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errors.push('New password and confirmation do not match');
    }

    // Validate new password complexity
    validatePasswordComplexity(newPassword, errors);

    if (errors.length > 0) {
      throw ApiError.unprocessableEntity('Password change validation failed', errors);
    }

    // Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw ApiError.badRequest('Incorrect current password');
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      throw ApiError.badRequest('New password must be different from your current password');
    }

    // Hash and update new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: 'Password updated successfully' };
  }

  /**
   * Generates a signed JWT access token for authenticated identity.
   * @param {Object} user - User model record
   * @returns {string} JWT Token
   */
  static generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  }
}
