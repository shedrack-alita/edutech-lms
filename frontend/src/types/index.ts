export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: 'ADMIN' | 'LEARNER';
	avatar?: string;
	createdAt: string;
	updatedAt: string;
}

export interface AuthResponse {
	user: User;
	token: string;
}

export interface Course {
	id: string;
	title: string;
	description: string;
	thumbnail?: string;
	category: string;
	level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
	isPublished: boolean;
	createdAt: string;
	updatedAt: string;
	creator: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
	};
	_count?: {
		modules: number;
		lessons?: number;
		enrollments: number;
	};
}

export interface Module {
	id: string;
	title: string;
	description?: string;
	order: number;
	courseId: string;
	lessons: Lesson[];
	createdAt: string;
	updatedAt: string;
}

export interface Lesson {
	id: string;
	title: string;
	description?: string;
	contentType: 'VIDEO' | 'TEXT' | 'DOCUMENT';
	videoUrl?: string;
	textContent?: string;
	duration?: number;
	order: number;
	moduleId: string;
	createdAt: string;
	updatedAt: string;
}

export interface Enrollment {
	id: string;
	enrolledAt: string;
	completedAt?: string;
	status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
	course: Course;
	user: User;
}

export interface CourseProgress {
	courseId: string;
	courseTitle: string;
	totalLessons: number;
	completedLessons: number;
	progressPercentage: number;
	enrollmentStatus: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
	enrolledAt: string;
	estimatedTimeRemaining?: number;
}

export interface ApiResponse<T = any> {
	success: boolean;
	message?: string;
	data?: T;
	error?: string;
}

export interface PaginatedResponse<T> {
	success: boolean;
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}
