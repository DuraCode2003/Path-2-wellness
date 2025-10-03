const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Set token from Bearer token in header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Set token from cookie
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the token
    req.user = await User.findById(decoded.id);
    
    // Update last login
    if (req.user) {
      req.user.lastLogin = Date.now();
      await req.user.save({ validateBeforeSave: false });
    }
    
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Check if user has specific permission
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    if (req.user.role === 'admin' || req.user.hasPermission(permission)) {
      return next();
    }
    return next(
      new ErrorResponse(
        `Not authorized to perform this action. Required permission: ${permission}`,
        403
      )
    );
  };
};

// Check resource ownership
exports.checkOwnership = (model, paramName = 'id') => {
  return async (req, res, next) => {
    const resource = await model.findById(req.params[paramName]);
    
    // If resource doesn't exist or user is not the owner and not an admin
    if (!resource) {
      return next(
        new ErrorResponse(
          `Resource not found with id of ${req.params[paramName]}`,
          404
        )
      );
    }
    
    // Make sure user is resource owner or admin
    if (
      resource.user &&
      resource.user.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this resource`,
          401
        )
      );
    }
    
    // If user is authorized, attach the resource to the request
    req.resource = resource;
    next();
  };
};

// Rate limiting middleware
exports.rateLimit = (windowMs, max) => {
  return (req, res, next) => {
    // Implement rate limiting logic here
    // This is a simplified version - consider using express-rate-limit in production
    next();
  };
};

// Request validation middleware
exports.validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(err => ({
        field: err.context.key,
        message: err.message.replace(/\"/g, '')
      }));
      
      return next(new ErrorResponse('Validation failed', 400, errors));
    }
    
    next();
  };
};
