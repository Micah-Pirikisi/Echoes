import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function computeTravelDepth(post) {
  let depth = 0;
  let ptr = post.echoParent;
  while (ptr) {
    depth += 1;
    ptr = ptr.echoParent;
  }
  return depth;
}

export function PostCard({
  post,
  me,
  onLikeToggle,
  onEcho,
  onComment,
  setSelectedImage,
}) {
  const nav = useNavigate();
  const [commentText, setCommentText] = useState("");
  const [commentFile, setCommentFile] = useState(null);
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
      className={`card p-4 mb-4 transition cursor-pointer hover:shadow-lg ${
        isStale ? "opacity-75 scale-[0.99]" : ""
      } ${echoedFrom ? "pulse-gentle" : ""}`}
      onClick={() => nav(`/posts/${post.id}`)}
    >
      {!author ? (
        <div className="text-red-500 p-4">
          Error: Post author information missing
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <img
              src={
                author.avatarUrl ||
                "https://www.gravatar.com/avatar?d=identicon"
              }
              alt={author.name}
              className={`w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition ${
                ageMs < 1000 * 60 * 60 * 24 ? "has-recent-post" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                nav(`/profile/${author.id}`);
              }}
            />
            <div>
              <div className="font-semibold flex items-center gap-2">
                <span
                  className="cursor-pointer hover:text-accent transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    nav(`/profile/${author.id}`);
                  }}
                >
                  {author.name}
                </span>
                {author.username && (
                  <span
                    className="text-gray-500 cursor-pointer hover:text-accent transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      nav(`/profile/${author.id}`);
                    }}
                  >
                    @{author.username}
                  </span>
                )}
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
              {depth > 0 && (
                <div
                  className="text-xs text-gray-500 inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full"
                  title={`Travel distance: echoed ${depth} ${
                    depth === 1 ? "hop" : "hops"
                  } from the original`}
                >
                  ↻ {depth}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 whitespace-pre-line text-sm text-gray-900">
            {displayContent}
          </div>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt=""
              className="mt-3 rounded w-full aspect-video object-contain cursor-pointer hover:opacity-90 transition bg-gray-100"
              onClick={() => setSelectedImage(post.imageUrl)}
            />
          )}

          {echoedFrom && (
            <div className="mt-3 border border-dashed border-gray-200 rounded p-3 bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">Original</div>
              <div 
                className="text-sm font-semibold cursor-pointer hover:text-accent transition"
                onClick={(e) => {
                  e.stopPropagation();
                  nav(`/profile/${echoedFrom.author?.id}`);
                }}
              >
                {echoedFrom.author?.name}
              </div>
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
          </div>

          <div className="mt-3">
            {post.comments?.map((c) => (
              <div key={c.id} className="text-sm mb-1">
                <span className="font-semibold">{c.author.name}:</span>{" "}
                {c.content}
              </div>
            ))}
            <form
              className="mt-2 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!commentText.trim() && !commentFile) return;
                onComment(post, commentText.trim());
                setCommentText("");
                setCommentFile(null);
              }}
            >
              <input
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <div className="file-input-wrapper">
                  <input
                    id={`comment-image-${post.id}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCommentFile(e.target.files[0])}
                  />
                  <label htmlFor={`comment-image-${post.id}`}>Add Image</label>
                </div>
                {commentFile && (
                  <span className="text-xs text-gray-500">
                    {commentFile.name}
                  </span>
                )}
              </div>
              {(commentText.trim() || commentFile) && (
                <button className="w-full px-3 py-1 bg-accent text-white rounded text-sm">
                  Send
                </button>
              )}
            </form>
          </div>
        </>
      )}
    </div>
  );
}
