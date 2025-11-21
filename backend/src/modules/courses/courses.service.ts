import prisma from '../../config/database.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../../shared/utils/errors.js';
import {
	CreateCourseInput,
	UpdateCourseInput,
	GetCoursesQuery,
	CreateModuleInput,
	UpdateModuleInput,
	CreateLessonInput,
	UpdateLessonInput,
} from './courses.types.js';

export class CoursesService {
	// ============================================
	// COURSE CRUD
	// ============================================

	/**
	 * Create a new course
	 */
	static async createCourse(creatorId: string, data: CreateCourseInput) {
		const course = await prisma.course.create({
			data: {
				title: data.title,
				description: data.description,
				thumbnail: data.thumbnail,
				category: data.category,
				level: data.level || 'BEGINNER',
				creatorId,
			},
			include: {
				creator: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
			},
		});

		return course;
	}

	/**
	 * Get all courses with filters and pagination
	 */
	static async getAllCourses(query: GetCoursesQuery) {
		const { page = 1, limit = 10, category, level, isPublished, search, sortBy = 'createdAt', sortOrder = 'desc', creatorId } = query;

		const skip = (page - 1) * limit;

		// Build where clause
		const where: any = {};

		if (category) {
			where.category = category;
		}

		if (level) {
			where.level = level;
		}

		if (isPublished !== undefined) {
			where.isPublished = isPublished;
		}

		if (creatorId) {
			where.creatorId = creatorId;
		}

		if (search) {
			where.OR = [
				{ title: { contains: search, mode: 'insensitive' } },
				{ description: { contains: search, mode: 'insensitive' } },
				{ category: { contains: search, mode: 'insensitive' } },
			];
		}

		// Get total count
		const total = await prisma.course.count({ where });

		// Get courses
		const courses = await prisma.course.findMany({
			where,
			skip,
			take: limit,
			orderBy: { [sortBy]: sortOrder },
			include: {
				creator: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
				_count: {
					select: {
						modules: true,
						enrollments: true,
					},
				},
			},
		});

		return {
			courses,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	/**
	 * Get course by ID with full details
	 */
	static async getCourseById(courseId: string, includeUnpublished = false) {
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			include: {
				creator: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						avatar: true,
					},
				},
				modules: {
					orderBy: { order: 'asc' },
					include: {
						lessons: {
							orderBy: { order: 'asc' },
						},
						_count: {
							select: {
								lessons: true,
							},
						},
					},
				},
				_count: {
					select: {
						enrollments: true,
					},
				},
			},
		});

		if (!course) {
			throw new NotFoundError('Course not found');
		}

		// If course is not published and user is not creator/admin
		if (!course.isPublished && !includeUnpublished) {
			throw new ForbiddenError('This course is not published yet');
		}

		return course;
	}

	/**
	 * Update course
	 */
	static async updateCourse(courseId: string, userId: string, userRole: string, data: UpdateCourseInput) {
		const course = await prisma.course.findUnique({
			where: { id: courseId },
		});

		if (!course) {
			throw new NotFoundError('Course not found');
		}

		// Check if user is creator or admin
		if (course.creatorId !== userId && userRole !== 'ADMIN') {
			throw new ForbiddenError('You do not have permission to update this course');
		}

		const updatedCourse = await prisma.course.update({
			where: { id: courseId },
			data: {
				title: data.title,
				description: data.description,
				thumbnail: data.thumbnail,
				category: data.category,
				level: data.level,
			},
			include: {
				creator: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
			},
		});

		return updatedCourse;
	}

	/**
	 * Publish/Unpublish course
	 */
	static async toggleCoursePublish(courseId: string, userId: string, userRole: string) {
		const course = await prisma.course.findUnique({
			where: { id: courseId },
		});

		if (!course) {
			throw new NotFoundError('Course not found');
		}

		// Check if user is creator or admin
		if (course.creatorId !== userId && userRole !== 'ADMIN') {
			throw new ForbiddenError('You do not have permission to publish/unpublish this course');
		}

		const updatedCourse = await prisma.course.update({
			where: { id: courseId },
			data: { isPublished: !course.isPublished },
			include: {
				creator: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
			},
		});

		return updatedCourse;
	}

	/**
	 * Delete course
	 */
	static async deleteCourse(courseId: string, userId: string, userRole: string) {
		const course = await prisma.course.findUnique({
			where: { id: courseId },
		});

		if (!course) {
			throw new NotFoundError('Course not found');
		}

		// Check if user is creator or admin
		if (course.creatorId !== userId && userRole !== 'ADMIN') {
			throw new ForbiddenError('You do not have permission to delete this course');
		}

		await prisma.course.delete({
			where: { id: courseId },
		});
	}

	// ============================================
	// MODULE CRUD
	// ============================================

	/**
	 * Add module to course
	 */
	static async createModule(courseId: string, userId: string, userRole: string, data: CreateModuleInput) {
		const course = await prisma.course.findUnique({
			where: { id: courseId },
		});

		if (!course) {
			throw new NotFoundError('Course not found');
		}

		// Check if user is creator or admin
		if (course.creatorId !== userId && userRole !== 'ADMIN') {
			throw new ForbiddenError('You do not have permission to add modules to this course');
		}

		const module = await prisma.module.create({
			data: {
				title: data.title,
				description: data.description,
				order: data.order,
				courseId,
			},
			include: {
				_count: {
					select: {
						lessons: true,
					},
				},
			},
		});

		return module;
	}

	/**
	 * Get module by ID
	 */
	static async getModuleById(moduleId: string) {
		const module = await prisma.module.findUnique({
			where: { id: moduleId },
			include: {
				course: {
					select: {
						id: true,
						title: true,
						creatorId: true,
					},
				},
				lessons: {
					orderBy: { order: 'asc' },
				},
				_count: {
					select: {
						lessons: true,
					},
				},
			},
		});

		if (!module) {
			throw new NotFoundError('Module not found');
		}

		return module;
	}

	/**
	 * Update module
	 */
	static async updateModule(moduleId: string, userId: string, userRole: string, data: UpdateModuleInput) {
		const module = await prisma.module.findUnique({
			where: { id: moduleId },
			include: {
				course: true,
			},
		});

		if (!module) {
			throw new NotFoundError('Module not found');
		}

		// Check if user is creator or admin
		if (module.course.creatorId !== userId && userRole !== 'ADMIN') {
			throw new ForbiddenError('You do not have permission to update this module');
		}

		const updatedModule = await prisma.module.update({
			where: { id: moduleId },
			data: {
				title: data.title,
				description: data.description,
				order: data.order,
			},
		});

		return updatedModule;
	}

	/**
	 * Delete module
	 */
	static async deleteModule(moduleId: string, userId: string, userRole: string) {
		const module = await prisma.module.findUnique({
			where: { id: moduleId },
			include: {
				course: true,
			},
		});

		if (!module) {
			throw new NotFoundError('Module not found');
		}

		// Check if user is creator or admin
		if (module.course.creatorId !== userId && userRole !== 'ADMIN') {
			throw new ForbiddenError('You do not have permission to delete this module');
		}

		await prisma.module.delete({
			where: { id: moduleId },
		});
	}

	// ============================================
	// LESSON CRUD
	// ============================================

	/**
	 * Add lesson to module
	 */
	static async createLesson(moduleId: string, userId: string, userRole: string, data: CreateLessonInput) {
		const module = await prisma.module.findUnique({
			where: { id: moduleId },
			include: {
				course: true,
			},
		});

		if (!module) {
			throw new NotFoundError('Module not found');
		}

		// Check if user is creator or admin
		if (module.course.creatorId !== userId && userRole !== 'ADMIN') {
			throw new ForbiddenError('You do not have permission to add lessons to this module');
		}

		// Validate content based on type
		if (data.contentType === 'VIDEO' && !data.videoUrl) {
			throw new ValidationError('Video URL is required for video lessons');
		}

		if (data.contentType === 'TEXT' && !data.textContent) {
			throw new ValidationError('Text content is required for text lessons');
		}

		const lesson = await prisma.lesson.create({
			data: {
				title: data.title,
				description: data.description,
				contentType: data.contentType,
				videoUrl: data.videoUrl,
				textContent: data.textContent,
				duration: data.duration,
				order: data.order,
				moduleId,
			},
		});

		return lesson;
	}

	/**
	 * Get lesson by ID
	 */
	static async getLessonById(lessonId: string) {
		const lesson = await prisma.lesson.findUnique({
			where: { id: lessonId },
			include: {
				module: {
					include: {
						course: {
							select: {
								id: true,
								title: true,
								creatorId: true,
							},
						},
					},
				},
			},
		});

		if (!lesson) {
			throw new NotFoundError('Lesson not found');
		}

		return lesson;
	}

	/**
	 * Update lesson
	 */
	static async updateLesson(lessonId: string, userId: string, userRole: string, data: UpdateLessonInput) {
		const lesson = await prisma.lesson.findUnique({
			where: { id: lessonId },
			include: {
				module: {
					include: {
						course: true,
					},
				},
			},
		});

		if (!lesson) {
			throw new NotFoundError('Lesson not found');
		}

		// Check if user is creator or admin
		if (lesson.module.course.creatorId !== userId && userRole !== 'ADMIN') {
			throw new ForbiddenError('You do not have permission to update this lesson');
		}

		const updatedLesson = await prisma.lesson.update({
			where: { id: lessonId },
			data: {
				title: data.title,
				description: data.description,
				contentType: data.contentType,
				videoUrl: data.videoUrl,
				textContent: data.textContent,
				duration: data.duration,
				order: data.order,
			},
		});

		return updatedLesson;
	}

	/**
	 * Delete lesson
	 */
	static async deleteLesson(lessonId: string, userId: string, userRole: string) {
		const lesson = await prisma.lesson.findUnique({
			where: { id: lessonId },
			include: {
				module: {
					include: {
						course: true,
					},
				},
			},
		});

		if (!lesson) {
			throw new NotFoundError('Lesson not found');
		}

		// Check if user is creator or admin
		if (lesson.module.course.creatorId !== userId && userRole !== 'ADMIN') {
			throw new ForbiddenError('You do not have permission to delete this lesson');
		}

		await prisma.lesson.delete({
			where: { id: lessonId },
		});
	}

	// ============================================
	// COURSE STATISTICS
	// ============================================

	/**
	 * Get course statistics
	 */
	static async getCourseStats(courseId: string) {
		const course = await prisma.course.findUnique({
			where: { id: courseId },
			include: {
				_count: {
					select: {
						modules: true,
						enrollments: true,
					},
				},
			},
		});

		if (!course) {
			throw new NotFoundError('Course not found');
		}

		// Get total lessons
		const totalLessons = await prisma.lesson.count({
			where: {
				module: {
					courseId,
				},
			},
		});

		// Get total duration
		const lessons = await prisma.lesson.findMany({
			where: {
				module: {
					courseId,
				},
			},
			select: {
				duration: true,
			},
		});

		const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

		// Get enrollment stats
		const completedEnrollments = await prisma.enrollment.count({
			where: {
				courseId,
				status: 'COMPLETED',
			},
		});

		const activeEnrollments = await prisma.enrollment.count({
			where: {
				courseId,
				status: 'ACTIVE',
			},
		});

		return {
			totalModules: course._count.modules,
			totalLessons,
			totalDuration, // in minutes
			totalEnrollments: course._count.enrollments,
			activeEnrollments,
			completedEnrollments,
			completionRate: course._count.enrollments > 0 ? (completedEnrollments / course._count.enrollments) * 100 : 0,
		};
	}
}
