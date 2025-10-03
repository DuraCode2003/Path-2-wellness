const mongoose = require('mongoose');

const ticketMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  attachments: [{
    filename: String,
    url: String,
    fileType: String
  }],
  isInternalNote: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const escalationTicketSchema = new mongoose.Schema({
  // Unique ticket identifier
  ticketId: {
    type: String,
    unique: true,
    default: function() {
      return 'ESC-' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
    }
  },
  
  // Patient information (can be registered user or anonymous)
  patient: {
    // If registered user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // Anonymous patient data
    name: String,
    age: Number,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    sessionId: String,
    contactInfo: {
      email: String,
      phone: String
    }
  },
  
  // Original AI interaction data
  interaction: {
    question: {
      type: String,
      required: true,
      trim: true
    },
    aiResponse: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    }
  },
  
  // Doctor assigned to handle this ticket
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Ticket metadata
  status: {
    type: String,
    enum: ['open', 'in_progress', 'awaiting_patient', 'resolved', 'closed'],
    default: 'open',
    index: true
  },
  
  priority: {
    type: String,
    enum: ['emergency', 'critical', 'high', 'medium', 'low'],
    required: true,
    index: true
  },
  
  // Automatic due date based on priority
  dueDate: {
    type: Date,
    required: true
  },
  
  // Category based on the interaction type
  category: {
    type: String,
    enum: [
      'ENT Pre-op', 'ENT Post-op', 
      'Pregnancy First Trimester', 'Pregnancy Second Trimester', 'Pregnancy Third Trimester',
      'Postpartum', 'Nutrition', 'Surgery Prep', 'Post-care', 'Emergency', 'General'
    ],
    required: true
  },
  
  // Communication history
  messages: [ticketMessageSchema],
  
  // Resolution details
  resolution: {
    notes: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
  
  // System fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // For analytics
  firstResponseTime: {
    type: Number // in minutes
  },
  timeToResolution: {
    type: Number // in minutes
  }
}, { timestamps: true });

// Indexes for common queries
escalationTicketSchema.index({ patient: 1, status: 1 });
escalationTicketSchema.index({ assignedTo: 1, status: 1 });
escalationTicketSchema.index({ priority: 1, dueDate: 1 });

// Pre-save hook to update timestamps
escalationTicketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate first response time
  if (this.isModified('status') && this.status === 'in_progress' && !this.firstResponseTime) {
    const firstResponse = this.messages
      .filter(m => !m.isInternalNote)
      .sort((a, b) => a.createdAt - b.createdAt)[0];
      
    if (firstResponse) {
      this.firstResponseTime = (firstResponse.createdAt - this.createdAt) / (1000 * 60); // in minutes
    }
  }
  
  // Calculate time to resolution
  if (this.isModified('status') && (this.status === 'resolved' || this.status === 'closed') && !this.timeToResolution) {
    this.timeToResolution = (Date.now() - this.createdAt) / (1000 * 60); // in minutes
    this.resolution.resolvedAt = Date.now();
  }
  
  next();
});

// Static method to get ticket statistics
escalationTicketSchema.statics.getTicketStats = async function(doctorId = null) {
  const matchStage = doctorId ? { assignedTo: mongoose.Types.ObjectId(doctorId) } : {};
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$firstResponseTime' },
        avgResolutionTime: { $avg: '$timeToResolution' }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$count' },
        byStatus: {
          $push: {
            status: '$_id',
            count: '$count',
            avgResponseTime: '$avgResponseTime',
            avgResolutionTime: '$avgResolutionTime'
          }
        },
        avgResponseTime: { $avg: '$avgResponseTime' },
        avgResolutionTime: { $avg: '$avgResolutionTime' }
      }
    }
  ]);
  
  return stats.length > 0 ? stats[0] : { total: 0, byStatus: [] };
};

module.exports = mongoose.model('EscalationTicket', escalationTicketSchema);
