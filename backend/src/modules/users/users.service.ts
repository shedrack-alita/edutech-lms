import bcrypt from 'bcryptjs';
import prisma from '../../config/database.js';
import { NotFoundError, ConflictError, UnauthorizedError, ForbiddenError } from '../../shared/utils/errors.js';
import { UserWithoutPassword } from '../../shared/types/index.js';
import { UpdateUserInput, UpdateUserRoleInput, ChangePasswordInput, GetUsersQuery } from './users.types.js';

export class UsersService {
	// Get all users (Admin only) with pagination and filters
	static async getAllUsers(query: GetUsersQuery) {
		const { page = 1, limit = 10, role, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;

		const skip = (page - 1) * limit; 

		// Build where clause
		const where: any = {};

		if (role) {
			where.role = role;
		}

		if (search) {
			where.OR = [
				{ email: { contains: search, mode: 'insensitive' } },
				{ firstName: { contains: search, mode: 'insensitive' } },
				{ lastName: { contains: search, mode: 'insensitive' } },
			];
		}

		// Get total count
		const total = await prisma.user.count({ where });

		// Get users
		const users = await prisma.user.findMany({
			where,
			skip,
			take: limit,
			orderBy: { [sortBy]: sortOrder },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				role: true,
				avatar: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						enrollments: true,
						createdCourses: true,
					},
				},
			},
		});

		return {
			users,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	/**
	 * Get user by ID
	 */
	static async getUserById(userId: string): Promise<UserWithoutPassword> {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				role: true,
				avatar: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						enrollments: true,
						progress: true,
						submissions: true,
						createdCourses: true,
						createdTasks: true,
						createdMeetings: true,
					},
				},
			},
		});

		if (!user) {
			throw new NotFoundError('User not found');
		}

		return user as UserWithoutPassword;
	}

	// Update user profile
	static async updateUser(userId: string, data: UpdateUserInput): Promise<UserWithoutPassword> {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new NotFoundError('User not found');
		}

		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				firstName: data.firstName,
				lastName: data.lastName,
				avatar: data.avatar,
			},
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				role: true,
				avatar: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return updatedUser as UserWithoutPassword;
	}

	// Update user role (Admin only)
	static async updateUserRole(userId: string, data: UpdateUserRoleInput): Promise<UserWithoutPassword> {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new NotFoundError('User not found');
		}

		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { role: data.role },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				role: true,
				avatar: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return updatedUser as UserWithoutPassword;
	}

	// Change password
	static async changePassword(userId: string, data: ChangePasswordInput): Promise<void> {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new NotFoundError('User not found');
		}

		// Verify current password
		const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);

		if (!isPasswordValid) {
			throw new UnauthorizedError('Current password is incorrect');
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(data.newPassword, 12);

		// Update password
		await prisma.user.update({
			where: { id: userId },
			data: { password: hashedPassword },
		});
	}

	// Delete user (Admin only)
	static async deleteUser(userId: string): Promise<void> {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new NotFoundError('User not found');
		}

		// Prevent deleting yourself (optional safety check)
		// This will be implemented in the controller

		await prisma.user.delete({
			where: { id: userId },
		});
	}

	// Get user statistics (for profile)
	static async getUserStats(userId: string) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				_count: {
					select: {
						enrollments: true,
						progress: true,
						submissions: true,
						createdCourses: true,
						createdTasks: true,
						createdMeetings: true,
					},
				},
			},
		});

		if (!user) {
			throw new NotFoundError('User not found');
		}

		// Get completed courses count
		const completedCourses = await prisma.enrollment.count({
			where: {
				userId,
				status: 'COMPLETED',
			},
		});

		// Get completed lessons count
		const completedLessons = await prisma.progress.count({
			where: {
				userId,
				isCompleted: true,
			},
		});

		return {
			totalEnrollments: user._count.enrollments,
			completedCourses,
			activeCourses: user._count.enrollments - completedCourses,
			completedLessons,
			totalSubmissions: user._count.submissions,
			...(user.role === 'ADMIN' && {
				createdCourses: user._count.createdCourses,
				createdTasks: user._count.createdTasks,
				createdMeetings: user._count.createdMeetings,
			}),
		};
	}
}
