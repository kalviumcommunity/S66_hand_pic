import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from "../components/Navbar";
import { useAuth } from '../context/AuthContext';
import {
    HandRaisedIcon,
    HeartIcon,
    ArrowUpIcon,
    PhotoIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

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
        // Fetch real statistics
        fetch('https://s66-hand-pic.onrender.com/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error('Error fetching stats:', err));

        // Fetch top 3 most liked posts
        fetch('https://s66-hand-pic.onrender.com/posts?sortBy=likes&order=desc')
            .then(res => res.json())
            .then(data => setFeaturedPosts(data.slice(0, 3)))
            .catch(err => console.error('Error fetching featured posts:', err));
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
                className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="absolute inset-0 bg-blue-500/5"></div>
                <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
                    <motion.div variants={itemVariants}>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            Welcome to <span className="text-blue-500">Handscape</span>
                        </h1>
                    </motion.div>

                    <motion.p
                        className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
                        variants={itemVariants}
                    >
                        Join our creative community where hands tell stories.
                        Upload, discover, and vote on the most creative hand photography.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
                        variants={itemVariants}
                    >
                        {isAuthenticated ? (
                            <Link
                                to="/posts"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                            >
                                Start Sharing
                            </Link>
                        ) : (
                            <Link
                                to="/signup"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                            >
                                Get Started Today
                            </Link>
                        )}
                        <Link
                            to="/posts"
                            className="border border-gray-600 hover:border-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:bg-blue-500/10"
                        >
                            Browse Gallery
                        </Link>
                    </motion.div>

                    {/* Stats Section */}
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
                        variants={itemVariants}
                    >
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                            <div className="flex items-center justify-center mb-2">
                                <UserGroupIcon className="w-8 h-8 text-blue-500" />
                            </div>
                            <div className="text-3xl font-bold text-white">{stats.totalUsers?.toLocaleString() || 0}</div>
                            <div className="text-gray-400">Total Users</div>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                            <div className="flex items-center justify-center mb-2">
                                <PhotoIcon className="w-8 h-8 text-blue-500" />
                            </div>
                            <div className="text-3xl font-bold text-white">{stats.photosShared?.toLocaleString() || 0}</div>
                            <div className="text-gray-400">Photos Shared</div>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                            <div className="flex items-center justify-center mb-2">
                                <HeartIcon className="w-8 h-8 text-red-500" />
                            </div>
                            <div className="text-3xl font-bold text-white">{stats.totalLikes?.toLocaleString() || 0}</div>
                            <div className="text-gray-400">Total Likes</div>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                            <div className="flex items-center justify-center mb-2">
                                <ArrowUpIcon className="w-8 h-8 text-green-500" />
                            </div>
                            <div className="text-3xl font-bold text-white">+{stats.growthRate || 0}%</div>
                            <div className="text-gray-400">Growth Rate</div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Featured Hand Art Section */}
            <motion.section
                className="py-20 bg-gray-900"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
            >
                <div className="max-w-6xl mx-auto px-4">
                    <motion.div className="text-center mb-16" variants={itemVariants}>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Featured Hand Art
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Discover the most creative submissions from our community
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
                        variants={containerVariants}
                    >
                        {featuredPosts.length > 0 ? (
                            featuredPosts.map((post) => (
                                <motion.div
                                    key={post._id}
                                    className="group relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-300"
                                    variants={itemVariants}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="aspect-square relative overflow-hidden">
                                        <img
                                            src={`https://s66-hand-pic.onrender.com/${post.image}`}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <HandRaisedIcon className="w-8 h-8 text-yellow-400 mb-2" />
                                            <h3 className="text-white font-semibold text-lg">{post.title}</h3>
                                            <p className="text-gray-300 text-sm">by {post.username}</p>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-sm">{post.title}</span>
                                            <div className="flex items-center space-x-1 text-blue-400">
                                                <HeartIcon className="w-4 h-4" />
                                                <span className="text-sm">{post.likesCount || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            // Placeholder cards when no posts are available
                            [1, 2, 3].map((index) => (
                                <motion.div
                                    key={index}
                                    className="group relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
                                    variants={itemVariants}
                                >
                                    <div className="aspect-square relative overflow-hidden bg-gray-700 flex items-center justify-center">
                                        <HandRaisedIcon className="w-16 h-16 text-gray-500" />
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-sm">Amazing Hand Art</span>
                                            <div className="flex items-center space-x-1 text-blue-400">
                                                <HeartIcon className="w-4 h-4" />
                                                <span className="text-sm">{Math.floor(Math.random() * 50) + 10}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>

                    <motion.div className="text-center" variants={itemVariants}>
                        <Link
                            to="/posts"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                        >
                            View All Posts
                        </Link>
                    </motion.div>
                </div>
            </motion.section>

            {/* Call to Action Section */}
            <motion.section
                className="py-20 bg-black"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
            >
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <motion.div variants={itemVariants}>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Ready to Share Your Art?
                        </h2>
                        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                            Join thousands of creative sharing their unique hand photography
                        </p>
                        {!isAuthenticated && (
                            <Link
                                to="/signup"
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                            >
                                Get Started Today
                            </Link>
                        )}
                    </motion.div>
                </div>
            </motion.section>
        </>
    );
}
