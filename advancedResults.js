const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async');

/**
 * Advanced filtering, sorting, pagination, and field limiting
 * @param {Model} model - Mongoose model to query
 * @param {Object} populate - Populate options
 * @returns {Function} Middleware function
 */
const advancedResults = (model, populate) => {
  return asyncHandler(async (req, res, next) => {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, $lt, $lte, $in)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Build initial query
    let query = model.find(JSON.parse(queryStr));

    // Search functionality (case-insensitive regex search on text fields)
    if (req.query.search) {
      const searchFields = ['firstName', 'lastName', 'email', 'specialization'];
      const searchQuery = searchFields.map(field => ({
        [field]: { $regex: req.query.search, $options: 'i' }
      }));
      
      query = query.or([...searchQuery]);
    }

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      // Default sort by most recent
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Populate
    if (populate) {
      query = query.populate(populate);
    }

    // Execute query
    const results = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    // Add advanced results to response
    res.advancedResults = {
      success: true,
      count: results.length,
      pagination,
      data: results
    };

    next();
  });
};

module.exports = advancedResults;
