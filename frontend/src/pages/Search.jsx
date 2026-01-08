import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { PostCard } from "../components/PostCard";

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get("q") || "";

  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    if (!q || q.length < 2) {
      setPosts([]);
      setUsers([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const [postsRes, usersRes] = await Promise.all([
          api.get("/search/posts", { params: { q } }),
          api.get("/search/users", { params: { q } }),
        ]);
        setPosts(postsRes.data.posts || []);
        setUsers(usersRes.data.users || []);
        setMe(postsRes.data.me);
      } catch (err) {
        console.error("Error searching:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [q]);

  const handleLikeToggle = async (post, liked) => {
    if (liked) {
      await api.delete(`/posts/${post.id}/like`);
    } else {
      await api.post(`/posts/${post.id}/like`);
    }
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              likes: liked
                ? p.likes.filter((l) => l.userId !== me)
                : [...p.likes, { userId: me }],
              _count: { ...p._count, likes: p._count.likes + (liked ? -1 : 1) },
            }
          : p
      )
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Search</h1>
        <input
          type="text"
          placeholder="Search posts, people, #hashtags..."
          defaultValue={q}
          onChange={(e) => navigate(`/search?q=${e.target.value}`)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-accent"
        />
      </div>

      {q && (
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-2 ${
              activeTab === "posts"
                ? "text-accent border-b-2 border-accent"
                : "text-gray-500"
            }`}
          >
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab("people")}
            className={`px-4 py-2 ${
              activeTab === "people"
                ? "text-accent border-b-2 border-accent"
                : "text-gray-500"
            }`}
          >
            People ({users.length})
          </button>
        </div>
      )}

      {loading && <div className="text-center py-8">Searching...</div>}

      {!q && (
        <div className="text-center py-12 text-gray-500">
          Enter a search term to get started
        </div>
      )}

      {q && !loading && activeTab === "posts" && (
        <div>
          {posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No posts found for "{q}"
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                me={me}
                onLikeToggle={(liked) => handleLikeToggle(post, liked)}
                onEcho={() => {}}
                onComment={() => {}}
                setSelectedImage={() => {}}
              />
            ))
          )}
        </div>
      )}

      {q && !loading && activeTab === "people" && (
        <div className="grid gap-3">
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No people found for "{q}"
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="card p-4 flex items-center gap-4 cursor-pointer hover:bg-opacity-80"
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                <img
                  src={
                    user.avatarUrl ||
                    "https://www.gravatar.com/avatar?d=identicon"
                  }
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="font-semibold">{user.name}</div>
                  {user.username && (
                    <div className="text-xs text-gray-500">@{user.username}</div>
                  )}
                  {user.bio && (
                    <div className="text-sm text-gray-600 truncate">{user.bio}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
