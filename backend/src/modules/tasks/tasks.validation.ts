import { body, query } from 'express-validator';

// Task Validations
export const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),

  body('type')
    .notEmpty()
    .withMessage('Task type is required')
    .isIn(['ASSIGNMENT', 'PROJECT', 'QUIZ'])
    .withMessage('Task type must be ASSIGNMENT, PROJECT, or QUIZ'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Due date cannot be in the past');
      }
      return true;
    }),

  body('maxScore')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max score must be a positive integer'),

  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),

  body('attachments.*')
    .optional()
    .isURL()
    .withMessage('Each attachment must be a valid URL'),
];

export const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),

  body('type')
    .optional()
    .isIn(['ASSIGNMENT', 'PROJECT', 'QUIZ'])
    .withMessage('Task type must be ASSIGNMENT, PROJECT, or QUIZ'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),

  body('maxScore')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max score must be a positive integer'),

  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),

  body('attachments.*')
    .optional()
    .isURL()
    .withMessage('Each attachment must be a valid URL'),
];

export const getTasksQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('type')
    .optional()
    .isIn(['ASSIGNMENT', 'PROJECT', 'QUIZ'])
    .withMessage('Task type must be ASSIGNMENT, PROJECT, or QUIZ'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'title', 'dueDate'])
    .withMessage('Invalid sortBy field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
];

// Submission Validations
export const createSubmissionValidation = [
  body('taskId')
    .notEmpty()
    .withMessage('Task ID is required')
    .isUUID()
    .withMessage('Task ID must be a valid UUID'),

  body('content')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters long'),

  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),

  body('attachments.*')
    .optional()
    .isURL()
    .withMessage('Each attachment must be a valid URL'),
];

export const updateSubmissionValidation = [
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters long'),

  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),

  body('attachments.*')
    .optional()
    .isURL()
    .withMessage('Each attachment must be a valid URL'),
];

export const gradeSubmissionValidation = [
  body('score')
    .notEmpty()
    .withMessage('Score is required')
    .isNumeric()
    .withMessage('Score must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Score cannot be negative');
      }
      return true;
    }),

  body('feedback')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Feedback must be at least 10 characters long'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['PENDING', 'GRADED', 'RETURNED'])
    .withMessage('Status must be PENDING, GRADED, or RETURNED'),
];

export const getSubmissionsQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(['PENDING', 'GRADED', 'RETURNED'])
    .withMessage('Status must be PENDING, GRADED, or RETURNED'),

  query('sortBy')
    .optional()
    .isIn(['submittedAt', 'gradedAt', 'score'])
    .withMessage('Invalid sortBy field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
];