import  { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [likedPosts, setLikedPosts] = useState({});

    useEffect(() => {
    fetch("http://localhost:8888/posts")
        .then((res) => res.json())
        .then((data) => setPosts(data))
        .catch((err) => console.error("Error fetching posts:", err));
    }, []);

    const handleLike = (postId) => {
    setLikedPosts(prev => ({
        ...prev,
        [postId]: !prev[postId]
    }));
    };

    return (
    <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
            <div 
            key={post._id} 
            className="group relative bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-102"
            >
            <div className="aspect-w-4 aspect-h-3 relative overflow-hidden">
                <img
                src={`http://localhost:8888/${post.image}`}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <button
                onClick={() => handleLike(post._id)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-colors duration-200 hover:bg-white"
                >
                <Heart
                    className={`w-6 h-6 transition-colors duration-200 ${
                    likedPosts[post._id] 
                        ? 'fill-red-500 stroke-red-500' 
                        : 'stroke-gray-600'
                    }`}
                />
                </button>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                {post.description}
                </p>
                <p className="text-gray-500 text-sm">
                By: <span className="font-medium">{post.username}</span>
                </p>
            </div>
            </div>
        ))}
        </div>
    </div>
    );
};

export default PostList;