const rateLimit = require('express-rate-limit');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    next(
      new ErrorResponse(
        options.message,
        429,
        {
          retryAfter: Math.ceil(options.windowMs / 1000), // in seconds
          limit: options.max,
          window: `${options.windowMs / 1000} seconds`
        }
      )
    );
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Use API key if available, otherwise use IP
    return req.headers['x-api-key'] || req.ip;
  },
  skip: (req) => {
    // Skip rate limiting for certain paths or IPs
    const skipPaths = ['/api/health', '/api/status'];
    const trustedIps = process.env.TRUSTED_IPS ? process.env.TRUSTED_IPS.split(',') : [];
    
    return skipPaths.includes(req.path) || 
           trustedIps.includes(req.ip) ||
           req.user?.role === 'admin';
  }
});

// More aggressive rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes',
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    next(
      new ErrorResponse(
        options.message,
        429,
        {
          retryAfter: Math.ceil(options.windowMs / 1000), // in seconds
          limit: options.max,
          window: `${options.windowMs / 1000} seconds`
        }
      )
    );
  }
});

// Rate limiting for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: 'Too many file uploads, please try again later',
  handler: (req, res, next, options) => {
    logger.warn(`Upload rate limit exceeded for IP: ${req.ip}`);
    next(
      new ErrorResponse(
        options.message,
        429,
        {
          retryAfter: Math.ceil(options.windowMs / 3600), // in hours
          limit: options.max,
          window: `${options.windowMs / 3600} hours`
        }
      )
    );
  },
  skip: (req) => {
    // Skip rate limiting for admins
    return req.user?.role === 'admin';
  }
});

// Rate limiting for password reset endpoints
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per hour
  message: 'Too many password reset attempts, please try again later',
  handler: (req, res, next, options) => {
    logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}`);
    next(
      new ErrorResponse(
        options.message,
        429,
        {
          retryAfter: Math.ceil(options.windowMs / 3600), // in hours
          limit: options.max,
          window: `${options.windowMs / 3600} hours`
        }
      )
    );
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  passwordResetLimiter
};
