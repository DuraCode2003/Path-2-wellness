const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { hasPermission } = require('../middleware/permissions');
const userController = require('../controllers/userController');

// All routes are protected
router.use(protect);

// Admin-only routes
router.use(authorize('admin'));

// User management routes
router.get('/', hasPermission('view_users'), userController.getUsers);
router.get('/doctors', hasPermission('view_doctors'), userController.getDoctors);
router.get('/:id', hasPermission('view_user'), userController.getUser);
router.post('/', hasPermission('create_user'), validate('registerUser'), userController.createUser);
router.put('/:id', hasPermission('update_user'), validate('updateUser'), userController.updateUser);
router.delete('/:id', hasPermission('delete_user'), userController.deleteUser);

// User profile routes (accessible by the user themselves or admin)
router.put('/:id/profile', hasPermission('update_profile'), validate('updateUser'), userController.updateUserProfile);
router.put('/:id/password', hasPermission('update_password'), userController.adminUpdatePassword);
router.put('/:id/status', hasPermission('update_user_status'), userController.updateUserStatus);

// User permissions and roles
router.put('/:id/roles', hasPermission('manage_roles'), userController.updateUserRoles);
router.put('/:id/permissions', hasPermission('manage_permissions'), userController.updateUserPermissions);

module.exports = router;
