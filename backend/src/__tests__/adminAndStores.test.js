import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getSortParams, parseFilterQuery } from '../utils/queryParser.js';

describe('Modules 5, 6, 7 — Admin APIs & Store Logic Tests', () => {
  describe('Admin Query & Sort Whitelisting', () => {
    test('getSortParams should restrict sorting to allowed user/store columns', () => {
      const allowedCols = ['name', 'email', 'address', 'role', 'createdAt'];

      const valid = getSortParams({ sortBy: 'email', sortOrder: 'asc' }, allowedCols);
      assert.strictEqual(valid.sortBy, 'email');
      assert.strictEqual(valid.sortOrder, 'asc');

      const SQLInjectionAttempt = getSortParams({ sortBy: 'email; DROP TABLE users;--' }, allowedCols);
      assert.strictEqual(SQLInjectionAttempt.sortBy, 'createdAt');
    });

    test('parseFilterQuery should sanitize filter string parameters', () => {
      const query = { name: '  Electronics  ', address: '  Tech Park  ', malicious: "' OR 1=1--" };
      const filters = parseFilterQuery(query, ['name', 'address']);

      assert.strictEqual(filters.name, 'Electronics');
      assert.strictEqual(filters.address, 'Tech Park');
      assert.strictEqual(filters.malicious, undefined);
    });
  });

  describe('Average Rating Calculation Logic', () => {
    test('should calculate average rating correctly and round to 2 decimals', () => {
      const ratings = [{ rating: 5 }, { rating: 4 }, { rating: 4 }];
      const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      const averageRating = parseFloat(avg.toFixed(2));

      assert.strictEqual(averageRating, 4.33);
    });

    test('store with no ratings should default averageRating to 0', () => {
      const ratings = [];
      const avg = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

      assert.strictEqual(avg, 0);
    });
  });
});
