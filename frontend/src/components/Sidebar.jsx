import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api/client";

export function Sidebar({ onComposeClick }) {
  const nav = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear any cached auth data and navigate to login
      nav("/login", { replace: true });
      window.location.reload();
    }
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: "Home", path: "/feed", icon: "🏠" },
    { label: "Explore", path: "/users", icon: "🔍" },
    { label: "Profile", path: "/profile/me", icon: "👤" },
    { label: "Messages", path: "#", icon: "💬", disabled: true },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="sidebar-desktop">
        <div className="sidebar-brand">Echoes</div>
        <div className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => !item.disabled && nav(item.path)}
              className={`sidebar-nav-item ${
                isActive(item.path) ? "active" : ""
              } ${item.disabled ? "disabled" : ""}`}
              disabled={item.disabled}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
          <button onClick={onComposeClick} className="sidebar-compose-btn">
            <span className="sidebar-icon">✍️</span>
            <span className="sidebar-label">Compose</span>
          </button>
        </div>
        <button onClick={handleLogout} className="sidebar-logout-btn">
          Logout
        </button>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="sidebar-mobile">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => !item.disabled && nav(item.path)}
            className={`mobile-nav-item ${
              isActive(item.path) ? "active" : ""
            } ${item.disabled ? "disabled" : ""}`}
            disabled={item.disabled}
            title={item.label}
          >
            <span className="mobile-icon">{item.icon}</span>
          </button>
        ))}
        <button
          onClick={onComposeClick}
          className="mobile-nav-item compose"
          title="Compose"
        >
          <span className="mobile-icon">✍️</span>
        </button>
        <button
          onClick={handleLogout}
          className="mobile-nav-item logout"
          title="Logout"
        >
          <span className="mobile-icon">🚪</span>
        </button>
      </nav>
    </>
  );
}
