import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: 'ADMIN' | 'LEARNER';
	avatar?: string;
}

interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	_hasHydrated: boolean;
	setAuth: (user: User, token: string) => void;
	logout: () => void;
	updateUser: (user: Partial<User>) => void;
	setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			token: null,
			isAuthenticated: false,
			_hasHydrated: false,

			setAuth: (user, token) => {
				set({
					user,
					token,
					isAuthenticated: true,
				});
			},

			logout: () => {
				set({
					user: null,
					token: null,
					isAuthenticated: false,
				});
			},

			updateUser: (updatedUser) => {
				set((state) => {
					if (!state.user) return state;
					return { user: { ...state.user, ...updatedUser } };
				});
			},

			setHasHydrated: (state) => {
				set({ _hasHydrated: state });
			},
		}),
		{
			name: 'auth-storage',
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true);
			},
		}
	)
);
