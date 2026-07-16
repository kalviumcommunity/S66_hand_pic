import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

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

    // CRIT-04 fix: No localStorage. Auth state derived entirely from httpOnly cookie via /auth/verify.
    // LOW-06: memoized with useCallback so ProtectedRoute doesn't re-create it on every render.
    const checkAuthStatus = useCallback(async () => {
        try {
            const response = await api.get('/auth/verify');
            if (response.data.user) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            }
        } catch {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            if (response.data.user) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                return { success: true, message: response.data.message };
            }
            return { success: false, message: 'Login failed' };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.error || 'Login failed. Please try again.'
            };
        }
    };

    const signup = async (userData) => {
        try {
            const response = await api.post('/signup', userData);
            return { success: true, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.error || 'Signup failed. Please try again.'
            };
        }
    };

    // CRIT-04 + HIGH-10 fix: sends Google credential (ID token) for server-side verification
    const googleAuth = async (credential) => {
        try {
            const response = await api.post('/auth/google', { credential });
            const { user } = response.data;
            // Cookie is set by server — no token stored locally
            setUser(user);
            setIsAuthenticated(true);
            return { success: true, message: response.data.message, isNewUser: response.data.isNewUser };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.error || 'Google authentication failed.'
            };
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            // No localStorage to clear
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
