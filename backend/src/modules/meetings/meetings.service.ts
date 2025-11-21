import prisma from '../../config/database.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../../shared/utils/errors.js';
import {
	CreateMeetingInput,
	UpdateMeetingInput,
	UpdateMeetingStatusInput,
	GetMeetingsQuery,
	MeetingWithCreator,
	CalendarEvent,
	MeetingStatistics,
} from './meetings.types.js';

export class MeetingsService {
	// ============================================
	// MEETING CRUD
	// ============================================

	/**
	 * Create a new meeting (Admin only)
	 */
	static async createMeeting(creatorId: string, data: CreateMeetingInput) {
		const { title, description, meetingUrl, startTime, endTime } = data;

		const start = new Date(startTime);
		const end = new Date(endTime);

		// Validate dates
		if (start >= end) {
			throw new ValidationError('End time must be after start time');
		}

		if (start < new Date()) {
			throw new ValidationError('Start time cannot be in the past');
		}

		// Check for conflicting meetings
		const conflictingMeeting = await prisma.meeting.findFirst({
			where: {
				creatorId,
				status: {
					not: 'CANCELLED',
				},
				OR: [
					// New meeting starts during existing meeting
					{
						AND: [{ startTime: { lte: start } }, { endTime: { gt: start } }],
					},
					// New meeting ends during existing meeting
					{
						AND: [{ startTime: { lt: end } }, { endTime: { gte: end } }],
					},
					// New meeting encompasses existing meeting
					{
						AND: [{ startTime: { gte: start } }, { endTime: { lte: end } }],
					},
				],
			},
		});

		if (conflictingMeeting) {
			throw new ValidationError('You have another meeting scheduled during this time');
		}

		const meeting = await prisma.meeting.create({
			data: {
				title,
				description,
				meetingUrl,
				startTime: start,
				endTime: end,
				creatorId,
				status: 'SCHEDULED',
			},
			include: {
				creator: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						avatar: true,
					},
				},
			},
		});

		return meeting;
	}

	/**
	 * Get all meetings with filters and pagination
	 */
	static async getAllMeetings(query: GetMeetingsQuery) {
		const { page = 1, limit = 10, status, creatorId, startDate, endDate, search, sortBy = 'startTime', sortOrder = 'asc' } = query;

		const skip = (page - 1) * limit;

		// Build where clause
		const where: any = {};

		if (status) {
			where.status = status;
		}

		if (creatorId) {
			where.creatorId = creatorId;
		}

		if (startDate) {
			where.startTime = {
				...where.startTime,
				gte: new Date(startDate),
			};
		}

		if (endDate) {
			where.startTime = {
				...where.startTime,
				lte: new Date(endDate),
			};
		}

		if (search) {
			where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];
		}

		// Get total count
		const total = await prisma.meeting.count({ where });

		// Get meetings
		const meetings = await prisma.meeting.findMany({
			where,
			skip,
			take: limit,
			orderBy: { [sortBy]: sortOrder },
			include: {
				creator: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						avatar: true,
					},
				},
			},
		});

		return {
			meetings,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	/**
	 * Get meeting by ID
	 */
	static async getMeetingById(meetingId: string): Promise<MeetingWithCreator> {
		const meeting = await prisma.meeting.findUnique({
			where: { id: meetingId },
			include: {
				creator: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						avatar: true,
					},
				},
			},
		});

		if (!meeting) {
			throw new NotFoundError('Meeting not found');
		}

		return meeting as MeetingWithCreator;
	}

	/**
	 * Update meeting
	 */
	static async updateMeeting(meetingId: string, userId: string, userRole: string, data: UpdateMeetingInput) {
		const meeting = await prisma.meeting.findUnique({
			where: { id: meetingId },
		});

		if (!meeting) {
			throw new NotFoundError('Meeting not found');
		}

		// Check if user is creator or admin
		if (meeting.creatorId !== userId && userRole !== 'ADMIN') {
			throw new ForbiddenError('You do not have permission to update this meeting');
		}

		// If meeting is completed or cancelled, don't allow updates
		if (meeting.status === 'COMPLETED' || meeting.status === 'CANCELLED') {
			throw new ForbiddenError('Cannot update a completed or cancelled meeting');
		}

		// Validate dates if provided
		const startTime = data.startTime ? new Date(data.startTime) : meeting.startTime;
		const endTime = data.endTime ? new Date(data.endTime) : meeting.endTime;

		if (startTime >= endTime) {
			throw new ValidationError('End time must be after start time');
		}

		// Check for conflicts if times are being changed
		if (data.startTime || data.endTime) {
			const conflictingMeeting = await prisma.meeting.findFirst({
				where: {
					id: { not: meetingId },
					creatorId: meeting.creatorId,
					status: {
						not: 'CANCELLED',
					},
					OR: [
						{
							AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
						},
						{
							AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
						},
						{
							AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
						},
					],
				},
			});

			if (conflictingMeeting) {
				throw new ValidationError('This time conflicts with another scheduled meeting');
			}
		}

		const updatedMeeting = await prisma.meeting.update({
			where: { id: meetingId },
			data: {
				title: data.title,
				description: data.description,
				meetingUrl: data.meetingUrl,
				startTime: data.startTime ? new Date(data.startTime) : undefined,
				endTime: data.endTime ? new Date(data.endTime) : undefined,
			},
			include: {
				creator: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						avatar: true,
					},
				},
			},
		});

		return updatedMeeting;
	}

	/**
	 * Update meeting status
	 */
	static async updateMeetingStatus(meetingId: string, userId: string, userRole: string, data: UpdateMeetingStatusInput) {
		const meeting = await prisma.meeting.findUnique({
			where: { id: meetingId },
		});

		if (!meeting) {
			throw new NotFoundError('Meeting not found');
		}

		// Check if user is creator or admin
		if (meeting.creatorId !== userId && userRole !== 'ADMIN') {
			throw new ForbiddenError('You do not have permission to update this meeting status');
		}

		const updatedMeeting = await prisma.meeting.update({
			where: { id: meetingId },
			data: {
				status: data.status,
			},
			include: {
				creator: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						avatar: true,
					},
				},
			},
		});

		return updatedMeeting;
	}

	/**
	 * Delete meeting
	 */
	static async deleteMeeting(meetingId: string, userId: string, userRole: string) {
		const meeting = await prisma.meeting.findUnique({
			where: { id: meetingId },
		});

		if (!meeting) {
			throw new NotFoundError('Meeting not found');
		}

		// Check if user is creator or admin
		if (meeting.creatorId !== userId && userRole !== 'ADMIN') {
			throw new ForbiddenError('You do not have permission to delete this meeting');
		}

		// If meeting is ongoing, don't allow deletion
		if (meeting.status === 'ONGOING') {
			throw new ForbiddenError('Cannot delete an ongoing meeting');
		}

		await prisma.meeting.delete({
			where: { id: meetingId },
		});
	}

	// ============================================
	// CALENDAR & SCHEDULING
	// ============================================

	/**
	 * Get calendar events for a date range
	 */
	static async getCalendarEvents(startDate: string, endDate: string, userId?: string): Promise<CalendarEvent[]> {
		const where: any = {
			startTime: {
				gte: new Date(startDate),
				lte: new Date(endDate),
			},
		};

		if (userId) {
			where.creatorId = userId;
		}

		const meetings = await prisma.meeting.findMany({
			where,
			orderBy: { startTime: 'asc' },
			select: {
				id: true,
				title: true,
				startTime: true,
				endTime: true,
				status: true,
				meetingUrl: true,
				description: true,
			},
		});

		return meetings.map((meeting) => ({
			id: meeting.id,
			title: meeting.title,
			start: meeting.startTime,
			end: meeting.endTime,
			status: meeting.status,
			meetingUrl: meeting.meetingUrl || undefined,
			description: meeting.description || undefined,
		}));
	}

	/**
	 * Get upcoming meetings
	 */
	static async getUpcomingMeetings(userId?: string, limit: number = 5) {
		const where: any = {
			startTime: {
				gte: new Date(),
			},
			status: {
				in: ['SCHEDULED', 'ONGOING'],
			},
		};

		if (userId) {
			where.creatorId = userId;
		}

		const meetings = await prisma.meeting.findMany({
			where,
			take: limit,
			orderBy: { startTime: 'asc' },
			include: {
				creator: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						avatar: true,
					},
				},
			},
		});

		return meetings;
	}

	/**
	 * Get today's meetings
	 */
	static async getTodaysMeetings(userId?: string) {
		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date();
		endOfDay.setHours(23, 59, 59, 999);

		const where: any = {
			startTime: {
				gte: startOfDay,
				lte: endOfDay,
			},
		};

		if (userId) {
			where.creatorId = userId;
		}

		const meetings = await prisma.meeting.findMany({
			where,
			orderBy: { startTime: 'asc' },
			include: {
				creator: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						avatar: true,
					},
				},
			},
		});

		return meetings;
	}

	// ============================================
	// STATISTICS
	// ============================================

	/**
	 * Get meeting statistics
	 */
	static async getMeetingStatistics(userId?: string): Promise<MeetingStatistics> {
		const where: any = {};

		if (userId) {
			where.creatorId = userId;
		}

		// Total meetings
		const totalMeetings = await prisma.meeting.count({ where });

		// Scheduled meetings
		const scheduledMeetings = await prisma.meeting.count({
			where: {
				...where,
				status: 'SCHEDULED',
			},
		});

		// Ongoing meetings
		const ongoingMeetings = await prisma.meeting.count({
			where: {
				...where,
				status: 'ONGOING',
			},
		});

		// Completed meetings
		const completedMeetings = await prisma.meeting.count({
			where: {
				...where,
				status: 'COMPLETED',
			},
		});

		// Cancelled meetings
		const cancelledMeetings = await prisma.meeting.count({
			where: {
				...where,
				status: 'CANCELLED',
			},
		});

		// Upcoming meetings (scheduled and in the future)
		const upcomingMeetings = await prisma.meeting.count({
			where: {
				...where,
				startTime: {
					gte: new Date(),
				},
				status: 'SCHEDULED',
			},
		});

		// Today's meetings
		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date();
		endOfDay.setHours(23, 59, 59, 999);

		const todaysMeetings = await prisma.meeting.count({
			where: {
				...where,
				startTime: {
					gte: startOfDay,
					lte: endOfDay,
				},
			},
		});

		return {
			totalMeetings,
			scheduledMeetings,
			ongoingMeetings,
			completedMeetings,
			cancelledMeetings,
			upcomingMeetings,
			todaysMeetings,
		};
	}

	/**
	 * Auto-update meeting statuses (can be called by a cron job)
	 */
	static async autoUpdateMeetingStatuses() {
		const now = new Date();

		// Update meetings that should be ongoing
		await prisma.meeting.updateMany({
			where: {
				status: 'SCHEDULED',
				startTime: {
					lte: now,
				},
				endTime: {
					gt: now,
				},
			},
			data: {
				status: 'ONGOING',
			},
		});

		// Update meetings that should be completed
		await prisma.meeting.updateMany({
			where: {
				status: {
					in: ['SCHEDULED', 'ONGOING'],
				},
				endTime: {
					lte: now,
				},
			},
			data: {
				status: 'COMPLETED',
			},
		});
	}
}
