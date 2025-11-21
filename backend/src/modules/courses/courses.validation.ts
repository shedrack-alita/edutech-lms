import { body, query } from 'express-validator';

// Course Validations
export const createCourseValidation = [
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

  body('thumbnail').optional().isURL().withMessage('Thumbnail must be a valid URL'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),

  body('level')
    .optional()
    .isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
    .withMessage('Level must be BEGINNER, INTERMEDIATE, or ADVANCED'),
];

export const updateCourseValidation = [
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

  body('thumbnail').optional().isURL().withMessage('Thumbnail must be a valid URL'),

  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),

  body('level')
    .optional()
    .isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
    .withMessage('Level must be BEGINNER, INTERMEDIATE, or ADVANCED'),
];

export const getCoursesQueryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('level')
    .optional()
    .isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'])
    .withMessage('Level must be BEGINNER, INTERMEDIATE, or ADVANCED'),

  query('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'title', 'updatedAt'])
    .withMessage('Invalid sortBy field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
];

// Module Validations
export const createModuleValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),

  body('order')
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
];

export const updateModuleValidation = [
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

  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
];

// Lesson Validations
export const createLessonValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),

  body('contentType')
    .notEmpty()
    .withMessage('Content type is required')
    .isIn(['VIDEO', 'TEXT', 'DOCUMENT'])
    .withMessage('Content type must be VIDEO, TEXT, or DOCUMENT'),

  body('videoUrl')
    .optional()
    .isURL()
    .withMessage('Video URL must be a valid URL'),

  body('textContent').optional().isString(),

  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),

  body('order')
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
];

export const updateLessonValidation = [
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

  body('contentType')
    .optional()
    .isIn(['VIDEO', 'TEXT', 'DOCUMENT'])
    .withMessage('Content type must be VIDEO, TEXT, or DOCUMENT'),

  body('videoUrl')
    .optional()
    .isURL()
    .withMessage('Video URL must be a valid URL'),

  body('textContent').optional().isString(),

  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),

  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
];