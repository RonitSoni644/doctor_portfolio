import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(undefined);
const THEME_STORAGE_KEY = 'doctor-portfolio-theme';

function normalizeTheme(theme) {
  return theme === 'dark' ? 'dark' : 'light';
}

function getStoredTheme() {
  if (typeof window === 'undefined') return null;

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : null;
}

export function ThemeProvider({ children, initialTheme = 'light' }) {
  const [hasUserPreference, setHasUserPreference] = useState(() => Boolean(getStoredTheme()));
  const [theme, setThemeState] = useState(() => getStoredTheme() ?? normalizeTheme(initialTheme));

  useEffect(() => {
    if (!hasUserPreference) {
      setThemeState(normalizeTheme(initialTheme));
    }
  }, [hasUserPreference, initialTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  }, [theme]);

  const setTheme = (nextTheme) => {
    const normalizedTheme = normalizeTheme(nextTheme);
    setThemeState(normalizedTheme);
    setHasUserPreference(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
  };

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
