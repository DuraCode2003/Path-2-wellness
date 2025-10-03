const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  // Authentication
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Profile Information
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number cannot be longer than 20 characters']
  },
  dateOfBirth: {
    type: Date
  },
  profileImage: {
    type: String,
    default: 'default.jpg'
  },
  
  // Role and Permissions
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  permissions: [{
    type: String,
    enum: ['view_dashboard', 'manage_patients', 'manage_doctors', 'manage_tickets', 'view_reports', 'manage_content']
  }],
  
  // Doctor Specific Fields
  specialization: {
    type: String,
    required: [
      function() { return this.role === 'doctor'; },
      'Specialization is required for doctors'
    ]
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  biography: {
    type: String,
    maxlength: [1000, 'Biography cannot be more than 1000 characters']
  },
  
  // Patient Specific Fields
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  allergies: [String],
  medicalConditions: [String],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  
  // Audit Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

// Generate email verification token
userSchema.methods.getEmailVerificationToken = function() {
  // Generate token
  const verificationToken = crypto.randomBytes(20).toString('hex');
  
  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  return verificationToken;
};

// Check user permissions
userSchema.methods.hasPermission = function(permission) {
  if (this.role === 'admin') return true;
  return this.permissions && this.permissions.includes(permission);
};

// Cascade delete interactions when a user is deleted
userSchema.pre('remove', async function(next) {
  await this.model('InteractionLog').deleteMany({ patientId: this._id });
  await this.model('EscalationTicket').updateMany(
    { patient: this._id },
    { $set: { patient: null } }
  );
  next();
});

// Create a text index for search
userSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  specialization: 'text',
  biography: 'text'
});

module.exports = mongoose.model('User', userSchema);