import { useState } from "react";

export function EchoModal({ isOpen, onClose, onSubmit, loading, post }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    try {
      await onSubmit(post, content);
      setContent("");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to echo. Please try again.");
    }
  };

  const handleClose = () => {
    setContent("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Echo</h2>
          <button
            onClick={handleClose}
            className="modal-close-btn"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4 p-3 bg-muted/10 rounded border border-muted/20">
          <p className="text-sm font-semibold mb-2">Original Post by {post?.author?.name}</p>
          <p className="text-sm text-muted line-clamp-3">{post?.content}</p>
        </div>

        <textarea
          className="w-full border rounded px-3 py-2 text-sm"
          rows={3}
          placeholder="Add your thoughts (optional)..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoFocus
          disabled={loading}
        />

        <div className="modal-footer">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded border border-gray-200"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-accent hover:bg-accent/80 text-white disabled:opacity-50"
            disabled={loading || !post}
          >
            {loading ? "Echoing..." : "Echo"}
          </button>
        </div>
      </div>
    </div>
  );
}
