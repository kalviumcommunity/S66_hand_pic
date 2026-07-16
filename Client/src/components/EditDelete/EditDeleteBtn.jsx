import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const EditDeleteBtn = ({ postId, onDeleteSuccess }) => {
    const navigate = useNavigate();

    const handleEdit = (e) => {
        e.stopPropagation(); // Stop event propagation in case parent has click handlers
        navigate(`/edit/${postId}`);
    };

    const handleDelete = async (e) => {
        e.stopPropagation();

        // LOW-08: replaced window.confirm with toast-based accessible confirmation
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
            const response = await api.delete(`/posts/${postId}`);
            toast.success(response.data.message || "Post deleted");
            if (onDeleteSuccess) {
                onDeleteSuccess(postId);
            }
        } catch (err) {
            console.error("Error deleting post:", err);
            toast.error(err.response?.data?.error || "Failed to delete post");
        }
    };

    return (
        <div className="flex gap-1.5 z-10">
            <button
                onClick={handleEdit}
                className="p-1.5 bg-white/90 border border-slate-200 text-slate-700 rounded-md hover:bg-slate-50 hover:text-slate-950 transition-colors backdrop-blur-sm shadow-sm cursor-pointer"
                title="Edit Post"
            >
                <PencilSquareIcon className="w-4 h-4" />
            </button>
            <button
                onClick={handleDelete}
                className="p-1.5 bg-white/90 border border-red-100 text-red-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors backdrop-blur-sm shadow-sm cursor-pointer"
                title="Delete Post"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

export default EditDeleteBtn;
