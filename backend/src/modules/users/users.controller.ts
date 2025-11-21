import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service.js';
import { ResponseUtil } from '../../shared/utils/response.js';
import { AuthRequest } from '../../shared/types/index.js';
import { UpdateUserInput, UpdateUserRoleInput, ChangePasswordInput, GetUsersQuery } from './users.types.js';
import { ForbiddenError } from '../../shared/utils/errors.js';

export class UsersController {
	/**
	 * Get all users (Admin only)
	 * GET /api/users
	 */
	static async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const query: GetUsersQuery = {
				page: req.query.page ? parseInt(req.query.page as string) : undefined,
				limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
				role: req.query.role as 'ADMIN' | 'LEARNER' | undefined,
				search: req.query.search as string,
				sortBy: req.query.sortBy as any,
				sortOrder: req.query.sortOrder as 'asc' | 'desc',
			};

			const result = await UsersService.getAllUsers(query);

			return ResponseUtil.paginated(res, result.users, result.pagination.page, result.pagination.limit, result.pagination.total);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get user by ID
	 * GET /api/users/:id
	 */
	static async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const user = await UsersService.getUserById(id);

			return ResponseUtil.success(res, user, 'User retrieved successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get current user's profile
	 * GET /api/users/me
	 */
	static async getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const user = await UsersService.getUserById(req.user.id);

			return ResponseUtil.success(res, user, 'Profile retrieved successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Update own profile
	 * PUT /api/users/me
	 */
	static async updateMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const data: UpdateUserInput = req.body;
			const user = await UsersService.updateUser(req.user.id, data);

			return ResponseUtil.success(res, user, 'Profile updated successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Update user (Admin only)
	 * PUT /api/users/:id
	 */
	static async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const data: UpdateUserInput = req.body;

			const user = await UsersService.updateUser(id, data);

			return ResponseUtil.success(res, user, 'User updated successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Update user role (Admin only)
	 * PATCH /api/users/:id/role
	 */
	static async updateUserRole(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const data: UpdateUserRoleInput = req.body;

			// Prevent changing own role
			if (req.user?.id === id) {
				throw new ForbiddenError('You cannot change your own role');
			}

			const user = await UsersService.updateUserRole(id, data);

			return ResponseUtil.success(res, user, 'User role updated successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Change password
	 * POST /api/users/me/change-password
	 */
	static async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const data: ChangePasswordInput = req.body;
			await UsersService.changePassword(req.user.id, data);

			return ResponseUtil.success(res, null, 'Password changed successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Delete user (Admin only)
	 * DELETE /api/users/:id
	 */
	static async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;

			// Prevent deleting yourself
			if (req.user?.id === id) {
				throw new ForbiddenError('You cannot delete your own account');
			}

			await UsersService.deleteUser(id);

			return ResponseUtil.success(res, null, 'User deleted successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get user statistics
	 * GET /api/users/:id/stats
	 */
	static async getUserStats(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const stats = await UsersService.getUserStats(id);

			return ResponseUtil.success(res, stats, 'User statistics retrieved successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get own statistics
	 * GET /api/users/me/stats
	 */
	static async getMyStats(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const stats = await UsersService.getUserStats(req.user.id);

			return ResponseUtil.success(res, stats, 'Statistics retrieved successfully');
		} catch (error) {
			next(error);
		}
	}
}
