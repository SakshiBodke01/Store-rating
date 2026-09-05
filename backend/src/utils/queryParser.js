/**
 * Reusable Query Parsing Utilities for Pagination, Sorting, and Searching.
 */

/**
 * Extracts and sanitizes pagination parameters from request query.
 * @param {Object} query - Express request query object
 * @param {number} [defaultLimit=10] - Default items per page
 * @param {number} [maxLimit=100] - Maximum items allowed per page
 * @returns {{ page: number, limit: number, skip: number, take: number }}
 */
export function getPaginationParams(query = {}, defaultLimit = 10, maxLimit = 100) {
  const pageRaw = parseInt(query.page, 10);
  const limitRaw = parseInt(query.limit, 10);

  const page = !isNaN(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  let limit = !isNaN(limitRaw) && limitRaw > 0 ? limitRaw : defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;
  const take = limit;

  return { page, limit, skip, take };
}

/**
 * Formats pagination metadata object.
 * @param {number} totalCount - Total number of records matching query
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {{ page: number, limit: number, totalCount: number, totalPages: number, hasNextPage: boolean, hasPrevPage: boolean }}
 */
export function formatPaginatedMeta(totalCount, page, limit) {
  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Validates and parses sorting parameters against an allowlist.
 * @param {Object} query - Express request query object
 * @param {Array<string>} [allowedFields=['createdAt']] - Whitelisted sortable field names
 * @param {string} [defaultSortBy='createdAt'] - Default sort column
 * @param {string} [defaultSortOrder='desc'] - Default sort direction ('asc' | 'desc')
 * @returns {{ sortBy: string, sortOrder: string, orderBy: Object }}
 */
export function getSortParams(
  query = {},
  allowedFields = ['createdAt'],
  defaultSortBy = 'createdAt',
  defaultSortOrder = 'desc'
) {
  const sortByQuery = query.sortBy || query.sort;
  const sortOrderQuery = (query.sortOrder || query.order || '').toLowerCase();

  const sortBy = allowedFields.includes(sortByQuery) ? sortByQuery : defaultSortBy;
  const sortOrder = ['asc', 'desc'].includes(sortOrderQuery) ? sortOrderQuery : defaultSortOrder;

  return {
    sortBy,
    sortOrder,
    orderBy: { [sortBy]: sortOrder },
  };
}

/**
 * Parses allowed text filters from request query parameters.
 * @param {Object} query - Express request query object
 * @param {Array<string>} filterableFields - Allowed filter fields
 * @returns {Object} Extracted key-value filter object
 */
export function parseFilterQuery(query = {}, filterableFields = []) {
  const filters = {};

  filterableFields.forEach((field) => {
    if (query[field] !== undefined && query[field] !== null && String(query[field]).trim() !== '') {
      filters[field] = String(query[field]).trim();
    }
  });

  return filters;
}
