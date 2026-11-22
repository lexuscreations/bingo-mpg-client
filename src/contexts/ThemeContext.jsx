import { createContext, useContext, useEffect, useState } from "react";

import { getStoredTheme, storeTheme, setupThemeListener } from "../utils/theme";

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => getStoredTheme());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    storeTheme(theme);
  }, [theme]);

  useEffect(() => {
    return setupThemeListener((newTheme) => setTheme(newTheme));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
