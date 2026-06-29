import { useTheme } from "@/context/ThemeContext";
import { useAppSelector } from "@/store/hooks";
import { Sun, Moon, User, Shield, Bot, Tag, GitFork } from "lucide-react";
import "./SettingPage.scss";

const GITHUB_URL = import.meta.env.VITE_GITHUB_URL;

function SettingPage() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const currentUser = useAppSelector((state) => state.auth.user);
  const models = useAppSelector((state) => state.models.list);
  const categories = useAppSelector((state) => state.categories.list);

  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <div className="setting-page m-auto">
      <h1 className="setting-page__title">Settings</h1>

      {/* ── Account section ── */}
      <section className="setting-section">
        <h2 className="setting-section__heading">Account</h2>

        <div className="setting-card">
          <div className="setting-card__icon-wrap setting-card__icon-wrap--user">
            <User size={20} />
          </div>
          <div className="setting-card__body">
            <span className="setting-card__label">Username</span>
            <span className="setting-card__value">
              {currentUser?.username ?? "—"}
            </span>
          </div>
        </div>

        <div className="setting-card">
          <div
            className={`setting-card__icon-wrap ${
              isAdmin
                ? "setting-card__icon-wrap--admin"
                : "setting-card__icon-wrap--user"
            }`}
          >
            <Shield size={20} />
          </div>
          <div className="setting-card__body">
            <span className="setting-card__label">Role</span>
            <span
              className={`setting-card__role-badge ${
                isAdmin
                  ? "setting-card__role-badge--admin"
                  : "setting-card__role-badge--default"
              }`}
            >
              {currentUser?.role ?? "—"}
            </span>
          </div>
        </div>
      </section>

      {/* ── Appearance section ── */}
      <section className="setting-section">
        <h2 className="setting-section__heading">Appearance</h2>

        <div className="setting-card setting-card--row">
          <div className="setting-card__body">
            <span className="setting-card__label">Theme</span>
            <span className="setting-card__value setting-card__value--muted">
              Currently using <strong>{isDark ? "dark" : "light"}</strong> mode
            </span>
          </div>
          <button
            className={`theme-toggle ${isDark ? "theme-toggle--dark" : "theme-toggle--light"}`}
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDark ? "Light mode" : "Dark mode"}</span>
          </button>
        </div>
      </section>

      {/* ── App stats section ── */}
      <section className="setting-section">
        <h2 className="setting-section__heading">App stats</h2>

        <div className="setting-stats">
          <div className="setting-stat">
            <div className="setting-stat__icon-wrap">
              <Bot size={22} />
            </div>
            <span className="setting-stat__value">{models.length}</span>
            <span className="setting-stat__label">AI Models</span>
          </div>

          <div className="setting-stat">
            <div className="setting-stat__icon-wrap setting-stat__icon-wrap--alt">
              <Tag size={22} />
            </div>
            <span className="setting-stat__value">{categories.length}</span>
            <span className="setting-stat__label">Categories</span>
          </div>
        </div>
      </section>

      {/* ── GitHub section ── */}
      <section className="setting-section">
        <h2 className="setting-section__heading">Project</h2>

        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="setting-github"
        >
          <div className="setting-github__icon">
            <GitFork size={28} />
          </div>
          <div className="setting-github__body">
            <span className="setting-github__title">View on GitHub</span>
            <span className="setting-github__url">{GITHUB_URL}</span>
          </div>
          <span className="setting-github__arrow">↗</span>
        </a>
      </section>
    </div>
  );
}

export default SettingPage;
