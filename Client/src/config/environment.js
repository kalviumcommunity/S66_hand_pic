// Environment configuration
const isDevelopment = import.meta.env.DEV;

export const API_CONFIG = {
    // Use local backend for development, production backend for production
    BASE_URL: isDevelopment
        ? 'http://localhost:8888'
        : 'https://s66-hand-pic.onrender.com',

    // Cookie settings for API calls — credentials must always be included
    COOKIE_CONFIG: {
        withCredentials: true
    }
};

export { isDevelopment };
// LOW-02: removed unused isProduction export
