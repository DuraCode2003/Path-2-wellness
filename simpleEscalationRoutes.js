const express = require('express');
const router = express.Router();

// In-memory storage for testing (no MongoDB required)
let tickets = [];
let ticketCounter = 1;

// Helper function to create a ticket
const createTicket = (data) => ({
  _id: 'ticket_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
  ticketId: 'ESC-' + String(ticketCounter++).padStart(3, '0'),
  patient: data.patient || {},
  interaction: data.interaction || {},
  symptoms: data.symptoms || [],
  category: data.category || 'General',
  status: 'pending',
  doctorNotes: '',
  feedback: '',
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create escalation ticket
router.post('/', (req, res) => {
  try {
    const ticketData = {
      patient: req.body.patient,
      interaction: req.body.interaction,
      symptoms: req.body.symptoms || [],
      category: req.body.category || 'General'
    };

    const ticket = createTicket(ticketData);
    tickets.push(ticket);

    console.log(`Created escalation ticket: ${ticket.ticketId} for ${ticket.patient.name}`);

    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error creating escalation ticket:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all escalation tickets
router.get('/', (req, res) => {
  try {
    const { status, severity, search } = req.query;
    let filteredTickets = [...tickets];

    // Apply filters
    if (status) {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
    }
    
    if (severity) {
      filteredTickets = filteredTickets.filter(ticket => 
        ticket.interaction.severity === severity
      );
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTickets = filteredTickets.filter(ticket =>
        ticket.patient.name?.toLowerCase().includes(searchLower) ||
        ticket.interaction.question?.toLowerCase().includes(searchLower) ||
        ticket.ticketId.toLowerCase().includes(searchLower)
      );
    }

    // Sort by creation date (newest first)
    filteredTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: filteredTickets.length,
      data: filteredTickets
    });
  } catch (error) {
    console.error('Error fetching escalation tickets:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single ticket
router.get('/:id', (req, res) => {
  try {
    const ticket = tickets.find(t => t._id === req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update ticket status and add feedback
router.put('/:id', (req, res) => {
  try {
    const { status, doctorNotes, feedback } = req.body;
    
    const ticketIndex = tickets.findIndex(t => t._id === req.params.id);
    
    if (ticketIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Update ticket
    if (status) tickets[ticketIndex].status = status;
    if (doctorNotes) tickets[ticketIndex].doctorNotes = doctorNotes;
    if (feedback) tickets[ticketIndex].feedback = feedback;
    tickets[ticketIndex].updatedAt = new Date();

    console.log(`Updated ticket: ${tickets[ticketIndex].ticketId} - Status: ${tickets[ticketIndex].status}`);

    res.json({
      success: true,
      data: tickets[ticketIndex]
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mark ticket as resolved (soft delete)
router.delete('/:id', (req, res) => {
  try {
    const ticketIndex = tickets.findIndex(t => t._id === req.params.id);
    
    if (ticketIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Mark as resolved instead of deleting
    tickets[ticketIndex].status = 'resolved';
    tickets[ticketIndex].updatedAt = new Date();

    console.log(`Resolved ticket: ${tickets[ticketIndex].ticketId}`);

    res.json({
      success: true,
      message: 'Ticket marked as resolved',
      data: tickets[ticketIndex]
    });
  } catch (error) {
    console.error('Error resolving ticket:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
