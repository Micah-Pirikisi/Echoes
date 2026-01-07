import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Login({ guestMode = false }) {
  const [email, setEmail] = useState(guestMode ? "guest@example.com" : "");
  const [password, setPassword] = useState(guestMode ? "guestpass123" : "");
  const [error, setError] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (guestMode) {
        await api.post("/auth/guest");
      } else {
        await api.post("/auth/login", { email, password });
      }
      nav("/feed");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold mb-4">
          {guestMode ? "Guest login" : "Login"}
        </h1>
        {error && <p className="text-red-600 mb-3">{error}</p>}
        <form className="space-y-4" onSubmit={submit}>
          {!guestMode && (
            <>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          )}
          {guestMode && (
            <p className="text-sm text-gray-600">
              You’ll log in as a demo user.
            </p>
          )}
          <button className="w-full bg-accent text-white rounded py-2 font-medium">
            Continue
          </button>
        </form>
        {!guestMode && (
          <button
            className="w-full mt-3 border rounded py-2"
            type="button"
            onClick={() => nav("/guest")}
          >
            Continue as guest
          </button>
        )}
      </div>
    </div>
  );
}
