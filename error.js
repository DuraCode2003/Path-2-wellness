const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log to console for development
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }
  
  // Log to file in production
  if (process.env.NODE_ENV === 'production') {
    logger.error({
      message: err.message,
      stack: err.stack,
      name: err.name,
      statusCode: err.statusCode || 500
    });
  }
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value`;
    error = new ErrorResponse(message, 400);
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new ErrorResponse(message, 401);
  }
  
  if (err.name === 'TokenExpiredError') {
    const message = 'Token has expired';
    error = new ErrorResponse(message, 401);
  }
  
  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async handler to wrap async/await and handle errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 Not Found handler
const notFound = (req, res, next) => {
  next(new ErrorResponse(`Not Found - ${req.originalUrl}`, 404));
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound
};
