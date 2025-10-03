const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { isCelebrate } = require('celebrate');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

// Security headers middleware
const securityHeaders = [
  helmet(),
  helmet.hidePoweredBy(),
  helmet.frameguard({ action: 'deny' }),
  helmet.xssFilter(),
  helmet.noSniff(),
  helmet.ieNoOpen(),
  helmet.hsts({
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  }),
  helmet.referrerPolicy({ policy: 'same-origin' }),
  helmet.permittedCrossDomainPolicies(),
  helmet.expectCt({
    maxAge: 86400, // 1 day
  }),
  helmet.dnsPrefetchControl({
    allow: false,
  }),
  helmet.crossOriginResourcePolicy({ policy: 'same-site' }),
];

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://path2wellness.com',
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (process.env.NODE_ENV === 'development' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'X-Api-Key',
    'X-Forwarded-For',
    'X-Forwarded-Proto',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
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
  },
});

// More aggressive rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many login attempts, please try again after 15 minutes',
  keyGenerator: (req) => req.ip,
});

// Rate limiting for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: 'Too many file uploads, please try again later',
  keyGenerator: (req) => req.ip,
  skip: (req) => req.user?.role === 'admin',
});

// Security middleware
const securityMiddleware = [
  // Enable CORS
  cors(corsOptions),
  
  // Apply security headers
  ...securityHeaders,
  
  // Apply rate limiting
  limiter,
  
  // Remove X-Powered-By header
  (req, res, next) => {
    res.removeHeader('X-Powered-By');
    next();
  },
  
  // Add security headers
  (req, res, next) => {
    // Set security headers for all responses
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('Feature-Policy', "geolocation 'none'; microphone 'none'; camera 'none';");
    
    // Add security headers for API responses
    if (req.path.startsWith('/api')) {
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self';");
    }
    
    next();
  },
];

// Error handler for security-related errors
const securityErrorHandler = (err, req, res, next) => {
  // Handle CORS errors
  if (err.name === 'CorsError') {
    logger.warn(`CORS error: ${err.message}`);
    return res.status(403).json({
      success: false,
      message: 'Not allowed by CORS',
    });
  }
  
  // Handle rate limit errors
  if (err.statusCode === 429) {
    return res.status(429).json({
      success: false,
      message: err.message || 'Too many requests, please try again later',
    });
  }
  
  // Handle validation errors
  if (isCelebrate(err)) {
    const errors = [];
    
    if (err.details) {
      for (const [segment, joiError] of err.details.entries()) {
        joiError.details.forEach((error) => {
          errors.push({
            field: error.path.join('.'),
            message: error.message.replace(/[\"']/g, ''),
          });
        });
      }
    }
    
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors,
    });
  }
  
  // Handle other errors
  logger.error(`Security error: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : 'anonymous',
  });
  
  // Don't leak error details in production
  const errorMessage = process.env.NODE_ENV === 'production'
    ? 'An error occurred'
    : err.message;
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: errorMessage,
  });
};

// Request sanitization middleware
const sanitizeRequest = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize request query
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize request params
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

// Helper function to sanitize object properties
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      
      // Sanitize strings
      if (typeof value === 'string') {
        sanitized[key] = value.replace(/[<>\"\'`]/g, '');
      } 
      // Recursively sanitize objects and arrays
      else if (value && typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } 
      // Keep other types as-is
      else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};

module.exports = {
  securityMiddleware,
  securityErrorHandler,
  limiter,
  authLimiter,
  uploadLimiter,
  corsOptions,
  sanitizeRequest,
};
