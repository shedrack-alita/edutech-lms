import { TaskType, SubmissionStatus } from '@prisma/client';

export interface CreateTaskInput {
	title: string;
	description: string;
	type: TaskType;
	dueDate?: Date | string;
	maxScore?: number;
	attachments?: string[];
}

export interface UpdateTaskInput {
	title?: string;
	description?: string;
	type?: TaskType;
	dueDate?: Date | string;
	maxScore?: number;
	attachments?: string[];
}

export interface GetTasksQuery {
	page?: number;
	limit?: number;
	type?: TaskType;
	creatorId?: string;
	search?: string;
	sortBy?: 'createdAt' | 'title' | 'dueDate';
	sortOrder?: 'asc' | 'desc';
}

export interface CreateSubmissionInput {
	taskId: string;
	content?: string;
	attachments?: string[];
}

export interface UpdateSubmissionInput {
	content?: string;
	attachments?: string[];
}

export interface GradeSubmissionInput {
	score: number;
	feedback?: string;
	status: SubmissionStatus;
}

export interface GetSubmissionsQuery {
	page?: number;
	limit?: number;
	taskId?: string;
	userId?: string;
	status?: SubmissionStatus;
	sortBy?: 'submittedAt' | 'gradedAt' | 'score';
	sortOrder?: 'asc' | 'desc';
}

export interface TaskWithStats {
	id: string;
	title: string;
	description: string;
	type: TaskType;
	dueDate?: Date;
	maxScore?: number;
	attachments: string[];
	createdAt: Date;
	updatedAt: Date;
	creator: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
	};
	stats: {
		totalSubmissions: number;
		pendingSubmissions: number;
		gradedSubmissions: number;
		averageScore?: number;
	};
}

export interface SubmissionWithTask {
	id: string;
	content?: string;
	attachments: string[];
	score?: number;
	feedback?: string;
	status: SubmissionStatus;
	submittedAt: Date;
	gradedAt?: Date;
	task: {
		id: string;
		title: string;
		type: TaskType;
		dueDate?: Date;
		maxScore?: number;
	};
	user: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		avatar?: string;
	};
}
