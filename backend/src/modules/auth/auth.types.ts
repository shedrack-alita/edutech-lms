import { UserWithoutPassword } from '../../shared/types/index.js';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'ADMIN' | 'LEARNER';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserWithoutPassword;
  token: string;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}