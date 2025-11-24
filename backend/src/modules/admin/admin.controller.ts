import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminController {
	// Get dashboard statistics
	async getDashboardStats(req: Request, res: Response) {
		try {
			const [totalCourses, totalStudents, totalEnrollments, publishedCourses, totalModules, totalLessons] = await Promise.all([
				prisma.course.count(),
				prisma.user.count({ where: { role: 'LEARNER' } }),
				prisma.enrollment.count(),
				prisma.course.count({ where: { isPublished: true } }),
				prisma.module.count(),
				prisma.lesson.count(),
			]);

			// Get recent enrollments (last 30 days)
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

			const recentEnrollments = await prisma.enrollment.count({
				where: {
					enrolledAt: {
						gte: thirtyDaysAgo,
					},
				},
			});

			res.json({
				success: true,
				data: {
					totalCourses,
					totalStudents,
					totalEnrollments,
					publishedCourses,
					unpublishedCourses: totalCourses - publishedCourses,
					totalModules,
					totalLessons,
					recentEnrollments,
					averageEnrollmentsPerCourse: totalCourses > 0 ? Math.round(totalEnrollments / totalCourses) : 0,
				},
			});
		} catch (error) {
			console.error('Error fetching dashboard stats:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to fetch dashboard statistics',
			});
		}
	}

	// Get all users
	async getAllUsers(req: Request, res: Response) {
		try {
			const { page = 1, limit = 10, role } = req.query;
			const skip = (Number(page) - 1) * Number(limit);

			const where = role ? { role: role as any } : {};

			const [users, total] = await Promise.all([
				prisma.user.findMany({
					where,
					skip,
					take: Number(limit),
					select: {
						id: true,
						email: true,
						firstName: true,
						lastName: true,
						role: true,
						avatar: true,
						createdAt: true,
						_count: {
							select: {
								enrollments: true,
							},
						},
					},
					orderBy: { createdAt: 'desc' },
				}),
				prisma.user.count({ where }),
			]);

			res.json({
				success: true,
				data: users,
				pagination: {
					page: Number(page),
					limit: Number(limit),
					total,
					totalPages: Math.ceil(total / Number(limit)),
				},
			});
		} catch (error) {
			console.error('Error fetching users:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to fetch users',
			});
		}
	}

	// Get all courses (including unpublished)
	async getAllCourses(req: Request, res: Response) {
		try {
			const { page = 1, limit = 10, isPublished } = req.query;
			const skip = (Number(page) - 1) * Number(limit);

			const where = isPublished !== undefined ? { isPublished: isPublished === 'true' } : {};

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
}
