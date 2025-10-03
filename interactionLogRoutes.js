// apps/api/src/routes/interactionLogRoutes.js
const express = require('express');
const { InteractionLogController, upload } = require('../controllers/interactionLogController');
const authMiddleware = require('../middleware/authMiddleware'); // Your auth middleware
const rbacMiddleware = require('../middleware/rbacMiddleware'); // Role-based access control

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

/**
 * @route   POST /api/interactions
 * @desc    Create new interaction log with optional file attachments
 * @access  Private (Patient, Doctor, Admin)
 */
router.post('/', 
  upload.array('attachments', 5), // Max 5 files
  InteractionLogController.createInteraction
);

/**
 * @route   GET /api/interactions
 */