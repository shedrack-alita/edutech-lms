import { Level } from '@prisma/client';

export interface CreateCourseInput {
	title: string;
	description: string;
	thumbnail?: string;
	category: string;
	level?: Level;
}

export interface UpdateCourseInput {
	title?: string;
	description?: string;
	thumbnail?: string;
	category?: string;
	level?: Level;
}

export interface GetCoursesQuery {
	page?: number;
	limit?: number;
	category?: string;
	level?: Level;
	isPublished?: boolean;
	search?: string;
	sortBy?: 'createdAt' | 'title' | 'updatedAt';
	sortOrder?: 'asc' | 'desc';
	creatorId?: string;
}

export interface CreateModuleInput {
	title: string;
	description?: string;
	order: number;
}

export interface UpdateModuleInput {
	title?: string;
	description?: string;
	order?: number;
}

export interface CreateLessonInput {
	title: string;
	description?: string;
	contentType: 'VIDEO' | 'TEXT' | 'DOCUMENT';
	videoUrl?: string;
	textContent?: string;
	duration?: number;
	order: number;
}

export interface UpdateLessonInput {
	title?: string;
	description?: string;
	contentType?: 'VIDEO' | 'TEXT' | 'DOCUMENT';
	videoUrl?: string;
	textContent?: string;
	duration?: number;
	order?: number;
}
