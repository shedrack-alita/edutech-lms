import { Response, NextFunction } from 'express';
import { AuthRequest } from '../shared/types/index.js';
import { AuthService } from '../modules/auth/auth.service.js';
import { UnauthorizedError, ForbiddenError } from '../shared/utils/errors.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware to verify JWT token and attach user to request
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		// Get token from header
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw new UnauthorizedError('No token provided');
		}

		const token = authHeader.substring(7);

		// Verify token
		const decoded = AuthService.verifyToken(token);

		// Check if user still exists in database (important for security!)
		const user = await prisma.user.findUnique({
			where: { id: decoded.id },
			select: {
				id: true,
				email: true,
				role: true,
			},
		});

		if (!user) {
			throw new UnauthorizedError('User not found');
		}

		// Attach user to request
		req.user = {
			id: user.id,
			email: user.email,
			role: user.role,
		};

		next();
	} catch (error) {
		next(error);
	}
};

// Middleware to check if user has required role
export const authorize = (...roles: string[]) => {
	return (req: AuthRequest, res: Response, next: NextFunction) => {
		if (!req.user) {
			throw new UnauthorizedError('User not authenticated');
		}

		if (!roles.includes(req.user.role)) {
			throw new ForbiddenError('You do not have permission to access this resource');
		}

		next();
	};
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const authHeader = req.headers.authorization;
		if (authHeader && authHeader.startsWith('Bearer ')) {
			const token = authHeader.substring(7);
			const decoded = AuthService.verifyToken(token);

			const user = await prisma.user.findUnique({
				where: { id: decoded.id },
				select: {
					id: true,
					email: true,
					role: true,
				},
			});

			if (user) {
				req.user = {
					id: user.id,
					email: user.email,
					role: user.role,
				};
			}
		}
		next();
	} catch (error) {
		// Continue without authentication
		next();
	}
};
