import { body, query } from 'express-validator';

export const createMeetingValidation = [
	body('title')
		.trim()
		.notEmpty()
		.withMessage('Title is required')
		.isLength({ min: 3, max: 200 })
		.withMessage('Title must be between 3 and 200 characters'),

	body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
	body('meetingUrl').optional().isURL().withMessage('Meeting URL must be a valid URL'),

	body('startTime')
		.notEmpty()
		.withMessage('Start time is required')
		.isISO8601()
		.withMessage('Start time must be a valid date')
		.custom((value) => {
			if (new Date(value) < new Date()) {
				throw new Error('Start time cannot be in the past');
			}
			return true;
		}),

	body('endTime')
		.notEmpty()
		.withMessage('End time is required')
		.isISO8601()
		.withMessage('End time must be a valid date')
		.custom((value, { req }) => {
			if (new Date(value) <= new Date(req.body.startTime)) {
				throw new Error('End time must be after start time');
			}
			return true;
		}),
];

export const updateMeetingValidation = [
	body('title').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
	body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
	body('meetingUrl').optional().isURL().withMessage('Meeting URL must be a valid URL'),
	body('startTime').optional().isISO8601().withMessage('Start time must be a valid date'),

	body('endTime')
		.optional()
		.isISO8601()
		.withMessage('End time must be a valid date')
		.custom((value, { req }) => {
			if (req.body.startTime && new Date(value) <= new Date(req.body.startTime)) {
				throw new Error('End time must be after start time');
			}
			return true;
		}),
];

export const updateMeetingStatusValidation = [
	body('status')
		.notEmpty()
		.withMessage('Status is required')
		.isIn(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'])
		.withMessage('Status must be SCHEDULED, ONGOING, COMPLETED, or CANCELLED'),
];

export const getMeetingsQueryValidation = [
	query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
	query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

	query('status')
		.optional()
		.isIn(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'])
		.withMessage('Status must be SCHEDULED, ONGOING, COMPLETED, or CANCELLED'),
	query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
	query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
	query('sortBy').optional().isIn(['startTime', 'endTime', 'createdAt', 'title']).withMessage('Invalid sortBy field'),
	query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be either asc or desc'),
];

export const getCalendarEventsValidation = [
	query('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Start date must be a valid date'),

	query('endDate')
		.notEmpty()
		.withMessage('End date is required')
		.isISO8601()
		.withMessage('End date must be a valid date')
		.custom((value, { req }) => {
			if (new Date(value) <= new Date(req.query.startDate as string)) {
				throw new Error('End date must be after start date');
			}
			return true;
		}),
];
