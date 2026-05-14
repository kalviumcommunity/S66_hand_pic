import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { API_CONFIG } from '../config/environment';
import {
    UserIcon,
    PhotoIcon,
    HeartIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';
import AddPost from '../components/AddPost';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, checkAuthStatus } = useAuth();
    const location = useLocation();
    const [userPosts, setUserPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [showAddPost, setShowAddPost] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(location.state?.showEditModal || false);
    const [editData, setEditData] = useState({
        username: '',
        age: '',
        password: '',
        profilePicture: ''
    });
    const [loadingEdit, setLoadingEdit] = useState(false);
    
    const [stats, setStats] = useState({
        totalPosts: 0,
        totalLikes: 0,
        totalViews: 0
    });

    useEffect(() => {
        if (user) {
            fetchUserPosts();
            fetchLikedPosts();
            setEditData({
                username: user.username?.startsWith('user') ? '' : user.username,
                age: user.age || '',
                password: '',
                profilePicture: user.profilePicture || ''
            });
        }
    }, [user]);

    const fetchUserPosts = async () => {
        try {
            const response = await api.get('/posts');
            const posts = response.data;
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
            toast.error("Failed to fetch your posts");
        }
    };

    const fetchLikedPosts = async () => {
        try {
            const response = await api.get('/user/liked-posts');
            setLikedPosts(response.data);
        } catch (error) {
            console.error('Error fetching liked posts:', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoadingEdit(true);
        try {
            const formData = new FormData();
            formData.append('username', editData.username);
            formData.append('age', editData.age);
            
            if (editData.password) {
                formData.append('password', editData.password);
            }
            
            if (editData.profilePicture && typeof editData.profilePicture !== 'string') {
                formData.append('profilePicture', editData.profilePicture);
            }

            await api.put(`/users/${user.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Profile updated successfully!");
            checkAuthStatus(); // Refresh user data in context
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoadingEdit(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this creation?")) return;
        try {
            await api.delete(`/posts/${postId}`);
            toast.success("Creation deleted successfully!");
            fetchUserPosts();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete creation");
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {posts.map((post) => (
                <motion.div
                    key={post._id}
                    className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm shadow-slate-200/50 hover:border-indigo-200 transition-all duration-300"
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                >
                    <div className="aspect-[4/5] relative overflow-hidden bg-slate-100">
                        <img
                            src={`${API_CONFIG.BASE_URL}/${post.image}`}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <h3 className="text-white font-bold text-base line-clamp-1">{post.title}</h3>
                            <p className="text-slate-200 text-xs line-clamp-1">{post.description}</p>
                        </div>
                    </div>
                    <div className="p-4 flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-800 font-bold text-sm truncate mr-2">{post.title}</span>
                            <div className="flex items-center space-x-1 text-fuchsia-600 font-bold text-xs">
                                <HeartIcon className="w-3 h-3 stroke-2" />
                                <span>{post.likesCount || 0}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleDeletePost(post._id)}
                            className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors"
                        >
                            Delete Creation
                        </button>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[#fafbfc] text-slate-900 pb-20 pt-10">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
                    
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Account Settings</h1>
                        <p className="text-slate-500 font-medium text-sm">Manage your personal profile, security, and creations.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Left Column: Personal Details */}
                        <div className="lg:col-span-5 flex flex-col space-y-6">
                            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm shadow-slate-200/50">
                                <h2 className="text-xl font-bold text-slate-900 mb-1">Personal Details</h2>
                                <p className="text-slate-500 text-sm mb-8">Update your personal information and profile picture</p>

                                {/* Profile Snapshot */}
                                <div className="bg-[#f8f9fc] rounded-2xl p-6 flex flex-col items-start mb-8 border border-slate-100">
                                    <div className="w-20 h-20 rounded-full overflow-hidden mb-4 bg-indigo-100 flex items-center justify-center border-4 border-white shadow-sm">
                                        {user?.profilePicture ? (
                                            <img 
                                                src={user.profilePicture.startsWith('http') ? user.profilePicture : `${API_CONFIG.BASE_URL}/${user.profilePicture}`} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            <UserIcon className="w-8 h-8 text-indigo-300" />
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">{user?.username}</h3>
                                    <p className="text-slate-500 text-sm mb-3">{user?.email}</p>
                                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold tracking-wider uppercase rounded-md">Verified</span>
                                </div>

                                {/* Edit Form */}
                                <form onSubmit={handleUpdateProfile} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">Full Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={editData.username}
                                            onChange={(e) => setEditData({...editData, username: e.target.value})}
                                            className="w-full px-4 py-3 bg-[#fafbfc] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ff00a0]/20 focus:border-[#ff00a0] transition-colors text-sm font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">Age</label>
                                        <input 
                                            type="number" 
                                            required
                                            value={editData.age}
                                            onChange={(e) => setEditData({...editData, age: e.target.value})}
                                            className="w-full px-4 py-3 bg-[#fafbfc] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ff00a0]/20 focus:border-[#ff00a0] transition-colors text-sm font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">Email Address</label>
                                        <input 
                                            type="email" 
                                            disabled
                                            value={user?.email || ''}
                                            className="w-full px-4 py-3 bg-[#f1f3f5] border border-slate-200 rounded-xl text-slate-500 text-sm font-medium cursor-not-allowed"
                                        />
                                        <p className="text-[10px] font-semibold text-slate-400 mt-1.5 ml-1">Email cannot be changed</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">New Password (Optional)</label>
                                        <input 
                                            type="password" 
                                            placeholder="Leave blank to keep current"
                                            value={editData.password}
                                            onChange={(e) => setEditData({...editData, password: e.target.value})}
                                            className="w-full px-4 py-3 bg-[#fafbfc] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ff00a0]/20 focus:border-[#ff00a0] transition-colors text-sm font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-800 mb-1.5 ml-1">Profile Picture (Optional)</label>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => setEditData({...editData, profilePicture: e.target.files[0]})}
                                            className="w-full px-4 py-3 bg-[#fafbfc] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ff00a0]/20 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#ff00a0]/10 file:text-[#ff00a0] hover:file:bg-[#ff00a0]/20 text-sm font-medium"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={loadingEdit}
                                            className="w-full bg-[#ff00a0] hover:bg-[#e60090] text-white py-3.5 rounded-xl font-bold shadow-md shadow-[#ff00a0]/20 transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                                        >
                                            {loadingEdit ? "Updating..." : "Update Profile"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Right Column: Creations */}
                        <div className="lg:col-span-7 flex flex-col">
                            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm shadow-slate-200/50 min-h-[600px] flex flex-col">
                                
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-1">Creations</h2>
                                        <p className="text-slate-500 text-sm">View and manage the creations linked to your account</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddPost(true)}
                                        className="bg-[#ff00a0] hover:bg-[#e60090] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-[#ff00a0]/20 transition-colors flex items-center justify-center shrink-0"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-1.5 stroke-2" />
                                        Creation
                                    </button>
                                </div>

                                <div className="flex-1 bg-[#fafbfc] rounded-2xl border border-slate-100 border-dashed p-6">
                                    {userPosts.length > 0 ? (
                                        <PostGrid posts={userPosts} />
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                                            <div className="w-16 h-16 bg-[#ff00a0]/10 rounded-2xl flex items-center justify-center mb-6">
                                                <PhotoIcon className="w-8 h-8 text-[#ff00a0]" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">No creations yet</h3>
                                            <p className="text-slate-500 text-sm max-w-sm mb-6">
                                                You haven't added any creations to your account.
                                                Create your first creation to start generating appreciation.
                                            </p>
                                            <button
                                                onClick={() => setShowAddPost(true)}
                                                className="bg-[#ff00a0] hover:bg-[#e60090] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-[#ff00a0]/20 transition-colors"
                                            >
                                                Add Creation
                                            </button>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

                {/* Add Post Modal Overlay */}
                {showAddPost && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-fade-up">
                            <div className="sticky top-0 bg-white/80 backdrop-blur px-6 py-5 border-b border-slate-100 flex justify-between items-center z-10">
                                <h2 className="text-xl font-bold text-slate-900">Curate New Piece</h2>
                                <button
                                    onClick={() => setShowAddPost(false)}
                                    className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:text-slate-800 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6 sm:p-8">
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
