import axios from 'axios';
import { API_CONFIG } from '../config/environment';

// Create axios instance with environment-based config
const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    withCredentials: API_CONFIG.COOKIE_CONFIG.withCredentials,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear invalid token
            localStorage.removeItem('authToken');
            // Optionally redirect to login
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
