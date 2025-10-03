const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const EscalationTicketController = require('../controllers/escalationTicketController');
const upload = require('../middleware/upload');

// Apply authentication to all routes
router.use(protect);

/**
 * @route   GET /api/tickets
 * @desc    Get all tickets with filtering and pagination
 * @access  Private (Admin, Doctor, Patient - with restrictions)
 */
router.get('/', 
  checkPermission('view_tickets'),
  EscalationTicketController.getTickets
);

/**
 * @route   GET /api/tickets/stats
 * @desc    Get ticket statistics
 * @access  Private (Admin, Doctor)
 */
router.get('/stats',
  authorize('admin', 'doctor'),
  EscalationTicketController.getTicketStats
);

/**
 * @route   GET /api/tickets/status
 * @desc    Get tickets grouped by status for dashboard
 * @access  Private (Admin, Doctor)
 */
router.get('/status',
  authorize('admin', 'doctor'),
  EscalationTicketController.getTicketsByStatus
);

/**
 * @route   GET /api/tickets/:id
 * @desc    Get single ticket by ID
 * @access  Private (Admin, Doctor, Patient - own tickets only)
 */
router.get('/:id', 
  checkPermission('view_tickets'),
  EscalationTicketController.getTicket
);

/**
 * @route   PUT /api/tickets/:id/status
 * @desc    Update ticket status
 * @access  Private (Admin, Doctor - assigned only)
 */
router.put('/:id/status',
  authorize('admin', 'doctor'),
  EscalationTicketController.updateTicketStatus
);

/**
 * @route   POST /api/tickets/:id/messages
 * @desc    Add message to ticket
 * @access  Private (Admin, Doctor, Patient - own tickets only)
 */
router.post('/:id/messages',
  upload.array('attachments', 5), // Max 5 files
  checkPermission('ticket_message'),
  EscalationTicketController.addMessage
);

/**
 * @route   POST /api/tickets/:id/assign
 * @desc    Assign ticket to a doctor
 * @access  Private (Admin, Doctor with permission)
 */
router.post('/:id/assign',
  authorize('admin'),
  checkPermission('manage_tickets'),
  EscalationTicketController.assignTicket
);

/**
 * @route   POST /api/tickets/:id/escalate
 * @desc    Escalate ticket to higher priority
 * @access  Private (Admin, Doctor with permission)
 */
router.post('/:id/escalate',
  authorize('admin', 'doctor'),
  checkPermission('escalate_tickets'),
  EscalationTicketController.escalateTicket
);

/**
 * @route   GET /api/tickets/:id/export
 * @desc    Export ticket details as PDF
 * @access  Private (Admin, Doctor, Patient - own tickets only)
 */
router.get('/:id/export',
  checkPermission('export_tickets'),
  EscalationTicketController.exportTicket
);

module.exports = router;
