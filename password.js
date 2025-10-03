const bcrypt = require('bcryptjs');
const { promisify } = require('util');
const ErrorResponse = require('./errorResponse');
const logger = require('./logger');

// Promisify bcrypt functions
const genSalt = promisify(bcrypt.genSalt);
const hash = promisify(bcrypt.hash);
const compare = promisify(bcrypt.compare);

// Default number of salt rounds
const SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS || 10;

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @param {number} [saltRounds=SALT_ROUNDS] - Number of salt rounds
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password, saltRounds = SALT_ROUNDS) => {
  try {
    if (!password) {
      throw new Error('Password is required');
    }

    const salt = await genSalt(parseInt(saltRounds, 10));
    const hashedPassword = await hash(password, salt);
    return hashedPassword;
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new ErrorResponse('Error hashing password', 500);
  }
};

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password to compare against
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
const comparePassword = async (password, hashedPassword) => {
  try {
    if (!password || !hashedPassword) {
      return false;
    }

    const isMatch = await compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    logger.error('Error comparing passwords:', error);
    return false;
  }
};

/**
 * Check if a password meets complexity requirements
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with success and optional error message
 */
const validatePassword = (password) => {
  // At least 8 characters
  if (password.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  // At least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  // At least one number
  if (!/\d/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number',
    };
  }

  // At least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character',
    };
  }

  return { valid: true };
};

/**
 * Generate a random password
 * @param {number} [length=12] - Length of the generated password
 * @returns {string} Generated password
 */
const generateRandomPassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]\\:;?><,./-=';
  let password = '';
  
  // Ensure at least one character from each required set
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+~`|}{[]\\:;?><,./-=';
  
  // Add one character from each required set
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += special.charAt(Math.floor(Math.random() * special.length));
  
  // Fill the rest of the password
  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Middleware to validate password complexity
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const passwordComplexityMiddleware = (req, res, next) => {
  if (req.body.password) {
    const { valid, message } = validatePassword(req.body.password);
    if (!valid) {
      return next(new ErrorResponse(message, 400));
    }
  }
  next();
};

module.exports = {
  hashPassword,
  comparePassword,
  validatePassword,
  generateRandomPassword,
  passwordComplexityMiddleware,
};
