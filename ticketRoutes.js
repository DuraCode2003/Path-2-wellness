const express = require('express');
const {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  addMessage,
  resolveTicket,
  getTicketStats,
  assignTicket
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes (for AI system to create tickets)
router.post('/', createTicket);

// Protected routes (authentication required)
router.use(protect);

// General ticket routes
router.get('/', getAllTickets);
router.get('/stats', getTicketStats);
router.get('/:id', getTicketById);
router.put('/:id', updateTicket);

// Message routes
router.post('/:id/messages', addMessage);

// Resolution routes
router.put('/:id/resolve', resolveTicket);

// Admin-only routes
router.delete('/:id', authorize('Admin'), deleteTicket);
router.put('/:id/assign', authorize('Admin'), assignTicket);

module.exports = router;
