// This file is a wrapper around doctorModel.js for backward compatibility
const Doctor = require('./doctorModel');

// Log a warning to identify code that's still using this import
console.warn('Warning: userModel.js is deprecated. Import doctorModel.js directly instead.');

// Re-export the Doctor model as User to maintain backward compatibility
const User = Doctor;

module.exports = User;