import { EnrollmentStatus } from '@prisma/client';

export interface EnrollCourseInput {
	courseId: string;
}

export interface UpdateEnrollmentStatusInput {
	status: EnrollmentStatus;
}

export interface GetEnrollmentsQuery {
	page?: number;
	limit?: number;
	status?: EnrollmentStatus;
	courseId?: string;
	userId?: string;
	sortBy?: 'enrolledAt' | 'completedAt';
	sortOrder?: 'asc' | 'desc';
}

export interface MarkLessonCompleteInput {
	lessonId: string;
}

export interface CourseProgressResponse {
	courseId: string;
	courseTitle: string;
	totalLessons: number;
	completedLessons: number;
	progressPercentage: number;
	enrollmentStatus: EnrollmentStatus;
	enrolledAt: Date;
	lastAccessedAt?: Date;
	estimatedTimeRemaining?: number; 
}

export interface LessonProgressResponse {
	lessonId: string;
	lessonTitle: string;
	isCompleted: boolean;
	completedAt?: Date;
}
