import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ApiError } from '../utils/ApiError.js';

describe('Modules 8, 9, 10 — Ratings & Store Owner Isolation Tests', () => {
  describe('Rating Score Validation', () => {
    test('Rating score must be an integer between 1 and 5', () => {
      const validateRating = (val) => {
        const ratingVal = parseInt(val, 10);
        if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
          throw ApiError.unprocessableEntity('Rating score must be an integer between 1 and 5');
        }
        return ratingVal;
      };

      assert.strictEqual(validateRating(5), 5);
      assert.strictEqual(validateRating(1), 1);
      assert.strictEqual(validateRating('4'), 4);

      assert.throws(() => validateRating(0));
      assert.throws(() => validateRating(6));
      assert.throws(() => validateRating('abc'));
    });
  });

  describe('Store Owner Data Isolation Logic', () => {
    test('Store Owner can only access stores matching their ownerId', () => {
      const stores = [
        { id: 'store-1', name: 'Owner A Store', ownerId: 'owner-A' },
        { id: 'store-2', name: 'Owner B Store', ownerId: 'owner-B' },
      ];

      const getOwnerStores = (currentOwnerId) => stores.filter((s) => s.ownerId === currentOwnerId);

      const ownerAStores = getOwnerStores('owner-A');
      assert.strictEqual(ownerAStores.length, 1);
      assert.strictEqual(ownerAStores[0].name, 'Owner A Store');

      const ownerCStores = getOwnerStores('owner-C');
      assert.strictEqual(ownerCStores.length, 0);
    });
  });
});
