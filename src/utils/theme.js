const THEME_KEY = "bingo-theme-preference";

export const getSystemTheme = () => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const getStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) || getSystemTheme();
  } catch {
    return "light";
  }
};

export const storeTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error("Failed to save theme preference:", error);
  }
};

export const setupThemeListener = (callback) => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handleChange = (e) => {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (!storedTheme) callback(e.matches ? "dark" : "light");
  };

  if (mediaQuery.addEventListener)
    mediaQuery.addEventListener("change", handleChange);
  else {
    // Fallback for older browsers
    mediaQuery.addListener(handleChange);
  }

  return () => {
    if (mediaQuery.removeEventListener)
      mediaQuery.removeEventListener("change", handleChange);
    else mediaQuery.removeListener(handleChange);
  };
};
