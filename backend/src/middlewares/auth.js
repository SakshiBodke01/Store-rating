import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Authentication Middleware
 * Verifies Bearer JWT token in Authorization header and attaches req.user.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Authentication token is required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Authentication token has expired. Please log in again.'));
    }
    return next(ApiError.unauthorized('Invalid or malformed authentication token'));
  }
}

/**
 * Role-Based Authorization Middleware (RBAC)
 * Enforces role restrictions on protected endpoints.
 * @param  {...string} allowedRoles - List of allowed roles ('ADMIN', 'USER', 'STORE_OWNER')
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User identity not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Forbidden: Insufficient privileges for role '${req.user.role}'`));
    }

    next();
  };
}
