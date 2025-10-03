// Completely disabled authentication middleware - no authorization needed

const protect = (req, res, next) => {
  // No authentication at all - just pass through
  req.user = {
    _id: '123456789012345678901234',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  };
  next();
};

const admin = (req, res, next) => {
  // No admin check - just pass through
  next();
};

const doctor = (req, res, next) => {
  // No doctor check - just pass through
  next();
};

module.exports = { protect, admin, doctor };