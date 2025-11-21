import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { updateUserValidation, updateUserRoleValidation, changePasswordValidation, getUsersQueryValidation } from './users.validation.js';
import { validate } from '../../middleware/validate.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin)
 */
router.get('/', authorize('ADMIN'), getUsersQueryValidation, validate, UsersController.getAllUsers);

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', UsersController.getMyProfile);

/**
 * @route   GET /api/users/me/stats
 * @desc    Get current user statistics
 * @access  Private
 */
router.get('/me/stats', UsersController.getMyStats);

/**
 * @route   PUT /api/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me', updateUserValidation, validate, UsersController.updateMyProfile);

/**
 * @route   POST /api/users/me/change-password
 * @desc    Change password
 * @access  Private
 */
router.post('/me/change-password', changePasswordValidation, validate, UsersController.changePassword);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin or own profile)
 */
router.get('/:id', UsersController.getUserById);

/**
 * @route   GET /api/users/:id/stats
 * @desc    Get user statistics
 * @access  Private (Admin or own profile)
 */
router.get('/:id/stats', UsersController.getUserStats);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (Admin only)
 * @access  Private (Admin)
 */
router.put('/:id', authorize('ADMIN'), updateUserValidation, validate, UsersController.updateUser);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Update user role (Admin only)
 * @access  Private (Admin)
 */
router.patch('/:id/role', authorize('ADMIN'), updateUserRoleValidation, validate, UsersController.updateUserRole);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (Admin only)
 * @access  Private (Admin)
 */
router.delete('/:id', authorize('ADMIN'), UsersController.deleteUser);

export default router;
