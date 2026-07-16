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
            className="space-y-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            {/* Title Input */}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Title
                </label>
                <input
                    type="text"
                    name="title"
                    placeholder="Provide a name for this snapshot"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 transition-all font-medium"
                />
            </div>

            {/* Description Input */}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Description
                </label>
                <textarea
                    name="description"
                    placeholder="Describe the context of this capture..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950 focus:border-slate-950 transition-all font-medium resize-none"
                />
            </div>

            {/* Image Upload */}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
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
                        className="flex flex-col items-center justify-center w-full h-48 border border-dashed border-slate-200 hover:border-slate-350 rounded-md cursor-pointer transition-all duration-200 bg-slate-50/50 hover:bg-slate-50 group relative overflow-hidden"
                    >
                        {imagePreview ? (
                            <div className="relative w-full h-full">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                                    <CloudArrowUpIcon className="w-6 h-6 text-white mb-1" />
                                    <p className="text-white text-xs font-semibold">Replace Resource</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-5 px-4 text-center">
                                <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center shadow-sm border border-slate-100 mb-3 text-slate-400 group-hover:text-slate-900 transition-colors">
                                    <PhotoIcon className="w-5 h-5" />
                                </div>
                                <p className="mb-0.5 text-xs font-semibold text-slate-800">
                                    Click to upload artifact
                                </p>
                                <p className="text-[11px] text-slate-400">Supported formats: JPEG, PNG, WebP, GIF, AVIF (Max 5MB)</p>
                            </div>
                        )}
                    </label>
                </div>
            </div>

            {/* Submit Button */}
            <motion.button
                type="submit"
                disabled={uploading}
                className="w-full bg-slate-950 hover:bg-slate-900 disabled:bg-slate-200 text-white py-2 px-4 rounded-md font-semibold shadow-sm transition-all flex items-center justify-center space-x-2 mt-2 text-sm cursor-pointer disabled:cursor-not-allowed"
                whileHover={{ scale: uploading ? 1 : 1.005 }}
                whileTap={{ scale: uploading ? 1 : 0.995 }}
            >
                {uploading ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Uploading...</span>
                    </>
                ) : (
                    <>
                        <CloudArrowUpIcon className="w-4 h-4" />
                        <span>Upload Creation</span>
                    </>
                )}
            </motion.button>
        </motion.form>
    );
}

export default AddPost;
