import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config/environment';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('authToken'));

    // Check if user is authenticated on app load
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const headers = {};
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await axios.get(`${API_CONFIG.BASE_URL}/auth/verify`, {
                withCredentials: API_CONFIG.COOKIE_CONFIG.withCredentials,
                headers
            });
            if (response.data.user) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            }
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            // Clear invalid token
            localStorage.removeItem('authToken');
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_CONFIG.BASE_URL}/login`, {
                email,
                password
            }, { withCredentials: API_CONFIG.COOKIE_CONFIG.withCredentials });

            if (response.data.user) {
                setUser(response.data.user);
                setIsAuthenticated(true);

                // Store token if provided
                if (response.data.token) {
                    localStorage.setItem('authToken', response.data.token);
                    setToken(response.data.token);
                }

                return { success: true, message: response.data.message };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const signup = async (userData) => {
        try {
            const response = await axios.post(`${API_CONFIG.BASE_URL}/signup`, userData);
            return { success: true, message: response.data.message };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.error || 'Signup failed' 
            };
        }
    };

    const googleAuth = async (email, name, picture) => {
        try {
            const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/google`, { email, name, profilePicture: picture });
            const { token, user } = response.data;
            
            localStorage.setItem('authToken', token);
            setToken(token);
            setUser(user);
            setIsAuthenticated(true);
            
            return { success: true, message: response.data.message, isNewUser: response.data.isNewUser };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.error || 'Google auth failed' 
            };
        }
    };

    const logout = async () => {
        try {
            const headers = {};
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
            await axios.post(`${API_CONFIG.BASE_URL}/logout`, {}, {
                withCredentials: API_CONFIG.COOKIE_CONFIG.withCredentials,
                headers
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('authToken');
            setToken(null);
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        signup,
        logout,
        checkAuthStatus,
        googleAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
