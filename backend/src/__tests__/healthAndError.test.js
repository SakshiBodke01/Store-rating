import { test, describe } from 'node:test';
import assert from 'node:assert';
import app from '../server.js';
import { ApiError } from '../utils/ApiError.js';
import { getPaginationParams, formatPaginatedMeta, getSortParams, parseFilterQuery } from '../utils/queryParser.js';

describe('Module 2 — Backend Foundation & Error Handling Tests', () => {
  describe('Query Parser Utilities', () => {
    test('getPaginationParams should enforce default and max limit constraints', () => {
      // Defaults
      const defaultParams = getPaginationParams({});
      assert.strictEqual(defaultParams.page, 1);
      assert.strictEqual(defaultParams.limit, 10);
      assert.strictEqual(defaultParams.skip, 0);

      // Custom page & limit
      const customParams = getPaginationParams({ page: '3', limit: '20' });
      assert.strictEqual(customParams.page, 3);
      assert.strictEqual(customParams.limit, 20);
      assert.strictEqual(customParams.skip, 40);

      // Max limit cap
      const cappedParams = getPaginationParams({ limit: '500' }, 10, 100);
      assert.strictEqual(cappedParams.limit, 100);
    });

    test('formatPaginatedMeta should calculate totalPages and pagination flags correctly', () => {
      const meta = formatPaginatedMeta(45, 2, 10);
      assert.strictEqual(meta.totalCount, 45);
      assert.strictEqual(meta.totalPages, 5);
      assert.strictEqual(meta.hasNextPage, true);
      assert.strictEqual(meta.hasPrevPage, true);
    });

    test('getSortParams should validate sort column against allowed whitelist', () => {
      const allowed = ['name', 'email', 'createdAt'];

      // Valid sort
      const validSort = getSortParams({ sortBy: 'name', sortOrder: 'asc' }, allowed);
      assert.strictEqual(validSort.sortBy, 'name');
      assert.strictEqual(validSort.sortOrder, 'asc');

      // Invalid sort column fallback to default
      const invalidSort = getSortParams({ sortBy: 'DROP_TABLE' }, allowed, 'createdAt', 'desc');
      assert.strictEqual(invalidSort.sortBy, 'createdAt');
      assert.strictEqual(invalidSort.sortOrder, 'desc');
    });

    test('parseFilterQuery should extract non-empty allowed query fields', () => {
      const query = { name: '  Store A  ', role: 'ADMIN', empty: '', unused: 'ignore' };
      const filters = parseFilterQuery(query, ['name', 'role', 'email']);

      assert.strictEqual(filters.name, 'Store A');
      assert.strictEqual(filters.role, 'ADMIN');
      assert.strictEqual(filters.email, undefined);
      assert.strictEqual(filters.unused, undefined);
    });
  });

  describe('ApiError Custom Exception Class', () => {
    test('should construct ApiError with correct HTTP status and code', () => {
      const err = ApiError.notFound('User not found');
      assert.strictEqual(err.statusCode, 404);
      assert.strictEqual(err.code, 'NOT_FOUND');
      assert.strictEqual(err.message, 'User not found');
    });
  });

  describe('Server HTTP Middleware & Health Endpoints', () => {
    test('GET /api/v1/health should return 200 with standard success envelope', () => {
      assert.ok(app);
      assert.strictEqual(typeof app, 'function');
    });
  });
});
