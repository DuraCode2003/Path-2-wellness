const express = require('express');
const router = express.Router();
const EscalationTicket = require('../models/EscalationTicket');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');

// Create escalation ticket (public endpoint for AI chat)
router.post('/', async (req, res) => {
  try {
    const { patient, interaction, symptoms, category } = req.body;

    // Validate required fields
    if (!interaction?.question || !interaction?.aiResponse) {
      return res.status(400).json({
        success: false,
        error: 'Question and AI response are required'
      });
    }

    // Determine severity based on keywords and AI response
    const severity = determineSeverity(interaction.question, interaction.aiResponse);
    
    // Find available doctor for assignment
    const availableDoctor = await findAvailableDoctor(category);

    // Create escalation ticket
    const ticketData = {
      patient: {
        name: patient?.name || 'Anonymous Patient',
        age: patient?.age,
        gender: patient?.gender,
        sessionId: patient?.sessionId || `session_${Date.now()}`,
        contactInfo: {
          email: patient?.email,
          phone: patient?.phone
        }
      },
      interaction: {
        question: interaction.question,
        aiResponse: interaction.aiResponse,
        timestamp: interaction.timestamp ? new Date(interaction.timestamp) : new Date(),
        confidence: interaction.confidence || 0.85
      },
      severity,
      priority: mapSeverityToPriority(severity),
      category: category || 'General',
      symptoms: symptoms || [],
      assignedTo: availableDoctor?._id,
      status: availableDoctor ? 'open' : 'pending',
      dueDate: calculateDueDate(severity)
    };

    const ticket = new EscalationTicket(ticketData);
    await ticket.save();

    // Populate assigned doctor info
    await ticket.populate('assignedTo', 'firstName lastName specialization');

    console.log(`✅ Created escalation ticket: ${ticket.ticketId} for ${ticket.patient.name}`);

    res.status(201).json({
      success: true,
      data: ticket
    });

  } catch (error) {
    console.error('❌ Error creating escalation ticket:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all escalation tickets (protected route)
router.get('/', protect, async (req, res) => {
  try {
    const { status, severity, priority, search, page = 1, limit = 20 } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (priority) filter.priority = priority;
    
    // Role-based filtering
    if (req.user.role === 'doctor') {
      filter.assignedTo = req.user._id;
    }
    
    // Text search
    if (search) {
      filter.$or = [
        { 'patient.name': { $regex: search, $options: 'i' } },
        { 'interaction.question': { $regex: search, $options: 'i' } },
        { ticketId: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const [tickets, total] = await Promise.all([
      EscalationTicket.find(filter)
        .populate('assignedTo', 'firstName lastName specialization')
        .sort({ createdAt: -1, priority: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      EscalationTicket.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: tickets.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: tickets
    });

  } catch (error) {
    console.error('❌ Error fetching escalation tickets:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single ticket
router.get('/:id', protect, async (req, res) => {
  try {
    const ticket = await EscalationTicket.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName specialization email')
      .populate('messages.sender', 'firstName lastName role');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check permissions
    if (req.user.role === 'doctor' && ticket.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this ticket'
      });
    }

    res.json({
      success: true,
      data: ticket
    });

  } catch (error) {
    console.error('❌ Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update ticket (add feedback, change status)
router.put('/:id', protect, async (req, res) => {
  try {
    const { status, doctorNotes, feedback, priority } = req.body;
    
    const ticket = await EscalationTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check permissions
    if (req.user.role === 'doctor' && ticket.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this ticket'
      });
    }

    // Update fields
    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (doctorNotes) ticket.doctorNotes = doctorNotes;
    if (feedback) ticket.feedback = feedback;
    
    // Set resolution details if resolving
    if (status === 'resolved' || status === 'closed') {
      ticket.resolution = {
        notes: doctorNotes || 'Ticket resolved',
        resolvedBy: req.user._id,
        resolvedAt: new Date()
      };
    }

    ticket.updatedBy = req.user._id;
    await ticket.save();

    // Populate for response
    await ticket.populate('assignedTo', 'firstName lastName specialization');

    console.log(`✅ Updated ticket: ${ticket.ticketId} - Status: ${ticket.status}`);

    res.json({
      success: true,
      data: ticket
    });

  } catch (error) {
    console.error('❌ Error updating ticket:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark ticket as resolved (soft delete)
router.delete('/:id', protect, async (req, res) => {
  try {
    const ticket = await EscalationTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check permissions
    if (req.user.role === 'doctor' && ticket.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to resolve this ticket'
      });
    }

    // Mark as resolved
    ticket.status = 'resolved';
    ticket.resolution = {
      notes: 'Ticket marked as resolved',
      resolvedBy: req.user._id,
      resolvedAt: new Date()
    };
    ticket.updatedBy = req.user._id;
    
    await ticket.save();

    console.log(`✅ Resolved ticket: ${ticket.ticketId}`);

    res.json({
      success: true,
      message: 'Ticket marked as resolved',
      data: ticket
    });

  } catch (error) {
    console.error('❌ Error resolving ticket:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get ticket statistics
router.get('/stats/overview', protect, authorize('admin', 'doctor'), async (req, res) => {
  try {
    const match = {};
    
    // Filter by doctor if not admin
    if (req.user.role === 'doctor') {
      match.assignedTo = req.user._id;
    }

    const stats = await EscalationTicket.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          emergency: { $sum: { $cond: [{ $eq: ['$severity', 'emergency'] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ['$severity', 'urgent'] }, 1, 0] } },
          normal: { $sum: { $cond: [{ $eq: ['$severity', 'normal'] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        total: 0, pending: 0, open: 0, inProgress: 0, resolved: 0,
        emergency: 0, urgent: 0, normal: 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching ticket stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper functions
function determineSeverity(question, aiResponse) {
  const emergencyKeywords = [
    'chest pain', 'heart attack', 'can\'t breathe', 'shortness of breath',
    'severe pain', 'bleeding heavily', 'unconscious', 'stroke',
    'severe allergic reaction', 'overdose', 'suicide'
  ];

  const urgentKeywords = [
    'severe headache', 'high fever', 'persistent vomiting',
    'severe abdominal pain', 'difficulty breathing', 'blurred vision',
    'severe dizziness', 'persistent chest discomfort'
  ];

  const text = (question + ' ' + aiResponse).toLowerCase();

  if (emergencyKeywords.some(keyword => text.includes(keyword))) {
    return 'emergency';
  }

  if (urgentKeywords.some(keyword => text.includes(keyword))) {
    return 'urgent';
  }

  if (text.includes('emergency') || text.includes('call 911') || text.includes('seek immediate')) {
    return 'emergency';
  }

  if (text.includes('urgent') || text.includes('see a doctor') || text.includes('medical attention')) {
    return 'urgent';
  }

  return 'normal';
}

function mapSeverityToPriority(severity) {
  const mapping = {
    'emergency': 'critical',
    'urgent': 'high',
    'normal': 'medium'
  };
  return mapping[severity] || 'medium';
}

function calculateDueDate(severity) {
  const now = new Date();
  const hours = {
    'emergency': 1,    // 1 hour
    'urgent': 4,       // 4 hours
    'normal': 24       // 24 hours
  };
  
  return new Date(now.getTime() + (hours[severity] || 24) * 60 * 60 * 1000);
}

async function findAvailableDoctor(category) {
  try {
    // Find doctors with least open tickets
    const doctors = await User.aggregate([
      { $match: { role: 'doctor', isActive: true } },
      {
        $lookup: {
          from: 'escalationtickets',
          let: { doctorId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$assignedTo', '$$doctorId'] },
                    { $in: ['$status', ['open', 'in_progress']] }
                  ]
                }
              }
            }
          ],
          as: 'openTickets'
        }
      },
      {
        $addFields: {
          openTicketsCount: { $size: '$openTickets' }
        }
      },
      { $sort: { openTicketsCount: 1 } },
      { $limit: 1 }
    ]);

    return doctors[0] || null;
  } catch (error) {
    console.error('Error finding available doctor:', error);
    return null;
  }
}

module.exports = router;
