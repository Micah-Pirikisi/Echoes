import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Feed from "./pages/Feed";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <Routes>
      {!user && (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/guest" element={<Login guestMode />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
      {user && (
        <>
          <Route path="/feed" element={<Feed />} />
          <Route path="/users" element={<Users />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </>
      )}
    </Routes>
  );
}
