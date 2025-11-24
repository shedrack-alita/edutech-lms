import api from './api';
import { Course } from '@/types';

export const coursesService = {
	// Get all published courses
	async getAllCourses(params?: { page?: number; limit?: number; category?: string; level?: string; search?: string }) {
		const response = await api.get<{
			success: boolean;
			data: Course[];
			pagination: {
				page: number;
				limit: number;
				total: number;
				totalPages: number;
			};
		}>('/courses', { params });
		return response.data;
	},

	// Get single course by ID
	async getCourseById(courseId: string) {
		const response = await api.get<{ data: any }>(`/courses/${courseId}`);
		return response.data.data;
	},

	// Get course statistics
	async getCourseStats(courseId: string) {
		const response = await api.get<{ data: any }>(`/courses/${courseId}/stats`);
		return response.data.data;
	},
};
