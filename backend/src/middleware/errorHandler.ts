import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/utils/errors.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      message: 'Database error',
      error: env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Default error
  console.error('Unhandled Error:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: env.NODE_ENV === 'development' ? err.message : undefined,
  });
};