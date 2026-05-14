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
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                const response = await api.delete(`/posts/${postId}`);
                toast.success(response.data.message || "Post deleted");
                if (onDeleteSuccess) {
                    onDeleteSuccess(postId);
                }
            } catch (err) {
                console.error("Error deleting post:", err);
                toast.error(err.response?.data?.message || "Failed to delete post");
            }
        }
    };

    return (
        <div className="flex gap-2 z-10">
            <button
                onClick={handleEdit}
                className="p-2 bg-indigo-600/90 text-white rounded-full hover:bg-indigo-700 transition-colors backdrop-blur-sm shadow-sm"
                title="Edit Post"
            >
                <PencilSquareIcon className="w-4.5 h-4.5" />
            </button>
            <button
                onClick={handleDelete}
                className="p-2 bg-red-600/90 text-white rounded-full hover:bg-red-700 transition-colors backdrop-blur-sm shadow-sm"
                title="Delete Post"
            >
                <TrashIcon className="w-4.5 h-4.5" />
            </button>
        </div>
    );
};

export default EditDeleteBtn;
