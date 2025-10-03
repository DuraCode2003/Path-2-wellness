const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');

// Public routes
router.post('/register', validate('registerUser'), authController.register);
router.post('/login', validate('loginUser'), authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Protected routes (require authentication)
router.use(protect);

router.get('/me', authController.getMe);
router.put('/update-details', validate('updateUser'), authController.updateDetails);
router.put('/update-password', authController.updatePassword);
router.post('/logout', authController.logout);

module.exports = router;
