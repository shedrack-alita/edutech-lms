import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class CoursesController {
	// Create a new course
	static async createCourse(req: Request, res: Response) {
		try {
			const { title, description, category, level, thumbnail, isPublished } = req.body;
			const userId = req.user!.id;

			const course = await prisma.course.create({
				data: {
					title,
					description,
					category,
					level,
					thumbnail,
					isPublished: isPublished || false,
					creatorId: userId,
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

			res.status(201).json({
				success: true,
				message: 'Course created successfully',
				data: course,
			});
		} catch (error) {
			console.error('Error creating course:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to create course',
			});
		}
	}

	// Get all courses
	static async getAllCourses(req: Request, res: Response) {
		try {
			const { page = 1, limit = 10, category, level, search, isPublished } = req.query;

			const skip = (Number(page) - 1) * Number(limit);

			const where: any = {};

			// If isPublished is specified, filter by it
			if (isPublished !== undefined) {
				where.isPublished = isPublished === 'true';
			} else {
				// By default, only show published courses for public access
				where.isPublished = true;
			}

			if (category) where.category = category;
			if (level) where.level = level;
			if (search) {
				where.OR = [
					{ title: { contains: search as string, mode: 'insensitive' } },
					{ description: { contains: search as string, mode: 'insensitive' } },
				];
			}

			const [courses, total] = await Promise.all([
				prisma.course.findMany({
					where,
					skip,
					take: Number(limit),
					include: {
						creator: {
							select: {
								id: true,
								firstName: true,
								lastName: true,
							},
						},
						_count: {
							select: {
								modules: true,
								enrollments: true,
							},
						},
					},
					orderBy: { createdAt: 'desc' },
				}),
				prisma.course.count({ where }),
			]);

			res.json({
				success: true,
				data: courses,
				pagination: {
					page: Number(page),
					limit: Number(limit),
					total,
					totalPages: Math.ceil(total / Number(limit)),
				},
			});
		} catch (error) {
			console.error('Error fetching courses:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to fetch courses',
			});
		}
	}

	// Get course by ID (with modules and lessons)
	static async getCourseById(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const course = await prisma.course.findUnique({
				where: { id },
				include: {
					creator: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							email: true,
						},
					},
					modules: {
						include: {
							lessons: {
								orderBy: { order: 'asc' },
							},
						},
						orderBy: { order: 'asc' },
					},
					_count: {
						select: {
							enrollments: true,
						},
					},
				},
			});

			if (!course) {
				return res.status(404).json({
					success: false,
					message: 'Course not found',
				});
			}

			res.json({
				success: true,
				data: course,
			});
		} catch (error) {
			console.error('Error fetching course:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to fetch course',
			});
		}
	}

	// Get course statistics
	static async getCourseStats(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const course = await prisma.course.findUnique({
				where: { id },
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
				return res.status(404).json({
					success: false,
					message: 'Course not found',
				});
			}

			// Get total lessons count
			const lessonsCount = await prisma.lesson.count({
				where: {
					module: {
						courseId: id,
					},
				},
			});

			res.json({
				success: true,
				data: {
					totalModules: course._count.modules,
					totalLessons: lessonsCount,
					totalEnrollments: course._count.enrollments,
				},
			});
		} catch (error) {
			console.error('Error fetching course stats:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to fetch course statistics',
			});
		}
	}

	// Update course
	static async updateCourse(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { title, description, category, level, thumbnail, isPublished } = req.body;

			const course = await prisma.course.update({
				where: { id },
				data: {
					title,
					description,
					category,
					level,
					thumbnail,
					isPublished,
				},
				include: {
					creator: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
						},
					},
				},
			});

			res.json({
				success: true,
				message: 'Course updated successfully',
				data: course,
			});
		} catch (error) {
			console.error('Error updating course:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to update course',
			});
		}
	}

	// Toggle publish status
	static async togglePublish(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const course = await prisma.course.findUnique({
				where: { id },
				select: { isPublished: true },
			});

			if (!course) {
				return res.status(404).json({
					success: false,
					message: 'Course not found',
				});
			}

			const updatedCourse = await prisma.course.update({
				where: { id },
				data: { isPublished: !course.isPublished },
			});

			res.json({
				success: true,
				message: `Course ${updatedCourse.isPublished ? 'published' : 'unpublished'} successfully`,
				data: updatedCourse,
			});
		} catch (error) {
			console.error('Error toggling publish status:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to toggle publish status',
			});
		}
	}

	// Delete course
	static async deleteCourse(req: Request, res: Response) {
		try {
			const { id } = req.params;

			await prisma.course.delete({
				where: { id },
			});

			res.json({
				success: true,
				message: 'Course deleted successfully',
			});
		} catch (error) {
			console.error('Error deleting course:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to delete course',
			});
		}
	}

	// Create module
	static async createModule(req: Request, res: Response) {
		try {
			const { courseId } = req.params;
			const { title, description, order } = req.body;

			const module = await prisma.module.create({
				data: {
					title,
					description,
					order,
					courseId,
				},
			});

			res.status(201).json({
				success: true,
				message: 'Module created successfully',
				data: module,
			});
		} catch (error) {
			console.error('Error creating module:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to create module',
			});
		}
	}

	// Get module by ID
	static async getModuleById(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const module = await prisma.module.findUnique({
				where: { id },
				include: {
					lessons: {
						orderBy: { order: 'asc' },
					},
					course: {
						select: {
							id: true,
							title: true,
						},
					},
				},
			});

			if (!module) {
				return res.status(404).json({
					success: false,
					message: 'Module not found',
				});
			}

			res.json({
				success: true,
				data: module,
			});
		} catch (error) {
			console.error('Error fetching module:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to fetch module',
			});
		}
	}

	// Update module
	static async updateModule(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { title, description, order } = req.body;

			const module = await prisma.module.update({
				where: { id },
				data: {
					title,
					description,
					order,
				},
			});

			res.json({
				success: true,
				message: 'Module updated successfully',
				data: module,
			});
		} catch (error) {
			console.error('Error updating module:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to update module',
			});
		}
	}

	// Delete module
	static async deleteModule(req: Request, res: Response) {
		try {
			const { id } = req.params;

			await prisma.module.delete({
				where: { id },
			});

			res.json({
				success: true,
				message: 'Module deleted successfully',
			});
		} catch (error) {
			console.error('Error deleting module:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to delete module',
			});
		}
	}

	// Create lesson
	static async createLesson(req: Request, res: Response) {
		try {
			const { moduleId } = req.params;
			const { title, description, contentType, videoUrl, textContent, duration, order } = req.body;

			const lesson = await prisma.lesson.create({
				data: {
					title,
					description,
					contentType,
					videoUrl,
					textContent,
					duration,
					order,
					moduleId,
				},
			});

			res.status(201).json({
				success: true,
				message: 'Lesson created successfully',
				data: lesson,
			});
		} catch (error) {
			console.error('Error creating lesson:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to create lesson',
			});
		}
	}

	// Get lesson by ID
	static async getLessonById(req: Request, res: Response) {
		try {
			const { id } = req.params;

			const lesson = await prisma.lesson.findUnique({
				where: { id },
				include: {
					module: {
						select: {
							id: true,
							title: true,
							courseId: true,
						},
					},
				},
			});

			if (!lesson) {
				return res.status(404).json({
					success: false,
					message: 'Lesson not found',
				});
			}

			res.json({
				success: true,
				data: lesson,
			});
		} catch (error) {
			console.error('Error fetching lesson:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to fetch lesson',
			});
		}
	}

	// Update lesson
	static async updateLesson(req: Request, res: Response) {
		try {
			const { id } = req.params;
			const { title, description, contentType, videoUrl, textContent, duration, order } = req.body;

			const lesson = await prisma.lesson.update({
				where: { id },
				data: {
					title,
					description,
					contentType,
					videoUrl,
					textContent,
					duration,
					order,
				},
			});

			res.json({
				success: true,
				message: 'Lesson updated successfully',
				data: lesson,
			});
		} catch (error) {
			console.error('Error updating lesson:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to update lesson',
			});
		}
	}

	// Delete lesson
	static async deleteLesson(req: Request, res: Response) {
		try {
			const { id } = req.params;

			await prisma.lesson.delete({
				where: { id },
			});

			res.json({
				success: true,
				message: 'Lesson deleted successfully',
			});
		} catch (error) {
			console.error('Error deleting lesson:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to delete lesson',
			});
		}
	}
}
