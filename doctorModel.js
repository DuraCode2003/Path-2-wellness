const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      default: 'doctor' // Changed default to doctor
    },
    phoneNumber: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    isAvailable: {
      type: Boolean,
      default: true // Set default to true for all users
    },
    specialization: {
      type: String,
      default: '',
      required: true // Always required for doctors
    }
  },
  {
    timestamps: true,
    discriminatorKey: 'role' // This allows us to use the User model as a base for Doctor model
  }
);

// Fix password hashing to handle errors
doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

doctorSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Add doctor-specific methods
doctorSchema.statics.findAvailableDoctors = function() {
  return this.find({ 
    isAvailable: true
  }).select('-password');
};

doctorSchema.statics.findBySpecialization = function(specialization) {
  return this.find({ 
    specialization,
    isAvailable: true
  }).select('-password');
};

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
