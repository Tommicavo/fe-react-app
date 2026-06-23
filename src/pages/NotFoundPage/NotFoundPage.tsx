import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="container mt-5 text-center">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <div>It seems like the page you are looking for is not here</div>
      <Link to="/" className="btn btn-primary">
        Back to Home Page
      </Link>
    </div>
  );
}

export default NotFoundPage;
