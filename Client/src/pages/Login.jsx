import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import PasswordInput from "../components/PasswordInput";
import { validateEmail } from "../utils/helper";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { HandRaisedIcon } from "@heroicons/react/24/outline";
import { useGoogleLogin } from '@react-oauth/google';
import axios from "axios";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, googleAuth } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            toast.error("Enter valid email");
            return;
        }

        if (!password) {
            toast.error("Enter password");
            return;
        }

        setLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                toast.success("Welcome back!");
                navigate("/");
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                const userInfo = await axios.get(
                    'https://www.googleapis.com/oauth2/v1/userinfo',
                    { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
                );
                
                const result = await googleAuth(userInfo.data.email, userInfo.data.name, userInfo.data.picture);
                
                if (result.success) {
                    toast.success("Google login successful!");
                    navigate("/profile", { state: { showEditModal: result.isNewUser } });
                } else {
                    toast.error(result.message);
                }
            } catch (error) {
                toast.error("Failed to authenticate with Google");
            } finally {
                setLoading(false);
            }
        },
        onError: () => toast.error("Google login failed")
    });

    const handleGoogleAuth = (e) => {
        e.preventDefault();
        loginWithGoogle();
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-white relative">
            
            {/* Absolute Home escape control */}
            <Link to="/" className="absolute top-6 left-6 z-50 flex items-center justify-center w-10 h-10 bg-white shadow-md rounded-full hover:bg-slate-50 transition-all border border-slate-100">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </Link>
            
            {/* LEFT PANEL: Decorative Ambient Side */}
            <div className="hidden lg:flex flex-1 relative bg-[#fef2f2] overflow-hidden flex-col px-16 py-10 justify-center">
                    {/* Soft ambient background elements */}
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-pink-200/30 rounded-full blur-[120px] -translate-x-1/4 -translate-y-1/4"></div>
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-200/30 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4"></div>

                    <motion.div 
                        className="relative z-10 max-w-xl"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, staggerChildren: 0.2 }}
                    >
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-pink-100 mb-6"
                        >
                            <span className="text-pink-500">✨</span>
                            <span className="text-xs font-semibold text-slate-700">Visual community for hand photography</span>
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-black tracking-tight text-slate-900 leading-[1.1] mb-6"
                        >
                            Building stories,<br/>designed for hands.
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-slate-600 text-lg font-medium leading-relaxed mb-8"
                        >
                            Handscape provides a minimal curation zone to highlight artistic manual perspectives. Document your focus, create visual resonance, and secure authentic engagement.
                        </motion.p>

                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4 mb-16"
                        >
                            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-slate-100">
                                <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                <span className="text-sm font-bold text-slate-800">Visual Showcase</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-slate-100">
                                <svg className="w-4 h-4 text-teal-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                <span className="text-sm font-bold text-slate-800">Curation Discovery</span>
                            </div>
                        </motion.div>

                        {/* Decorative curve/path from image */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="relative h-48 mt-10"
                        >
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.2 }}
                                className="absolute top-0 left-4 flex items-center space-x-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-slate-100"
                            >
                                <span className="w-4 h-4 bg-pink-100 rounded-full flex items-center justify-center"><span className="w-2 h-2 bg-pink-500 rounded-full"></span></span>
                                <span className="text-xs font-bold text-slate-800">Snapshot Curated</span>
                            </motion.div>
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.6 }}
                                className="absolute top-12 right-20 flex items-center space-x-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-slate-100"
                            >
                                <span className="w-4 h-4 bg-pink-100 rounded-full flex items-center justify-center"><span className="w-2 h-2 bg-pink-500 rounded-full"></span></span>
                                <span className="text-xs font-bold text-slate-800">Trending Locally</span>
                            </motion.div>

                            <motion.svg className="w-full h-full" viewBox="0 0 400 150" fill="none" preserveAspectRatio="none">
                                <motion.path 
                                    d="M 10 120 Q 50 120, 100 75 T 200 100 T 350 50" 
                                    stroke="url(#gradientPath)" 
                                    strokeWidth="12" 
                                    strokeLinecap="round" 
                                    opacity="0.2" 
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                                />
                                <motion.path 
                                    d="M 10 120 Q 50 120, 100 75 T 200 100 T 350 50" 
                                    stroke="url(#gradientPath)" 
                                    strokeWidth="3" 
                                    strokeLinecap="round" 
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                                />
                                <defs>
                                    <linearGradient id="gradientPath" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#EC4899" />
                                        <stop offset="50%" stopColor="#D8B4FE" />
                                        <stop offset="100%" stopColor="#34D399" />
                                    </linearGradient>
                                </defs>
                                {/* Points on curve */}
                                <motion.circle 
                                    cx="50" cy="108" r="8" fill="#EC4899" 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }}
                                />
                                <motion.circle 
                                    cx="168" cy="92" r="8" fill="#F472B6" 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1 }}
                                />
                                <motion.circle 
                                    cx="335" cy="54" r="8" fill="#F472B6" 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.8 }}
                                />
                            </motion.svg>
                            
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2 }}
                                className="flex justify-between mt-2 text-xs font-bold text-slate-500 px-4"
                            >
                                <span>Artifact Capture</span>
                                <span>Shared Feed</span>
                                <span>Featured Spotlight</span>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* RIGHT PANEL: LOGIN FORM */}
                <div className="flex-1 flex items-center justify-center px-6 sm:px-12 bg-white h-full overflow-y-auto">
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full max-w-[420px] py-6"
                    >
                        
                        {/* Fancy logo mark */}
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mb-6 flex items-start"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-50 to-fuchsia-50 border border-pink-100 shadow-sm flex items-center justify-center">
                                <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-br from-pink-500 to-pink-600 italic">hs</span>
                            </div>
                        </motion.div>

                        <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1"
                        >
                            Welcome back
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-slate-600 text-sm font-medium mb-6"
                        >
                            Sign in to continue managing your handscapes.
                        </motion.p>

                        <motion.form 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            onSubmit={handleLogin} 
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-2">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 transition-all font-medium"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-bold text-slate-800 mb-2">
                                    Password
                                </label>
                                <PasswordInput
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 transition-all font-medium"
                                    placeholder="Enter your password"
                                />
                            </div>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#ea06b2] hover:bg-[#cc0099] disabled:bg-pink-300 text-white py-3.5 px-6 rounded-lg font-bold shadow-md transition-all flex items-center justify-center mt-4 text-base"
                                whileHover={{ scale: loading ? 1 : 1.005 }}
                                whileTap={{ scale: loading ? 1 : 0.995 }}
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                ) : (
                                    "Login"
                                )}
                            </motion.button>

                            <div className="text-right -mt-2">
                                <Link to="/forgot-password" className="text-[#ea06b2] text-sm font-semibold hover:underline">Forgot password?</Link>
                            </div>

                            <div className="relative flex items-center py-2 mt-4">
                                <div className="flex-grow border-t border-slate-100"></div>
                                <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold tracking-wider uppercase bg-white px-2">OR CONTINUE WITH</span>
                                <div className="flex-grow border-t border-slate-100"></div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleAuth}
                                disabled={loading}
                                className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-200/80 py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors font-bold text-slate-700 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-300 border-t-slate-600"></div>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
                                        <span>Google</span>
                                    </>
                                )}
                            </button>

                            <div className="text-center pt-4">
                                <p className="text-slate-600 font-medium text-sm">
                                    New to Handscape?{" "}
                                    <Link
                                        to="/signup"
                                        className="text-[#ea06b2] hover:text-pink-700 font-bold transition-all"
                                    >
                                        Create an account
                                    </Link>
                                </p>
                            </div>

                            <div className="text-center pt-8">
                                <p className="text-slate-400 text-[11px] leading-relaxed">
                                    By continuing, you agree to our <a href="#" className="text-slate-500 hover:underline">Terms</a> and <a href="#" className="text-slate-500 hover:underline">Privacy Policy</a>.
                                </p>
                            </div>
                        </motion.form>
                    </motion.div>
                </div>
        </div>
    );
};

export default Login;
