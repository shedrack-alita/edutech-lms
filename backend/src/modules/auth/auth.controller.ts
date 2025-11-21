import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterInput, LoginInput } from './auth.types.js';
import { ResponseUtil } from '../../shared/utils/response.js';
import { AuthRequest } from '../../shared/types/index.js';

export class AuthController {
	/**
	 * Register a new user
	 * POST /api/auth/register
	 */
	static async register(req: Request, res: Response, next: NextFunction) {
		try {
			const data: RegisterInput = req.body;
			const result = await AuthService.register(data);

			return ResponseUtil.success(res, result, 'User registered successfully', 201);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Login user
	 * POST /api/auth/login
	 */
	static async login(req: Request, res: Response, next: NextFunction) {
		try {
			const data: LoginInput = req.body;
			const result = await AuthService.login(data);

			return ResponseUtil.success(res, result, 'Login successful');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get current user profile
	 * GET /api/auth/me
	 */
	static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const user = await AuthService.getProfile(req.user.id);

			return ResponseUtil.success(res, user, 'Profile retrieved successfully');
		} catch (error) {
			next(error);
		}
	}
}
