export interface UpdateUserInput {
	firstName?: string;
	lastName?: string;
	avatar?: string;
}

export interface UpdateUserRoleInput {
	role: 'ADMIN' | 'LEARNER';
}

export interface ChangePasswordInput {
	currentPassword: string;
	newPassword: string;
}

export interface GetUsersQuery {
	page?: number;
	limit?: number;
	role?: 'ADMIN' | 'LEARNER';
	search?: string;
	sortBy?: 'createdAt' | 'email' | 'firstName';
	sortOrder?: 'asc' | 'desc';
}
