import { useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import "./SettingPage.scss";

function SettingPage() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    console.log(`Theme changed to: ${theme}`);
  }, [theme]);

  return (
    <div className="setting-page">
      <h1 className="setting-page__title">Settings</h1>

      <div className="setting-card">
        <div className="setting-card__info">
          <h2 className="setting-card__label">Appearance</h2>
        </div>

        <button
          className={`theme-toggle ${isDark ? "theme-toggle--dark" : "theme-toggle--light"}`}
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
          <span className="theme-toggle__icon">{isDark ? <Sun size={20} /> : <Moon size={20} />}</span>
          <span className="theme-toggle__label">{isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
        </button>
      </div>

      <div className="setting-card">
        <div className="setting-card__info">
          <h2 className="setting-card__label">Current Theme</h2>
          <p className="setting-card__desc">
            Active: <strong>{isDark ? "Dark" : "Light"}</strong> mode
          </p>
        </div>
      </div>
    </div>
  );
}

export default SettingPage;
