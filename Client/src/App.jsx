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

// Use env variable or placeholder
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "73907727181-a1n4mbftd1m0mldcch6vj2uou907k368.apps.googleusercontent.com"; // Provide a test client ID if missing

export default function App() {
  return (
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
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                borderRadius: '12px',
                fontFamily: 'Poppins, sans-serif'
              }
            }}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}
