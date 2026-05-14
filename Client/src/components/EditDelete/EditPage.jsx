import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import Navbar from '../Navbar';
import toast from 'react-hot-toast';
import { PhotoIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const EditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState({
        title: '',
        description: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchPostData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/posts/${id}`);
                setPost({
                    title: response.data.title || '',
                    description: response.data.description || '',
                });
            } catch (err) {
                console.error("Error fetching post data:", err);
                toast.error("Failed to fetch post details");
                navigate('/posts');
            } finally {
                setLoading(false);
            }
        };
        fetchPostData();
    }, [id, navigate]);

    const handleChange = (e) => {
        setPost({ ...post, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!post.title.trim() || !post.description.trim()) {
            toast.error('All fields are required!');
            return;
        }

        try {
            setSaving(true);
            await api.put(`/posts/${id}`, {
                title: post.title,
                description: post.description
            });
            toast.success("Post updated successfully!");
            navigate("/posts");
        } catch (err) {
            console.error("Error updating post:", err);
            toast.error(err.response?.data?.message || "Failed to update post");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-[calc(100vh-64px)] bg-[#f8fafc] bg-dots text-slate-900 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
                <motion.div 
                    className="w-full max-w-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors group font-semibold"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Gallery
                    </button>

                    <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50">
                        <div className="p-6 sm:p-10 border-b border-slate-100 flex items-center space-x-4 bg-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                            
                            <div className="bg-indigo-50 p-3 rounded-2xl relative z-10">
                                <PhotoIcon className="w-8 h-8 text-indigo-600" />
                            </div>
                            <div className="relative z-10">
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Amend Artifact</h1>
                                <p className="text-slate-500 text-sm font-medium mt-1">Refine documentation details for live community stream</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 border-b-indigo-600"></div>
                                <p className="text-slate-400 mt-4 text-sm font-medium">Retrieving record...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 tracking-wide">
                                        Update Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={post.title}
                                        onChange={handleChange}
                                        placeholder="Provide revised title context..."
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700 tracking-wide">
                                        Narrative Context
                                    </label>
                                    <textarea
                                        name="description"
                                        value={post.description}
                                        onChange={handleChange}
                                        rows={6}
                                        placeholder="Refactor descriptive elements..."
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none font-medium"
                                        required
                                    />
                                </div>

                                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-[2] flex justify-center items-center py-4 px-6 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.99] disabled:bg-slate-300"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                Processing Commits...
                                            </>
                                        ) : "Commit Amendments"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/posts')}
                                        className="flex-1 flex justify-center items-center py-4 px-6 border border-slate-200 rounded-2xl font-bold text-slate-600 bg-white hover:bg-slate-50 transition-all active:scale-[0.99] shadow-sm"
                                    >
                                        Discard
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default EditPage;
