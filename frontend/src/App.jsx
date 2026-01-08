import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Feed from "./pages/Feed";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import PostDetail from "./pages/PostDetail";
import { Sidebar } from "./components/Sidebar";
import { ImageModal } from "./components/ImageModal";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { user, loading, checkAuth } = useAuth();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const location = useLocation();

  // Re-check auth when route changes (helps with login redirect)
  useEffect(() => {
    checkAuth();
  }, [location.pathname, checkAuth]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className={user ? "app-layout" : ""}>
      {user && <Sidebar onComposeClick={() => setIsComposeOpen(true)} />}
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
            <Route
              path="/feed"
              element={
                <Feed
                  isComposeOpen={isComposeOpen}
                  setIsComposeOpen={setIsComposeOpen}
                  selectedImage={selectedImage}
                  setSelectedImage={setSelectedImage}
                />
              }
            />
            <Route path="/users" element={<Users />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="*" element={<Navigate to="/feed" replace />} />
          </>
        )}
      </Routes>
      <ImageModal
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}
