import { useMemo, useState } from 'react';

export function PostCard({ post, me, onLikeToggle, onEcho, onComment }) {
  const [commentText, setCommentText] = useState('');
  const liked = useMemo(() => post.likes?.some((l) => l.userId === me), [post.likes, me]);
  const reach = (post._count?.likes || 0) + (post._count?.echoes || 0);
  const ageMs = Date.now() - new Date(post.publishedAt).getTime();
  const isStale = ageMs > 1000 * 60 * 60 * 24 * 3; // 3 days -> fade
  const author = post.author;
  const echoedFrom = post.echoParent;

  const displayContent = post.content && post.content.length > 0 ? post.content : echoedFrom?.content || '';

  return (
    <div className={`card p-4 mb-4 ${isStale ? 'opacity-75 scale-[0.99]' : ''}`}>
      {echoedFrom && (
        <div className="text-xs text-gray-500 mb-1">
          Echoed from {echoedFrom.author?.name || 'someone'}
        </div>
      )}
      <div className="flex items-center gap-3">
        <img
          src={author.avatarUrl || 'https://www.gravatar.com/avatar?d=identicon'}
          alt={author.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <div className="font-semibold">{author.name}</div>
          <div className="text-xs text-gray-500">
            {new Date(post.publishedAt).toLocaleString()}
            {echoedFrom ? ' · Echo' : ''}
          </div>
        </div>
      </div>

      <div className="mt-3 whitespace-pre-line text-sm text-gray-900">{displayContent}</div>
      {post.imageUrl && (
        <img src={post.imageUrl} alt="" className="mt-3 rounded-lg max-h-96 object-cover w-full" />
      )}

      {echoedFrom && (
        <div className="mt-3 border border-dashed border-gray-200 rounded p-3 bg-gray-50">
          <div className="text-xs text-gray-500 mb-1">Original</div>
          <div className="text-sm font-semibold">{echoedFrom.author?.name}</div>
          <div className="text-sm text-gray-800 whitespace-pre-line">{echoedFrom.content}</div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
        <button
          onClick={() => onLikeToggle(post)}
          className={`px-3 py-1 rounded border ${liked ? 'bg-accent text-white border-accent' : 'border-gray-200'}`}
        >
          {liked ? 'Liked' : 'Like'} ({post._count?.likes || 0})
        </button>
        <button
          onClick={() => onEcho(post)}
          className="px-3 py-1 rounded border border-gray-200 hover:border-accent hover:text-accent"
        >
          Echo ({post._count?.echoes || 0})
        </button>
        <div className="text-xs text-gray-500">Reach: {reach}</div>
      </div>

      <div className="mt-3">
        <div className="text-xs text-gray-500 mb-1">Comments</div>
        {post.comments?.map((c) => (
          <div key={c.id} className="text-sm mb-1">
            <span className="font-semibold">{c.author.name}:</span> {c.content}
          </div>
        ))}
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!commentText.trim()) return;
            onComment(post, commentText.trim());
            setCommentText('');
          }}
        >
          <input
            className="flex-1 border rounded px-2 py-1 text-sm"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button className="px-3 py-1 bg-accent text-white rounded text-sm">Send</button>
        </form>
      </div>
    </div>
  );
}