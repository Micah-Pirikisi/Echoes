import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { PostCard } from '../components/PostCard';
import { useNavigate } from 'react-router-dom';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [me, setMe] = useState(null);
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/posts/feed');
        setPosts(data.posts);
        setMe(data.me);
      } catch (err) {
        if (err.response?.status === 401) nav('/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  const uploadImage = async () => {
    if (!file) return null;
    const form = new FormData();
    form.append('image', file);
    const { data } = await api.post('/uploads/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data.url;
  };

  const createPost = async () => {
    if (!content.trim() && !file) return;
    const imageUrl = await uploadImage();
    await api.post('/posts', { content, imageUrl });
    setContent('');
    setFile(null);
    const { data } = await api.get('/posts/feed');
    setPosts(data.posts);
  };

  const toggleLike = async (post) => {
    const liked = post.likes?.some((l) => l.userId === me);
    if (liked) await api.delete(`/posts/${post.id}/like`);
    else await api.post(`/posts/${post.id}/like`);
    const { data } = await api.get('/posts/feed');
    setPosts(data.posts);
  };

  const echoPost = async (post) => {
    await api.post(`/posts/${post.id}/echo`, { content: '' });
    const { data } = await api.get('/posts/feed');
    setPosts(data.posts);
  };

  const addComment = async (post, text) => {
    await api.post(`/posts/${post.id}/comments`, { content: text });
    const { data } = await api.get('/posts/feed');
    setPosts(data.posts);
  };

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
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
          <button
            className="px-4 py-2 bg-accent text-white rounded"
            onClick={createPost}
            disabled={!content.trim() && !file}
          >
            Post
          </button>
        </div>
      </div>

      {posts.map((p) => (
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