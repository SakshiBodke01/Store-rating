import { ApiError } from '../utils/ApiError.js';

/**
 * 404 Not Found Middleware
 * Intercepts unmatched requests and creates an ApiError.notFound.
 */
export function notFoundHandler(req, res, next) {
  const message = `Resource endpoint ${req.method} ${req.originalUrl} not found`;
  next(ApiError.notFound(message));
}
