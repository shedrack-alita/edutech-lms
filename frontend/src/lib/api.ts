import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('API URL:', API_URL); 

const api = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 10000, 
});

api.interceptors.request.use(
	(config) => {
		if (typeof window !== 'undefined') {
			const token = localStorage.getItem('token');
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}
		return config;
	},
	(error) => {
		console.error('Request error:', error);
		return Promise.reject(error);
	}
);

api.interceptors.response.use(
	(response) => {
		console.log('Response received:', response); 
		return response;
	},
	(error) => {
		console.error('Response error:', error.message);
		console.error('Error config:', error.config);

		if (error.response?.status === 401) {
			if (typeof window !== 'undefined') {
				localStorage.removeItem('token');
				localStorage.removeItem('user');
				window.location.href = '/login';
			}
		}
		return Promise.reject(error);
	}
);

export default api;
