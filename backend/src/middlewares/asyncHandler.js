/**
 * Async Handler Middleware Wrapper
 * Eliminates repetitive try-catch blocks in Express controllers.
 * Passes any unhandled promise rejections directly to the centralized error middleware.
 *
 * @param {Function} fn - Async Express route handler function
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
