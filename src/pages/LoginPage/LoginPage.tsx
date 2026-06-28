import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import {
  authValidator,
  type AuthValidationResult,
} from "@/services/validators/auth.validator";
import "./LoginPage.scss";
import type {
  AuthCredentials,
  AuthValidationErrors,
} from "@/models/auth.model";

type Mode = "login" | "register";

const EMPTY_FORM: AuthCredentials = { username: "", password: "" };
const EMPTY_ERRORS: AuthValidationErrors = {};

function LoginPage() {
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState<AuthCredentials>(EMPTY_FORM);
  const [errors, setErrors] = useState<AuthValidationErrors>(EMPTY_ERRORS);
  const [serverError, setServerError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) navigate("/", { replace: true });
  }, [isLoggedIn, navigate]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setForm(EMPTY_FORM);
    setErrors(EMPTY_ERRORS);
    setServerError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof AuthValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setServerError("");
  };

  const validate = (): AuthValidationResult => {
    return mode === "login"
      ? authValidator.validateLogin(form)
      : authValidator.validateRegister(form);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const { valid, errors: validationErrors } = validate();
    if (!valid) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const result = await authService.login(form);
        if (!result.success || !result.user) {
          setServerError(result.error ?? "Login failed.");
          return;
        }
        login(result.user);
        navigate("/", { replace: true });
      } else {
        const taken = await authService.isUsernameTaken(form.username.trim());
        if (taken) {
          setErrors((prev) => ({
            ...prev,
            username: "Username is already taken.",
          }));
          return;
        }
        const result = await authService.register(form);
        if (!result.success || !result.user) {
          setServerError(result.error ?? "Registration failed.");
          return;
        }
        login(result.user);
        navigate("/", { replace: true });
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="login-page">
      <div className="login-page__card">
        <h1 className="login-page__title">AI Catalogue</h1>
        <p className="login-page__subtitle">
          {isLogin ? "Sign in to your account" : "Create a new account"}
        </p>

        {/* Mode tabs */}
        <div className="login-page__tabs">
          <button
            type="button"
            className={`login-page__tab${isLogin ? " login-page__tab--active" : ""}`}
            onClick={() => switchMode("login")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`login-page__tab${!isLogin ? " login-page__tab--active" : ""}`}
            onClick={() => switchMode("register")}
          >
            Register
          </button>
        </div>

        <form className="login-page__form" onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div className="login-page__field">
            <label htmlFor="username" className="login-page__label">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              className={`form-control${errors.username ? " is-invalid" : ""}`}
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your username"
              disabled={loading}
            />
            {errors.username && (
              <div className="invalid-feedback">{errors.username}</div>
            )}
          </div>

          {/* Password */}
          <div className="login-page__field">
            <label htmlFor="password" className="login-page__label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              className={`form-control${errors.password ? " is-invalid" : ""}`}
              value={form.password}
              onChange={handleChange}
              placeholder={
                isLogin ? "Enter your password" : "Create a strong password"
              }
              disabled={loading}
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password}</div>
            )}
            {!isLogin && !errors.password && (
              <div className="login-page__hint">
                Min. 8 chars · 1 uppercase · 1 lowercase · 1 number · 1 symbol
              </div>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <div className="login-page__server-error">{serverError}</div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 login-page__submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                {isLogin ? "Signing in…" : "Creating account…"}
              </>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
