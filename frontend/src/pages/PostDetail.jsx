import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { PostCard } from "../components/PostCard";

export default function PostDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [post, setPost] = useState(null);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/posts/${id}`);
        setPost(data.post);
        setMe(data.me);
      } catch (err) {
        console.error("Error loading post:", err);
        if (err.response?.status === 401) nav("/login");
        if (err.response?.status === 404) nav("/feed");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, nav]);

  const handleLikeToggle = async (liked) => {
    if (liked) {
      await api.delete(`/posts/${id}/like`);
    } else {
      await api.post(`/posts/${id}/like`);
    }
    // Reload post
    const { data } = await api.get(`/posts/${id}`);
    setPost(data.post);
  };

  const handleEcho = async (content, file) => {
    // Implementation similar to Feed
    await api.post(`/posts/${id}/echo`, { content });
    const { data } = await api.get(`/posts/${id}`);
    setPost(data.post);
  };

  const handleComment = async (content, file) => {
    // Implementation similar to Feed
    await api.post(`/posts/${id}/comments`, { content });
    const { data } = await api.get(`/posts/${id}`);
    setPost(data.post);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!post) return <div className="p-6">Post not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={() => nav(-1)}
        className="text-accent hover:underline mb-4"
      >
        ← Back
      </button>
      <PostCard
        post={post}
        me={me}
        onLikeToggle={handleLikeToggle}
        onEcho={handleEcho}
        onComment={handleComment}
        setSelectedImage={() => {}}
      />
    </div>
  );
}
