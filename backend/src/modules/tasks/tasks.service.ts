import prisma from '../../config/database.js';
import { NotFoundError, ForbiddenError, ValidationError, ConflictError } from '../../shared/utils/errors.js';
import {
	CreateTaskInput,
	UpdateTaskInput,
	GetTasksQuery,
	CreateSubmissionInput,
	UpdateSubmissionInput,
	GradeSubmissionInput,
	GetSubmissionsQuery,
	TaskWithStats,
	SubmissionWithTask,
} from './tasks.types.js';

export class TasksService {
	// ============================================
	// TASK CRUD
	// ============================================

	/**
	 * Create a new task (Admin only)
	 */
	static async createTask(creatorId: string, data: CreateTaskInput) {
		const task = await prisma.task.create({
			data: {
				title: data.title,
				description: data.description,
				type: data.type,
				dueDate: data.dueDate ? new Date(data.dueDate) : null,
				maxScore: data.maxScore,
				attachments: data.attachments || [],
				creatorId,
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
				_count: {
					select: {
						submissions: true,
					},
				},
			},
		});

		return task;
	}

	/**
	 * Get all tasks with filters and pagination
	 */
	static async getAllTasks(query: GetTasksQuery) {
		const { page = 1, limit = 10, type, creatorId, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;

		const skip = (page - 1) * limit;

		// Build where clause
		const where: any = {};

		if (type) {
			where.type = type;
		}

		if (creatorId) {
			where.creatorId = creatorId;
		}

		if (search) {
			where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];
		}

		// Get total count
		const total = await prisma.task.count({ where });

		// Get tasks
		const tasks = await prisma.task.findMany({
			where,
			skip,
			take: limit,
			orderBy: { [sortBy]: sortOrder },
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
						submissions: true,
					},
				},
			},
		});

		return {
			tasks,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	/**
	 * Get task by ID with statistics
	 */
	static async getTaskById(taskId: string): Promise<TaskWithStats> {
		const task = await prisma.task.findUnique({
			where: { id: taskId },
			include: {
				creator: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
					},
				},
				submissions: {
					select: {
						id: true,
						status: true,
						score: true,
					},
				},
			},
		});

		if (!task) {
			throw new NotFoundError('Task not found');
		}

		// Calculate statistics
		const totalSubmissions = task.submissions.length;
		const pendingSubmissions = task.submissions.filter((s) => s.status === 'PENDING').length;
		const gradedSubmissions = task.submissions.filter((s) => s.status === 'GRADED').length;

		const scores = task.submissions.filter((s) => s.score !== null).map((s) => s.score as number);
		const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : undefined;

		const { submissions, ...taskData } = task;

		return {
			...taskData,
			stats: {
				totalSubmissions,
				pendingSubmissions,
				gradedSubmissions,
				averageScore: averageScore ? Math.round(averageScore * 10) / 10 : undefined,
			},
		};
	}

	/**
	 * Update task
	 */
	static async updateTask(taskId: string, userId: string, userRole: string, data: UpdateTaskInput) {
		const task = await prisma.task.findUnique({
			where: { id: taskId },
		});

		if (!task) {
			throw new NotFoundError('Task not found');
		}

		// Check if user is creator or admin
		if (task.creatorId !== userId && userRole !== 'ADMIN') {
			throw new ForbiddenError('You do not have permission to update this task');
		}

		const updatedTask = await prisma.task.update({
			where: { id: taskId },
			data: {
				title: data.title,
				description: data.description,
				type: data.type,
				dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
				maxScore: data.maxScore,
				attachments: data.attachments,
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

		return updatedTask;
	}

	/**
	 * Delete task
	 */
	static async deleteTask(taskId: string, userId: string, userRole: string) {
		const task = await prisma.task.findUnique({
			where: { id: taskId },
		});

		if (!task) {
			throw new NotFoundError('Task not found');
		}

		// Check if user is creator or admin
		if (task.creatorId !== userId && userRole !== 'ADMIN') {
			throw new ForbiddenError('You do not have permission to delete this task');
		}

		await prisma.task.delete({
			where: { id: taskId },
		});
	}

	// ============================================
	// SUBMISSION CRUD
	// ============================================

	/**
	 * Submit a task
	 */
	static async createSubmission(userId: string, data: CreateSubmissionInput) {
		const { taskId, content, attachments } = data;

		// Check if task exists
		const task = await prisma.task.findUnique({
			where: { id: taskId },
		});

		if (!task) {
			throw new NotFoundError('Task not found');
		}

		// Check if user already submitted
		const existingSubmission = await prisma.submission.findFirst({
			where: {
				userId,
				taskId,
			},
		});

		if (existingSubmission) {
			throw new ConflictError('You have already submitted this task');
		}

		// Check if task is past due date
		if (task.dueDate && new Date() > task.dueDate) {
			throw new ValidationError('This task is past its due date');
		}

		// Create submission
		const submission = await prisma.submission.create({
			data: {
				userId,
				taskId,
				content,
				attachments: attachments || [],
				status: 'PENDING',
			},
			include: {
				task: {
					select: {
						id: true,
						title: true,
						type: true,
						dueDate: true,
						maxScore: true,
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

		return submission;
	}

	/**
	 * Get all submissions with filters
	 */
	static async getAllSubmissions(query: GetSubmissionsQuery) {
		const { page = 1, limit = 10, taskId, userId, status, sortBy = 'submittedAt', sortOrder = 'desc' } = query;

		const skip = (page - 1) * limit;

		// Build where clause
		const where: any = {};

		if (taskId) {
			where.taskId = taskId;
		}

		if (userId) {
			where.userId = userId;
		}

		if (status) {
			where.status = status;
		}

		// Get total count
		const total = await prisma.submission.count({ where });

		// Get submissions
		const submissions = await prisma.submission.findMany({
			where,
			skip,
			take: limit,
			orderBy: { [sortBy]: sortOrder },
			include: {
				task: {
					select: {
						id: true,
						title: true,
						type: true,
						dueDate: true,
						maxScore: true,
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
			submissions,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	/**
	 * Get user's submissions
	 */
	static async getUserSubmissions(userId: string, query: GetSubmissionsQuery) {
		return this.getAllSubmissions({ ...query, userId });
	}

	/**
	 * Get submission by ID
	 */
	static async getSubmissionById(submissionId: string): Promise<SubmissionWithTask> {
		const submission = await prisma.submission.findUnique({
			where: { id: submissionId },
			include: {
				task: {
					select: {
						id: true,
						title: true,
						type: true,
						dueDate: true,
						maxScore: true,
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

		if (!submission) {
			throw new NotFoundError('Submission not found');
		}

		return submission as SubmissionWithTask;
	}

	/**
	 * Update submission (before grading)
	 */
	static async updateSubmission(submissionId: string, userId: string, data: UpdateSubmissionInput) {
		const submission = await prisma.submission.findUnique({
			where: { id: submissionId },
		});

		if (!submission) {
			throw new NotFoundError('Submission not found');
		}

		// Check if user owns this submission
		if (submission.userId !== userId) {
			throw new ForbiddenError('You can only update your own submissions');
		}

		// Check if submission is already graded
		if (submission.status === 'GRADED') {
			throw new ForbiddenError('Cannot update a graded submission');
		}

		const updatedSubmission = await prisma.submission.update({
			where: { id: submissionId },
			data: {
				content: data.content,
				attachments: data.attachments,
			},
			include: {
				task: {
					select: {
						id: true,
						title: true,
						type: true,
						dueDate: true,
						maxScore: true,
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

		return updatedSubmission;
	}

	/**
	 * Grade submission (Admin only)
	 */
	static async gradeSubmission(submissionId: string, data: GradeSubmissionInput) {
		const submission = await prisma.submission.findUnique({
			where: { id: submissionId },
			include: {
				task: true,
			},
		});

		if (!submission) {
			throw new NotFoundError('Submission not found');
		}

		// Validate score against max score
		if (submission.task.maxScore && data.score > submission.task.maxScore) {
			throw new ValidationError(`Score cannot exceed maximum score of ${submission.task.maxScore}`);
		}

		const gradedSubmission = await prisma.submission.update({
			where: { id: submissionId },
			data: {
				score: data.score,
				feedback: data.feedback,
				status: data.status,
				gradedAt: new Date(),
			},
			include: {
				task: {
					select: {
						id: true,
						title: true,
						type: true,
						dueDate: true,
						maxScore: true,
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

		return gradedSubmission;
	}

	/**
	 * Delete submission
	 */
	static async deleteSubmission(submissionId: string, userId: string, userRole: string) {
		const submission = await prisma.submission.findUnique({
			where: { id: submissionId },
		});

		if (!submission) {
			throw new NotFoundError('Submission not found');
		}

		// Check if user owns this submission or is admin
		if (submission.userId !== userId && userRole !== 'ADMIN') {
			throw new ForbiddenError('You do not have permission to delete this submission');
		}

		// Check if submission is graded
		if (submission.status === 'GRADED') {
			throw new ForbiddenError('Cannot delete a graded submission');
		}

		await prisma.submission.delete({
			where: { id: submissionId },
		});
	}

	// ============================================
	// STATISTICS
	// ============================================

	/**
	 * Get user's task statistics
	 */
	static async getUserTaskStats(userId: string) {
		// Total submissions
		const totalSubmissions = await prisma.submission.count({
			where: { userId },
		});

		// Pending submissions
		const pendingSubmissions = await prisma.submission.count({
			where: {
				userId,
				status: 'PENDING',
			},
		});

		// Graded submissions
		const gradedSubmissions = await prisma.submission.count({
			where: {
				userId,
				status: 'GRADED',
			},
		});

		// Average score
		const submissions = await prisma.submission.findMany({
			where: {
				userId,
				status: 'GRADED',
				score: { not: null },
			},
			select: {
				score: true,
			},
		});

		const averageScore = submissions.length > 0 ? submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length : 0;

		return {
			totalSubmissions,
			pendingSubmissions,
			gradedSubmissions,
			averageScore: Math.round(averageScore * 10) / 10,
		};
	}

	/**
	 * Get task statistics for admin
	 */
	static async getTaskStatistics(taskId: string) {
		const task = await prisma.task.findUnique({
			where: { id: taskId },
			include: {
				submissions: {
					include: {
						user: {
							select: {
								id: true,
								firstName: true,
								lastName: true,
								email: true,
							},
						},
					},
				},
			},
		});

		if (!task) {
			throw new NotFoundError('Task not found');
		}

		const totalSubmissions = task.submissions.length;
		const pendingSubmissions = task.submissions.filter((s) => s.status === 'PENDING').length;
		const gradedSubmissions = task.submissions.filter((s) => s.status === 'GRADED').length;
		const returnedSubmissions = task.submissions.filter((s) => s.status === 'RETURNED').length;

		const scores = task.submissions.filter((s) => s.score !== null).map((s) => s.score as number);
		const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

		const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
		const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

		return {
			taskId: task.id,
			taskTitle: task.title,
			taskType: task.type,
			maxScore: task.maxScore,
			dueDate: task.dueDate,
			totalSubmissions,
			pendingSubmissions,
			gradedSubmissions,
			returnedSubmissions,
			averageScore: Math.round(averageScore * 10) / 10,
			highestScore,
			lowestScore,
			submissionRate: 0, 
		};
	}
}
