import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { PostCard } from "../components/PostCard";
import { ComposeModal } from "../components/ComposeModal";
import { useNavigate } from "react-router-dom";

const FILTERS = ["All", "Originals", "Echoes", "Fresh"];

export default function Feed({
  isComposeOpen,
  setIsComposeOpen,
  setSelectedImage,
}) {
  const [posts, setPosts] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [isPosting, setIsPosting] = useState(false);
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

  const uploadImage = async (file) => {
    if (!file) return null;

    // Compress image before upload
    const compressed = await compressImage(file);

    const form = new FormData();
    form.append("image", compressed);
    const { data } = await api.post("/uploads/image", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.url;
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Reduce dimensions if too large
          const maxWidth = 1200;
          const maxHeight = 1200;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to blob with quality 0.7
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            "image/jpeg",
            0.7
          );
        };
      };
    });
  };

  const createPost = async (content, file) => {
    if (!content.trim() && !file) return;
    setIsPosting(true);
    try {
      const imageUrl = await uploadImage(file);
      await api.post("/posts", { content, imageUrl });
      await loadFeed();
    } finally {
      setIsPosting(false);
    }
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
    <>
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSubmit={createPost}
        loading={isPosting}
      />
      <div className="max-w-3xl mx-auto p-6">
        <div className="mt-3 flex gap-2 mb-4">
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

        {filtered.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            me={me}
            onLikeToggle={toggleLike}
            onEcho={echoPost}
            onComment={addComment}
            setSelectedImage={setSelectedImage}
          />
        ))}
      </div>
    </>
  );
}
