import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import PasswordInput from "../components/PasswordInput";
import Logo from "../assets/logo.png";

// CRIT-03 fix: two-step OTP password reset
const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1 = email entry, 2 = OTP + new password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Step 1: Request OTP
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!email) { toast.error("Enter your email address"); return; }

        setLoading(true);
        try {
            await api.post('/request-password-reset', { email });
            toast.success("If that email is registered, a 6-digit reset code has been sent.");
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to send reset code.");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP + reset password
    const handleVerifyAndReset = async (e) => {
        e.preventDefault();

        if (otp.length !== 6 || isNaN(otp)) {
            toast.error("Enter the 6-digit code sent to your email");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/verify-reset-otp', { email, otp, newPassword });
            toast.success(response.data.message || "Password reset successful!");
            navigate("/login");
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-white relative">
            
            {/* Back button */}
            <Link to="/login" className="absolute top-4 left-4 z-50 flex items-center justify-center w-8 h-8 bg-white shadow-sm rounded-md hover:bg-slate-50 transition-all border border-slate-200">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </Link>
            
            {/* LEFT PANEL */}
            <div className="hidden lg:flex flex-1 relative bg-slate-950 overflow-hidden flex-col px-16 py-10 justify-center text-slate-100">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-slate-800/10 rounded-full blur-[120px] -translate-x-1/4 -translate-y-1/4"></div>

                <div className="relative z-10 max-w-xl">
                    <div className="inline-flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-md mb-6">
                        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Security Control</span>
                    </div>

                    <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
                        Recover access to<br/>your perspective.
                    </h1>
                    
                    <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                        A verification code will be sent to your email. Enter the code to confirm your identity before setting a new password.
                    </p>

                    {/* Progress steps indicator */}
                    <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-white text-slate-950' : 'bg-slate-800 text-slate-400'}`}>1</div>
                        <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-white' : 'bg-slate-800'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-white text-slate-950' : 'bg-slate-800 text-slate-400'}`}>2</div>
                    </div>
                    <div className="flex justify-between mt-1.5">
                        <span className="text-slate-500 text-[11px] font-semibold">Enter email</span>
                        <span className="text-slate-500 text-[11px] font-semibold">Verify & reset</span>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 flex items-center justify-center px-6 sm:px-12 bg-white h-full overflow-y-auto">
                <div className="w-full max-w-[360px] py-6">
                    
                    <div className="mb-6 flex items-start">
                        <img src={Logo} alt="Handscape" className="h-9 w-auto" />
                    </div>

                    <AnimatePresence mode="wait">
                        {/* STEP 1: Email */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight mb-1">Reset Password</h2>
                                <p className="text-slate-500 text-xs font-semibold mb-8">Enter your account email to receive a 6-digit verification code.</p>

                                <form onSubmit={handleRequestOtp} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 transition-all font-medium"
                                            required
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
                                            "Send Verification Code"
                                        )}
                                    </motion.button>

                                    <div className="text-center pt-4">
                                        <p className="text-slate-500 font-medium text-xs">
                                            Remember your password?{" "}
                                            <Link to="/login" className="text-slate-950 hover:underline font-bold transition-all">
                                                Back to Login
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* STEP 2: OTP + new password */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight mb-1">Enter Code</h2>
                                <p className="text-slate-500 text-xs font-semibold mb-2">
                                    A 6-digit code was sent to <span className="text-slate-950 font-bold">{email}</span>
                                </p>
                                <p className="text-slate-400 text-[11px] mb-6">Code expires in 10 minutes. Check spam if not received.</p>

                                <form onSubmit={handleVerifyAndReset} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Verification Code</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            placeholder="6-digit code"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 transition-all font-mono font-bold tracking-widest text-center text-lg"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">New Password</label>
                                        <PasswordInput
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 transition-all font-medium pr-10"
                                            placeholder="At least 8 characters"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Confirm Password</label>
                                        <PasswordInput
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 transition-all font-medium pr-10"
                                            placeholder="Confirm new password"
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
                                            "Reset Password"
                                        )}
                                    </motion.button>

                                    <div className="text-center pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="text-slate-500 text-xs font-semibold hover:text-slate-950 transition-colors"
                                        >
                                            ← Use a different email
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
