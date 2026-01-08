import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Login({ guestMode = false }) {
  const [email, setEmail] = useState(guestMode ? "guest@example.com" : "");
  const [password, setPassword] = useState(guestMode ? "guestpass123" : "");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (guestMode) {
        await api.post("/auth/guest");
      } else {
        await api.post("/auth/login", { email, password });
      }
      // Verify session is established before navigating
      const verifyRes = await api.get("/auth/me");
      if (verifyRes.data) {
        nav("/feed", { replace: true });
      } else {
        setError("Session not established. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold mb-2">
          {guestMode ? "Guest Login" : "Welcome Back"}
        </h1>
        {!guestMode && (
          <p className="text-sm text-gray-600 mb-6">
            Share your echoes with the world
          </p>
        )}
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
          <button
            className="w-full bg-accent text-white rounded py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Continue"}
          </button>
        </form>
        {!guestMode && (
          <button
            className="w-full mt-3 border rounded py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            type="button"
            onClick={() => nav("/guest")}
            disabled={isLoading}
          >
            Continue as guest
          </button>
        )}
        {!guestMode && (
          <p className="text-center mt-4 text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              className="text-accent hover:underline font-medium"
              type="button"
              onClick={() => nav("/signup")}
            >
              Sign up
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
