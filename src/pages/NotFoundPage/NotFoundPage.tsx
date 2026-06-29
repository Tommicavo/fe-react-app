import { useNavigate } from "react-router-dom";
import { Home, SearchX } from "lucide-react";
import "./NotFoundPage.scss";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <div className="not-found__code" aria-hidden="true">
        404
      </div>

      <div className="not-found__icon">
        <SearchX size={48} strokeWidth={1.5} />
      </div>

      <h1 className="not-found__title">Page not found</h1>
      <p className="not-found__desc">
        The page you're looking for doesn't exist or has been moved.
        <br className="not-found__br" />
        Check the URL or head back to the catalogue.
      </p>

      <button className="not-found__btn" onClick={() => navigate("/")}>
        <Home size={18} />
        Back to catalogue
      </button>
    </div>
  );
}

export default NotFoundPage;
