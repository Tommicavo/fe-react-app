import { Outlet, Navigate, NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Home, LockKeyhole, Settings, Search } from "lucide-react";
import "./App.scss";

function App() {
  const { isLoggedIn, logout } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-header__title">AI Catalogue</span>
        <nav className="app-header__nav">
          <NavLink to="/" end>
            <Home size={18} /> Home
          </NavLink>
          <NavLink to="/admin">
            <LockKeyhole size={18} /> Admin
          </NavLink>
          <NavLink to="/setting">
            <Settings size={18} /> Settings
          </NavLink>
          <NavLink to="/detail/1">
            <Search size={18} /> Detail
          </NavLink>
        </nav>
        <button className="app-header__logout btn btn-sm btn-outline-light" onClick={logout}>
          Logout
        </button>
      </header>

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
