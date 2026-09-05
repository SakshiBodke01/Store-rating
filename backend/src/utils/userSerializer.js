/**
 * Sanitizes a User object or array of User objects by removing sensitive fields like passwordHash.
 * @param {Object|Array} data - User object or array of User objects
 * @returns {Object|Array} Sanitized user data safe for API responses
 */
export function sanitizeUser(data) {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((user) => sanitizeSingleUser(user));
  }

  return sanitizeSingleUser(data);
}

function sanitizeSingleUser(user) {
  if (!user || typeof user !== 'object') return user;

  // eslint-disable-next-line no-unused-vars
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
