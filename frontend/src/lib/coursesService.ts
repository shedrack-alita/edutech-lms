import api from './api';

export const coursesService = {
	// Get all courses (public)
	async getAllCourses(params?: { page?: number; limit?: number; category?: string; level?: string; search?: string }) {
		const response = await api.get('/courses', { params });
		return response.data;
	},

	// Get single course by ID (with modules and lessons)
	async getCourse(courseId: string) {
		const response = await api.get(`/courses/${courseId}`);
		return response.data.data;
	},

	// Get course statistics
	async getCourseStats(courseId: string) {
		const response = await api.get(`/courses/${courseId}/stats`);
		return response.data.data;
	},

	// Get course modules
	async getCourseModules(courseId: string) {
		const response = await api.get(`/courses/${courseId}`);
		return response.data.data.modules;
	},

	// Get module by ID
	async getModule(moduleId: string) {
		const response = await api.get(`/modules/${moduleId}`);
		return response.data.data;
	},

	// Get lesson by ID
	async getLesson(lessonId: string) {
		const response = await api.get(`/lessons/${lessonId}`);
		return response.data.data;
	},
};
