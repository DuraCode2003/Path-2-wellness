const ErrorResponse = require('../utils/errorResponse');

/**
 * Wrap async/await functions to handle errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    // If the error is already an instance of ErrorResponse, pass it to the next middleware
    if (err instanceof ErrorResponse) {
      return next(err);
    }
    
    // For other types of errors, wrap them in an ErrorResponse
    const error = new ErrorResponse(err.message || 'Internal Server Error', 500);
    error.stack = err.stack; // Preserve the original stack trace
    next(error);
  });
};

module.exports = asyncHandler;
