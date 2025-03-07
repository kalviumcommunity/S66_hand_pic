import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState({
        title: '',
        description: '',
        username: ''
    });

    useEffect(() => {
        fetch(`http://localhost:8888/posts/${id}`)
            .then(res => res.json())
            .then(data => setPost(data))
            .catch(err => console.error("Error fetching post data:", err));
    }, [id]);

    const handleChange = (e) => {
        setPost({ ...post, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!post.title || !post.description || !post.username) {
            alert('All fields are required!');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8888/posts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(post)
            });

            if (response.ok) {
                alert("Post updated successfully!");
                navigate("/");
            } else {
                alert("Failed to update post");
            }
        } catch (err) {
            console.error("Error updating post:", err);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-4 text-center">Edit Post</h2>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={post.title}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={post.description}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                        type="text"
                        name="username"
                        value={post.username}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                >
                    Update Post
                </button>
            </form>
        </div>
    );
};

export default EditPage;
