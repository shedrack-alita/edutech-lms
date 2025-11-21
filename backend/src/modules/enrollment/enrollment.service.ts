import prisma from '../../config/database.js';
import { NotFoundError, ConflictError, ForbiddenError, ValidationError } from '../../shared/utils/errors.js';
import {
	EnrollCourseInput,
	UpdateEnrollmentStatusInput,
	GetEnrollmentsQuery,
	MarkLessonCompleteInput,
	CourseProgressResponse,
	LessonProgressResponse,
} from './enrollment.types.js';

export class EnrollmentService {
	// ============================================
	// ENROLLMENT CRUD
	// ============================================

	/**
	 * Enroll user in a course
	 */
	static async enrollInCourse(userId: string, data: EnrollCourseInput) {
		const { courseId } = data;

		// Check if course exists and is published
		const course = await prisma.course.findUnique({
			where: { id: courseId },
		});

		if (!course) {
			throw new NotFoundError('Course not found');
		}

		if (!course.isPublished) {
			throw new ForbiddenError('Cannot enroll in an unpublished course');
		}

		// Check if user is already enrolled
		const existingEnrollment = await prisma.enrollment.findUnique({
			where: {
				userId_courseId: {
					userId,
					courseId,
				},
			},
		});

		if (existingEnrollment) {
			throw new ConflictError('You are already enrolled in this course');
		}

		// Create enrollment
		const enrollment = await prisma.enrollment.create({
			data: {
				userId,
				courseId,
				status: 'ACTIVE',
			},
			include: {
				course: {
					select: {
						id: true,
						title: true,
						description: true,
						thumbnail: true,
						category: true,
						level: true,
					},
				},
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
			},
		});

		return enrollment;
	}

	/**
	 * Get all enrollments with filters
	 */
	static async getAllEnrollments(query: GetEnrollmentsQuery) {
		const { page = 1, limit = 10, status, courseId, userId, sortBy = 'enrolledAt', sortOrder = 'desc' } = query;

		const skip = (page - 1) * limit;

		// Build where clause
		const where: any = {};

		if (status) {
			where.status = status;
		}

		if (courseId) {
			where.courseId = courseId;
		}

		if (userId) {
			where.userId = userId;
		}

		// Get total count
		const total = await prisma.enrollment.count({ where });

		// Get enrollments
		const enrollments = await prisma.enrollment.findMany({
			where,
			skip,
			take: limit,
			orderBy: { [sortBy]: sortOrder },
			include: {
				course: {
					select: {
						id: true,
						title: true,
						description: true,
						thumbnail: true,
						category: true,
						level: true,
					},
				},
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						avatar: true,
					},
				},
			},
		});

		return {
			enrollments,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	/**
	 * Get user's enrollments
	 */
	static async getUserEnrollments(userId: string, query: GetEnrollmentsQuery) {
		return this.getAllEnrollments({ ...query, userId });
	}

	/**
	 * Get enrollment by ID
	 */
	static async getEnrollmentById(enrollmentId: string) {
		const enrollment = await prisma.enrollment.findUnique({
			where: { id: enrollmentId },
			include: {
				course: {
					include: {
						modules: {
							orderBy: { order: 'asc' },
							include: {
								lessons: {
									orderBy: { order: 'asc' },
								},
							},
						},
					},
				},
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						avatar: true,
					},
				},
			},
		});

		if (!enrollment) {
			throw new NotFoundError('Enrollment not found');
		}

		return enrollment;
	}

	/**
	 * Update enrollment status (Admin only or auto-complete)
	 */
	static async updateEnrollmentStatus(enrollmentId: string, data: UpdateEnrollmentStatusInput) {
		const enrollment = await prisma.enrollment.findUnique({
			where: { id: enrollmentId },
		});

		if (!enrollment) {
			throw new NotFoundError('Enrollment not found');
		}

		const updatedEnrollment = await prisma.enrollment.update({
			where: { id: enrollmentId },
			data: {
				status: data.status,
				completedAt: data.status === 'COMPLETED' ? new Date() : null,
			},
			include: {
				course: {
					select: {
						id: true,
						title: true,
					},
				},
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
			},
		});

		return updatedEnrollment;
	}

	/**
	 * Unenroll from course
	 */
	static async unenrollFromCourse(enrollmentId: string, userId: string) {
		const enrollment = await prisma.enrollment.findUnique({
			where: { id: enrollmentId },
		});

		if (!enrollment) {
			throw new NotFoundError('Enrollment not found');
		}

		// Check if user owns this enrollment
		if (enrollment.userId !== userId) {
			throw new ForbiddenError('You can only unenroll from your own courses');
		}

		// Delete enrollment (this will cascade delete progress)
		await prisma.enrollment.delete({
			where: { id: enrollmentId },
		});
	}

	// ============================================
	// PROGRESS TRACKING
	// ============================================

	/**
	 * Mark lesson as complete
	 */
	static async markLessonComplete(userId: string, lessonId: string) {
		// Check if lesson exists
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

		// Check if user is enrolled in the course
		const enrollment = await prisma.enrollment.findUnique({
			where: {
				userId_courseId: {
					userId,
					courseId: lesson.module.course.id,
				},
			},
		});

		if (!enrollment) {
			throw new ForbiddenError('You must be enrolled in this course to track progress');
		}

		// Check if progress already exists
		const existingProgress = await prisma.progress.findUnique({
			where: {
				userId_lessonId: {
					userId,
					lessonId,
				},
			},
		});

		let progress;

		if (existingProgress) {
			// Update existing progress
			progress = await prisma.progress.update({
				where: {
					userId_lessonId: {
						userId,
						lessonId,
					},
				},
				data: {
					isCompleted: true,
					completedAt: new Date(),
				},
				include: {
					lesson: {
						select: {
							id: true,
							title: true,
							order: true,
						},
					},
				},
			});
		} else {
			// Create new progress
			progress = await prisma.progress.create({
				data: {
					userId,
					lessonId,
					isCompleted: true,
					completedAt: new Date(),
				},
				include: {
					lesson: {
						select: {
							id: true,
							title: true,
							order: true,
						},
					},
				},
			});
		}

		// Check if course is now completed
		await this.checkAndUpdateCourseCompletion(userId, lesson.module.course.id);

		return progress;
	}

	/**
	 * Mark lesson as incomplete
	 */
	static async markLessonIncomplete(userId: string, lessonId: string) {
		const progress = await prisma.progress.findUnique({
			where: {
				userId_lessonId: {
					userId,
					lessonId,
				},
			},
		});

		if (!progress) {
			throw new NotFoundError('Progress not found for this lesson');
		}

		const updatedProgress = await prisma.progress.update({
			where: {
				userId_lessonId: {
					userId,
					lessonId,
				},
			},
			data: {
				isCompleted: false,
				completedAt: null,
			},
			include: {
				lesson: {
					select: {
						id: true,
						title: true,
						order: true,
					},
				},
			},
		});

		return updatedProgress;
	}

	/**
	 * Get course progress for user
	 */
	static async getCourseProgress(userId: string, courseId: string): Promise<CourseProgressResponse> {
		// Check if user is enrolled
		const enrollment = await prisma.enrollment.findUnique({
			where: {
				userId_courseId: {
					userId,
					courseId,
				},
			},
			include: {
				course: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		});

		if (!enrollment) {
			throw new NotFoundError('You are not enrolled in this course');
		}

		// Get all lessons in the course
		const totalLessons = await prisma.lesson.count({
			where: {
				module: {
					courseId,
				},
			},
		});

		// Get completed lessons count
		const completedLessons = await prisma.progress.count({
			where: {
				userId,
				lesson: {
					module: {
						courseId,
					},
				},
				isCompleted: true,
			},
		});

		// Calculate progress percentage
		const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

		// Get total duration and calculate estimated time remaining
		const lessons = await prisma.lesson.findMany({
			where: {
				module: {
					courseId,
				},
			},
			select: {
				id: true,
				duration: true,
			},
		});

		const completedLessonIds = await prisma.progress.findMany({
			where: {
				userId,
				lesson: {
					module: {
						courseId,
					},
				},
				isCompleted: true,
			},
			select: {
				lessonId: true,
			},
		});

		const completedIds = completedLessonIds.map((p) => p.lessonId);
		const remainingLessons = lessons.filter((l) => !completedIds.includes(l.id));
		const estimatedTimeRemaining = remainingLessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

		return {
			courseId: enrollment.course.id,
			courseTitle: enrollment.course.title,
			totalLessons,
			completedLessons,
			progressPercentage,
			enrollmentStatus: enrollment.status,
			enrolledAt: enrollment.enrolledAt,
			estimatedTimeRemaining,
		};
	}

	/**
	 * Get all lessons progress for a course
	 */
	static async getCourseLessonsProgress(userId: string, courseId: string): Promise<LessonProgressResponse[]> {
		// Check if user is enrolled
		const enrollment = await prisma.enrollment.findUnique({
			where: {
				userId_courseId: {
					userId,
					courseId,
				},
			},
		});

		if (!enrollment) {
			throw new NotFoundError('You are not enrolled in this course');
		}

		// Get all lessons with progress
		const lessons = await prisma.lesson.findMany({
			where: {
				module: {
					courseId,
				},
			},
			orderBy: [{ module: { order: 'asc' } }, { order: 'asc' }],
			include: {
				progress: {
					where: {
						userId,
					},
				},
			},
		});

		return lessons.map((lesson) => ({
			lessonId: lesson.id,
			lessonTitle: lesson.title,
			isCompleted: lesson.progress[0]?.isCompleted || false,
			completedAt: lesson.progress[0]?.completedAt || undefined,
		}));
	}

	/**
	 * Check if course is completed and update enrollment status
	 */
	private static async checkAndUpdateCourseCompletion(userId: string, courseId: string) {
		// Get total lessons
		const totalLessons = await prisma.lesson.count({
			where: {
				module: {
					courseId,
				},
			},
		});

		// Get completed lessons
		const completedLessons = await prisma.progress.count({
			where: {
				userId,
				lesson: {
					module: {
						courseId,
					},
				},
				isCompleted: true,
			},
		});

		// If all lessons completed, mark enrollment as completed
		if (totalLessons > 0 && completedLessons === totalLessons) {
			await prisma.enrollment.updateMany({
				where: {
					userId,
					courseId,
					status: 'ACTIVE',
				},
				data: {
					status: 'COMPLETED',
					completedAt: new Date(),
				},
			});
		}
	}

	/**
	 * Get user's overall learning statistics
	 */
	static async getUserLearningStats(userId: string) {
		// Total enrollments
		const totalEnrollments = await prisma.enrollment.count({
			where: { userId },
		});

		// Completed courses
		const completedCourses = await prisma.enrollment.count({
			where: {
				userId,
				status: 'COMPLETED',
			},
		});

		// Active courses
		const activeCourses = await prisma.enrollment.count({
			where: {
				userId,
				status: 'ACTIVE',
			},
		});

		// Total completed lessons
		const completedLessons = await prisma.progress.count({
			where: {
				userId,
				isCompleted: true,
			},
		});

		// Get enrollments with progress
		const enrollments = await prisma.enrollment.findMany({
			where: {
				userId,
				status: 'ACTIVE',
			},
			include: {
				course: {
					include: {
						modules: {
							include: {
								lessons: true,
							},
						},
					},
				},
			},
		});

		// Calculate average progress
		let totalProgress = 0;
		for (const enrollment of enrollments) {
			const totalLessons = enrollment.course.modules.reduce((sum, module) => sum + module.lessons.length, 0);

			if (totalLessons > 0) {
				const completed = await prisma.progress.count({
					where: {
						userId,
						lesson: {
							module: {
								courseId: enrollment.courseId,
							},
						},
						isCompleted: true,
					},
				});

				totalProgress += (completed / totalLessons) * 100;
			}
		}

		const averageProgress = enrollments.length > 0 ? totalProgress / enrollments.length : 0;

		return {
			totalEnrollments,
			activeCourses,
			completedCourses,
			completedLessons,
			averageProgress: Math.round(averageProgress),
		};
	}
}
