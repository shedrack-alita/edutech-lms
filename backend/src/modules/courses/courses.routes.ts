import { Router } from 'express';
import { CoursesController } from './courses.controller.js';
import {
	createCourseValidation,
	updateCourseValidation,
	getCoursesQueryValidation,
	createModuleValidation,
	updateModuleValidation,
	createLessonValidation,
	updateLessonValidation,
} from './courses.validation.js';
import { validate } from '../../middleware/validate.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

// ============================================
// COURSE ROUTES
// ============================================

/**
 * @route   POST /api/courses
 * @desc    Create a new course
 * @access  Private (Admin only)
 */
router.post('/', authenticate, authorize('ADMIN'), createCourseValidation, validate, CoursesController.createCourse);

/**
 * @route   GET /api/courses
 * @desc    Get all courses with filters
 * @access  Public
 */
router.get('/', getCoursesQueryValidation, validate, CoursesController.getAllCourses);

/**
 * @route   GET /api/courses/:id
 * @desc    Get course by ID
 * @access  Public (but unpublished courses require auth)
 */
router.get('/:id', CoursesController.getCourseById);

/**
 * @route   GET /api/courses/:id/stats
 * @desc    Get course statistics
 * @access  Private (Creator or Admin)
 */
router.get('/:id/stats', authenticate, CoursesController.getCourseStats);

/**
 * @route   PUT /api/courses/:id
 * @desc    Update course
 * @access  Private (Creator or Admin)
 */
router.put('/:id', authenticate, authorize('ADMIN'), updateCourseValidation, validate, CoursesController.updateCourse);

/**
 * @route   PATCH /api/courses/:id/publish
 * @desc    Toggle course publish status
 * @access  Private (Creator or Admin)
 */
router.patch('/:id/publish', authenticate, authorize('ADMIN'), CoursesController.togglePublish);

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete course
 * @access  Private (Creator or Admin)
 */
router.delete('/:id', authenticate, authorize('ADMIN'), CoursesController.deleteCourse);

// ============================================
// MODULE ROUTES
// ============================================

/**
 * @route   POST /api/courses/:courseId/modules
 * @desc    Add module to course
 * @access  Private (Creator or Admin)
 */
router.post('/:courseId/modules', authenticate, authorize('ADMIN'), createModuleValidation, validate, CoursesController.createModule);

/**
 * @route   GET /api/modules/:id
 * @desc    Get module by ID
 * @access  Public
 */
router.get('/modules/:id', CoursesController.getModuleById);

/**
 * @route   PUT /api/modules/:id
 * @desc    Update module
 * @access  Private (Creator or Admin)
 */
router.put('/modules/:id', authenticate, authorize('ADMIN'), updateModuleValidation, validate, CoursesController.updateModule);

/**
 * @route   DELETE /api/modules/:id
 * @desc    Delete module
 * @access  Private (Creator or Admin)
 */
router.delete('/modules/:id', authenticate, authorize('ADMIN'), CoursesController.deleteModule);

// ============================================
// LESSON ROUTES
// ============================================

/**
 * @route   POST /api/modules/:moduleId/lessons
 * @desc    Add lesson to module
 * @access  Private (Creator or Admin)
 */
router.post(
	'/modules/:moduleId/lessons',
	authenticate,
	authorize('ADMIN'),
	createLessonValidation,
	validate,
	CoursesController.createLesson
);

/**
 * @route   GET /api/lessons/:id
 * @desc    Get lesson by ID
 * @access  Public (or authenticated for enrolled users)
 */
router.get('/lessons/:id', CoursesController.getLessonById);

/**
 * @route   PUT /api/lessons/:id
 * @desc    Update lesson
 * @access  Private (Creator or Admin)
 */
router.put('/lessons/:id', authenticate, authorize('ADMIN'), updateLessonValidation, validate, CoursesController.updateLesson);

/**
 * @route   DELETE /api/lessons/:id
 * @desc    Delete lesson
 * @access  Private (Creator or Admin)
 */
router.delete('/lessons/:id', authenticate, authorize('ADMIN'), CoursesController.deleteLesson);

export default router;
