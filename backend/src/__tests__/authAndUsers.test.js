import { test, describe } from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { validateRegistrationInput, validatePasswordComplexity } from '../utils/validators.js';
import { sanitizeUser } from '../utils/userSerializer.js';

describe('Modules 3 & 4 — Auth & User Password Management Tests', () => {
  describe('Input & Password Rules Validation', () => {
    test('validateRegistrationInput should throw UnprocessableEntity for short name or weak password', () => {
      const invalidPayload = {
        name: 'Short', // Less than 20 chars
        email: 'invalid-email',
        address: '123 Main St',
        password: 'weak',
      };

      assert.throws(
        () => validateRegistrationInput(invalidPayload),
        (err) => {
          assert.strictEqual(err.statusCode, 422);
          assert.strictEqual(err.code, 'VALIDATION_ERROR');
          return true;
        }
      );
    });

    test('validatePasswordComplexity should require uppercase and special character', () => {
      const errors = [];
      validatePasswordComplexity('password123', errors); // Missing uppercase & special char

      assert.ok(errors.length > 0);
      assert.ok(errors.some((e) => e.includes('uppercase')));
      assert.ok(errors.some((e) => e.includes('special character')));
    });

    test('validatePasswordComplexity should pass for valid compliant passwords', () => {
      const errors = [];
      validatePasswordComplexity('Password123!', errors);
      assert.strictEqual(errors.length, 0);
    });
  });

  describe('JWT Token & Security', () => {
    test('JWT token generation and verification payload integrity', () => {
      const mockUser = {
        id: 'usr-admin-123',
        email: 'admin@storerating.com',
        role: 'ADMIN',
      };

      const token = jwt.sign(mockUser, env.jwtSecret, { expiresIn: '1h' });
      const decoded = jwt.verify(token, env.jwtSecret);

      assert.strictEqual(decoded.id, mockUser.id);
      assert.strictEqual(decoded.email, mockUser.email);
      assert.strictEqual(decoded.role, 'ADMIN');
    });

    test('sanitizeUser must strip passwordHash from objects', () => {
      const rawUser = {
        id: '123',
        email: 'test@example.com',
        passwordHash: '$2a$10$superSecretHashValue',
        role: 'USER',
      };

      const safe = sanitizeUser(rawUser);
      assert.strictEqual(safe.passwordHash, undefined);
      assert.strictEqual(safe.email, 'test@example.com');
    });
  });
});
