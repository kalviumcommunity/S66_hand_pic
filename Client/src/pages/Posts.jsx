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
import { API_CONFIG } from '../config/environment';
import api from '../utils/api';
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
    const [viewingPost, setViewingPost] = useState(null);
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
            const response = await api.get(`/posts?sortBy=${sortBy}&order=${sortOrder}`);
            setPosts(response.data);
        } catch (err) {
            console.error("Error fetching posts:", err);
            toast.error("Failed to load posts");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    const loadUserLikes = async () => {
        try {
            const response = await api.get('/user/liked-posts');
            const likedPostsData = response.data;
            const likesMap = {};
            if (Array.isArray(likedPostsData)) {
                likedPostsData.forEach(post => {
                    likesMap[post._id] = true;
                });
            }
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
            const response = await api.post(`/posts/${postId}/like`);
            const data = response.data;

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
        } catch (err) {
            console.error("Error liking post:", err);
            toast.error(err.response?.data?.message || "Failed to like post");
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
            <div className="min-h-screen bg-[#f8fafc] bg-dots text-slate-900">
                {/* Header Section */}
                <div className="bg-white border-b border-slate-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-6 py-10">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-indigo-100">Gallery</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                                    Community Feed
                                </h1>
                                <p className="text-slate-600 mt-2 font-medium">
                                    Discover, vote, and upload artistic photography from enthusiasts worldwide.
                                </p>
                            </div>
                            {isAuthenticated && (
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setShowAddPost(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all duration-200"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    <span>Post Artifact</span>
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search keywords, users, titles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                            />
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap gap-3">
                            {/* User Filter */}
                            <select
                                value={selectedUser}
                                onChange={handleUserChange}
                                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-indigo-500 transition-colors min-w-[140px]"
                            >
                                <option value="">All Contributors</option>
                                {users.map(user => (
                                    <option key={user._id} value={user.username}>
                                        @{user.username}
                                    </option>
                                ))}
                            </select>

                            {/* Sort Options */}
                            <div className="flex gap-2 w-full sm:w-auto">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-indigo-500 transition-colors flex-1"
                                >
                                    <option value="createdAt">Latest</option>
                                    <option value="likes">Popularity</option>
                                    <option value="title">Alphabetical</option>
                                </select>
                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                                    title="Toggle Direction"
                                >
                                    <FunnelIcon className={`w-5 h-5 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                                </button>
                                <button
                                    onClick={fetchPosts}
                                    className="px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10"
                                    title="Refresh feed"
                                >
                                    <ArrowPathIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Posts Grid */}
                <div className="max-w-7xl mx-auto px-6 pb-20">
                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-24">
                            <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-slate-200 border-b-indigo-600"></div>
                            <p className="text-slate-500 mt-4 font-medium">Refreshing timeline...</p>
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {filteredPosts.map((post) => (
                                <motion.div
                                    key={post._id}
                                    className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:shadow-indigo-100/40 hover:border-indigo-200 transition-all duration-500 cursor-pointer"
                                    variants={itemVariants}
                                    whileHover={{ y: -6 }}
                                    onClick={() => setViewingPost(post)}
                                >
                                    <div className="aspect-[4/5] relative overflow-hidden bg-slate-50">
                                        <img
                                            src={`${API_CONFIG.BASE_URL}/${post.image}`}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

                                        {/* Action Bar Overlays */}
                                        <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                                            <div className="flex justify-between items-start w-full pointer-events-auto">
                                                {/* Post Actions */}
                                                <div className="z-20">
                                                    {isAuthenticated && user && post.created_by === user.id && (
                                                        <EditDeleteBtn 
                                                            postId={post._id} 
                                                            onDeleteSuccess={(deletedId) => {
                                                                setPosts(prev => prev.filter(p => p._id !== deletedId));
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                
                                                {/* Like Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleLike(post._id);
                                                    }}
                                                    className={`p-2.5 rounded-full shadow-lg transition-all duration-300 active:scale-90 z-20 ${
                                                        likedPosts[post._id] 
                                                        ? "bg-red-500 text-white" 
                                                        : "bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white"
                                                    }`}
                                                >
                                                    {likedPosts[post._id] ? (
                                                        <HeartSolidIcon className="w-5 h-5" />
                                                    ) : (
                                                        <HeartIcon className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>

                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none pb-2 px-2">
                                                <span className="inline-block bg-white/20 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg border border-white/20">
                                                    Artifact Ref: {post._id.substring(post._id.length - 4)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-slate-900 mb-1.5 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                                            {post.description}
                                        </p>
                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm shadow-indigo-200">
                                                    {post.username.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-slate-800 text-sm font-semibold">@{post.username}</span>
                                            </div>
                                            <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                                                <HeartSolidIcon className={`w-3.5 h-3.5 ${post.likesCount > 0 ? 'text-red-500' : 'text-slate-300'}`} />
                                                <span className="text-slate-700 text-xs font-bold">{post.likesCount || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-24 bg-white border border-slate-200 rounded-3xl shadow-sm"
                        >
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl mx-auto mb-6 flex items-center justify-center border border-slate-100">
                                <PhotoIcon className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No artifacts spotted</h3>
                            <p className="text-slate-500 mb-8 max-w-md mx-auto font-medium">
                                {searchTerm || selectedUser
                                    ? "The selected filter didn't yield match criteria. Try widening the perspective."
                                    : "Be the foundational member to share the first artistic snapshot here!"
                                }
                            </p>
                            {isAuthenticated && !searchTerm && !selectedUser && (
                                <button
                                    onClick={() => setShowAddPost(true)}
                                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-slate-900/10 transition-all active:scale-95"
                                >
                                    Upload Inaugural Post
                                </button>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Add Post Modal */}
                <AnimatePresence>
                    {showAddPost && (
                        <motion.div
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl relative"
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                transition={{ type: "spring", bounce: 0.3 }}
                            >
                                <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-5 border-b border-slate-100 flex justify-between items-center z-10">
                                    <div>
                                        <h2 className="text-xl font-extrabold text-slate-900">Compose Artifact</h2>
                                        <p className="text-slate-500 text-xs font-medium mt-0.5">Fill details to curate on feed</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddPost(false)}
                                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                                <div className="p-6 sm:p-8">
                                    <AddPost onSuccess={() => {
                                        setShowAddPost(false);
                                        fetchPosts();
                                        toast.success('Artifact uploaded curation successful!');
                                    }} />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Post Detail Expansion Modal */}
                <AnimatePresence>
                    {viewingPost && (
                        <motion.div
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 md:p-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewingPost(null)}
                        >
                            <motion.div
                                className="bg-white rounded-[2.5rem] max-w-5xl w-full max-h-[90vh] overflow-hidden border border-slate-200 shadow-2xl flex flex-col lg:flex-row relative"
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setViewingPost(null)}
                                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md flex items-center justify-center transition-all z-20"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>

                                {/* Image Display Side */}
                                <div className="lg:flex-1 bg-slate-900 relative flex items-center justify-center min-h-[300px] lg:min-h-0">
                                    <img
                                        src={`${API_CONFIG.BASE_URL}/${viewingPost.image}`}
                                        alt={viewingPost.title}
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                {/* Content Info Side */}
                                <div className="w-full lg:w-[380px] xl:w-[420px] bg-white flex flex-col border-l border-slate-100 h-full overflow-y-auto">
                                    <div className="p-8 flex-1">
                                        <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-slate-100">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-100">
                                                {viewingPost.username.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-slate-900 font-extrabold tracking-tight">@{viewingPost.username}</div>
                                                <div className="text-slate-400 text-xs font-medium">Posted {new Date(viewingPost.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                            </div>
                                        </div>

                                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-4">
                                            {viewingPost.title}
                                        </h2>
                                        
                                        <div className="bg-slate-50 rounded-2xl p-5 text-slate-600 font-medium text-base leading-relaxed mb-6 border border-slate-100">
                                            {viewingPost.description}
                                        </div>

                                        <div className="flex items-center justify-between py-4 px-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                                            <div className="flex items-center space-x-2">
                                                <HeartSolidIcon className="w-5 h-5 text-fuchsia-600" />
                                                <span className="font-bold text-slate-800 text-lg">{viewingPost.likesCount || 0}</span>
                                                <span className="text-slate-500 text-sm font-medium">Appreciations</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 pt-0 mt-auto">
                                        <button
                                            onClick={(e) => {
                                                handleLike(viewingPost._id);
                                            }}
                                            className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ${
                                                likedPosts[viewingPost._id]
                                                    ? "bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200 shadow-inner"
                                                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
                                            }`}
                                        >
                                            {likedPosts[viewingPost._id] ? (
                                                <>
                                                    <HeartSolidIcon className="w-5 h-5" />
                                                    <span>Already Appreciated</span>
                                                </>
                                            ) : (
                                                <>
                                                    <HeartIcon className="w-5 h-5" />
                                                    <span>Register Appreciation</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
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
