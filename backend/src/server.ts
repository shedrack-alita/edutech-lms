import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import prisma from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import coursesRoutes from './modules/courses/courses.routes.js'; // NEW

const app: Application = express();

// Middleware
app.use(
	cors({
		origin: env.FRONTEND_URL,
		credentials: true,
	})
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(env.UPLOAD_PATH));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
	res.json({
		success: true,
		status: 'OK',
		timestamp: new Date().toISOString(),
		environment: env.NODE_ENV,
	});
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/courses', coursesRoutes); 

// 404 Handler
app.use((req: Request, res: Response) => {
	res.status(404).json({
		success: false,
		message: 'Route not found',
	});
});

// Global error handler (must be last)
app.use(errorHandler);

app.listen(env.PORT, () => {
	console.log(`Server running on port ${env.PORT}`);
	console.log(`API URL: http://localhost:${env.PORT}`);
});
