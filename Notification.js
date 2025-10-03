const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Reference to the user who will receive this notification
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Notification content
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  
  // Notification metadata
  type: {
    type: String,
    required: true,
    enum: [
      'ticket_assigned',
      'ticket_message',
      'ticket_resolved',
      'appointment_reminder',
      'appointment_confirmation',
      'appointment_cancellation',
      'prescription_ready',
      'test_results',
      'system_alert',
      'general'
    ],
    default: 'general',
    index: true
  },
  
  // Reference to the related document (ticket, appointment, etc.)
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  
  // Notification channels and status
  channel: {
    type: String,
    enum: ['email', 'sms', 'push', 'in_app', 'all'],
    default: 'in_app',
    required: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending',
    index: true
  },
  
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  
  // Read status
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  
  readAt: {
    type: Date
  },
  
  // Additional metadata
  metadata: {
    type: Map,
    of: String
  },
  
  // Error information if delivery failed
  error: {
    message: String,
    stack: String,
    timestamp: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for common queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ status: 1, createdAt: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// Pre-save hook to set readAt timestamp
notificationSchema.pre('save', function(next) {
  if (this.isModified('read') && this.read && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Static method to get unread notification count for a user
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ 
    user: userId, 
    read: false 
  });
};

// Method to mark notification as read
notificationSchema.methods.markAsRead = async function() {
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
    await this.save();
  }
  return this;
};

// Virtual for formatted date
notificationSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Static method to clean up old notifications
notificationSchema.statics.cleanupOldNotifications = async function(days = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const result = await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    // Keep unread notifications regardless of age
    read: true
  });
  
  return result;
};

module.exports = mongoose.model('Notification', notificationSchema);
