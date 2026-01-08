export function ImageModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: "90vw", padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close"
            style={{ margin: 0, padding: "8px" }}
          >
            ✕
          </button>
        </div>
        <div
          className="flex items-center justify-center"
          style={{ padding: "24px" }}
        >
          <img
            src={imageUrl}
            alt="Full size"
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
