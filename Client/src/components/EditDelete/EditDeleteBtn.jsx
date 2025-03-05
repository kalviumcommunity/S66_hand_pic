import { useNavigate } from 'react-router-dom';

const EditDeleteBtn = ({ postId, refreshPosts }) => {
    const navigate = useNavigate();

    const handleEdit = () => {
        navigate(`/edit/${postId}`);
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this post?");
        if (confirmDelete) {
            try {
                await fetch(`http://localhost:8888/posts/${postId}`, { method: 'DELETE' });
                refreshPosts();
            } catch (err) {
                console.error("Error deleting post:", err);
            }
        }
    };

    return (
        <div className="absolute bottom-4 right-4 flex gap-2">
            <button
                onClick={handleEdit}
                className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded hover:bg-blue-600 transition"
            >
                Edit
            </button>
            <button
                onClick={handleDelete}
                className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 transition"
            >
                Delete
            </button>
        </div>
    );
};

export default EditDeleteBtn;
