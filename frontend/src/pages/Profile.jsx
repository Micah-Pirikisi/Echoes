import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "../components/Spinner";
import { api } from "../api/client";
import { PostCard } from "../components/PostCard";

export default function Profile() {
  const { id } = useParams();
  const nav = useNavigate();
  const [profile, setProfile] = useState(null);
  const [me, setMe] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const meRes = await api.get("/auth/me");
        const myId = meRes.data?.id;
        setMe(myId);

        // If id is "me", use the current user's id
        const userId = id === "me" ? myId : id;
        if (!userId) {
          nav("/login");
          return;
        }

        const { data } = await api.get(`/users/${userId}`);
        setProfile(data);
      } catch (err) {
        console.error("Error loading profile:", err);
        if (err.response?.status === 401) nav("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, nav]);

  const load = async () => {
    try {
      const meRes = await api.get("/auth/me");
      const myId = meRes.data?.id;
      setMe(myId);
      const userId = id === "me" ? myId : id;
      const { data } = await api.get(`/users/${userId}`);
      setProfile(data);
      setBioText(data.bio || "");
    } catch (err) {
      console.error("Error reloading profile:", err);
    }
  };

  const uploadAvatar = async () => {
    if (!file) return;
    try {
      const form = new FormData();
      form.append("image", file);
      const { data } = await api.post("/uploads/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await api.post("/users/me/avatar", { avatarUrl: data.url });
      await load();
      setFile(null);
    } catch (err) {
      console.error("Error uploading avatar:", err);
    }
  };

  const updateBio = async () => {
    try {
      await api.post("/users/me/bio", { bio: bioText });
      await load();
      setEditingBio(false);
    } catch (err) {
      console.error("Error updating bio:", err);
    }
  };

  const toggleLike = async (post) => {
    try {
      const liked = post.likes?.some((l) => l.userId === me);
      if (liked) await api.delete(`/posts/${post.id}/like`);
      else await api.post(`/posts/${post.id}/like`);
      await load();
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const echoPost = async (post) => {
    try {
      await api.post(`/posts/${post.id}/echo`, { content: "" });
      await load();
    } catch (err) {
      console.error("Error echoing post:", err);
    }
  };

  const addComment = async (post, text) => {
    try {
      await api.post(`/posts/${post.id}/comments`, { content: text });
      await load();
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  if (loading)
    return (
      <div className="p-6 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  if (!profile) return <div className="p-6">Profile not found</div>;

  const isMe = me === profile.id;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className={isMe ? "" : "card p-4 mb-4"}>
        <div className="flex items-center gap-4 mb-4">
          <img
            src={
              profile.avatarUrl || "https://www.gravatar.com/avatar?d=identicon"
            }
            alt={profile.name}
            className="w-20 h-20 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
            onClick={() => nav(`/profile/${profile.id}`)}
          />
          <div className="flex-1">
            <div
              className="text-xl font-semibold cursor-pointer hover:text-accent transition"
              onClick={() => nav(`/profile/${profile.id}`)}
            >
              {profile.name}
            </div>
            {profile.username && (
              <div className="text-gray-500 text-sm">@{profile.username}</div>
            )}
            {isMe && (
              <div className="flex flex-row gap-2 mt-2">
                <div className="file-input-wrapper">
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <label htmlFor="avatar-upload">Choose Avatar</label>
                </div>
                <button
                  className="file-input-wrapper"
                  onClick={uploadAvatar}
                  disabled={!file}
                >
                  <label>Update Avatar</label>
                </button>
              </div>
            )}
          </div>
        </div>

        {editingBio ? (
          <div className="space-y-2">
            <textarea
              className="w-full border rounded px-3 py-2 text-sm"
              rows={3}
              placeholder="Add a bio..."
              value={bioText}
              onChange={(e) => setBioText(e.target.value.slice(0, 500))}
              maxLength={500}
            />
            <div className="text-xs text-gray-500">{bioText.length}/500</div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 bg-accent text-white rounded text-sm"
                onClick={updateBio}
              >
                Save
              </button>
              <button
                className="px-3 py-1 border rounded text-sm"
                onClick={() => {
                  setEditingBio(false);
                  setBioText(profile.bio || "");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-sm text-gray-600">
              {profile.bio || "No bio yet"}
            </div>
            {isMe && (
              <button
                className="text-xs text-accent mt-2 hover:underline"
                onClick={() => setEditingBio(true)}
              >
                Edit bio
              </button>
            )}
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold mb-3" style={{ marginTop: "50px" }}>
        Posts & Echoes
      </h3>
      {profile.posts && profile.posts.length > 0 ? (
        profile.posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            me={me}
            onLikeToggle={toggleLike}
            onEcho={echoPost}
            onComment={addComment}
          />
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">No posts yet</div>
      )}
    </div>
  );
}
