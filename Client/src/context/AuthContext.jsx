import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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

    // Check if user is authenticated on app load
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await axios.get('https://s66-hand-pic.onrender.com/auth/verify', {
                withCredentials: true
            });
            if (response.data.user) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            }
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post('https://s66-hand-pic.onrender.com/login', {
                email,
                password
            }, { withCredentials: true });

            if (response.data.user) {
                setUser(response.data.user);
                setIsAuthenticated(true);
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
            const response = await axios.post('https://s66-hand-pic.onrender.com/signup', userData);
            return { success: true, message: response.data.message };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.error || 'Signup failed' 
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post('https://s66-hand-pic.onrender.com/logout', {}, { withCredentials: true });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        signup,
        logout,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
