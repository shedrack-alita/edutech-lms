import api from './api';

export const progressService = {
	// Mark lesson as complete
	async completLesson(lessonId: string) {
		const response = await api.post('/enrollments/progress/complete', { lessonId });
		return response.data.data;
	},

	// Mark lesson as incomplete
	async markLessonIncomplete(lessonId: string) {
		const response = await api.post('/enrollments/progress/incomplete', { lessonId });
		return response.data.data;
	},

	// Get course progress
	async getCourseProgress(courseId: string) {
		const response = await api.get(`/enrollments/courses/${courseId}/progress`);
		return response.data.data;
	},

	// Get lessons progress for a course
	async getLessonsProgress(courseId: string) {
		const response = await api.get(`/enrollments/courses/${courseId}/lessons-progress`);
		return response.data.data;
	},
};
