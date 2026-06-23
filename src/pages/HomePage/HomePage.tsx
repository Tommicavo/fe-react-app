import { Link } from "react-router-dom";

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
            Home Page
          </Link>
          <Link className="nav-link" to="/login">
            Login Page
          </Link>
          <Link className="nav-link" to="/admin">
            Admin Page
          </Link>
          <Link className="nav-link" to="/setting">
            Setting Page
          </Link>
          <Link className="nav-link" to="/detail/1">
            Detail Page - Id: 1
          </Link>
          <Link className="nav-link" to="/not-found">
            404
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default HomePage;
