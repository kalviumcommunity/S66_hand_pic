import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { PhotoIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function AddPost({ onSuccess }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.image) {
            toast.error('All fields are required!');
            return;
        }

        if (!user) {
            toast.error('You must be logged in to create a post');
            return;
        }

        setUploading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('username', user.username);
        data.append('image', formData.image);

        try {
            const response = await api.post('/create/post', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success(response.data.message);
            setFormData({
                title: '',
                description: '',
                image: null
            });
            setImagePreview(null);

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create post');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Title Input */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide">
                    Title
                </label>
                <input
                    type="text"
                    name="title"
                    placeholder="Snapshot Heading..."
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                />
            </div>

            {/* Description Input */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide">
                    Narrative Description
                </label>
                <textarea
                    name="description"
                    placeholder="Compose a short context about this capture..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium resize-none"
                />
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide">
                    Visual Asset
                </label>
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                        className="hidden"
                        id="image-upload"
                    />
                    <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl cursor-pointer transition-all duration-200 bg-slate-50 hover:bg-indigo-50/30 group relative overflow-hidden"
                    >
                        {imagePreview ? (
                            <div className="relative w-full h-full">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-indigo-900/60 backdrop-blur-[1px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                                    <CloudArrowUpIcon className="w-8 h-8 text-white mb-1" />
                                    <p className="text-white text-xs font-bold">Replace Resource</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-4 text-slate-400 group-hover:text-indigo-500 transition-colors">
                                    <PhotoIcon className="w-7 h-7" />
                                </div>
                                <p className="mb-1 text-sm font-bold text-slate-700">
                                    Click to browse artifact
                                </p>
                                <p className="text-xs text-slate-500">Select image up to 10MB</p>
                            </div>
                        )}
                    </label>
                </div>
            </div>

            {/* Submit Button */}
            <motion.button
                type="submit"
                disabled={uploading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white py-4 px-6 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 mt-2"
                whileHover={{ scale: uploading ? 1 : 1.01 }}
                whileTap={{ scale: uploading ? 1 : 0.99 }}
            >
                {uploading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Synthesizing...</span>
                    </>
                ) : (
                    <>
                        <CloudArrowUpIcon className="w-5 h-5" />
                        <span>Execute Upload</span>
                    </>
                )}
            </motion.button>
        </motion.form>
    );
}

export default AddPost;
