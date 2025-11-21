import { body, query } from 'express-validator';

export const updateUserValidation = [
	body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
	body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
	body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
];

export const updateUserRoleValidation = [
	body('role').notEmpty().withMessage('Role is required').isIn(['ADMIN', 'LEARNER']).withMessage('Role must be either ADMIN or LEARNER'),
];

export const changePasswordValidation = [
	body('currentPassword').notEmpty().withMessage('Current password is required'),

	body('newPassword')
		.isLength({ min: 6 })
		.withMessage('New password must be at least 6 characters long')
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
		.withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

export const getUsersQueryValidation = [
	query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
	query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
	query('role').optional().isIn(['ADMIN', 'LEARNER']).withMessage('Role must be either ADMIN or LEARNER'),
	query('sortBy').optional().isIn(['createdAt', 'email', 'firstName']).withMessage('Invalid sortBy field'),
	query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be either asc or desc'),
];
