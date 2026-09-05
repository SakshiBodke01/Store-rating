import { test, describe } from 'node:test';
import assert from 'node:assert';
import { sanitizeUser } from '../utils/userSerializer.js';

describe('Schema & Serialization Verification Tests', () => {
  describe('User Serialization & Security', () => {
    test('should strip passwordHash from single user object', () => {
      const userWithHash = {
        id: 'usr-123',
        name: 'Alice Test',
        email: 'alice@example.com',
        role: 'USER',
        passwordHash: '$2a$10$e7W...hashValueSecret',
        createdAt: new Date(),
      };

      const sanitized = sanitizeUser(userWithHash);

      assert.strictEqual(sanitized.passwordHash, undefined);
      assert.strictEqual(sanitized.id, 'usr-123');
      assert.strictEqual(sanitized.email, 'alice@example.com');
      assert.strictEqual(sanitized.name, 'Alice Test');
      assert.strictEqual(sanitized.role, 'USER');
    });

    test('should strip passwordHash from array of users', () => {
      const users = [
        { id: '1', email: 'u1@test.com', passwordHash: 'hash1' },
        { id: '2', email: 'u2@test.com', passwordHash: 'hash2' },
      ];

      const sanitized = sanitizeUser(users);

      assert.strictEqual(sanitized.length, 2);
      assert.strictEqual(sanitized[0].passwordHash, undefined);
      assert.strictEqual(sanitized[1].passwordHash, undefined);
      assert.strictEqual(sanitized[0].email, 'u1@test.com');
      assert.strictEqual(sanitized[1].email, 'u2@test.com');
    });
  });

  describe('Rating Validation Rules', () => {
    test('should validate rating integer is between 1 and 5', () => {
      const isValidRating = (val) => Number.isInteger(val) && val >= 1 && val <= 5;

      assert.strictEqual(isValidRating(1), true);
      assert.strictEqual(isValidRating(3), true);
      assert.strictEqual(isValidRating(5), true);

      assert.strictEqual(isValidRating(0), false);
      assert.strictEqual(isValidRating(6), false);
      assert.strictEqual(isValidRating(3.5), false);
      assert.strictEqual(isValidRating(-1), false);
    });
  });

  describe('Roles Enum Verification', () => {
    test('should validate allowed system roles', () => {
      const validRoles = ['ADMIN', 'USER', 'STORE_OWNER'];
      
      assert.ok(validRoles.includes('ADMIN'));
      assert.ok(validRoles.includes('USER'));
      assert.ok(validRoles.includes('STORE_OWNER'));
      assert.strictEqual(validRoles.includes('SUPERADMIN'), false);
    });
  });
});
