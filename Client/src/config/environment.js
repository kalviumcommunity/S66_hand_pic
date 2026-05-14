// Environment configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const API_CONFIG = {
    // Use local backend for development, production backend for production
    BASE_URL: isDevelopment 
        ? 'http://localhost:8888' 
        : 'https://s66-hand-pic.onrender.com',
    
    // Cookie settings based on environment
    COOKIE_CONFIG: {
        withCredentials: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax'
    }
};

export { isDevelopment, isProduction };
