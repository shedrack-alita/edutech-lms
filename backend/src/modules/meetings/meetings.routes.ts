import { Router } from 'express';
import { MeetingsController } from './meetings.controller.js';
import {
	createMeetingValidation,
	updateMeetingValidation,
	updateMeetingStatusValidation,
	getMeetingsQueryValidation,
	getCalendarEventsValidation,
} from './meetings.validation.js';
import { validate } from '../../middleware/validate.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/meetings
 * @desc    Create a new meeting
 * @access  Private (Admin only)
 */
router.post('/', authorize('ADMIN'), createMeetingValidation, validate, MeetingsController.createMeeting);

/**
 * @route   GET /api/meetings
 * @desc    Get all meetings with filters
 * @access  Private
 */
router.get('/', getMeetingsQueryValidation, validate, MeetingsController.getAllMeetings);

/**
 * @route   GET /api/meetings/calendar/events
 * @desc    Get calendar events for a date range
 * @access  Private
 */
router.get('/calendar/events', getCalendarEventsValidation, validate, MeetingsController.getCalendarEvents);

/**
 * @route   GET /api/meetings/upcoming
 * @desc    Get upcoming meetings
 * @access  Private
 */
router.get('/upcoming', MeetingsController.getUpcomingMeetings);

/**
 * @route   GET /api/meetings/today
 * @desc    Get today's meetings
 * @access  Private
 */
router.get('/today', MeetingsController.getTodaysMeetings);

/**
 * @route   GET /api/meetings/statistics
 * @desc    Get meeting statistics
 * @access  Private
 */
router.get('/statistics', MeetingsController.getMeetingStatistics);

/**
 * @route   POST /api/meetings/auto-update-statuses
 * @desc    Auto-update meeting statuses (for cron jobs)
 * @access  Private (Admin only)
 */
router.post('/auto-update-statuses', authorize('ADMIN'), MeetingsController.autoUpdateMeetingStatuses);

/**
 * @route   GET /api/meetings/:id
 * @desc    Get meeting by ID
 * @access  Private
 */
router.get('/:id', MeetingsController.getMeetingById);

/**
 * @route   PUT /api/meetings/:id
 * @desc    Update meeting
 * @access  Private (Creator or Admin)
 */
router.put('/:id', authorize('ADMIN'), updateMeetingValidation, validate, MeetingsController.updateMeeting);

/**
 * @route   PATCH /api/meetings/:id/status
 * @desc    Update meeting status
 * @access  Private (Creator or Admin)
 */
router.patch('/:id/status', authorize('ADMIN'), updateMeetingStatusValidation, validate, MeetingsController.updateMeetingStatus);

/**
 * @route   DELETE /api/meetings/:id
 * @desc    Delete meeting
 * @access  Private (Creator or Admin)
 */
router.delete('/:id', authorize('ADMIN'), MeetingsController.deleteMeeting);

export default router;
