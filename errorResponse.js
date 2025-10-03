class ErrorResponse extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    
    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
  
  // Static method to create a validation error response
  static validationError(errors) {
    return new ErrorResponse('Validation Error', 400, errors);
  }
  
  // Static method to create a not found error
  static notFound(resource = 'Resource') {
    return new ErrorResponse(`${resource} not found`, 404);
  }
  
  // Static method to create an unauthorized error
  static unauthorized(message = 'Not authorized to access this route') {
    return new ErrorResponse(message, 401);
  }
  
  // Static method to create a forbidden error
  static forbidden(message = 'Forbidden') {
    return new ErrorResponse(message, 403);
  }
  
  // Static method to create a bad request error
  static badRequest(message = 'Bad Request') {
    return new ErrorResponse(message, 400);
  }
  
  // Static method to create an internal server error
  static serverError(message = 'Internal Server Error') {
    return new ErrorResponse(message, 500);
  }
  
  // Convert error to JSON response
  toJSON() {
    return {
      success: false,
      message: this.message,
      statusCode: this.statusCode,
      ...(this.errors.length > 0 && { errors: this.errors })
    };
  }
}

module.exports = ErrorResponse;
