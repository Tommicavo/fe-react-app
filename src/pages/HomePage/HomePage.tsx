import { Link } from "react-router-dom";

import {
  Home,
  User,
  LockKeyhole,
  Settings,
  Search,
  GlobeOff,
} from "lucide-react";

function HomePage() {
  return (
    <div>
      <div className="container">
        <h1 className="text-center">
          Epicode | Computer Engineering & Artificial Intelligence
        </h1>
        <h2>Frontend Project | Vite + React</h2>
        <h2>Home Page</h2>
      </div>
      <nav className="navbar navbar-expand bg-primary px-4">
        <div className="navbar-nav gap-3">
          <Link className="nav-link" to="/">
            <div className="d-flex justify-content-center align-items-center gap-2">
              <div>
                <Home size={24} />
              </div>
              <div>Home Page</div>
            </div>
          </Link>
          <Link className="nav-link" to="/login">
            <div className="d-flex justify-content-center align-items-center gap-2">
              <div>
                <User size={24} />
              </div>
              <div>Login Page</div>
            </div>
          </Link>
          <Link className="nav-link" to="/admin">
            <div className="d-flex justify-content-center align-items-center gap-2">
              <div>
                <LockKeyhole size={24} />
              </div>
              <div>Admin Page</div>
            </div>
          </Link>
          <Link className="nav-link" to="/setting">
            <div className="d-flex justify-content-center align-items-center gap-2">
              <div>
                <Settings size={24} />
              </div>
              <div>Settings Page</div>
            </div>
          </Link>
          <Link className="nav-link" to="/detail/1">
            <div className="d-flex justify-content-center align-items-center gap-2">
              <div>
                <Search size={24} />
              </div>
              <div>Detail Page - Id: 1</div>
            </div>
          </Link>
          <Link className="nav-link" to="/not-found">
            <div className="d-flex justify-content-center align-items-center gap-2">
              <div>
                <GlobeOff size={24} />
              </div>
              <div>Not Found Page</div>
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default HomePage;
