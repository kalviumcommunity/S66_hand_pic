import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HeartIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    PhotoIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AddPost from '../components/AddPost';
import EditDeleteBtn from '../components/EditDelete/EditDeleteBtn';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/environment';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const PostList = () => {
    const { user, isAuthenticated } = useAuth();
    const [posts, setPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState({});
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddPost, setShowAddPost] = useState(false);
    const [viewingPost, setViewingPost] = useState(null);
    const [loading, setLoading] = useState(true);

    // MED-13 fix: useCallback so interval doesn't capture stale closure
    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            // MED-07: paginated request
            const response = await api.get(`/posts?sortBy=${sortBy}&order=${sortOrder}&limit=50`);
            // Handle both paginated and non-paginated response shapes
            const data = response.data;
            setPosts(Array.isArray(data) ? data : (data.posts || []));
        } catch (err) {
            console.error("Error fetching posts:", err);
            toast.error("Failed to load posts");
        } finally {
            setLoading(false);
        }
    }, [sortBy, sortOrder]);

    const loadUserLikes = useCallback(async () => {
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
    }, []);

    // Fetch posts when sort params change (depends on memoized fetchPosts)
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // Auto-refresh — memoized fetchPosts prevents stale closure (MED-09, MED-13)
    useEffect(() => {
        const interval = setInterval(fetchPosts, 30000);
        return () => clearInterval(interval);
    }, [fetchPosts]);

    // Load user's liked posts when auth state is known
    useEffect(() => {
        if (isAuthenticated && user) {
            loadUserLikes();
        }
    }, [isAuthenticated, user, loadUserLikes]);

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

    const handleViewPost = async (post) => {
        try {
            // Increment views on the server and get updated post
            const response = await api.get(`/posts/${post._id}`);
            setViewingPost(response.data);
            
            // Update the local state array with the new viewsCount
            setPosts(prev => prev.map(p => p._id === post._id ? response.data : p));
        } catch (err) {
            console.error("Error updating views:", err);
            // Fallback
            setViewingPost(post);
        }
    };

    const handleSharePost = (postId, e) => {
        if (e) e.stopPropagation();
        const postLink = `${window.location.origin}/posts?postId=${postId}`;
        navigator.clipboard.writeText(postLink);
        toast.success("Post link copied to clipboard!");
    };

    // Deep-linking: automatically open shared post if postId is in URL search params
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const sharedPostId = queryParams.get('postId');
        if (sharedPostId) {
            const fetchSharedPost = async () => {
                try {
                    const response = await api.get(`/posts/${sharedPostId}`);
                    setViewingPost(response.data);
                } catch (err) {
                    console.error("Error loading shared post:", err);
                }
            };
            fetchSharedPost();
        }
    }, []);
    const filteredPosts = posts.filter(post => {
        const matchesSearch = searchTerm ?
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.username.toLowerCase().includes(searchTerm.toLowerCase())
            : true;
        return matchesSearch;
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
            <div className="min-h-screen bg-white bg-dots text-slate-950">
                {/* Header Section */}
                <div className="bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <div className="flex items-center space-x-2 mb-1.5">
                                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-800 shadow-none">Gallery Catalog</span>
                                </div>
                                <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
                                    Community Feed
                                </h1>
                                <p className="text-slate-500 text-sm mt-1">
                                    Discover and upload artistic photography from creators worldwide.
                                </p>
                            </div>
                            {isAuthenticated && (
                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowAddPost(true)}
                                    className="bg-slate-950 hover:bg-slate-900 text-white px-4 py-2 rounded-md font-semibold text-sm flex items-center justify-center space-x-2 shadow-sm transition-all duration-150 shrink-0 self-start sm:self-center cursor-pointer"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    <span>Post Artifact</span>
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="bg-white rounded-md border border-slate-200 p-3 flex flex-col md:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search contributors, titles, keywords..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-md text-slate-955 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 transition-all font-medium"
                            />
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap gap-2">
                            {/* Sort Options */}
                            <div className="flex gap-1.5 w-full sm:w-auto">
                                <select
                                    value={`${sortBy}:${sortOrder}`}
                                    onChange={(e) => {
                                        const [field, order] = e.target.value.split(':');
                                        setSortBy(field);
                                        setSortOrder(order);
                                    }}
                                    className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:border-slate-950 transition-colors flex-1 min-w-[160px]"
                                >
                                    <option value="createdAt:desc">Newest</option>
                                    <option value="createdAt:asc">Oldest</option>
                                    <option value="likes:desc">Most Likes</option>
                                    <option value="likes:asc">Least Likes</option>
                                    <option value="views:desc">Most Views</option>
                                    <option value="views:asc">Least Views</option>
                                    <option value="title:asc">Alphabetical (A-Z)</option>
                                    <option value="title:desc">Alphabetical (Z-A)</option>
                                </select>
                                <button
                                    onClick={fetchPosts}
                                    className="px-2.5 py-2 bg-slate-950 text-white rounded-md hover:bg-slate-900 transition-all shadow-sm cursor-pointer"
                                    title="Refresh feed"
                                >
                                    <ArrowPathIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Posts Grid */}
                <div className="max-w-7xl mx-auto px-6 pb-20">
                    {loading ? (
                        <div className="flex flex-col justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-b-slate-950"></div>
                            <p className="text-slate-400 mt-3 text-xs font-semibold">Loading feed...</p>
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {filteredPosts.map((post) => (
                                <motion.div
                                    key={post._id}
                                    className="group relative bg-white rounded-lg overflow-hidden border border-slate-200 hover:border-slate-350 transition-all duration-300 cursor-pointer flex flex-col"
                                    variants={itemVariants}
                                    whileHover={{ y: -3 }}
                                    onClick={() => handleViewPost(post)}
                                >
                                    <div className="aspect-[4/5] relative overflow-hidden bg-slate-50 border-b border-slate-100">
                                        <img
                                            src={`${API_CONFIG.BASE_URL}/${post.image}`}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.01]"
                                        />
                                        <div className="absolute inset-0 bg-slate-950/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        {/* Action Bar Overlays */}
                                        <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
                                            {/* Post Actions */}
                                            <div className="pointer-events-auto">
                                                {isAuthenticated && user && post.created_by === user.id && (
                                                    <EditDeleteBtn 
                                                        postId={post._id} 
                                                        onDeleteSuccess={(deletedId) => {
                                                            setPosts(prev => prev.filter(p => p._id !== deletedId));
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            
                                            {/* Action Overlays (Right Side) */}
                                            <div className="pointer-events-auto flex items-center space-x-1.5">
                                                {/* Share Button */}
                                                <button
                                                    onClick={(e) => handleSharePost(post._id, e)}
                                                    className="p-1.5 bg-white/90 border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50 hover:text-slate-950 transition-colors backdrop-blur-sm shadow-sm cursor-pointer"
                                                    title="Share Creation"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 10.742l4.636-2.318m0 0a3 3 0 100-4.184m-4.636 4.184a3 3 0 11-4.636-2.263m4.636 2.263a3 3 0 100 4.184m0 0l-4.636 2.318m0 0a3 3 0 11-4.636-2.263m4.636 2.263a3 3 0 100 4.184" />
                                                    </svg>
                                                </button>

                                                {/* Like Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleLike(post._id);
                                                    }}
                                                    className="p-1.5 bg-white/90 border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50 hover:text-slate-950 transition-colors backdrop-blur-sm shadow-sm cursor-pointer"
                                                    title={likedPosts[post._id] ? "Unlike Creation" : "Like Creation"}
                                                >
                                                    {likedPosts[post._id] ? (
                                                        <HeartSolidIcon className="w-4 h-4 text-red-505" fill="currentColor" />
                                                    ) : (
                                                        <HeartIcon className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 flex flex-col flex-grow">
                                        <h3 className="text-sm font-bold text-slate-950 tracking-tight leading-tight group-hover:text-slate-800 transition-colors mb-1">
                                            {post.title}
                                        </h3>
                                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-4 flex-grow">
                                            {post.description}
                                        </p>
                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center space-x-1.5 z-25">
                                                <Link
                                                    to={`/profile/${post.created_by}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center space-x-1.5 hover:opacity-80 transition-opacity"
                                                >
                                                    <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-sm">
                                                        {post.username.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-slate-850 text-xs font-semibold">@{post.username}</span>
                                                </Link>
                                            </div>
                                            <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-700">
                                                <HeartSolidIcon className={`w-3 h-3 ${post.likesCount > 0 ? 'text-red-500' : 'text-slate-350'}`} />
                                                <span>{post.likesCount || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20 bg-white border border-slate-200 rounded-lg"
                        >
                            <div className="w-12 h-12 bg-slate-50 rounded-md mx-auto mb-4 flex items-center justify-center border border-slate-100 text-slate-350">
                                <PhotoIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-1">No artifacts spotted</h3>
                            <p className="text-slate-400 text-xs mb-6 max-w-xs mx-auto font-medium">
                                {searchTerm
                                    ? "No matches were found. Try updating search queries."
                                    : "Be the first platform member to publish an artifact!"
                                }
                            </p>
                            {isAuthenticated && !searchTerm && (
                                <button
                                    onClick={() => setShowAddPost(true)}
                                    className="bg-slate-950 hover:bg-slate-900 text-white px-5 py-2.5 rounded-md font-semibold text-xs transition-all cursor-pointer"
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
                            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-xl relative"
                                initial={{ scale: 0.98, opacity: 0, y: 8 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.98, opacity: 0, y: 8 }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            >
                                <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-5 py-4 border-b border-slate-100 flex justify-between items-center z-10">
                                    <div>
                                        <h2 className="text-base font-bold text-slate-950">Compose Artifact</h2>
                                        <p className="text-slate-400 text-[10px] font-semibold mt-0.5">Submit detail parameters to feed</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddPost(false)}
                                        className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                                <div className="p-5">
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
                            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setViewingPost(null)}
                        >
                            <motion.div
                                className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto md:overflow-hidden border border-slate-200 shadow-xl flex flex-col md:flex-row relative"
                                initial={{ scale: 0.98, opacity: 0, y: 8 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.98, opacity: 0, y: 8 }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setViewingPost(null)}
                                    className="absolute top-3 right-3 w-8 h-8 rounded-md bg-white/90 border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-white backdrop-blur-sm flex items-center justify-center transition-all z-20 cursor-pointer shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>

                                {/* Image Display Side */}
                                <div className="md:flex-1 bg-slate-950 relative flex items-center justify-center min-h-[250px] md:min-h-0">
                                    <img
                                        src={`${API_CONFIG.BASE_URL}/${viewingPost.image}`}
                                        alt={viewingPost.title}
                                        className="w-full h-full object-contain max-h-[45vh] md:max-h-[75vh]"
                                    />
                                </div>

                                {/* Content Info Side */}
                                <div className="w-full md:w-[350px] bg-white flex flex-col border-t md:border-t-0 md:border-l border-slate-200 md:h-full md:overflow-y-auto">
                                    <div className="p-6 flex-grow">
                                        <div className="flex items-center space-x-2.5 mb-5 pb-4 border-b border-slate-100">
                                            <Link
                                                to={`/profile/${viewingPost.created_by}`}
                                                className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity"
                                            >
                                                <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                                                    {viewingPost.username.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-slate-950 font-bold text-sm">@{viewingPost.username}</div>
                                                    <div className="text-slate-400 text-[10px] font-medium">Shared {new Date(viewingPost.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                </div>
                                            </Link>
                                        </div>

                                        <h2 className="text-lg font-extrabold text-slate-950 leading-tight mb-3">
                                            {viewingPost.title}
                                        </h2>
                                        
                                        <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-slate-650 text-xs leading-relaxed mb-4">
                                            {viewingPost.description}
                                        </div>

                                        <div className="flex items-center justify-between py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-md">
                                            <div className="flex items-center space-x-1.5 text-slate-700 text-xs font-semibold">
                                                <HeartSolidIcon className="w-4 h-4 text-red-550" />
                                                <span>{viewingPost.likesCount || 0} Likes</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-semibold">Curation score</span>
                                        </div>
                                    </div>

                                    <div className="p-6 pt-0 mt-auto border-t border-slate-100 flex gap-3 pt-4">
                                        <button
                                            onClick={() => handleSharePost(viewingPost._id)}
                                            className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md font-semibold flex items-center justify-center space-x-2 transition-all active:scale-[0.98] text-sm cursor-pointer shadow-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 10.742l4.636-2.318m0 0a3 3 0 100-4.184m-4.636 4.184a3 3 0 11-4.636-2.263m4.636 2.263a3 3 0 100 4.184m0 0l-4.636 2.318m0 0a3 3 0 11-4.636-2.263m4.636 2.263a3 3 0 100 4.184" />
                                            </svg>
                                            <span>Share</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleLike(viewingPost._id);
                                            }}
                                            className={`flex-[2] py-2.5 rounded-md font-semibold flex items-center justify-center space-x-2 transition-all active:scale-[0.98] text-sm cursor-pointer ${
                                                likedPosts[viewingPost._id]
                                                    ? "bg-slate-100 text-slate-700 border border-slate-200"
                                                    : "bg-slate-950 text-white hover:bg-slate-900 shadow-sm"
                                            }`}
                                        >
                                            {likedPosts[viewingPost._id] ? (
                                                <>
                                                    <HeartSolidIcon className="w-4 h-4" />
                                                    <span>Liked</span>
                                                </>
                                            ) : (
                                                <>
                                                    <HeartIcon className="w-4 h-4" />
                                                    <span>Like</span>
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
            <Footer />
        </>
    );
};

export default PostList;
