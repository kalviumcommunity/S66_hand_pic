
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
        <nav className="bg-white/60 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <motion.div
                            className="flex items-center"
                            whileHover={{ scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                            <img src={Logo} alt="Handscape" className="h-10 w-auto" />
                        </motion.div>
                    </Link>
 
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors duration-200 flex items-center space-x-1.5 px-3 py-1.5 rounded-md hover:bg-slate-50"
                            >
                                <item.icon className="w-4.5 h-4.5" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
 
                        <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/profile"
                                        className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors duration-200 flex items-center space-x-1 px-3 py-1.5 rounded-md hover:bg-slate-50"
                                    >
                                        <UserIcon className="w-4.5 h-4.5" />
                                        <span>{user?.username}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-slate-500 hover:text-red-600 hover:bg-red-50 text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-md"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors duration-200 px-3 py-1.5 rounded-md hover:bg-slate-50"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="bg-slate-950 hover:bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-all duration-200"
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
                            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-md transition-colors"
                        >
                            {isMenuOpen ? (
                                <XMarkIcon className="w-5.5 h-5.5" />
                            ) : (
                                <Bars3Icon className="w-5.5 h-5.5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
 
            {/* Mobile Navigation */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="md:hidden bg-white/90 backdrop-blur-lg border-t border-slate-200 shadow-lg absolute w-full left-0 z-40"
                    >
                        <div className="px-4 py-3 space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md text-sm font-medium transition-all duration-250 flex items-center space-x-2.5 p-2.5"
                                >
                                    <item.icon className="w-4.5 h-4.5" />
                                    <span>{item.name}</span>
                                </Link>
                            ))}

                            {isAuthenticated ? (
                                <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center space-x-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md text-sm font-medium p-2.5"
                                    >
                                        <UserIcon className="w-4.5 h-4.5" />
                                        <span>Profile ({user?.username})</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left text-slate-500 hover:text-red-650 hover:bg-red-50 rounded-md text-sm font-medium transition-all duration-250 p-2.5"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="border-t border-slate-100 pt-2.5 mt-2 space-y-2 px-1">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block text-center text-slate-705 hover:text-slate-900 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors duration-200 py-2.5"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/signup"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block bg-slate-950 hover:bg-slate-900 text-white py-2 rounded-md transition-colors duration-200 font-medium text-center shadow-sm text-sm"
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