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
            <div className="min-h-[calc(100vh-56px)] bg-white bg-dots text-slate-950 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
                <motion.div 
                    className="w-full max-w-xl"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center text-slate-500 hover:text-slate-950 mb-5 transition-colors group font-semibold text-sm cursor-pointer"
                    >
                        <ArrowLeftIcon className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
                        Back to Gallery
                    </button>

                    <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
                        <div className="p-5 border-b border-slate-100 flex items-center space-x-3.5 bg-white relative overflow-hidden">
                            <div className="bg-slate-50 border border-slate-200 p-2 rounded-md">
                                <PhotoIcon className="w-5 h-5 text-slate-900" />
                            </div>
                            <div>
                                <h1 className="text-lg font-extrabold text-slate-955 tracking-tight">Amend Artifact</h1>
                                <p className="text-slate-400 text-[11px] font-semibold mt-0.5">Refine documentation details for live community stream</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col justify-center items-center h-48">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-b-slate-950"></div>
                                <p className="text-slate-400 mt-3 text-xs font-semibold">Retrieving record...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Update Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={post.title}
                                        onChange={handleChange}
                                        placeholder="Provide revised title context..."
                                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 transition-all font-medium"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Narrative Context
                                    </label>
                                    <textarea
                                        name="description"
                                        value={post.description}
                                        onChange={handleChange}
                                        rows={5}
                                        placeholder="Refactor descriptive elements..."
                                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 transition-all resize-none font-medium"
                                        required
                                    />
                                </div>

                                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-[2] flex justify-center items-center py-2 px-4 rounded-md font-semibold text-sm text-white bg-slate-950 hover:bg-slate-900 shadow-sm transition-all active:scale-[0.99] disabled:bg-slate-200 cursor-pointer"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                Processing...
                                            </>
                                        ) : "Commit Amendments"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/posts')}
                                        className="flex-1 flex justify-center items-center py-2 px-4 border border-slate-200 rounded-md font-semibold text-sm text-slate-700 bg-white hover:bg-slate-50 transition-all active:scale-[0.99] shadow-sm cursor-pointer"
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
