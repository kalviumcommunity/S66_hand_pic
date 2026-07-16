import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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
                console.log('[DEBUG] statsResponse:', statsResponse.data);
                setStats(statsResponse.data);
                
                // Fetch top 3 most liked posts
                const postsResponse = await api.get('/posts?sortBy=likes&order=desc&limit=3');
                console.log('[DEBUG] postsResponse:', postsResponse.data);
                setFeaturedPosts(postsResponse.data.posts || []);
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
                className="relative min-h-[80vh] bg-white bg-dots flex items-center justify-center overflow-hidden border-b border-slate-100"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Subtle top light glow */}
                <div className="absolute top-0 left-1/2 w-[800px] h-[350px] bg-slate-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-70"></div>

                <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-12 pb-16">
                    <motion.div variants={itemVariants} className="mb-6 flex justify-center">
                        <span className="inline-flex items-center space-x-1.5 rounded-full border border-slate-200 bg-white/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse"></span>
                            <span>Community Curation Catalog</span>
                        </span>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-950 mb-6 leading-[1.05]">
                            Captured focus.<br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-500 via-slate-600 to-slate-950">Designed for hands.</span>
                        </h1>
                    </motion.div>

                    <motion.p
                        className="text-base md:text-lg text-slate-500 mb-8 max-w-xl mx-auto font-normal leading-relaxed"
                        variants={itemVariants}
                    >
                        Handscape is a clean, curated stream highlighting manual photography and artistic perspectives. Secure authentic feedback and showcase your focus.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-3 justify-center mb-16"
                        variants={itemVariants}
                    >
                        {isAuthenticated ? (
                            <Link
                                to="/posts"
                                className="bg-slate-950 hover:bg-slate-900 text-white px-6 py-3 rounded-md text-sm font-semibold shadow-sm transition-all text-center cursor-pointer"
                            >
                                Open Gallery
                            </Link>
                        ) : (
                            <Link
                                to="/signup"
                                className="bg-slate-950 hover:bg-slate-900 text-white px-6 py-3 rounded-md text-sm font-semibold shadow-sm transition-all text-center cursor-pointer"
                            >
                                Get Started Free
                            </Link>
                        )}
                        <Link
                            to="/posts"
                            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-md text-sm font-semibold shadow-sm transition-all text-center cursor-pointer"
                        >
                            Explore Feed
                        </Link>
                    </motion.div>

                    {/* Stats Section */}
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
                        variants={itemVariants}
                    >
                        <div className="bg-white rounded-md p-5 border border-slate-200 text-left flex flex-col justify-between h-28 shadow-sm">
                            <div className="flex items-center justify-between text-slate-400">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enthusiasts</span>
                                <UserGroupIcon className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-slate-950 leading-none">{stats.totalUsers?.toLocaleString() || 0}</div>
                                <p className="text-[10px] text-slate-400 mt-1">Platform members</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-md p-5 border border-slate-200 text-left flex flex-col justify-between h-28 shadow-sm">
                            <div className="flex items-center justify-between text-slate-400">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Creations</span>
                                <PhotoIcon className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-slate-950 leading-none">{stats.photosShared?.toLocaleString() || 0}</div>
                                <p className="text-[10px] text-slate-400 mt-1">Shared perspectives</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-md p-5 border border-slate-200 text-left flex flex-col justify-between h-28 shadow-sm">
                            <div className="flex items-center justify-between text-slate-400">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Appreciation</span>
                                <HeartIcon className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-slate-950 leading-none">{stats.totalLikes?.toLocaleString() || 0}</div>
                                <p className="text-[10px] text-slate-400 mt-1">Total expressions</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-md p-5 border border-slate-200 text-left flex flex-col justify-between h-28 shadow-sm">
                            <div className="flex items-center justify-between text-slate-400">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Growth</span>
                                <ArrowUpIcon className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-slate-950 leading-none">+{stats.growthRate || 0}%</div>
                                <p className="text-[10px] text-slate-400 mt-1">Weekly increase</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Core Pillars / How it works Section */}
            <motion.section 
                className="py-20 bg-slate-50 border-b border-slate-200"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div className="text-center mb-16" variants={itemVariants}>
                        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">How Handscape Works</span>
                        <h2 className="text-3xl font-extrabold text-slate-950 mt-1 mb-3">
                            The Curation Pipeline
                        </h2>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            Three simple, integrated stages to share manual photography and establish visual credentials.
                        </p>
                    </motion.div>

                    <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" variants={containerVariants}>
                        <motion.div variants={itemVariants} className="bg-white border border-slate-200 p-8 rounded-lg shadow-sm">
                            <div className="w-10 h-10 rounded-md bg-slate-950 text-white flex items-center justify-center font-bold text-sm mb-6">
                                01
                            </div>
                            <h3 className="text-lg font-bold text-slate-950 mb-2">Capture & Document</h3>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                Take manual focus snapshots emphasizing detailed textures, shapes, and angles. Upload them to the catalog with narrative context.
                            </p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white border border-slate-200 p-8 rounded-lg shadow-sm">
                            <div className="w-10 h-10 rounded-md bg-slate-950 text-white flex items-center justify-center font-bold text-sm mb-6">
                                02
                            </div>
                            <h3 className="text-lg font-bold text-slate-950 mb-2">Express & React</h3>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                Scroll through the global stream, discover perspective documentation, and send likes to reward creation alignment.
                            </p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="bg-white border border-slate-200 p-8 rounded-lg shadow-sm">
                            <div className="w-10 h-10 rounded-md bg-slate-950 text-white flex items-center justify-center font-bold text-sm mb-6">
                                03
                            </div>
                            <h3 className="text-lg font-bold text-slate-950 mb-2">Refine & Analyze</h3>
                            <p className="text-slate-500 text-xs leading-relaxed font-medium">
                                Track platform growth statistics, manage your account, edit details, and see how your posts contribute to community trends.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Featured Section */}
            <motion.section
                className="py-20 bg-white"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div className="text-center mb-12" variants={itemVariants}>
                        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Curation Spotlight</span>
                        <h2 className="text-3xl font-extrabold text-slate-955 mt-1 mb-3">
                            Featured Creation
                        </h2>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            The highest rated visual snapshot recently curated by our creative community.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {featuredPosts.length > 0 ? (
                            featuredPosts.map((post, index) => (
                                <motion.div
                                    key={post._id}
                                    className="group relative bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm transition-all duration-205 hover:border-slate-350"
                                    variants={itemVariants}
                                    whileHover={{ y: -3 }}
                                >
                                    <div className="aspect-[4/3] relative overflow-hidden bg-slate-50">
                                        <img
                                            src={`${API_CONFIG.BASE_URL}/${post.image}`}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                                        
                                        <div className="absolute top-4 right-4 z-20 flex items-center space-x-1 bg-white border border-slate-200 text-red-650 px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">
                                            <HeartIcon className="w-3.5 h-3.5 fill-red-600 text-red-600 stroke-0" />
                                            <span>{post.likesCount || 0} Likes</span>
                                        </div>
                                        
                                        <div className="absolute bottom-6 left-6 right-6 z-20 text-white">
                                            <div className="flex items-center space-x-1.5 mb-2">
                                                <span className="text-[10px] font-bold text-slate-900 tracking-wider uppercase bg-white px-2 py-0.5 rounded-md">
                                                    Featured #{index + 1}
                                                </span>
                                            </div>
                                            <h3 className="font-extrabold text-lg truncate text-white">{post.title}</h3>
                                            <p className="text-slate-200 text-xs mt-0.5">Captured by @{post.username}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full group bg-white rounded-lg overflow-hidden border border-slate-200">
                                <div className="aspect-[4/3] sm:aspect-video relative overflow-hidden bg-slate-50 flex flex-col items-center justify-center">
                                    <HandRaisedIcon className="w-12 h-12 text-slate-300 animate-pulse mb-3" />
                                    <p className="text-slate-400 font-semibold text-sm">Awaiting top curation...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <motion.div className="text-center" variants={itemVariants}>
                        <Link
                            to="/posts"
                            className="inline-flex items-center bg-slate-950 hover:bg-slate-900 text-white px-6 py-3 rounded-md text-sm font-semibold transition-all shadow-sm cursor-pointer"
                        >
                            Explore Feed Gallery
                        </Link>
                    </motion.div>
                </div>
            </motion.section>

            {/* Call to Action Section */}
            <motion.section
                className="py-24 bg-slate-50 relative overflow-hidden border-t border-slate-200"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="bg-dots absolute inset-0 opacity-40"></div>
                <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
                    <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-lg p-10 md:p-12 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-extrabold text-slate-955 mb-4 leading-tight">
                                Share your perspective
                            </h2>
                            <p className="text-slate-500 text-xs font-semibold mb-8 max-w-sm mx-auto leading-relaxed">
                                Join our community catalog today and showcase unique handscapes to enthusiasts worldwide.
                            </p>
                            {!isAuthenticated && (
                                <Link
                                    to="/signup"
                                    className="inline-block bg-slate-950 hover:bg-slate-900 text-white px-6 py-3 rounded-md text-sm font-semibold shadow-sm transition-all cursor-pointer"
                                >
                                    Register Account
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            <Footer />
        </>
    );
}
