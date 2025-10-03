/**
 * Success response wrapper
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} JSON response
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Error response wrapper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {Array} errors - Array of error objects (default: [])
 * @returns {Object} JSON response
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString()
  });
};

/**
 * Pagination response wrapper
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @param {Object} meta - Additional metadata (optional)
 * @returns {Object} JSON response with pagination info
 */
const paginatedResponse = (res, data, total, page, limit, meta = {}) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
      hasNextPage,
      hasPreviousPage,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: hasPreviousPage ? page - 1 : null
    },
    ...meta,
    timestamp: new Date().toISOString()
  });
};

/**
 * Not found response wrapper
 * @param {Object} res - Express response object
 * @param {string} resource - Name of the resource not found
 * @returns {Object} JSON response with 404 status
 */
const notFoundResponse = (res, resource = 'Resource') => {
  return errorResponse(res, `${resource} not found`, 404);
};

/**
 * Unauthorized response wrapper
 * @param {Object} res - Express response object
 * @param {string} message - Unauthorized message
 * @returns {Object} JSON response with 401 status
 */
const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return errorResponse(res, message, 401);
};

/**
 * Forbidden response wrapper
 * @param {Object} res - Express response object
 * @param {string} message - Forbidden message
 * @returns {Object} JSON response with 403 status
 */
const forbiddenResponse = (res, message = 'Forbidden') => {
  return errorResponse(res, message, 403);
};

/**
 * Bad request response wrapper
 * @param {Object} res - Express response object
 * @param {string} message - Bad request message
 * @param {Array} errors - Array of validation errors (default: [])
 * @returns {Object} JSON response with 400 status
 */
const badRequestResponse = (res, message = 'Bad Request', errors = []) => {
  return errorResponse(res, message, 400, errors);
};

/**
 * Conflict response wrapper (e.g., duplicate entry)
 * @param {Object} res - Express response object
 * @param {string} message - Conflict message
 * @returns {Object} JSON response with 409 status
 */
const conflictResponse = (res, message = 'Conflict') => {
  return errorResponse(res, message, 409);
};

/**
 * Created response wrapper (for successful resource creation)
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 * @returns {Object} JSON response with 201 status
 */
const createdResponse = (res, data, message = 'Resource created successfully') => {
  return successResponse(res, data, message, 201);
};

/**
 * No content response wrapper (for successful deletion)
 * @param {Object} res - Express response object
 * @returns {Object} Empty response with 204 status
 */
const noContentResponse = (res) => {
  return res.status(204).end();
};

/**
 * File download response wrapper
 * @param {Object} res - Express response object
 * @param {Buffer} fileBuffer - File content as buffer
 * @param {string} fileName - Name of the file to be downloaded
 * @param {string} contentType - MIME type of the file
 * @returns {Object} File download response
 */
const fileDownloadResponse = (res, fileBuffer, fileName, contentType) => {
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Length', fileBuffer.length);
  return res.send(fileBuffer);
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
  conflictResponse,
  createdResponse,
  noContentResponse,
  fileDownloadResponse
};
