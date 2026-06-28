import { useState } from "react";
import { Outlet, Navigate, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Home, LockKeyhole, Settings, LogOut } from "lucide-react";
import "./App.scss";

const NAV_LINKS = [
  { to: "/", label: "Home", icon: <Home size={18} />, end: true },
  { to: "/admin", label: "Admin", icon: <LockKeyhole size={18} />, end: false },
  {
    to: "/setting",
    label: "Settings",
    icon: <Settings size={18} />,
    end: false,
  },
];

function App() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-header__title">AI Catalogue</span>

        <nav className="app-header__nav">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.icon} {link.label}
            </NavLink>
          ))}
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
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={closeMenu}
          >
            {link.icon} {link.label}
          </NavLink>
        ))}
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
