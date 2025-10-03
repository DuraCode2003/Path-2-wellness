const Joi = require('joi');
const { ValidationError } = require('./errorResponse');
const logger = require('./logger');

// Common validation schemas
const schemas = {
  // User schemas
  id: Joi.string().hex().length(24).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/),
  
  // Pagination
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().default('-createdAt'),
    search: Joi.string().allow('').default(''),
  },
  
  // File upload
  file: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    size: Joi.number().required(),
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
  }),
};

// Common validation options
const defaultOptions = {
  abortEarly: false, // Return all errors, not just the first one
  allowUnknown: true, // Allow unknown keys that will be ignored
  stripUnknown: true, // Remove unknown keys from the validated data
};

/**
 * Validate data against a Joi schema
 * @param {Object} data - Data to validate
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {Object} options - Validation options (optional)
 * @returns {Object} - Validated and sanitized data
 * @throws {ValidationError} - If validation fails
 */
const validate = (data, schema, options = {}) => {
  const validationOptions = { ...defaultOptions, ...options };
  
  const { error, value } = schema.validate(data, validationOptions);
  
  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/["']/g, ''),
      type: detail.type,
    }));
    
    throw new ValidationError('Validation failed', 400, errors);
  }
  
  return value;
};

/**
 * Middleware factory for request validation
 * @param {Object} schema - Object with Joi schemas for body, params, query
 * @returns {Function} - Express middleware function
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request parts if schemas are provided
      if (schema.body) {
        req.body = validate(req.body, schema.body);
      }
      
      if (schema.params) {
        req.params = validate(req.params, schema.params);
      }
      
      if (schema.query) {
        req.query = validate(req.query, schema.query);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validate file upload
 * @param {Object} file - File object from multer
 * @param {Object} options - Validation options
 * @param {Array} options.allowedTypes - Allowed MIME types
 * @param {number} options.maxSize - Maximum file size in bytes
 * @throws {ValidationError} - If validation fails
 */
const validateFile = (file, options = {}) => {
  const { allowedTypes = [], maxSize = 5 * 1024 * 1024 } = options;
  
  if (!file) {
    throw new ValidationError('No file uploaded', 400);
  }
  
  // Validate file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
    throw new ValidationError(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      400
    );
  }
  
  // Validate file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    throw new ValidationError(
      `File too large. Maximum size is ${maxSizeMB}MB`,
      400
    );
  }
  
  return true;
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} - True if valid
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Sanitize input to prevent XSS
 * @param {string} input - Input string to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input.replace(/[<>\"\'`]/g, '');
};

/**
 * Sanitize request body to prevent NoSQL injection
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object
 */
const sanitizeRequest = (obj) => {
  if (!obj) return obj;
  
  const sanitized = { ...obj };
  
  // Remove any keys that start with $ (MongoDB operators)
  Object.keys(sanitized).forEach((key) => {
    if (key.startsWith('$')) {
      delete sanitized[key];
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeRequest(sanitized[key]);
    } else if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]);
    }
  });
  
  return sanitized;
};

module.exports = {
  schemas,
  validate,
  validateRequest,
  validateFile,
  isValidObjectId,
  isValidEmail,
  isValidUrl,
  sanitizeInput,
  sanitizeRequest,
};
