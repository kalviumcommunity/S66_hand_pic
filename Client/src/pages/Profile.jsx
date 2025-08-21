import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { 
    UserIcon, 
    PhotoIcon, 
    HeartIcon, 
    PlusIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import AddPost from '../components/AddPost';

const Profile = () => {
    const { user } = useAuth();
    const [userPosts, setUserPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [showAddPost, setShowAddPost] = useState(false);
    const [stats, setStats] = useState({
        totalPosts: 0,
        totalLikes: 0,
        totalViews: 0
    });

    useEffect(() => {
        if (user) {
            fetchUserPosts();
            fetchLikedPosts();
        }
    }, [user]);

    const fetchUserPosts = async () => {
        try {
            const response = await fetch(`https://s66-hand-pic.onrender.com/posts`);
            const posts = await response.json();
            const userSpecificPosts = posts.filter(post => post.created_by === user.id);
            setUserPosts(userSpecificPosts);

            // Calculate stats
            const totalLikes = userSpecificPosts.reduce((sum, post) => sum + (post.likesCount || 0), 0);
            setStats({
                totalPosts: userSpecificPosts.length,
                totalLikes,
                totalViews: userSpecificPosts.length * 50 // Mock view count
            });
        } catch (error) {
            console.error('Error fetching user posts:', error);
        }
    };

    const fetchLikedPosts = async () => {
        try {
            const response = await fetch('https://s66-hand-pic.onrender.com/user/liked-posts', {
                credentials: 'include'
            });
            const posts = await response.json();
            setLikedPosts(posts);
        } catch (error) {
            console.error('Error fetching liked posts:', error);
        }
    };

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

    const PostGrid = ({ posts }) => (
        <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {posts.map((post) => (
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <h3 className="text-white font-semibold text-lg">{post.title}</h3>
                            <p className="text-gray-300 text-sm">{post.description}</p>
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
            ))}
        </motion.div>
    );

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-black text-white">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {/* Profile Header */}
                    <motion.div 
                        className="bg-gray-900 rounded-lg p-8 mb-8 border border-gray-800"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
                                <UserIcon className="w-12 h-12 text-white" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-white mb-2">{user?.username}</h1>
                                <p className="text-gray-400 mb-4">{user?.email}</p>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">{stats.totalPosts}</div>
                                        <div className="text-gray-400 text-sm">Posts</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">{stats.totalLikes}</div>
                                        <div className="text-gray-400 text-sm">Likes</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">{stats.totalViews}</div>
                                        <div className="text-gray-400 text-sm">Views</div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddPost(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                            >
                                <PlusIcon className="w-5 h-5" />
                                <span>Add Post</span>
                            </button>
                        </div>
                    </motion.div>

                    {/* Tabs */}
                    <div className="flex space-x-1 mb-8">
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                                activeTab === 'posts'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                        >
                            <PhotoIcon className="w-5 h-5 inline mr-2" />
                            My Posts ({userPosts.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('liked')}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                                activeTab === 'liked'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                        >
                            <HeartIcon className="w-5 h-5 inline mr-2" />
                            Liked Posts ({likedPosts.length})
                        </button>
                    </div>

                    {/* Content */}
                    <div className="min-h-96">
                        {activeTab === 'posts' && (
                            <div>
                                {userPosts.length > 0 ? (
                                    <PostGrid posts={userPosts} />
                                ) : (
                                    <div className="text-center py-16">
                                        <PhotoIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-400 mb-2">No posts yet</h3>
                                        <p className="text-gray-500 mb-6">Share your first hand picture with the community!</p>
                                        <button
                                            onClick={() => setShowAddPost(true)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                                        >
                                            Upload Your First Post
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'liked' && (
                            <div>
                                {likedPosts.length > 0 ? (
                                    <PostGrid posts={likedPosts} />
                                ) : (
                                    <div className="text-center py-16">
                                        <HeartIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-400 mb-2">No liked posts yet</h3>
                                        <p className="text-gray-500">Start exploring and like posts you enjoy!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Post Modal */}
                {showAddPost && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-white">Add New Post</h2>
                                    <button
                                        onClick={() => setShowAddPost(false)}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <AddPost onSuccess={() => {
                                    setShowAddPost(false);
                                    fetchUserPosts();
                                }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Profile;
