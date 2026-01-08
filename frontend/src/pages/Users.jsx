import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [pending, setPending] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const nav = useNavigate();

  const load = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data.users || []);
      setFollowing(data.following || []);
      setPending(data.pending || []);
      const incomingRes = await api.get("/users/follow-requests/incoming");
      setIncoming(incomingRes.data.requests || []);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  const sendRequest = async (id) => {
    await api.post(`/users/${id}/follow-request`);
    await load();
  };

  const accept = async (id) => {
    await api.post(`/users/follow-requests/${id}/accept`);
    await load();
  };

  const reject = async (id) => {
    await api.post(`/users/follow-requests/${id}/reject`);
    await load();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-3">People</h2>
      <div className="grid md:grid-cols-2 gap-3">
        {users.map((u) => {
          const isFollowing = following.includes(u.id);
          const isPending = pending.includes(u.id);
          return (
            <div
              key={u.id}
              className="card p-3 flex items-center gap-3 cursor-pointer hover:bg-opacity-80 transition-all"
              onClick={() => nav(`/profile/${u.id}`)}
            >
              <img
                src={
                  u.avatarUrl || "https://www.gravatar.com/avatar?d=identicon"
                }
                alt={u.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{u.name}</div>
                <div className="text-xs text-gray-500 truncate">{u.bio}</div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                {isFollowing ? (
                  <span className="text-xs text-green-600 font-medium">
                    Following
                  </span>
                ) : isPending ? (
                  <span className="text-xs text-gray-500">Request sent</span>
                ) : (
                  <button
                    className="px-3 py-1 text-sm border rounded text-green-600 hover:border-green-600 hover:bg-green-50"
                    onClick={() => sendRequest(u.id)}
                  >
                    Follow
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <h3 className="text-lg font-semibold mt-6 mb-2">
        Incoming follow requests
      </h3>
      {incoming.length === 0 && (
        <div className="text-sm text-gray-500">None</div>
      )}
      {incoming.map((r) => (
        <div key={r.id} className="card p-3 flex items-center gap-3 mb-2">
          <img
            src={
              r.requester.avatarUrl ||
              "https://www.gravatar.com/avatar?d=identicon"
            }
            alt={r.requester.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="font-semibold">{r.requester.name}</div>
            <div className="text-xs text-gray-500">wants to follow you</div>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 text-sm border rounded"
              onClick={() => reject(r.id)}
            >
              Reject
            </button>
            <button
              className="px-3 py-1 text-sm bg-accent text-white rounded"
              onClick={() => accept(r.id)}
            >
              Accept
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
