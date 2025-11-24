import api from './api';
import { AuthResponse, User } from '@/types';

export const authService = {
	// Register a new user
	async register(data: {
		email: string;
		password: string;
		firstName: string;
		lastName: string;
		role?: 'ADMIN' | 'LEARNER';
	}): Promise<AuthResponse> {
		const response = await api.post<{ data: AuthResponse }>('/auth/register', data);
		return response.data.data;
	},

    // Login user
	async login(data: { email: string; password: string }): Promise<AuthResponse> {
		const response = await api.post<{ data: AuthResponse }>('/auth/login', data);
		return response.data.data;
	},

	// Get current user profile
	async getCurrentUser(): Promise<User> {
		const response = await api.get<{ data: User }>('/auth/me');
		return response.data.data;
	},
};
