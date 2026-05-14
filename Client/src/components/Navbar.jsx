
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bars3Icon,
    XMarkIcon,
    UserIcon,
    PhotoIcon,
    HomeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Logo from '../assets/logo.png';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        navigate('/');
        setIsMenuOpen(false);
    };

    const navItems = [
        { name: 'Home', path: '/', icon: HomeIcon },
        { name: 'Gallery', path: '/posts', icon: PhotoIcon },
    ];

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <motion.div
                            className="flex items-center"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <img src={Logo} alt="Handscape" className="h-9 w-auto" />
                        </motion.div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className="text-slate-600 hover:text-indigo-600 font-medium transition-colors duration-200 flex items-center space-x-1.5"
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        ))}

                        <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/profile"
                                        className="text-slate-600 hover:text-indigo-600 font-medium transition-colors duration-200 flex items-center space-x-1"
                                    >
                                        <UserIcon className="w-5 h-5" />
                                        <span>{user?.username}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-slate-600 hover:text-red-600 font-medium transition-colors duration-200 text-sm"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-slate-600 hover:text-indigo-600 font-medium transition-colors duration-200"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
                                    >
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-lg transition-colors"
                        >
                            {isMenuOpen ? (
                                <XMarkIcon className="w-6 h-6" />
                            ) : (
                                <Bars3Icon className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden bg-white border-t border-slate-100 shadow-lg"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg font-medium transition-all duration-200 flex items-center space-x-3 p-3"
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </Link>
                            ))}

                            {isAuthenticated ? (
                                <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center space-x-3 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg font-medium p-3"
                                    >
                                        <UserIcon className="w-5 h-5" />
                                        <span>Profile ({user?.username})</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left text-slate-600 hover:text-red-600 hover:bg-slate-50 rounded-lg font-medium transition-all duration-200 p-3"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="border-t border-slate-100 pt-3 mt-2 space-y-2 px-1">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block text-center text-slate-700 hover:text-slate-900 font-medium transition-colors duration-200 py-2"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/signup"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition-colors duration-200 font-medium text-center shadow-sm"
                                    >
                                        Sign up free
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;