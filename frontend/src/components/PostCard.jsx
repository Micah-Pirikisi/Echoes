import { useMemo, useState, useEffect } from "react";

function computeTravelDepth(post) {
  let depth = 0;
  let ptr = post.echoParent;
  while (ptr) {
    depth += 1;
    ptr = ptr.echoParent;
  }
  return depth;
}

export function PostCard({ post, me, onLikeToggle, onEcho, onComment }) {
  const [commentText, setCommentText] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    (async () => {
      setNow(Date.now());
    })();
  }, [post.publishedAt, post.echoParent]);

  const liked = useMemo(
    () => post.likes?.some((l) => l.userId === me),
    [post.likes, me]
  );
  const reach = (post._count?.likes || 0) + (post._count?.echoes || 0);
  const ageMs = now - new Date(post.publishedAt).getTime();
  const isStale = ageMs > 1000 * 60 * 60 * 24 * 3; // 3 days -> fade
  const isFreshEcho = !!post.echoParent && ageMs < 1000 * 60 * 60 * 24; // 24h
  const author = post.author;
  const echoedFrom = post.echoParent;
  const depth = computeTravelDepth(post);

  // If backend doesn't include nested echoParent, the depth will be at most 1; this is still fine.

  const displayContent =
    post.content && post.content.length > 0
      ? post.content
      : echoedFrom?.content || "";

  return (
    <div
      className={`card p-4 mb-4 transition ${
        isStale ? "opacity-75 scale-[0.99]" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <img
          src={
            author.avatarUrl || "https://www.gravatar.com/avatar?d=identicon"
          }
          alt={author.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <div className="font-semibold flex items-center gap-2">
            {author.name}
            {echoedFrom && (
              <span className="text-xs text-gray-500">
                Echoed from {echoedFrom.author?.name || "someone"}
              </span>
            )}
            {isFreshEcho && (
              <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                Fresh Echo
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(post.publishedAt).toLocaleString()}
            {depth > 0 && (
              <span
                className="ml-2 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-gray-100 rounded-full"
                title={`Travel distance: echoed ${depth} ${
                  depth === 1 ? "hop" : "hops"
                } from the original`}
              >
                ↻ {depth}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 whitespace-pre-line text-sm text-gray-900">
        {displayContent}
      </div>
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt=""
          className="mt-3 rounded-lg max-h-96 object-cover w-full"
        />
      )}

      {echoedFrom && (
        <div className="mt-3 border border-dashed border-gray-200 rounded p-3 bg-gray-50">
          <div className="text-xs text-gray-500 mb-1">Original</div>
          <div className="text-sm font-semibold">{echoedFrom.author?.name}</div>
          <div className="text-sm text-gray-800 whitespace-pre-line">
            {echoedFrom.content}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
        <button
          onClick={() => onLikeToggle(post, liked)}
          className={`px-3 py-1 rounded border ${
            liked ? "bg-accent text-white border-accent" : "border-gray-200"
          }`}
        >
          {liked ? "Liked" : "Like"} ({post._count?.likes || 0})
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
            setCommentText("");
          }}
        >
          <input
            className="flex-1 border rounded px-2 py-1 text-sm"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button className="px-3 py-1 bg-accent text-white rounded text-sm">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
