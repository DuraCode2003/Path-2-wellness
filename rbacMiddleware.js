// apps/api/src/middleware/rbacMiddleware.js
const rbacMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const { userRole, userId } = req.user;

      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'No role assigned to user'
        });
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      // For patient role, add additional checks for accessing own data
      if (userRole === 'patient') {
        // Add patient ID to request for filtering
        req.patientFilter = { patientId: userId };
      }

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

module.exports = rbacMiddleware;
