import { Router } from 'express';
import { EnrollmentController } from './enrollment.controller.js';
import {
	enrollCourseValidation,
	updateEnrollmentStatusValidation,
	markLessonCompleteValidation,
	getEnrollmentsQueryValidation,
} from './enrollment.validation.js';
import { validate } from '../../middleware/validate.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/enrollments
 * @desc    Enroll in a course
 * @access  Private
 */
router.post('/', enrollCourseValidation, validate, EnrollmentController.enrollInCourse);

/**
 * @route   GET /api/enrollments
 * @desc    Get all enrollments (Admin only)
 * @access  Private (Admin)
 */
router.get('/', authorize('ADMIN'), getEnrollmentsQueryValidation, validate, EnrollmentController.getAllEnrollments);

/**
 * @route   GET /api/enrollments/me
 * @desc    Get my enrollments
 * @access  Private
 */
router.get('/me', getEnrollmentsQueryValidation, validate, EnrollmentController.getMyEnrollments);

/**
 * @route   GET /api/enrollments/stats
 * @desc    Get user's learning statistics
 * @access  Private
 */
router.get('/stats', EnrollmentController.getUserLearningStats);

/**
 * @route   POST /api/enrollments/progress/complete
 * @desc    Mark lesson as complete
 * @access  Private
 */
router.post('/progress/complete', markLessonCompleteValidation, validate, EnrollmentController.markLessonComplete);

/**
 * @route   POST /api/enrollments/progress/incomplete
 * @desc    Mark lesson as incomplete
 * @access  Private
 */
router.post('/progress/incomplete', markLessonCompleteValidation, validate, EnrollmentController.markLessonIncomplete);

/**
 * @route   GET /api/enrollments/courses/:courseId/progress
 * @desc    Get course progress
 * @access  Private
 */
router.get('/courses/:courseId/progress', EnrollmentController.getCourseProgress);

/**
 * @route   GET /api/enrollments/courses/:courseId/lessons-progress
 * @desc    Get course lessons progress
 * @access  Private
 */
router.get('/courses/:courseId/lessons-progress', EnrollmentController.getCourseLessonsProgress);

/**
 * @route   GET /api/enrollments/:id
 * @desc    Get enrollment by ID
 * @access  Private
 */
router.get('/:id', EnrollmentController.getEnrollmentById);

/**
 * @route   PATCH /api/enrollments/:id/status
 * @desc    Update enrollment status (Admin only)
 * @access  Private (Admin)
 */
router.patch('/:id/status', authorize('ADMIN'), updateEnrollmentStatusValidation, validate, EnrollmentController.updateEnrollmentStatus);

/**
 * @route   DELETE /api/enrollments/:id
 * @desc    Unenroll from course
 * @access  Private
 */
router.delete('/:id', EnrollmentController.unenrollFromCourse);

export default router;
