import { body, query } from 'express-validator';

export const enrollCourseValidation = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .isUUID()
    .withMessage('Course ID must be a valid UUID'),
];

export const updateEnrollmentStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['ACTIVE', 'COMPLETED', 'DROPPED'])
    .withMessage('Status must be ACTIVE, COMPLETED, or DROPPED'),
];

export const markLessonCompleteValidation = [
  body('lessonId')
    .notEmpty()
    .withMessage('Lesson ID is required')
    .isUUID()
    .withMessage('Lesson ID must be a valid UUID'),
];

export const getEnrollmentsQueryValidation = [
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
    .isIn(['ACTIVE', 'COMPLETED', 'DROPPED'])
    .withMessage('Status must be ACTIVE, COMPLETED, or DROPPED'),

  query('sortBy')
    .optional()
    .isIn(['enrolledAt', 'completedAt'])
    .withMessage('Invalid sortBy field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
];