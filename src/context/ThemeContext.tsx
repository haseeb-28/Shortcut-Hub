"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = "shortcut-hub-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const hasExplicitChoice = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    let saved: string | null = null;

    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error("Unable to read the saved theme preference.", error);
    }

    if (saved === "light" || saved === "dark") {
      hasExplicitChoice.current = true;
      root.dataset.theme = saved;
      setThemeState(saved);
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const applySystemTheme = () => {
      if (hasExplicitChoice.current) return;
      const nextTheme = media.matches ? "light" : "dark";
      root.dataset.theme = nextTheme;
      setThemeState(nextTheme);
    };

    applySystemTheme();
    media.addEventListener("change", applySystemTheme);
    return () => media.removeEventListener("change", applySystemTheme);
  }, []);

  const setTheme = useCallback((nextTheme: Theme) => {
    hasExplicitChoice.current = true;
    document.documentElement.dataset.theme = nextTheme;
    setThemeState(nextTheme);
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch (error) {
      console.error("Unable to save the theme preference.", error);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }
  return context;
}
