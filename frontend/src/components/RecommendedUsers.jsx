import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { UserHoverCard } from "./UserHoverCard";

export function RecommendedUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        // Get all users and filter those not followed
        const { data } = await api.get("/users");
        // Recommend users with most recent activity or random selection
        const recommended = data.users
          .filter((u) => !data.following.includes(u.id))
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);
        setUsers(recommended);
      } catch (err) {
        console.error("Error loading recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  if (loading) return <div className="card p-4">Loading...</div>;
  if (users.length === 0) return null;

  return (
    <div className="card p-4 sticky top-6">
      <h3 className="font-semibold mb-3">Who to follow</h3>
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between gap-2"
          >
            <div
              className="flex items-center gap-2 flex-1 cursor-pointer hover:opacity-80"
              onClick={() => nav(`/profile/${user.id}`)}
            >
              <UserHoverCard userId={user.id}>
                <img
                  src={
                    user.avatarUrl ||
                    "https://www.gravatar.com/avatar?d=identicon"
                  }
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </UserHoverCard>
              <div className="min-w-0">
                <UserHoverCard userId={user.id}>
                  <div className="font-sm font-medium truncate">
                    {user.name}
                  </div>
                </UserHoverCard>
                {user.username && (
                  <UserHoverCard userId={user.id}>
                    <div className="text-xs text-gray-500 truncate">
                      @{user.username}
                    </div>
                  </UserHoverCard>
                )}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Trigger follow action - parent component should handle
              }}
              className="px-2 py-1 text-xs bg-accent text-white rounded hover:bg-opacity-90"
            >
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
