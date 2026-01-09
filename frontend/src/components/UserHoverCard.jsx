import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export function UserHoverCard({ userId, children }) {
  const [showCard, setShowCard] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const nav = useNavigate();
  const timeoutRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!showCard) {
      setUser(null);
      return;
    }

    setLoading(true);
    const fetchUser = async () => {
      try {
        const { data } = await api.get(`/users/${userId}`);
        setUser(data);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchUser, 300);
    return () => clearTimeout(timer);
  }, [showCard, userId]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
    setShowCard(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowCard(false);
    }, 150);
  };

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      {children}

      {showCard &&
        createPortal(
          <div
            className="rounded-lg shadow-xl border p-4 w-64 z-50 pointer-events-auto"
            style={{
              position: "absolute",
              top: `${position.top}px`,
              left: `${position.left}px`,
              backgroundColor: "var(--bg)",
              borderColor: "var(--card-border)",
            }}
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setShowCard(true);
            }}
            onMouseLeave={handleMouseLeave}
          >
            {loading ? (
              <div className="text-center py-4 text-sm text-gray-500">
                Loading...
              </div>
            ) : user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      user.avatarUrl ||
                      "https://www.gravatar.com/avatar?d=identicon"
                    }
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{user.name}</div>
                    {user.username && (
                      <div className="text-sm text-gray-500">
                        @{user.username}
                      </div>
                    )}
                  </div>
                </div>

                {user.bio && (
                  <div className="text-sm text-gray-700">{user.bio}</div>
                )}

                {user._count && (
                  <div className="flex gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-semibold text-gray-900">
                        {user._count.posts || 0}
                      </span>
                      <span> Posts</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">
                        {user._count.followers || 0}
                      </span>
                      <span> Followers</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">
                        {user._count.following || 0}
                      </span>
                      <span> Following</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    nav(`/profile/${userId}`);
                    setShowCard(false);
                  }}
                  className="w-full px-3 py-2 bg-accent text-white rounded text-sm font-medium hover:bg-opacity-90 transition"
                >
                  View Profile
                </button>
              </div>
            ) : null}
          </div>,
          document.body
        )}
    </div>
  );
}
