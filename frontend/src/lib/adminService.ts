import api from './api';

export const adminService = {
	// Get dashboard statistics
	async getDashboardStats() {
		const response = await api.get('/admin/stats');
		return response.data.data;
	},

	// Get all users (admin only)
	async getAllUsers(params?: { page?: number; limit?: number; role?: 'ADMIN' | 'LEARNER' }) {
		const response = await api.get('/admin/users', { params });
		return response.data;
	},

	// Get all courses (admin view - includes unpublished)
	async getAllCoursesAdmin(params?: { page?: number; limit?: number; isPublished?: boolean }) {
		const response = await api.get('/admin/courses', { params });
		return response.data;
	},

	// Create course
	async createCourse(data: {
		title: string;
		description: string;
		category: string;
		level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
		thumbnail?: string;
		isPublished?: boolean;
	}) {
		const response = await api.post('/courses', data);
		return response.data.data;
	},

	// Update course
	async updateCourse(courseId: string, data: any) {
		const response = await api.put(`/courses/${courseId}`, data);
		return response.data.data;
	},

	// Delete course
	async deleteCourse(courseId: string) {
		const response = await api.delete(`/courses/${courseId}`);
		return response.data;
	},

	// Create module
	async createModule(data: { title: string; description?: string; order: number; courseId: string }) {
		const response = await api.post('/modules', data);
		return response.data.data;
	},

	// Update module
	async updateModule(moduleId: string, data: any) {
		const response = await api.put(`/modules/${moduleId}`, data);
		return response.data.data;
	},

	// Delete module
	async deleteModule(moduleId: string) {
		const response = await api.delete(`/modules/${moduleId}`);
		return response.data;
	},

	// Create lesson
	async createLesson(data: {
		title: string;
		description?: string;
		contentType: 'VIDEO' | 'TEXT' | 'DOCUMENT';
		videoUrl?: string;
		textContent?: string;
		duration?: number;
		order: number;
		moduleId: string;
	}) {
		const response = await api.post('/lessons', data);
		return response.data.data;
	},

	// Update lesson
	async updateLesson(lessonId: string, data: any) {
		const response = await api.put(`/lessons/${lessonId}`, data);
		return response.data.data;
	},

	// Delete lesson
	async deleteLesson(lessonId: string) {
		const response = await api.delete(`/lessons/${lessonId}`);
		return response.data;
	},
};
