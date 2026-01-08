import { useState } from "react";

export function ComposeModal({ isOpen, onClose, onSubmit, loading }) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    try {
      await onSubmit(content, file);
      setContent("");
      setFile(null);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to post. Please try again.");
    }
  };

  const handleClose = () => {
    setContent("");
    setFile(null);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Compose</h2>
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

        <textarea
          className="w-full border rounded px-3 py-2 text-sm"
          rows={4}
          placeholder="Share a thought..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoFocus
          disabled={loading}
        />

        <div className="mt-3 flex items-center gap-2">
          <div className="file-input-wrapper">
            <input
              id="modal-image-upload"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              disabled={loading}
            />
            <label htmlFor="modal-image-upload">Add Image</label>
          </div>
          {file && <span className="text-xs text-gray-500">{file.name}</span>}
        </div>

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
            className="px-4 py-2 bg-accent text-white rounded"
            disabled={(!content.trim() && !file) || loading}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
