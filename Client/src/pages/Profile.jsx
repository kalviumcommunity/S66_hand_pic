import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
    const { user, checkAuthStatus, logout } = useAuth();
    const { userId } = useParams();
    const location = useLocation();
    
    const [profileUser, setProfileUser] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [userPosts, setUserPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [showAddPost, setShowAddPost] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(location.state?.showEditModal || false);
    const [editData, setEditData] = useState({
        username: '',
        age: '',
        currentPassword: '',
        password: '',
        profilePicture: ''
    });
    const [loadingEdit, setLoadingEdit] = useState(false);
    
    const [stats, setStats] = useState({
        totalPosts: 0,
        totalLikes: 0,
        totalViews: 0
    });

    const isOwnProfile = !userId || userId === user?.id;

    useEffect(() => {
        const loadProfileData = async () => {
            if (isOwnProfile) {
                if (user) {
                    setProfileUser(user);
                    setEditData({
                        username: user.username?.startsWith('user') ? '' : user.username,
                        age: user.age || '',
                        currentPassword: '',
                        password: '',
                        profilePicture: user.profilePicture || ''
                    });
                    setLoadingProfile(false);
                    fetchUserPosts(user.id);
                    fetchLikedPosts();
                }
            } else {
                try {
                    setLoadingProfile(true);
                    const response = await api.get(`/users/${userId}`);
                    setProfileUser(response.data);
                    fetchUserPosts(userId);
                } catch (err) {
                    console.error("Error loading public profile:", err);
                    toast.error("Failed to load user profile");
                } finally {
                    setLoadingProfile(false);
                }
            }
        };
        loadProfileData();
    }, [user, userId, isOwnProfile]);

    const fetchUserPosts = async (targetId) => {
        try {
            const response = await api.get(`/posts?userId=${targetId}&limit=50`);
            const data = response.data;
            const userPosts = Array.isArray(data) ? data : (data.posts || []);
            setUserPosts(userPosts);

            const totalLikes = userPosts.reduce((sum, post) => sum + (post.likesCount || 0), 0);
            const totalViews = userPosts.reduce((sum, post) => sum + (post.viewsCount || 0), 0);
            setStats({
                totalPosts: userPosts.length,
                totalLikes,
                totalViews
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
                if (!editData.currentPassword) {
                    toast.error('Enter your current password to set a new one.');
                    setLoadingEdit(false);
                    return;
                }
                if (editData.password.length < 8) {
                    toast.error('New password must be at least 8 characters.');
                    setLoadingEdit(false);
                    return;
                }
                formData.append('currentPassword', editData.currentPassword);
                formData.append('password', editData.password);
            }
            
            if (editData.profilePicture && typeof editData.profilePicture !== 'string') {
                formData.append('profilePicture', editData.profilePicture);
            }

            await api.put(`/users/${user.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Profile updated successfully!");
            checkAuthStatus();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to update profile");
        } finally {
            setLoadingEdit(false);
        }
    };

    const handleShareProfile = () => {
        const profileLink = `${window.location.origin}/profile/${profileUser._id || profileUser.id}`;
        navigator.clipboard.writeText(profileLink);
        toast.success("Profile link copied to clipboard!");
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = await new Promise((resolve) => {
            toast((t) => (
                <div className="flex flex-col space-y-2">
                    <p className="text-xs font-semibold text-slate-900">Are you absolutely sure you want to delete your account?</p>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                resolve(false);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                resolve(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-red-650 hover:bg-red-700 text-white rounded cursor-pointer"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ), { duration: 8000 });
        });

        if (!confirmDelete) return;

        try {
            await api.delete(`/users/${user.id}`);
            toast.success("Account deleted successfully.");
            await logout();
        } catch (err) {
            console.error("Error deleting account:", err);
            toast.error(err.response?.data?.error || "Failed to delete account");
        }
    };

    const handlePostUploadSuccess = () => {
        setShowAddPost(false);
        if (profileUser) {
            fetchUserPosts(profileUser._id || profileUser.id);
        }
    };

    const handleDeletePost = async (postId) => {
        // LOW-08: replace window.confirm with toast-based confirmation
        const confirmDelete = await new Promise((resolve) => {
            toast((t) => (
                <div className="flex flex-col space-y-2">
                    <span className="font-semibold text-sm text-slate-950">Delete this post?</span>
                    <p className="text-xs text-slate-500">This action cannot be undone.</p>
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={() => { toast.dismiss(t.id); resolve(true); }}
                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-md hover:bg-red-700"
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => { toast.dismiss(t.id); resolve(false); }}
                            className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ), { duration: 10000 });
        });
        if (!confirmDelete) return;
        try {
            await api.delete(`/posts/${postId}`);
            toast.success("Post deleted successfully!");
            fetchUserPosts();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to delete post");
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
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {posts.map((post) => (
                <motion.div
                    key={post._id}
                    className="group relative bg-white rounded-md overflow-hidden border border-slate-200 shadow-sm transition-all duration-200 hover:border-slate-350"
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                >
                    <div className="aspect-[4/5] relative overflow-hidden bg-slate-50">
                        <img
                            src={`${API_CONFIG.BASE_URL}/${post.image}`}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                            <h3 className="text-white font-bold text-sm line-clamp-1">{post.title}</h3>
                            <p className="text-slate-200 text-[10px] line-clamp-1">{post.description}</p>
                        </div>
                    </div>
                    <div className="p-3 flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-950 font-bold text-xs truncate mr-2">{post.title}</span>
                            <div className="flex items-center space-x-0.5 text-slate-500 font-bold text-[11px]">
                                <HeartIcon className="w-3 h-3" />
                                <span>{post.likesCount || 0}</span>
                            </div>
                        </div>
                        {isOwnProfile && (
                            <button 
                                onClick={() => handleDeletePost(post._id)}
                                className="w-full py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-[11px] font-semibold border border-red-100 transition-colors cursor-pointer"
                            >
                                Delete Creation
                            </button>
                        )}
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );

    if (loadingProfile || !profileUser) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-white flex flex-col justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-b-slate-950"></div>
                    <p className="text-slate-400 mt-3 text-xs font-semibold">Retrieving profile...</p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-white text-slate-950 pb-20 pt-8">
                <div className="max-w-[1200px] mx-auto px-6">
                    
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-extrabold text-slate-955 mb-1">
                            {isOwnProfile ? "Account Settings" : "Creator Gallery Profile"}
                        </h1>
                        <p className="text-slate-500 text-xs font-semibold">
                            {isOwnProfile 
                                ? "Manage your personal profile, security parameters, and creations." 
                                : `Browse curations and photography assets shared by @${profileUser.username}.`}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Left Column */}
                        <div className="lg:col-span-5 flex flex-col space-y-4">
                            <div className="bg-white rounded-md p-6 border border-slate-200 shadow-sm">
                                <h2 className="text-base font-bold text-slate-955 mb-0.5">
                                    {isOwnProfile ? "Personal Details" : "Creator Biography"}
                                </h2>
                                <p className="text-slate-500 text-[11px] mb-6">
                                    {isOwnProfile 
                                        ? "Update your personal information and profile picture" 
                                        : "Platform verification credentials and metadata"}
                                </p>

                                {/* Profile Snapshot */}
                                <div className="bg-slate-50/50 rounded-md p-4 flex flex-col items-start mb-6 border border-slate-200">
                                    <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-slate-200 flex items-center justify-center border border-slate-300 shadow-sm">
                                        {profileUser.profilePicture ? (
                                            <img 
                                                src={profileUser.profilePicture.startsWith('http') ? profileUser.profilePicture : `${API_CONFIG.BASE_URL}/${profileUser.profilePicture}`} 
                                                alt="Profile" 
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            <UserIcon className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-955">@{profileUser.username}</h3>
                                    {isOwnProfile && <p className="text-slate-500 text-xs mb-3">{profileUser.email}</p>}
                                    
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-250 text-slate-800 text-[9px] font-bold uppercase tracking-wider rounded-md">Verified User</span>
                                        <span className="inline-block px-2 py-0.5 bg-slate-150 border border-slate-250 text-slate-700 text-[9px] font-bold uppercase tracking-wider rounded-md">Age: {profileUser.age}</span>
                                    </div>

                                    <button
                                        onClick={handleShareProfile}
                                        className="mt-4 flex items-center space-x-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-all cursor-pointer"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 10.742l4.636-2.318m0 0a3 3 0 100-4.184m-4.636 4.184a3 3 0 11-4.636-2.263m4.636 2.263a3 3 0 100 4.184m0 0l-4.636 2.318m0 0a3 3 0 11-4.636-2.263m4.636 2.263a3 3 0 100 4.184" />
                                        </svg>
                                        <span>Share Profile</span>
                                    </button>
                                </div>

                                {/* Public Profile Stats Grid for visitors */}
                                {!isOwnProfile && (
                                    <div className="grid grid-cols-3 gap-2 text-center pt-2">
                                        <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100">
                                            <div className="text-base font-extrabold text-slate-950">{stats.totalPosts}</div>
                                            <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Creations</div>
                                        </div>
                                        <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100">
                                            <div className="text-base font-extrabold text-slate-950">{stats.totalLikes}</div>
                                            <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Likes</div>
                                        </div>
                                        <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100">
                                            <div className="text-base font-extrabold text-slate-950">{stats.totalViews}</div>
                                            <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Views</div>
                                        </div>
                                    </div>
                                )}

                                {/* Edit Form (Only visible to account owner) */}
                                {isOwnProfile && (
                                    <form onSubmit={handleUpdateProfile} className="space-y-4 pt-4 border-t border-slate-100">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Full Name</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={editData.username}
                                                onChange={(e) => setEditData({...editData, username: e.target.value})}
                                                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md text-slate-955 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 transition-all font-medium"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Age</label>
                                            <input 
                                                type="number" 
                                                required
                                                value={editData.age}
                                                onChange={(e) => setEditData({...editData, age: e.target.value})}
                                                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md text-slate-955 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 transition-all font-medium"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Email Address</label>
                                            <input 
                                                type="email" 
                                                disabled
                                                value={profileUser.email || ''}
                                                className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-md text-slate-400 font-medium cursor-not-allowed"
                                            />
                                            <p className="text-[10px] text-slate-400 font-medium">Email address cannot be changed</p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Current Password</label>
                                            <input 
                                                type="password" 
                                                placeholder="Required to change password"
                                                value={editData.currentPassword}
                                                onChange={(e) => setEditData({...editData, currentPassword: e.target.value})}
                                                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md text-slate-955 focus:outline-none focus:ring-1 focus:ring-slate-955 focus:border-slate-955 transition-all font-medium"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">New Password (Optional)</label>
                                            <input 
                                                type="password" 
                                                placeholder="Leave blank to keep current"
                                                value={editData.password}
                                                onChange={(e) => setEditData({...editData, password: e.target.value})}
                                                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md text-slate-955 focus:outline-none focus:ring-1 focus:ring-slate-955 focus:border-slate-955 transition-all font-medium"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Profile Picture (Optional)</label>
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => setEditData({...editData, profilePicture: e.target.files[0]})}
                                                className="w-full px-2 py-1 text-sm bg-white border border-slate-200 rounded-md text-slate-955 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 transition-all font-medium file:mr-3 file:py-1 file:px-2 file:rounded-md file:border file:border-slate-200 file:text-[11px] file:font-semibold file:bg-slate-50 file:text-slate-850 hover:file:bg-slate-100"
                                            />
                                        </div>

                                        <div className="pt-1.5">
                                            <button
                                                type="submit"
                                                disabled={loadingEdit}
                                                className="w-full bg-slate-950 hover:bg-slate-900 text-white py-2 rounded-md font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
                                            >
                                                {loadingEdit ? "Updating..." : "Update Profile"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {isOwnProfile && (
                                <div className="bg-red-50/30 rounded-md p-6 border border-red-200 shadow-sm">
                                    <h2 className="text-sm font-bold text-red-650 mb-0.5">Danger Zone</h2>
                                    <p className="text-slate-500 text-[10px] mb-4">Once you delete your account, there is no going back. All your uploads will be permanently removed.</p>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-semibold transition-all text-xs cursor-pointer text-center"
                                    >
                                        Delete Account
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Creations */}
                        <div className="lg:col-span-7 flex flex-col">
                            <div className="bg-white rounded-md p-6 border border-slate-200 shadow-sm min-h-[500px] flex flex-col">
                                
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b border-slate-100 pb-4">
                                    <div>
                                        <h2 className="text-base font-bold text-slate-955">Creations</h2>
                                        <p className="text-slate-500 text-[11px]">
                                            {isOwnProfile 
                                                ? "View and manage the creations linked to your account" 
                                                : `View the photography assets shared by @${profileUser.username}`}
                                        </p>
                                    </div>
                                    {isOwnProfile && (
                                        <button
                                            onClick={() => setShowAddPost(true)}
                                            className="bg-slate-950 hover:bg-slate-900 text-white px-3.5 py-1.5 rounded-md font-semibold text-xs transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                                        >
                                            <PlusIcon className="w-3.5 h-3.5 mr-1.5" />
                                            Creation
                                        </button>
                                    )}
                                </div>

                                <div className="flex-grow bg-slate-50/50 rounded-md border border-slate-200 border-dashed p-4">
                                    {userPosts.length > 0 ? (
                                        <PostGrid posts={userPosts} />
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                                            <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center mb-4 border border-slate-200 text-slate-400">
                                                <PhotoIcon className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-900 mb-1.5">No creations yet</h3>
                                            <p className="text-slate-400 text-xs max-w-xs mb-4">
                                                {isOwnProfile 
                                                    ? "You haven't added any creations to your account. Publish your first creation to start gathering community score." 
                                                    : `@${profileUser.username} hasn't published any creations yet.`}
                                            </p>
                                            {isOwnProfile && (
                                                <button
                                                    onClick={() => setShowAddPost(true)}
                                                    className="bg-slate-950 hover:bg-slate-900 text-white px-4 py-2 rounded-md font-semibold text-xs transition-colors cursor-pointer"
                                                >
                                                    Add Creation
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

                {/* Add Post Modal Overlay */}
                {showAddPost && (
                    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-md max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 animate-fade-up">
                            <div className="sticky top-0 bg-white/95 backdrop-blur px-5 py-4 border-b border-slate-100 flex justify-between items-center z-10">
                                <h2 className="text-base font-bold text-slate-900">Curate New Piece</h2>
                                <button
                                    onClick={() => setShowAddPost(false)}
                                    className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-md flex items-center justify-center hover:text-slate-800 transition-colors cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-5">
                                <AddPost onSuccess={handlePostUploadSuccess} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default Profile;
