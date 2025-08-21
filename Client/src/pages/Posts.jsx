import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HeartIcon,
    PlusIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    PhotoIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Navbar from '../components/Navbar';
import AddPost from '../components/AddPost';
import EditDeleteBtn from '../components/EditDelete/EditDeleteBtn';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PostList = () => {
    const { user, isAuthenticated } = useAuth();
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [likedPosts, setLikedPosts] = useState({});
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddPost, setShowAddPost] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch all posts
    useEffect(() => {
        fetchPosts();
    }, [sortBy, sortOrder]);

    // Auto-refresh posts every 30 seconds to show new posts from other users
    useEffect(() => {
        const interval = setInterval(() => {
            fetchPosts();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [sortBy, sortOrder]);

    // Fetch all users
    useEffect(() => {
        fetchUsers();
    }, []);

    // Load user's liked posts
    useEffect(() => {
        if (isAuthenticated && user) {
            loadUserLikes();
        }
    }, [isAuthenticated, user]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8888/posts?sortBy=${sortBy}&order=${sortOrder}`);
            const data = await response.json();
            setPosts(data);
        } catch (err) {
            console.error("Error fetching posts:", err);
            toast.error("Failed to load posts");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:8888/users");
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    const loadUserLikes = async () => {
        try {
            const response = await fetch('http://localhost:8888/user/liked-posts', {
                credentials: 'include'
            });
            const likedPostsData = await response.json();
            const likesMap = {};
            likedPostsData.forEach(post => {
                likesMap[post._id] = true;
            });
            setLikedPosts(likesMap);
        } catch (err) {
            console.error("Error loading user likes:", err);
        }
    };

    const handleLike = async (postId) => {
        if (!isAuthenticated) {
            toast.error("Please login to like posts");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8888/posts/${postId}/like`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await response.json();

            if (response.ok) {
                // Update liked posts state
                setLikedPosts(prev => ({
                    ...prev,
                    [postId]: data.isLiked
                }));

                // Update posts with new like count
                setPosts(prev => prev.map(post =>
                    post._id === postId
                        ? { ...post, likesCount: data.likesCount }
                        : post
                ));

                toast.success(data.message);
            } else {
                toast.error(data.message || "Failed to like post");
            }
        } catch (err) {
            console.error("Error liking post:", err);
            toast.error("Failed to like post");
        }
    };

    // Handle user selection
    const handleUserChange = (e) => {
        setSelectedUser(e.target.value);
    };

    // Filter posts based on selected user and search term
    const filteredPosts = posts.filter(post => {
        const matchesUser = selectedUser ? post.username === selectedUser : true;
        const matchesSearch = searchTerm ?
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.username.toLowerCase().includes(searchTerm.toLowerCase())
            : true;
        return matchesUser && matchesSearch;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
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
            <div className="min-h-screen bg-black text-white">
                {/* Header Section */}
                <div className="bg-gray-900 border-b border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    Hand Picture Gallery
                                </h1>
                                <p className="text-gray-400">
                                    Discover creative and unique hand photography from our community
                                </p>
                            </div>
                            {isAuthenticated && (
                                <button
                                    onClick={() => setShowAddPost(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    <span>Upload Picture</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search posts, users, or descriptions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* User Filter */}
                        <select
                            value={selectedUser}
                            onChange={handleUserChange}
                            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="">All Users</option>
                            {users.map(user => (
                                <option key={user._id} value={user.username}>
                                    {user.username}
                                </option>
                            ))}
                        </select>

                        {/* Sort Options */}
                        <div className="flex space-x-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="createdAt">Date</option>
                                <option value="likes">Likes</option>
                                <option value="title">Title</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors duration-200"
                            >
                                <FunnelIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={fetchPosts}
                                className="px-4 py-3 bg-blue-600 border border-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors duration-200"
                                title="Refresh posts"
                            >
                                <ArrowPathIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Posts Grid */}
                <div className="max-w-7xl mx-auto px-4 pb-8">
                    {loading ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {filteredPosts.map((post) => (
                                <motion.div
                                    key={post._id}
                                    className="group relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-300"
                                    variants={itemVariants}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="aspect-square relative overflow-hidden">
                                        <img
                                            src={`http://localhost:8888/${post.image}`}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                        {/* Like Button */}
                                        <button
                                            onClick={() => handleLike(post._id)}
                                            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors duration-200"
                                        >
                                            {likedPosts[post._id] ? (
                                                <HeartSolidIcon className="w-6 h-6 text-red-500" />
                                            ) : (
                                                <HeartIcon className="w-6 h-6 text-white" />
                                            )}
                                        </button>

                                        {/* Edit/Delete Button for post owner */}
                                        {isAuthenticated && user && post.created_by === user.id && (
                                            <EditDeleteBtn postId={post._id} />
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-white mb-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                                            {post.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-gray-500 text-sm">
                                                By: <span className="font-medium text-blue-400">{post.username}</span>
                                            </p>
                                            <div className="flex items-center space-x-1 text-gray-400">
                                                <HeartIcon className="w-4 h-4" />
                                                <span className="text-sm">{post.likesCount || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center py-16">
                            <PhotoIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-400 mb-2">No posts found</h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm || selectedUser
                                    ? "Try adjusting your filters or search terms"
                                    : "Be the first to share a hand picture!"
                                }
                            </p>
                            {isAuthenticated && !searchTerm && !selectedUser && (
                                <button
                                    onClick={() => setShowAddPost(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                                >
                                    Upload First Post
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Add Post Modal */}
                <AnimatePresence>
                    {showAddPost && (
                        <motion.div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-white">Upload Hand Picture</h2>
                                        <button
                                            onClick={() => setShowAddPost(false)}
                                            className="text-gray-400 hover:text-white text-2xl"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <AddPost onSuccess={() => {
                                        setShowAddPost(false);
                                        fetchPosts(); // This ensures the posts list refreshes immediately
                                        toast.success('Post uploaded successfully!');
                                    }} />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default PostList;
