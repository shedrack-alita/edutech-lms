import { Router } from 'express';
import { TasksController } from './tasks.controller.js';
import {
	createTaskValidation,
	updateTaskValidation,
	getTasksQueryValidation,
	createSubmissionValidation,
	updateSubmissionValidation,
	gradeSubmissionValidation,
	getSubmissionsQueryValidation,
} from './tasks.validation.js';
import { validate } from '../../middleware/validate.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============================================
// TASK ROUTES
// ============================================

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private (Admin only)
 */
router.post('/', authorize('ADMIN'), createTaskValidation, validate, TasksController.createTask);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with filters
 * @access  Private
 */
router.get('/', getTasksQueryValidation, validate, TasksController.getAllTasks);

/**
 * @route   GET /api/tasks/stats
 * @desc    Get user's task statistics
 * @access  Private
 */
router.get('/stats', TasksController.getUserTaskStats);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get task by ID
 * @access  Private
 */
router.get('/:id', TasksController.getTaskById);

/**
 * @route   GET /api/tasks/:id/statistics
 * @desc    Get task statistics (Admin only)
 * @access  Private (Admin)
 */
router.get('/:id/statistics', authorize('ADMIN'), TasksController.getTaskStatistics);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 * @access  Private (Creator or Admin)
 */
router.put('/:id', authorize('ADMIN'), updateTaskValidation, validate, TasksController.updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task
 * @access  Private (Creator or Admin)
 */
router.delete('/:id', authorize('ADMIN'), TasksController.deleteTask);

// ============================================
// SUBMISSION ROUTES
// ============================================

/**
 * @route   POST /api/tasks/submissions
 * @desc    Submit a task
 * @access  Private
 */
router.post('/submissions', createSubmissionValidation, validate, TasksController.createSubmission);

/**
 * @route   GET /api/tasks/submissions
 * @desc    Get all submissions (Admin only)
 * @access  Private (Admin)
 */
router.get('/submissions', authorize('ADMIN'), getSubmissionsQueryValidation, validate, TasksController.getAllSubmissions);

/**
 * @route   GET /api/tasks/submissions/me
 * @desc    Get my submissions
 * @access  Private
 */
router.get('/submissions/me', getSubmissionsQueryValidation, validate, TasksController.getMySubmissions);

/**
 * @route   GET /api/tasks/submissions/:id
 * @desc    Get submission by ID
 * @access  Private
 */
router.get('/submissions/:id', TasksController.getSubmissionById);

/**
 * @route   PUT /api/tasks/submissions/:id
 * @desc    Update submission (before grading)
 * @access  Private (Owner only)
 */
router.put('/submissions/:id', updateSubmissionValidation, validate, TasksController.updateSubmission);

/**
 * @route   PATCH /api/tasks/submissions/:id/grade
 * @desc    Grade submission
 * @access  Private (Admin only)
 */
router.patch('/submissions/:id/grade', authorize('ADMIN'), gradeSubmissionValidation, validate, TasksController.gradeSubmission);

/**
 * @route   DELETE /api/tasks/submissions/:id
 * @desc    Delete submission
 * @access  Private (Owner or Admin)
 */
router.delete('/submissions/:id', TasksController.deleteSubmission);

export default router;
