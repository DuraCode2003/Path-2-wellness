// apps/api/src/models/InteractionLog.js
const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  url: {
    type: String,
    required: true
  }
});

const interactionLogSchema = new mongoose.Schema({
  // Basic Information
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  
  // Conversation Data
  question: {
    type: String,
    required: true,
    maxlength: 2000
  },
  response: {
    type: String,
    required: true,
    maxlength: 5000
  },
  
  // Classification & Context
  questionType: {
    type: String,
    enum: [
      'ENT Pre-op',
      'ENT Post-op', 
      'Pregnancy First Trimester',
      'Pregnancy Second Trimester',
      'Pregnancy Third Trimester',
      'Postpartum',
      'Nutrition',
      'Surgery Prep',
      'Post-care',
      'Emergency',
      'General',
      'Other'
    ],
    required: true,
    index: true
  },
  
  // Sentiment & Priority Analysis
  sentiment: {
    type: String,
    enum: ['very_anxious', 'anxious', 'concerned', 'normal', 'positive', 'very_positive'],
    default: 'normal',
    index: true
  },
  sentimentScore: {
    type: Number,
    min: -1,
    max: 1,
    default: 0
  },
  
  severity: {
    type: String,
    enum: ['emergency', 'urgent', 'normal', 'educational', 'informational'],
    default: 'normal',
    index: true
  },
  
  // Attachments
  attachments: [attachmentSchema],
  
  // Patient Feedback & Notes
  patientNotes: {
    type: String,
    maxlength: 1000
  },
  patientRating: {
    type: Number,
    min: 1,
    max: 5
  },
  patientFeedback: {
    type: String,
    maxlength: 500
  },
  
  // Medical Review
  doctorReview: {
    status: {
      type: String,
      enum: ['pending', 'valid', 'needs_correction', 'wrong', 'escalated'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: Date,
    reviewNotes: {
      type: String,
      maxlength: 1000
    }
  },
  
  // Flagging & Escalation
  flagged: {
    type: Boolean,
    default: false,
    index: true
  },
  flagReason: {
    type: String,
    maxlength: 500
  },
  escalated: {
    type: Boolean,
    default: false,
    index: true
  },
  escalatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  escalationDate: Date,
  
  // Timestamps & Session Management
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  responseTime: {
    type: Number, // in milliseconds
    default: 0
  },
  
  // Multi-session Context
  previousQuestions: [{
    question: String,
    timestamp: Date,
    questionType: String
  }],
  
  // Analytics & Learning
  botConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  },
  topicKeywords: [String],
  relatedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InteractionLog'
  }],
  
  // Data Management
  anonymized: {
    type: Boolean,
    default: false
  },
  scheduledForDeletion: Date,
  
  // System Fields
  ipAddress: String,
  userAgent: String,
  deviceInfo: {
    type: String,
    maxlength: 200
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
interactionLogSchema.index({ patientId: 1, timestamp: -1 });
interactionLogSchema.index({ sessionId: 1, timestamp: -1 });
interactionLogSchema.index({ questionType: 1, severity: 1 });
interactionLogSchema.index({ flagged: 1, escalated: 1 });
interactionLogSchema.index({ timestamp: -1 });
interactionLogSchema.index({ 'doctorReview.status': 1 });

// Virtual for formatted timestamp
interactionLogSchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toLocaleString();
});

// Virtual for session duration calculation
interactionLogSchema.virtual('sessionDuration').get(function() {
  if (this.previousQuestions && this.previousQuestions.length > 0) {
    const firstQuestion = this.previousQuestions[0].timestamp;
    return this.timestamp - firstQuestion;
  }
  return 0;
});

// Pre-save middleware for auto-flagging
interactionLogSchema.pre('save', function(next) {
  // Auto-flag emergency or urgent cases
  if (this.severity === 'emergency' || this.severity === 'urgent') {
    this.flagged = true;
    if (!this.flagReason) {
      this.flagReason = `Auto-flagged due to ${this.severity} severity level`;
    }
  }
  
  // Auto-flag very anxious sentiment
  if (this.sentiment === 'very_anxious' && this.sentimentScore < -0.7) {
    this.flagged = true;
    if (!this.flagReason) {
      this.flagReason = 'Auto-flagged due to high anxiety level detected';
    }
  }
  
  next();
});

// Static method for analytics queries
interactionLogSchema.statics.getAnalytics = function(filters = {}) {
  return this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: null,
        totalInteractions: { $sum: 1 },
        avgResponseTime: { $avg: '$responseTime' },
        flaggedCount: { $sum: { $cond: ['$flagged', 1, 0] } },
        escalatedCount: { $sum: { $cond: ['$escalated', 1, 0] } },
        severityBreakdown: {
          $push: '$severity'
        },
        questionTypeBreakdown: {
          $push: '$questionType'
        }
      }
    }
  ]);
};

// Static method for sentiment analysis
interactionLogSchema.statics.getSentimentTrends = function(patientId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        patientId: mongoose.Types.ObjectId(patientId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$timestamp'
          }
        },
        avgSentiment: { $avg: '$sentimentScore' },
        questionCount: { $sum: 1 },
        anxiousQuestions: {
          $sum: {
            $cond: [
              { $in: ['$sentiment', ['anxious', 'very_anxious']] },
              1,
              0
            ]
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

module.exports = mongoose.model('InteractionLog', interactionLogSchema);