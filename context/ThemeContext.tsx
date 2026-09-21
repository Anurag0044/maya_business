"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    // Night mode is the strict default.
    // Clean up any stale localStorage override so light mode is never permanently stuck.
    try {
      localStorage.removeItem("maya-theme");
      const sessionTheme = sessionStorage.getItem("maya-theme") as Theme | null;
      if (sessionTheme === "light") {
        setThemeState("light");
        document.documentElement.classList.add("light");
        document.documentElement.setAttribute("data-theme", "light");
        return;
      }
    } catch {
      // ignore
    }

    setThemeState("dark");
    document.documentElement.classList.remove("light");
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      sessionStorage.setItem("maya-theme", newTheme);
    } catch {
      // ignore in incognito or restricted mode
    }
    document.documentElement.classList.toggle("light", newTheme === "light");
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "dark" as Theme,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
}
