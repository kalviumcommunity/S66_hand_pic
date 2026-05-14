import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { API_CONFIG } from "../config/environment";
import PasswordInput from "../components/PasswordInput";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleReset = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_CONFIG.BASE_URL}/reset-password`, {
                email,
                newPassword
            });
            
            toast.success(response.data.message || "Password reset successful!");
            navigate("/login");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password. Ensure the email is correct.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-white relative">
            
            {/* Absolute Home escape control */}
            <Link to="/login" className="absolute top-6 left-6 z-50 flex items-center justify-center w-10 h-10 bg-white shadow-md rounded-full hover:bg-slate-50 transition-all border border-slate-100">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </Link>
            
            {/* LEFT PANEL: Decorative Ambient Side (Shared aesthetics) */}
            <div className="hidden lg:flex flex-1 relative bg-[#fef2f2] overflow-hidden flex-col px-16 py-10 justify-center">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-[120px] -translate-x-1/4 -translate-y-1/4"></div>
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-200/30 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4"></div>

                <div className="relative z-10 max-w-xl">
                    <div className="inline-flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-indigo-100 mb-6">
                        <span className="text-indigo-500">🔒</span>
                        <span className="text-xs font-semibold text-slate-700">Secure account recovery</span>
                    </div>

                    <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-[1.1] mb-6">
                        Recover access to<br/>your perspective.
                    </h1>
                    
                    <p className="text-slate-600 text-lg font-medium leading-relaxed mb-8">
                        Handscape ensures safe identity management. Reset your passkey using your verified identification token to secure your gallery archives.
                    </p>
                </div>
            </div>

            {/* RIGHT PANEL: RESET FORM */}
            <div className="flex-1 flex items-center justify-center px-6 sm:px-12 bg-white h-full overflow-y-auto">
                <div className="w-full max-w-[420px] py-6">
                    
                    <div className="mb-6 flex items-start">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-50 to-indigo-50 border border-pink-100 shadow-sm flex items-center justify-center">
                            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 to-pink-500 italic">hs</span>
                        </div>
                    </div>

                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">Reset Password</h2>
                    <p className="text-slate-600 text-sm font-medium mb-8">Establish new credentials to lock back into your channel.</p>

                    <form onSubmit={handleReset} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 transition-all font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">
                                New Password
                            </label>
                            <PasswordInput
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 transition-all font-medium"
                                placeholder="Enter new password"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">
                                Confirm Password
                            </label>
                            <PasswordInput
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 transition-all font-medium"
                                placeholder="Confirm new password"
                            />
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ea06b2] hover:bg-[#cc0099] disabled:bg-pink-300 text-white py-3.5 px-6 rounded-lg font-bold shadow-md transition-all flex items-center justify-center mt-6 text-base"
                            whileHover={{ scale: loading ? 1 : 1.005 }}
                            whileTap={{ scale: loading ? 1 : 0.995 }}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            ) : (
                                "Reset Password"
                            )}
                        </motion.button>

                        <div className="text-center pt-6">
                            <p className="text-slate-600 font-medium text-sm">
                                Remember your password?{" "}
                                <Link
                                    to="/login"
                                    className="text-[#ea06b2] hover:text-pink-700 font-bold transition-all"
                                >
                                    Back to Login
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
