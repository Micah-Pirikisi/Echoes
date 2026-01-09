import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "../components/Spinner";
import { api } from "../api/client";
import { PostCard } from "../components/PostCard";

export default function EchoTree() {
  const { id } = useParams();
  const nav = useNavigate();
  const [originalPost, setOriginalPost] = useState(null);
  const [echoes, setEchoes] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const meRes = await api.get("/auth/me");
        setMe(meRes.data?.id);

        // Fetch the post
        const postRes = await api.get(`/posts/${id}`);
        let rootPost = postRes.data.post;

        // If this post is an echo, find the original
        while (rootPost.echoParent) {
          const parentRes = await api.get(`/posts/${rootPost.echoParentId}`);
          rootPost = parentRes.data.post;
        }

        setOriginalPost(rootPost);

        // Fetch all echoes of the original post
        const echoesRes = await api.get(`/posts/${rootPost.id}/echoes`);
        setEchoes(echoesRes.data.echoes || []);
      } catch (err) {
        console.error("Error loading echo tree:", err);
        if (err.response?.status === 404) nav("/feed");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, nav]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!originalPost) {
    return <div className="max-w-2xl mx-auto p-6">Post not found</div>;
  }

  const handleLikeToggle = async (post, liked) => {
    if (liked) {
      await api.delete(`/posts/${post.id}/like`);
    } else {
      await api.post(`/posts/${post.id}/like`);
    }
    // Reload the echo tree
    const echoesRes = await api.get(`/posts/${originalPost.id}/echoes`);
    setEchoes(echoesRes.data.echoes || []);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={() => nav(-1)}
        className="text-accent hover:underline mb-4"
      >
        ← Back
      </button>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Echo Tree</h2>
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h3 className="text-sm text-gray-500 mb-3 uppercase">
            Original Post
          </h3>
          <PostCard
            post={originalPost}
            me={me}
            onLikeToggle={(post, liked) => handleLikeToggle(post, liked)}
            onEcho={() => {}}
            onComment={() => {}}
            setSelectedImage={() => {}}
          />
        </div>

        {echoes.length > 0 ? (
          <div>
            <h3 className="text-sm text-gray-500 mb-3 uppercase">
              Echoes ({echoes.length})
            </h3>
            <div className="space-y-4">
              {echoes.map((echo) => (
                <div key={echo.id} className="pl-4 border-l-2 border-accent">
                  <PostCard
                    post={echo}
                    me={me}
                    onLikeToggle={(post, liked) =>
                      handleLikeToggle(post, liked)
                    }
                    onEcho={() => {}}
                    onComment={() => {}}
                    setSelectedImage={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No echoes yet. Be the first to echo this post!
          </div>
        )}
      </div>
    </div>
  );
}
