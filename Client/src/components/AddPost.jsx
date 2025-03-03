import { useState } from 'react';
import axios from 'axios';

function AddPost() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        username: '',
        image: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('username', formData.username);
        data.append('image', formData.image);

        try {
            const response = await axios.post('http://localhost:8888/create/post', data);
            alert(response.data.message);
            setFormData({
                title: '',
                description: '',
                username: '',
                image: null
            });
        } catch (error) {
            alert('Failed to create post');
            console.log(error);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-4 w-full max-w-md">
                <h2 className="text-xl font-bold text-center">Create New Post</h2>

                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                />

                <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                ></textarea>

                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                />

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="w-full p-2 border rounded"
                />

                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                    Submit Post
                </button>
            </form>
        </div>
    );
}

export default AddPost;
