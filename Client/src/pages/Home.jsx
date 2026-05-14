import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from "../components/Navbar";
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/environment';
import {
    HandRaisedIcon,
    HeartIcon,
    ArrowUpIcon,
    PhotoIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';

export default function Home() {
    const { isAuthenticated } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        photosShared: 0,
        totalViews: 0,
        totalLikes: 0,
        growthRate: 0
    });
    const [featuredPosts, setFeaturedPosts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch real statistics
                const statsResponse = await api.get('/stats');
                setStats(statsResponse.data);
                
                // Fetch top 3 most liked posts
                const postsResponse = await api.get('/posts?sortBy=likes&order=desc');
                setFeaturedPosts(postsResponse.data.slice(0, 3));
            } catch (err) {
                console.error('Error fetching home data:', err);
            }
        };

        fetchData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6
            }
        }
    };

    return (
        <>
            <Navbar />

            {/* Hero Section */}
            <motion.div
                className="relative min-h-[90vh] bg-gray-50 bg-dots flex items-center justify-center overflow-hidden"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Decorative mesh gradient glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300/20 blur-3xl rounded-full translate-y-1/2 -translate-x-1/3"></div>

                <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-16 pb-24">
                    <motion.div variants={itemVariants} className="mb-6 flex justify-center">
                        <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-semibold tracking-wide uppercase rounded-full border border-indigo-100 shadow-sm">
                            Community
                        </span>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8">
                            Built for stories.<br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-fuchsia-600">Designed for hands.</span>
                        </h1>
                    </motion.div>

                    <motion.p
                        className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium leading-relaxed"
                        variants={itemVariants}
                    >
                        Join our minimal creative platform where hands tell a thousand stories.
                        Discover, upload, and appreciate unique photography.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
                        variants={itemVariants}
                    >
                        {isAuthenticated ? (
                            <Link
                                to="/posts"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl shadow-indigo-600/20 transition-all duration-300 transform hover:scale-[1.02]"
                            >
                                Open Gallery
                            </Link>
                        ) : (
                            <Link
                                to="/signup"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl shadow-indigo-600/20 transition-all duration-300 transform hover:scale-[1.02]"
                            >
                                Get Started Free
                            </Link>
                        )}
                        <Link
                            to="/posts"
                            className="bg-white border border-slate-200 hover:border-indigo-200 text-slate-700 hover:bg-slate-50 px-8 py-4 rounded-2xl text-lg font-semibold shadow-sm transition-all duration-300"
                        >
                            Explore Feed
                        </Link>
                    </motion.div>

                    {/* Stats Section */}
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-6"
                        variants={itemVariants}
                    >
                        <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl p-6 border border-slate-100 hover:border-slate-200 transition-colors">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-indigo-50 rounded-2xl mb-4">
                                <UserGroupIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalUsers?.toLocaleString() || 0}</div>
                            <div className="text-slate-500 font-medium text-sm tracking-wide uppercase">Users</div>
                        </div>

                        <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl p-6 border border-slate-100 hover:border-slate-200 transition-colors">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-50 rounded-2xl mb-4">
                                <PhotoIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.photosShared?.toLocaleString() || 0}</div>
                            <div className="text-slate-500 font-medium text-sm tracking-wide uppercase">Photos</div>
                        </div>

                        <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl p-6 border border-slate-100 hover:border-slate-200 transition-colors">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-fuchsia-50 rounded-2xl mb-4">
                                <HeartIcon className="w-6 h-6 text-fuchsia-600" />
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalLikes?.toLocaleString() || 0}</div>
                            <div className="text-slate-500 font-medium text-sm tracking-wide uppercase">Appreciation</div>
                        </div>

                        <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl p-6 border border-slate-100 hover:border-slate-200 transition-colors">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-emerald-50 rounded-2xl mb-4">
                                <ArrowUpIcon className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">+{stats.growthRate || 0}%</div>
                            <div className="text-slate-500 font-medium text-sm tracking-wide uppercase">Growth</div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Featured Section */}
            <motion.section
                className="py-24 bg-white border-t border-slate-100"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div className="text-center mb-16" variants={itemVariants}>
                        <span className="text-indigo-600 font-semibold uppercase tracking-wider text-sm">Curation</span>
                        <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-4">
                            Featured Works
                        </h2>
                        <p className="text-lg text-slate-600 max-w-xl mx-auto">
                            The absolute finest submissions recently recognized by our global creative circle
                        </p>
                    </motion.div>

                    <motion.div
                        className="max-w-3xl mx-auto mb-16"
                        variants={containerVariants}
                    >
                        {featuredPosts.length > 0 ? (
                            <motion.div
                                className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/60 border border-slate-100 transition-all duration-300"
                                variants={itemVariants}
                                whileHover={{ y: -8 }}
                            >
                                <div className="aspect-[4/3] sm:aspect-video relative overflow-hidden bg-slate-100">
                                    <img
                                        src={`${API_CONFIG.BASE_URL}/${featuredPosts[0].image}`}
                                        alt={featuredPosts[0].title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="absolute top-6 right-6 z-20 flex items-center space-x-1.5 bg-white/90 backdrop-blur-md text-fuchsia-600 px-4 py-2 rounded-full font-bold shadow-sm">
                                        <HeartIcon className="w-5 h-5 fill-fuchsia-600 text-fuchsia-600" />
                                        <span>{featuredPosts[0].likesCount || 0} Likes</span>
                                    </div>
                                    <div className="absolute bottom-8 left-8 right-8 z-20">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <div className="bg-white/20 backdrop-blur-md rounded-full p-2">
                                                <HandRaisedIcon className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="text-sm font-bold text-white tracking-wider uppercase bg-black/30 backdrop-blur-md px-3 py-1 rounded-full">#1 Featured</span>
                                        </div>
                                        <h3 className="text-white font-extrabold text-3xl md:text-4xl truncate">{featuredPosts[0].title}</h3>
                                        <p className="text-slate-200 text-lg mt-1 font-medium">Captured by {featuredPosts[0].username}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/60 border border-slate-100"
                                variants={itemVariants}
                            >
                                <div className="aspect-[4/3] sm:aspect-video relative overflow-hidden bg-slate-50 flex flex-col items-center justify-center">
                                    <HandRaisedIcon className="w-20 h-20 text-slate-200 animate-pulse mb-4" />
                                    <p className="text-slate-400 font-bold text-lg">Awaiting top curation...</p>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    <motion.div className="text-center" variants={itemVariants}>
                        <Link
                            to="/posts"
                            className="inline-flex items-center bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg transform hover:scale-[1.02]"
                        >
                            Explore Full Gallery
                        </Link>
                    </motion.div>
                </div>
            </motion.section>

            {/* Call to Action Section */}
            <motion.section
                className="py-24 bg-gray-50 relative overflow-hidden border-t border-slate-100"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
            >
                <div className="bg-dots absolute inset-0 opacity-70"></div>
                <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
                    <motion.div variants={itemVariants} className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-indigo-200 overflow-hidden relative">
                        {/* decorative circle */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                        
                        <div className="relative z-10">
                            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">
                                Inspired to share your perspective?
                            </h2>
                            <p className="text-indigo-100 text-base font-medium mb-6 max-w-md mx-auto opacity-90">
                                Join our global community and showcase your hand artistry to other enthusiasts.
                            </p>
                            {!isAuthenticated && (
                                <Link
                                    to="/signup"
                                    className="inline-block bg-white text-indigo-600 px-8 py-3.5 rounded-xl font-bold shadow-md hover:bg-indigo-50 transition-all duration-300 transform hover:scale-[1.02]"
                                >
                                    Register Account
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.section>
        </>
    );
}
