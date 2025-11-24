import api from './api';

export const enrollmentService = {
	// Enroll in a course
	async enrollInCourse(courseId: string) {
		const response = await api.post<{ data: any }>('/enrollments', { courseId });
		return response.data.data;
	},

	// Get my enrollments
	async getMyEnrollments() {
		const response = await api.get<{ data: any[] }>('/enrollments/me');
		return response.data.data;
	},

	// Get course progress
	async getCourseProgress(courseId: string) {
		const response = await api.get<{ data: any }>(`/enrollments/courses/${courseId}/progress`);
		return response.data.data;
	},

	// Unenroll from course
	async unenrollFromCourse(enrollmentId: string) {
		const response = await api.delete(`/enrollments/${enrollmentId}`);
		return response.data;
	},
};
