import { Request, Response, NextFunction } from 'express';
import { TasksService } from './tasks.service.js';
import { ResponseUtil } from '../../shared/utils/response.js';
import { AuthRequest } from '../../shared/types/index.js';
import {
	CreateTaskInput,
	UpdateTaskInput,
	GetTasksQuery,
	CreateSubmissionInput,
	UpdateSubmissionInput,
	GradeSubmissionInput,
	GetSubmissionsQuery,
} from './tasks.types.js';

export class TasksController {
	// ============================================
	// TASK CONTROLLERS
	// ============================================

	/**
	 * Create task
	 * POST /api/tasks
	 */
	static async createTask(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const data: CreateTaskInput = req.body;
			const task = await TasksService.createTask(req.user.id, data);

			return ResponseUtil.success(res, task, 'Task created successfully', 201);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get all tasks
	 * GET /api/tasks
	 */
	static async getAllTasks(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const query: GetTasksQuery = {
				page: req.query.page ? parseInt(req.query.page as string) : undefined,
				limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
				type: req.query.type as any,
				creatorId: req.query.creatorId as string,
				search: req.query.search as string,
				sortBy: req.query.sortBy as any,
				sortOrder: req.query.sortOrder as 'asc' | 'desc',
			};

			const result = await TasksService.getAllTasks(query);

			return ResponseUtil.paginated(res, result.tasks, result.pagination.page, result.pagination.limit, result.pagination.total);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get task by ID
	 * GET /api/tasks/:id
	 */
	static async getTaskById(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const task = await TasksService.getTaskById(id);

			return ResponseUtil.success(res, task, 'Task retrieved successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Update task
	 * PUT /api/tasks/:id
	 */
	static async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { id } = req.params;
			const data: UpdateTaskInput = req.body;

			const task = await TasksService.updateTask(id, req.user.id, req.user.role, data);

			return ResponseUtil.success(res, task, 'Task updated successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Delete task
	 * DELETE /api/tasks/:id
	 */
	static async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { id } = req.params;

			await TasksService.deleteTask(id, req.user.id, req.user.role);

			return ResponseUtil.success(res, null, 'Task deleted successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get task statistics
	 * GET /api/tasks/:id/statistics
	 */
	static async getTaskStatistics(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const stats = await TasksService.getTaskStatistics(id);

			return ResponseUtil.success(res, stats, 'Task statistics retrieved successfully');
		} catch (error) {
			next(error);
		}
	}

	// ============================================
	// SUBMISSION CONTROLLERS
	// ============================================

	/**
	 * Submit a task
	 * POST /api/tasks/submissions
	 */
	static async createSubmission(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const data: CreateSubmissionInput = req.body;
			const submission = await TasksService.createSubmission(req.user.id, data);

			return ResponseUtil.success(res, submission, 'Submission created successfully', 201);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get all submissions (Admin only)
	 * GET /api/tasks/submissions
	 */
	static async getAllSubmissions(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const query: GetSubmissionsQuery = {
				page: req.query.page ? parseInt(req.query.page as string) : undefined,
				limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
				taskId: req.query.taskId as string,
				userId: req.query.userId as string,
				status: req.query.status as any,
				sortBy: req.query.sortBy as any,
				sortOrder: req.query.sortOrder as 'asc' | 'desc',
			};

			const result = await TasksService.getAllSubmissions(query);

			return ResponseUtil.paginated(
				res,
				result.submissions,
				result.pagination.page,
				result.pagination.limit,
				result.pagination.total
			);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get my submissions
	 * GET /api/tasks/submissions/me
	 */
	static async getMySubmissions(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const query: GetSubmissionsQuery = {
				page: req.query.page ? parseInt(req.query.page as string) : undefined,
				limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
				taskId: req.query.taskId as string,
				status: req.query.status as any,
				sortBy: req.query.sortBy as any,
				sortOrder: req.query.sortOrder as 'asc' | 'desc',
			};

			const result = await TasksService.getUserSubmissions(req.user.id, query);

			return ResponseUtil.paginated(
				res,
				result.submissions,
				result.pagination.page,
				result.pagination.limit,
				result.pagination.total
			);
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get submission by ID
	 * GET /api/tasks/submissions/:id
	 */
	static async getSubmissionById(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const submission = await TasksService.getSubmissionById(id);

			return ResponseUtil.success(res, submission, 'Submission retrieved successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Update submission
	 * PUT /api/tasks/submissions/:id
	 */
	static async updateSubmission(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { id } = req.params;
			const data: UpdateSubmissionInput = req.body;

			const submission = await TasksService.updateSubmission(id, req.user.id, data);

			return ResponseUtil.success(res, submission, 'Submission updated successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Grade submission (Admin only)
	 * PATCH /api/tasks/submissions/:id/grade
	 */
	static async gradeSubmission(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const data: GradeSubmissionInput = req.body;
			const submission = await TasksService.gradeSubmission(id, data);

			return ResponseUtil.success(res, submission, 'Submission graded successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Delete submission
	 * DELETE /api/tasks/submissions/:id
	 */
	static async deleteSubmission(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}

			const { id } = req.params;
			await TasksService.deleteSubmission(id, req.user.id, req.user.role);

			return ResponseUtil.success(res, null, 'Submission deleted successfully');
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Get user's task statistics
	 * GET /api/tasks/stats
	 */
	static async getUserTaskStats(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				throw new Error('User not authenticated');
			}
			const stats = await TasksService.getUserTaskStats(req.user.id);
			return ResponseUtil.success(res, stats, 'Task statistics retrieved successfully');
		} catch (error) {
			next(error);
		}
	}
}
