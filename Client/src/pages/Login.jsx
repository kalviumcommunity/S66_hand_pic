import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PasswordInput from "../components/PasswordInput";
import { validateEmail } from "../utils/helper";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { GoogleLogin } from '@react-oauth/google';
import Logo from "../assets/logo.png";

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

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            const result = await googleAuth(credentialResponse.credential);
            if (result.success) {
                toast.success("Google login successful!");
                navigate("/profile", { state: { showEditModal: result.isNewUser } });
            } else {
                toast.error(result.message);
            }
        } catch {
            toast.error("Failed to authenticate with Google");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden bg-white relative">
            
            {/* Absolute Home escape control */}
            <Link to="/" className="absolute top-4 left-4 z-50 flex items-center justify-center w-8 h-8 bg-white shadow-sm rounded-md hover:bg-slate-50 transition-all border border-slate-200">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </Link>
            
            {/* LEFT PANEL: Decorative Ambient Side */}
            <div className="hidden lg:flex flex-1 relative bg-slate-950 overflow-hidden flex-col px-16 py-10 justify-center text-slate-100">
                    {/* Soft ambient background elements */}
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-slate-800/10 rounded-full blur-[120px] -translate-x-1/4 -translate-y-1/4"></div>

                    <motion.div 
                        className="relative z-10 max-w-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, staggerChildren: 0.15 }}
                    >
                        <motion.div 
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-md mb-6"
                        >
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Curation Hub</span>
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-extrabold tracking-tight text-white leading-tight mb-4"
                        >
                            Stories captured,<br/>designed for hands.
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-slate-400 text-sm font-medium leading-relaxed mb-8"
                        >
                            Handscape provides a minimal catalog to showcase manual photography.
                            Publish your own perspectives, vote on creations, and connect with other enthusiasts.
                        </motion.p>

                        <motion.div 
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-3 mb-10"
                        >
                            <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-md shadow-sm">
                                <svg className="w-3.5 h-3.5 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                <span className="text-xs font-semibold text-slate-355">Visual Showcase</span>
                            </div>
                            <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-855 px-3 py-1.5 rounded-md shadow-sm">
                                <svg className="w-3.5 h-3.5 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                <span className="text-xs font-semibold text-slate-355">Platform Feed</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* RIGHT PANEL: LOGIN FORM */}
                <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 bg-white min-h-screen lg:h-full lg:overflow-y-auto">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-[360px] py-6"
                    >
                        
                        {/* Logo mark */}
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="mb-6 flex items-start"
                        >
                            <img src={Logo} alt="Handscape" className="h-9 w-auto" />
                        </motion.div>

                        <motion.h2 
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-2xl font-extrabold text-slate-950 tracking-tight mb-1"
                        >
                            Welcome back
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="text-slate-500 text-xs font-semibold mb-6"
                        >
                            Sign in to continue managing your handscapes.
                        </motion.p>

                        <motion.form 
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            onSubmit={handleLogin} 
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 transition-all font-medium"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Password
                                    </label>
                                    <Link to="/forgot-password" className="text-slate-500 text-[11px] font-semibold hover:underline">Forgot password?</Link>
                                </div>
                                <PasswordInput
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md text-slate-955 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 transition-all font-medium pr-10"
                                    placeholder="Enter your password"
                                />
                            </div>

                            <motion.button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-950 hover:bg-slate-900 disabled:bg-slate-200 text-white py-2 px-4 rounded-md font-semibold shadow-sm transition-all flex items-center justify-center mt-6 text-sm cursor-pointer disabled:cursor-not-allowed"
                                whileHover={{ scale: loading ? 1 : 1.005 }}
                                whileTap={{ scale: loading ? 1 : 0.995 }}
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                ) : (
                                    "Login"
                                )}
                            </motion.button>

                            <div className="relative flex items-center py-2 mt-2">
                                <div className="flex-grow border-t border-slate-100"></div>
                                <span className="flex-shrink mx-3 text-slate-400 text-[10px] font-bold tracking-wider uppercase bg-white px-2">OR CONTINUE WITH</span>
                                <div className="flex-grow border-t border-slate-100"></div>
                            </div>

                            <div className="w-full flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => toast.error('Google login failed')}
                                    width="328"
                                    shape="rectangular"
                                    theme="outline"
                                    text="signin_with"
                                />
                            </div>

                            <div className="text-center pt-2">
                                <p className="text-slate-500 font-medium text-xs">
                                    New to Handscape?{" "}
                                    <Link
                                        to="/signup"
                                        className="text-slate-950 hover:underline font-bold transition-all"
                                    >
                                        Create an account
                                    </Link>
                                </p>
                            </div>

                            <div className="text-center pt-6">
                                <p className="text-slate-400 text-[10px] leading-relaxed">
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
