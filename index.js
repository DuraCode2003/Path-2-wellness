const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes (temporarily disabled due to auth middleware issues)
// const interactionLogRoutes = require('./routes/interactionLogRoutes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Database connection
const { connectDB, setupConnectionEvents } = require('./config/database');

// Connect to MongoDB (Atlas or Local)
connectDB().catch(error => {
  console.error('Failed to connect to database:', error.message);
});

// Setup connection event handlers
setupConnectionEvents();

// Health check route
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    success: true,
    message: 'PathAI API is running ✅',
    database: 'pathAIDB',
    dbStatus: dbStatus,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PathAI API is running ✅',
    database: 'pathAIDB',
    timestamp: new Date().toISOString()
  });
});

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'PathAI API is working!',
    timestamp: new Date().toISOString()
  });
});

// Simple Escalation Ticket CRUD (no auth for testing)
const EscalationTicket = require('./models/EscalationTicket');

// CREATE - Create new escalation ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const { patientId, message, priority, category } = req.body;
    
    const ticket = new EscalationTicket({
      patient: patientId || '507f1f77bcf86cd799439011', // Mock patient ID
      status: 'open',
      priority: priority || 'medium',
      category: category || 'general',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      messages: [{
        sender: patientId || '507f1f77bcf86cd799439011',
        message: message,
        isInternalNote: false
      }]
    });

    const savedTicket = await ticket.save();
    res.json({
      success: true,
      data: savedTicket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket'
    });
  }
});

// READ - Get all tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await EscalationTicket.find()
      .populate('patient', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets'
    });
  }
});

// UPDATE - Update ticket (add feedback/review)
app.put('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback, assignedTo } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (feedback) {
      updateData.$push = {
        messages: {
          sender: '507f1f77bcf86cd799439012', // Mock doctor ID
          message: feedback,
          isInternalNote: true
        }
      };
    }

    const ticket = await EscalationTicket.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    ).populate('patient', 'name email');
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket'
    });
  }
});

// DELETE - Mark ticket as resolved
app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const ticket = await EscalationTicket.findByIdAndUpdate(
      id,
      { 
        status: 'resolved',
        resolvedAt: new Date()
      },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Ticket marked as resolved',
      data: ticket
    });
  } catch (error) {
    console.error('Resolve ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve ticket'
    });
  }
});

// Patient chat endpoint (no auth required)
app.post('/api/patient-chat', async (req, res) => {
  try {
    const { patientId, sessionId, message, timestamp } = req.body;
    
    // Simple AI response logic (pure JavaScript)
    const generateResponse = (userMessage) => {
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('chest pain') || lowerMessage.includes('heart attack')) {
        return {
          response: "🚨 I understand you're experiencing chest pain. This could be serious. If you're having severe chest pain, difficulty breathing, or feel this is an emergency, please call 911 immediately.",
          severity: 'emergency',
          confidence: 0.95
        };
      }
      
      if (lowerMessage.includes('headache') || lowerMessage.includes('head hurts')) {
        return {
          response: "I understand you have a headache. Can you tell me more about it? When did it start, and how would you rate the pain on a scale of 1-10?",
          severity: 'normal',
          confidence: 0.85
        };
      }
      
      if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
        return {
          response: "A fever can indicate your body is fighting an infection. Have you taken your temperature? If it's over 103°F (39.4°C), please consider contacting a healthcare provider.",
          severity: 'urgent',
          confidence: 0.80
        };
      }
      
      return {
        response: "Thank you for sharing that with me. Can you provide more details about your symptoms? I'm here to help guide you, but remember that for serious concerns, it's always best to consult with a healthcare professional.",
        severity: 'normal',
        confidence: 0.75
      };
    };
    
    const aiResponse = generateResponse(message);
    
    // Log the interaction (simplified for patient chat)
    const interactionData = {
      patientId: patientId || 'anonymous',
      sessionId,
      userMessage: message,
      aiResponse: aiResponse.response,
      severity: aiResponse.severity,
      timestamp: new Date(timestamp),
      confidence: aiResponse.confidence
    };
    
    // In a real app, you'd save this to MongoDB
    console.log('Patient interaction logged:', interactionData);
    
    res.json({
      success: true,
      data: {
        response: aiResponse.response,
        severity: aiResponse.severity,
        confidence: aiResponse.confidence,
        responseTime: Math.floor(Math.random() * 1000) + 500,
        suggestions: [
          "Can you describe your symptoms in more detail?",
          "When did these symptoms first appear?",
          "Have you experienced this before?"
        ]
      }
    });
    
  } catch (error) {
    console.error('Patient chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, I encountered an error. Please try again.'
    });
  }
});

// Routes (temporarily disabled)
// app.use('/api/interactions', interactionLogRoutes);

// Authentication routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Database-connected escalation tickets routes
const escalationRoutes = require('./routes/escalationRoutes');
app.use('/api/escalation-tickets', escalationRoutes);

// User management routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// New CRUD Ticket routes
const ticketRoutes = require('./routes/ticketRoutes');
app.use('/api/tickets', ticketRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 PathAI Server running on port ${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/health`);
  console.log(`🎫 Escalation Tickets: http://localhost:${PORT}/api/escalation-tickets`);
});