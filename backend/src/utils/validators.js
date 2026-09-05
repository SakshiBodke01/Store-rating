import { ApiError } from './ApiError.js';

/**
 * Validation utilities enforcing system business constraints.
 */

// Email regex validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password rules: 8-16 characters, at least 1 uppercase letter, at least 1 special character
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 16;
const UPPERCASE_REGEX = /[A-Z]/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/]/;

/**
 * Validates user registration fields (Name: 20-60 chars, Email, Address: max 400 chars, Password rules).
 * @param {Object} payload - User input payload
 */
export function validateRegistrationInput(payload = {}) {
  const { name, email, address, password } = payload;
  const errors = [];

  // Name validation (20 to 60 characters as per spec rules)
  if (!name || typeof name !== 'string') {
    errors.push('Name is required');
  } else {
    const trimmedName = name.trim();
    if (trimmedName.length < 20 || trimmedName.length > 60) {
      errors.push('Name must be between 20 and 60 characters long');
    }
  }

  // Email validation
  if (!email || typeof email !== 'string') {
    errors.push('Email address is required');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Please provide a valid email address');
  }

  // Address validation (Max 400 characters)
  if (!address || typeof address !== 'string') {
    errors.push('Address is required');
  } else if (address.trim().length > 400) {
    errors.push('Address must not exceed 400 characters');
  }

  // Password validation
  validatePasswordComplexity(password, errors);

  if (errors.length > 0) {
    throw ApiError.unprocessableEntity('Registration validation failed', errors);
  }
}

/**
 * Validates password complexity: 8-16 characters, 1 uppercase, 1 special character.
 * @param {string} password - Raw password string
 * @param {Array<string>} [errorsList] - Error accumulator list
 */
export function validatePasswordComplexity(password, errorsList = []) {
  if (!password || typeof password !== 'string') {
    errorsList.push('Password is required');
    return errorsList;
  }

  if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    errorsList.push(`Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters long`);
  }

  if (!UPPERCASE_REGEX.test(password)) {
    errorsList.push('Password must contain at least one uppercase letter');
  }

  if (!SPECIAL_CHAR_REGEX.test(password)) {
    errorsList.push('Password must contain at least one special character (!@#$%^&*...)');
  }

  return errorsList;
}

/**
 * Validates login input parameters.
 * @param {Object} payload - Login payload ({ email, password })
 */
export function validateLoginInput(payload = {}) {
  const { email, password } = payload;
  const errors = [];

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('Valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.trim() === '') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    throw ApiError.badRequest('Invalid login input parameters', errors);
  }
}
