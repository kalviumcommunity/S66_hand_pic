import axios from 'axios';
import { API_CONFIG } from '../config/environment';

// Create axios instance with environment-based config
const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    withCredentials: true, // Securely send httpOnly cookies on every request
});

// Add request interceptor (in case Authorization header is ever needed in future, but not storing in localStorage anymore)
api.interceptors.request.use(
    (config) => {
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
            // No local storage to clean up now as we rely entirely on httpOnly cookie auth state
        }
        return Promise.reject(error);
    }
);

export default api;
