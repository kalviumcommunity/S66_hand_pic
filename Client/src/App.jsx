import { Component } from 'react';
import EditPage from "./components/EditDelete/EditPage";
import "./index.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PostList from "./pages/Posts";
import Profile from "./pages/Profile";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

// MED-05: Only use env variable — no hardcoded fallback Client ID in source
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// MED-08: React Error Boundary — catches runtime errors in any child component
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('[ErrorBoundary] Caught error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-md flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-extrabold text-slate-950 mb-2">Something went wrong</h1>
                    <p className="text-slate-500 text-sm mb-6 max-w-sm">
                        An unexpected error occurred. Please refresh the page or go back to the home page.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-slate-950 text-white rounded-md text-sm font-semibold hover:bg-slate-900 transition-colors"
                        >
                            Refresh Page
                        </button>
                        <button
                            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function App() {
    return (
        <ErrorBoundary>
            <GoogleOAuthProvider clientId={clientId}>
                <AuthProvider>
                    <BrowserRouter>
                        <div className="min-h-screen bg-gray-50 text-slate-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/posts" element={<PostList />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<SignUp />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/profile" element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                } />
                                <Route path="/profile/:userId" element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                } />
                                <Route path="/edit/:id" element={
                                    <ProtectedRoute>
                                        <EditPage />
                                    </ProtectedRoute>
                                } />
                            </Routes>
                            <Toaster
                                position="top-right"
                                toastOptions={{
                                    style: {
                                        background: '#ffffff',
                                        color: '#09090b',
                                        border: '1px solid #e4e4e7',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        borderRadius: '8px',
                                    }
                                }}
                            />
                        </div>
                    </BrowserRouter>
                </AuthProvider>
            </GoogleOAuthProvider>
        </ErrorBoundary>
    );
}
