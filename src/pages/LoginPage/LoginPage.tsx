import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import "./LoginPage.scss";

function LoginPage() {
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate("/", { replace: true });
  }, [isLoggedIn, navigate]);

  const handleLogin = () => {
    login();
    navigate("/", { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-page__card">
        <h1 className="login-page__title">AI Catalogue</h1>
        <button className="btn btn-primary w-100" onClick={handleLogin}>
          Sign In Here
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
