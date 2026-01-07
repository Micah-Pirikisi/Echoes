import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { PostCard } from "../components/PostCard";

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [me, setMe] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    (async () => {
      const meRes = await api.get("/auth/me");
      setMe(meRes.data?.id);
      const { data } = await api.get(`/users/${id}`);
      setProfile(data);
    })().catch(console.error);
  }, [id]);

  const load = async () => {
    const meRes = await api.get("/auth/me");
    setMe(meRes.data?.id);
    const { data } = await api.get(`/users/${id}`);
    setProfile(data);
  };

  const uploadAvatar = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("image", file);
    const { data } = await api.post("/uploads/image", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await api.post("/users/me/avatar", { avatarUrl: data.url });
    await load();
    setFile(null);
  };

  const toggleLike = async (post) => {
    const liked = post.likes?.some((l) => l.userId === me);
    if (liked) await api.delete(`/posts/${post.id}/like`);
    else await api.post(`/posts/${post.id}/like`);
    await load();
  };

  const echoPost = async (post) => {
    await api.post(`/posts/${post.id}/echo`, { content: "" });
    await load();
  };

  const addComment = async (post, text) => {
    await api.post(`/posts/${post.id}/comments`, { content: text });
    await load();
  };

  if (!profile) return <div className="p-6">Loading profile...</div>;

  const isMe = me === profile.id;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="card p-4 mb-4 flex items-center gap-4">
        <img
          src={
            profile.avatarUrl || "https://www.gravatar.com/avatar?d=identicon"
          }
          alt={profile.name}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="text-xl font-semibold">{profile.name}</div>
          <div className="text-sm text-gray-600">{profile.bio}</div>
        </div>
        {isMe && (
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button
              className="px-3 py-1 bg-accent text-white rounded text-sm"
              onClick={uploadAvatar}
              disabled={!file}
            >
              Update avatar
            </button>
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold mb-3">Posts & Echoes</h3>
      {profile.posts.map((p) => (
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
