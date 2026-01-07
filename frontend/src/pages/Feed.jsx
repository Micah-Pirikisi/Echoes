import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { PostCard } from "../components/PostCard";
import { useNavigate } from "react-router-dom";

const FILTERS = ["All", "Originals", "Echoes", "Fresh"];

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [me, setMe] = useState(null);
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const nav = useNavigate();

  const loadFeed = async () => {
    const { data } = await api.get("/posts/feed");
    setPosts(data.posts);
    setMe(data.me);
  };

  useEffect(() => {
    (async () => {
      try {
        await loadFeed();
      } catch (err) {
        if (err.response?.status === 401) nav("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  const uploadImage = async () => {
    if (!file) return null;
    const form = new FormData();
    form.append("image", file);
    const { data } = await api.post("/uploads/image", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
  };

  const createPost = async () => {
    if (!content.trim() && !file) return;
    const imageUrl = await uploadImage();
    await api.post("/posts", { content, imageUrl });
    setContent("");
    setFile(null);
    await loadFeed();
  };

  // optimistic like
  const toggleLike = async (post, liked) => {
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
    try {
      if (liked) await api.delete(`/posts/${post.id}/like`);
      else await api.post(`/posts/${post.id}/like`);
    } catch {
      await loadFeed(); // fallback sync
    }
  };

  // optimistic echo
  const echoPost = async (post) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, _count: { ...p._count, echoes: p._count.echoes + 1 } }
          : p
      )
    );
    try {
      await api.post(`/posts/${post.id}/echo`, { content: "" });
      await loadFeed();
    } catch {
      await loadFeed();
    }
  };

  // optimistic comment
  const addComment = async (post, text) => {
    const tempId = `temp-${Date.now()}`;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              comments: [
                ...p.comments,
                { id: tempId, content: text, author: { name: "You" } },
              ],
            }
          : p
      )
    );
    try {
      await api.post(`/posts/${post.id}/comments`, { content: text });
      await loadFeed();
    } catch {
      await loadFeed();
    }
  };

  const filtered = useMemo(() => {
    const now = Date.now();
    return posts.filter((p) => {
      if (filter === "Originals") return !p.echoParent;
      if (filter === "Echoes") return !!p.echoParent;
      if (filter === "Fresh")
        return now - new Date(p.publishedAt).getTime() < 1000 * 60 * 60 * 24;
      return true;
    });
  }, [posts, filter]);

  if (loading) return <div className="p-6">Loading feed...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="card p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Compose</h2>
        <textarea
          className="w-full border rounded px-3 py-2 text-sm"
          rows={3}
          placeholder="Share a thought..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="mt-2 flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button
            className="px-4 py-2 bg-accent text-white rounded"
            onClick={createPost}
            disabled={!content.trim() && !file}
          >
            Post
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm rounded border ${
                filter === f
                  ? "bg-accent text-white border-accent"
                  : "border-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          me={me}
          onLikeToggle={toggleLike}
          onEcho={echoPost}
          onComment={addComment}
        />
      ))}
    </div>
  );
}
