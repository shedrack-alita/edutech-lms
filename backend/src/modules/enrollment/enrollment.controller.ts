import { Request, Response, NextFunction } from 'express';
import { EnrollmentService } from './enrollment.service.js';
import { ResponseUtil } from '../../shared/utils/response.js';
import { AuthRequest } from '../../shared/types/index.js';
import { EnrollCourseInput, UpdateEnrollmentStatusInput, GetEnrollmentsQuery } from './enrollment.types.js';

export class EnrollmentController {
	/**
	 * Enroll in a course
	 * POST /api/enrollments
	 */
	static async enrollInCourse(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const data: EnrollCourseInput = req.body;
			const enrollment = await EnrollmentService.enrollInCourse(req.user.id, data);

			return ResponseUtil.success(res, enrollment, 'Successfully enrolled in course', 201);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get all enrollments (Admin only)
	 * GET /api/enrollments
	 */
	static async getAllEnrollments(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const query: GetEnrollmentsQuery = {
				page: req.query.page ? parseInt(req.query.page as string) : undefined,
				limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
				status: req.query.status as any,
				courseId: req.query.courseId as string,
				userId: req.query.userId as string,
				sortBy: req.query.sortBy as any,
				sortOrder: req.query.sortOrder as 'asc' | 'desc',
			};

			const result = await EnrollmentService.getAllEnrollments(query);

			return ResponseUtil.paginated(
				res,
				result.enrollments,
				result.pagination.page,
				result.pagination.limit,
				result.pagination.total
			);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get my enrollments
	 * GET /api/enrollments/me
	 */
	static async getMyEnrollments(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const query: GetEnrollmentsQuery = {
				page: req.query.page ? parseInt(req.query.page as string) : undefined,
				limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
				status: req.query.status as any,
				sortBy: req.query.sortBy as any,
				sortOrder: req.query.sortOrder as 'asc' | 'desc',
			};

			const result = await EnrollmentService.getUserEnrollments(req.user.id, query);

			return ResponseUtil.paginated(
				res,
				result.enrollments,
				result.pagination.page,
				result.pagination.limit,
				result.pagination.total
			);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get enrollment by ID
	 * GET /api/enrollments/:id
	 */
	static async getEnrollmentById(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const enrollment = await EnrollmentService.getEnrollmentById(id);

			return ResponseUtil.success(res, enrollment, 'Enrollment retrieved successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Update enrollment status (Admin only)
	 * PATCH /api/enrollments/:id/status
	 */
	static async updateEnrollmentStatus(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const data: UpdateEnrollmentStatusInput = req.body;

			const enrollment = await EnrollmentService.updateEnrollmentStatus(id, data);

			return ResponseUtil.success(res, enrollment, 'Enrollment status updated successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Unenroll from course
	 * DELETE /api/enrollments/:id
	 */
	static async unenrollFromCourse(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { id } = req.params;
			await EnrollmentService.unenrollFromCourse(id, req.user.id);

			return ResponseUtil.success(res, null, 'Successfully unenrolled from course');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Mark lesson as complete
	 * POST /api/enrollments/progress/complete
	 */
	static async markLessonComplete(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { lessonId } = req.body;
			const progress = await EnrollmentService.markLessonComplete(req.user.id, lessonId);

			return ResponseUtil.success(res, progress, 'Lesson marked as complete');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Mark lesson as incomplete
	 * POST /api/enrollments/progress/incomplete
	 */
	static async markLessonIncomplete(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { lessonId } = req.body;
			const progress = await EnrollmentService.markLessonIncomplete(req.user.id, lessonId);

			return ResponseUtil.success(res, progress, 'Lesson marked as incomplete');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get course progress
	 * GET /api/enrollments/courses/:courseId/progress
	 */
	static async getCourseProgress(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { courseId } = req.params;
			const progress = await EnrollmentService.getCourseProgress(req.user.id, courseId);

			return ResponseUtil.success(res, progress, 'Course progress retrieved successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get course lessons progress
	 * GET /api/enrollments/courses/:courseId/lessons-progress
	 */
	static async getCourseLessonsProgress(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { courseId } = req.params;
			const progress = await EnrollmentService.getCourseLessonsProgress(req.user.id, courseId);

			return ResponseUtil.success(res, progress, 'Lessons progress retrieved successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get user's learning statistics
	 * GET /api/enrollments/stats
	 */
	static async getUserLearningStats(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const stats = await EnrollmentService.getUserLearningStats(req.user.id);

			return ResponseUtil.success(res, stats, 'Learning statistics retrieved successfully');
		} catch (error) {
			next(error);
		}
	}
}
