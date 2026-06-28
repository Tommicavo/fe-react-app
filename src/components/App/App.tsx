import { useState } from "react";
import { Outlet, Navigate, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Home, LockKeyhole, Settings, LogOut } from "lucide-react";
import "./App.scss";

function App() {
  const { isLoggedIn, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = currentUser?.role === "ADMIN";
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-header__title">AI Catalogue</span>

        <nav className="app-header__nav">
          <NavLink to="/" end>
            <Home size={18} /> Home
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin">
              <LockKeyhole size={18} /> Admin
            </NavLink>
          )}
          <NavLink to="/setting">
            <Settings size={18} /> Settings
          </NavLink>
        </nav>

        <div className="app-header__actions">
          <button
            className="btn btn-sm app-header__logout"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={16} /> <span>Logout</span>
          </button>

          <button
            className={`app-header__hamburger ${menuOpen ? "is-open" : ""}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <nav className={`app-mobile-nav ${menuOpen ? "is-open" : ""}`}>
        <NavLink to="/" end onClick={closeMenu}>
          <Home size={18} /> Home
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" onClick={closeMenu}>
            <LockKeyhole size={18} /> Admin
          </NavLink>
        )}
        <NavLink to="/setting" onClick={closeMenu}>
          <Settings size={18} /> Settings
        </NavLink>
      </nav>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <span>© 2026 AI Catalogue — Epicode — Frontend Project</span>
      </footer>
    </div>
  );
}

export default App;
