/**
 * Standardized API response formatters ensuring consistent JSON payloads across all endpoints.
 */

/**
 * Sends a successful API response envelope.
 * @param {import('express').Response} res - Express response object
 * @param {any} [data=null] - Payload data
 * @param {string} [message='Success'] - Descriptive message
 * @param {number} [statusCode=200] - HTTP status code
 * @param {Object} [meta=null] - Optional metadata (e.g. pagination)
 */
export function sendSuccess(res, data = null, message = 'Success', statusCode = 200, meta = null) {
  const payload = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...(meta !== null && { meta }),
  };

  return res.status(statusCode).json(payload);
}

/**
 * Sends a paginated API response envelope.
 * @param {import('express').Response} res - Express response object
 * @param {Array} items - List of items for current page
 * @param {Object} meta - Pagination metadata ({ page, limit, totalPages, totalCount })
 * @param {string} [message='Data retrieved successfully'] - Descriptive message
 */
export function sendPaginated(res, items, meta, message = 'Data retrieved successfully') {
  return sendSuccess(res, items, message, 200, meta);
}

/**
 * Sends a standardized error API response envelope.
 * @param {import('express').Response} res - Express response object
 * @param {string} message - Human readable error message
 * @param {number} [statusCode=500] - HTTP status code
 * @param {string} [code='INTERNAL_ERROR'] - Machine readable error code
 * @param {any} [details=null] - Additional details or validation error fields
 */
export function sendError(res, message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
  const payload = {
    success: false,
    error: {
      message,
      code,
      ...(details !== null && { details }),
    },
  };

  return res.status(statusCode).json(payload);
}
