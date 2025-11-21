import { Request, Response, NextFunction } from 'express';
import { MeetingsService } from './meetings.service.js';
import { ResponseUtil } from '../../shared/utils/response.js';
import { AuthRequest } from '../../shared/types/index.js';
import { CreateMeetingInput, UpdateMeetingInput, UpdateMeetingStatusInput, GetMeetingsQuery } from './meetings.types.js';

export class MeetingsController {
	/**
	 * Create meeting
	 * POST /api/meetings
	 */
	static async createMeeting(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const data: CreateMeetingInput = req.body;
			const meeting = await MeetingsService.createMeeting(req.user.id, data);

			return ResponseUtil.success(res, meeting, 'Meeting created successfully', 201);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get all meetings
	 * GET /api/meetings
	 */
	static async getAllMeetings(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const query: GetMeetingsQuery = {
				page: req.query.page ? parseInt(req.query.page as string) : undefined,
				limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
				status: req.query.status as any,
				creatorId: req.query.creatorId as string,
				startDate: req.query.startDate as string,
				endDate: req.query.endDate as string,
				search: req.query.search as string,
				sortBy: req.query.sortBy as any,
				sortOrder: req.query.sortOrder as 'asc' | 'desc',
			};

			const result = await MeetingsService.getAllMeetings(query);

			return ResponseUtil.paginated(res, result.meetings, result.pagination.page, result.pagination.limit, result.pagination.total);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get meeting by ID
	 * GET /api/meetings/:id
	 */
	static async getMeetingById(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const meeting = await MeetingsService.getMeetingById(id);

			return ResponseUtil.success(res, meeting, 'Meeting retrieved successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Update meeting
	 * PUT /api/meetings/:id
	 */
	static async updateMeeting(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { id } = req.params;
			const data: UpdateMeetingInput = req.body;

			const meeting = await MeetingsService.updateMeeting(id, req.user.id, req.user.role, data);

			return ResponseUtil.success(res, meeting, 'Meeting updated successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Update meeting status
	 * PATCH /api/meetings/:id/status
	 */
	static async updateMeetingStatus(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { id } = req.params;
			const data: UpdateMeetingStatusInput = req.body;

			const meeting = await MeetingsService.updateMeetingStatus(id, req.user.id, req.user.role, data);

			return ResponseUtil.success(res, meeting, 'Meeting status updated successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Delete meeting
	 * DELETE /api/meetings/:id
	 */
	static async deleteMeeting(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { id } = req.params;

			await MeetingsService.deleteMeeting(id, req.user.id, req.user.role);

			return ResponseUtil.success(res, null, 'Meeting deleted successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get calendar events
	 * GET /api/meetings/calendar/events
	 */
	static async getCalendarEvents(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { startDate, endDate, userId } = req.query;

			const events = await MeetingsService.getCalendarEvents(startDate as string, endDate as string, userId as string | undefined);

			return ResponseUtil.success(res, events, 'Calendar events retrieved successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get upcoming meetings
	 * GET /api/meetings/upcoming
	 */
	static async getUpcomingMeetings(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
			const userId = req.query.userId as string | undefined;

			const meetings = await MeetingsService.getUpcomingMeetings(userId, limit);

			return ResponseUtil.success(res, meetings, 'Upcoming meetings retrieved successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get today's meetings
	 * GET /api/meetings/today
	 */
	static async getTodaysMeetings(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const userId = req.query.userId as string | undefined;

			const meetings = await MeetingsService.getTodaysMeetings(userId);

			return ResponseUtil.success(res, meetings, "Today's meetings retrieved successfully");
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get meeting statistics
	 * GET /api/meetings/statistics
	 */
	static async getMeetingStatistics(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const userId = req.query.userId as string | undefined;

			const stats = await MeetingsService.getMeetingStatistics(userId);

			return ResponseUtil.success(res, stats, 'Meeting statistics retrieved successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Auto-update meeting statuses (can be called by cron job)
	 * POST /api/meetings/auto-update-statuses
	 */
	static async autoUpdateMeetingStatuses(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			await MeetingsService.autoUpdateMeetingStatuses();

			return ResponseUtil.success(res, null, 'Meeting statuses updated successfully');
		} catch (error) {
			next(error);
		}
	}
}
