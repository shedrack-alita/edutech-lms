import { Request, Response, NextFunction } from 'express';
import { CoursesService } from './courses.service.js';
import { ResponseUtil } from '../../shared/utils/response.js';
import { AuthRequest } from '../../shared/types/index.js';
import {
	CreateCourseInput,
	UpdateCourseInput,
	GetCoursesQuery,
	CreateModuleInput,
	UpdateModuleInput,
	CreateLessonInput,
	UpdateLessonInput,
} from './courses.types.js';

export class CoursesController {
	// ============================================
	// COURSE CONTROLLERS
	// ============================================

	/**
	 * Create course
	 * POST /api/courses
	 */
	static async createCourse(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const data: CreateCourseInput = req.body;
			const course = await CoursesService.createCourse(req.user.id, data);

			return ResponseUtil.success(res, course, 'Course created successfully', 201);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get all courses
	 * GET /api/courses
	 */
	static async getAllCourses(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const query: GetCoursesQuery = {
				page: req.query.page ? parseInt(req.query.page as string) : undefined,
				limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
				category: req.query.category as string,
				level: req.query.level as any,
				isPublished: req.query.isPublished === 'true' ? true : req.query.isPublished === 'false' ? false : undefined,
				search: req.query.search as string,
				sortBy: req.query.sortBy as any,
				sortOrder: req.query.sortOrder as 'asc' | 'desc',
				creatorId: req.query.creatorId as string,
			};

			const result = await CoursesService.getAllCourses(query);

			return ResponseUtil.paginated(res, result.courses, result.pagination.page, result.pagination.limit, result.pagination.total);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get course by ID
	 * GET /api/courses/:id
	 */
	static async getCourseById(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;

			// Allow unpublished courses for creator/admin
			const includeUnpublished = req.user?.role === 'ADMIN' || (req.query.creatorView === 'true' && req.user);

			const course = await CoursesService.getCourseById(id, includeUnpublished);

			return ResponseUtil.success(res, course, 'Course retrieved successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Update course
	 * PUT /api/courses/:id
	 */
	static async updateCourse(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { id } = req.params;
			const data: UpdateCourseInput = req.body;

			const course = await CoursesService.updateCourse(id, req.user.id, req.user.role, data);

			return ResponseUtil.success(res, course, 'Course updated successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Toggle course publish status
	 * PATCH /api/courses/:id/publish
	 */
	static async togglePublish(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { id } = req.params;

			const course = await CoursesService.toggleCoursePublish(id, req.user.id, req.user.role);

			return ResponseUtil.success(res, course, `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Delete course
	 * DELETE /api/courses/:id
	 */
	static async deleteCourse(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { id } = req.params;

			await CoursesService.deleteCourse(id, req.user.id, req.user.role);

			return ResponseUtil.success(res, null, 'Course deleted successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get course statistics
	 * GET /api/courses/:id/stats
	 */
	static async getCourseStats(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const stats = await CoursesService.getCourseStats(id);

			return ResponseUtil.success(res, stats, 'Course statistics retrieved successfully');
		} catch (error) {
			next(error);
		}
	}

	// ============================================
	// MODULE CONTROLLERS
	// ============================================

	/**
	 * Create module
	 * POST /api/courses/:courseId/modules
	 */
	static async createModule(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { courseId } = req.params;
			const data: CreateModuleInput = req.body;

			const module = await CoursesService.createModule(courseId, req.user.id, req.user.role, data);

			return ResponseUtil.success(res, module, 'Module created successfully', 201);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get module by ID
	 * GET /api/modules/:id
	 */
	static async getModuleById(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const module = await CoursesService.getModuleById(id);

			return ResponseUtil.success(res, module, 'Module retrieved successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Update module
	 * PUT /api/modules/:id
	 */
	static async updateModule(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { id } = req.params;
			const data: UpdateModuleInput = req.body;

			const module = await CoursesService.updateModule(id, req.user.id, req.user.role, data);

			return ResponseUtil.success(res, module, 'Module updated successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Delete module
	 * DELETE /api/modules/:id
	 */
	static async deleteModule(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { id } = req.params;

			await CoursesService.deleteModule(id, req.user.id, req.user.role);

			return ResponseUtil.success(res, null, 'Module deleted successfully');
		} catch (error) {
			next(error);
		}
	}

	// ============================================
	// LESSON CONTROLLERS
	// ============================================

	/**
	 * Create lesson
	 * POST /api/modules/:moduleId/lessons
	 */
	static async createLesson(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { moduleId } = req.params;
			const data: CreateLessonInput = req.body;

			const lesson = await CoursesService.createLesson(moduleId, req.user.id, req.user.role, data);

			return ResponseUtil.success(res, lesson, 'Lesson created successfully', 201);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get lesson by ID
	 * GET /api/lessons/:id
	 */
	static async getLessonById(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const lesson = await CoursesService.getLessonById(id);

			return ResponseUtil.success(res, lesson, 'Lesson retrieved successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Update lesson
	 * PUT /api/lessons/:id
	 */
	static async updateLesson(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { id } = req.params;
			const data: UpdateLessonInput = req.body;

			const lesson = await CoursesService.updateLesson(id, req.user.id, req.user.role, data);

			return ResponseUtil.success(res, lesson, 'Lesson updated successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Delete lesson
	 * DELETE /api/lessons/:id
	 */
	static async deleteLesson(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { id } = req.params;

			await CoursesService.deleteLesson(id, req.user.id, req.user.role);

			return ResponseUtil.success(res, null, 'Lesson deleted successfully');
		} catch (error) {
			next(error);
		}
	}
}
