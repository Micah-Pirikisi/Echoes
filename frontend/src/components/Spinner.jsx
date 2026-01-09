export function Spinner({ size = "md", className = "" }) {
  const sizeMap = {
    sm: 16,
    md: 32,
    lg: 48,
  };

  const spinnerSize = sizeMap[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        style={{
          width: `${spinnerSize}px`,
          height: `${spinnerSize}px`,
          border: `3px solid var(--muted)`,
          borderTop: `3px solid var(--accent)`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      ></div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
