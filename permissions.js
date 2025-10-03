const ErrorResponse = require('../utils/errorResponse');

/**
 * Middleware to check if user has specific permission
 * @param  {...String} permissions - List of required permissions
 * @returns {Function} Express middleware function
 */
const hasPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission => 
      req.user.permissions?.includes(permission)
    );

    if (!hasAllPermissions) {
      return next(
        new ErrorResponse(
          `Not authorized to perform this action. Required permissions: ${requiredPermissions.join(', ')}`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Middleware to check if user has any of the specified permissions
 * @param  {...String} permissions - List of acceptable permissions
 * @returns {Function} Express middleware function
 */
const hasAnyPermission = (...permissions) => {
  return (req, res, next) => {
    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user has any of the required permissions
    const hasAny = permissions.some(permission => 
      req.user.permissions?.includes(permission)
    );

    if (!hasAny) {
      return next(
        new ErrorResponse(
          `Not authorized to perform this action. Requires one of: ${permissions.join(', ')}`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Middleware to check if user has a specific role
 * @param  {...String} roles - List of allowed roles
 * @returns {Function} Express middleware function
 */
const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user?.role || 'unknown'} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

/**
 * Middleware to check ownership of a resource
 * @param {String} modelName - Name of the model to check
 * @param {String} idParam - Name of the route parameter containing the resource ID
 * @param {String} userField - Name of the user field in the model (default: 'user')
 * @returns {Function} Express middleware function
 */
const checkOwnership = (modelName, idParam = 'id', userField = 'user') => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${modelName}`);
      const resource = await Model.findById(req.params[idParam]);

      if (!resource) {
        return next(
          new ErrorResponse(
            `${modelName} not found with id of ${req.params[idParam]}`,
            404
          )
        );
      }

      // Check if resource belongs to user or user is admin
      if (
        req.user.role !== 'admin' && 
        resource[userField].toString() !== req.user.id
      ) {
        return next(
          new ErrorResponse(
            `User ${req.user.id} is not authorized to access this resource`,
            401
          )
        );
      }

      // Attach resource to request object for use in route handlers
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  hasPermission,
  hasAnyPermission,
  hasRole,
  checkOwnership
};
