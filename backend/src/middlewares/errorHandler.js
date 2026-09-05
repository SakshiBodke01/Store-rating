import { ApiError } from '../utils/ApiError.js';
import { sendError } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

/**
 * Centralized Express Error Handler Middleware.
 * Catches all errors emitted in the app pipeline and sends a consistent JSON response.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let error = err;

  // Handle SyntaxError (e.g. malformed JSON payload)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = ApiError.badRequest('Malformed JSON payload', { originalError: err.message });
  }

  // Handle Prisma Database Errors
  if (err?.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      const fields = err.meta?.target || 'field';
      error = ApiError.conflict(`Unique constraint violation on ${Array.isArray(fields) ? fields.join(', ') : fields}`);
    } else if (err.code === 'P2025') {
      error = ApiError.notFound('Record to update or delete not found');
    } else {
      error = ApiError.badRequest('Database query error', { prismaCode: err.code });
    }
  }

  // Fallback for non-ApiError instances
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, 'INTERNAL_SERVER_ERROR', null);
  }

  // Log non-operational errors or 500s
  if (error.statusCode >= 500 || env.nodeEnv === 'development') {
    console.error(`💥 [${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Error ${error.statusCode}: ${error.message}`);
    if (err.stack && env.nodeEnv === 'development') {
      console.error(err.stack);
    }
  }

  return sendError(
    res,
    error.message,
    error.statusCode,
    error.code,
    error.details
  );
}
