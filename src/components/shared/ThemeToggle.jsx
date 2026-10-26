import { useTheme } from "../../contexts/ThemeContext";

import styles from "./ThemeToggle.module.scss";

const ThemeToggle = ({ className = "" }) => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      className={`${styles.themeToggle} ${className}`}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      <span className={styles.icon}>{theme === "light" ? "🌙" : "☀️"}</span>
      <span className={styles.label}>
        {theme === "light" ? "Dark" : "Light"}
      </span>
    </button>
  );
};

export default ThemeToggle;
