import { MeetingStatus } from '@prisma/client';

export interface CreateMeetingInput {
	title: string;
	description?: string;
	meetingUrl?: string;
	startTime: Date | string;
	endTime: Date | string;
}

export interface UpdateMeetingInput {
	title?: string;
	description?: string;
	meetingUrl?: string;
	startTime?: Date | string;
	endTime?: Date | string;
}

export interface UpdateMeetingStatusInput {
	status: MeetingStatus;
}

export interface GetMeetingsQuery {
	page?: number;
	limit?: number;
	status?: MeetingStatus;
	creatorId?: string;
	startDate?: string; // Filter meetings from this date
	endDate?: string; // Filter meetings until this date
	search?: string;
	sortBy?: 'startTime' | 'endTime' | 'createdAt' | 'title';
	sortOrder?: 'asc' | 'desc';
}

export interface MeetingWithCreator {
	id: string;
	title: string;
	description?: string;
	meetingUrl?: string;
	startTime: Date;
	endTime: Date;
	status: MeetingStatus;
	createdAt: Date;
	updatedAt: Date;
	creator: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		avatar?: string;
	};
}

export interface CalendarEvent {
	id: string;
	title: string;
	start: Date;
	end: Date;
	status: MeetingStatus;
	meetingUrl?: string;
	description?: string;
}

export interface MeetingStatistics {
	totalMeetings: number;
	scheduledMeetings: number;
	ongoingMeetings: number;
	completedMeetings: number;
	cancelledMeetings: number;
	upcomingMeetings: number;
	todaysMeetings: number;
}
