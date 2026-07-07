"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import {
  getPreferredTheme,
  isDarkTheme,
  THEME_CHANGE_EVENT,
  Theme,
  toggleTheme,
} from "@/utils/theme";

export default function ThemeToggle({ variant = "sidebar", className = "" }) {
  const [theme, setTheme] = useState(Theme.LIGHT);

  useEffect(() => {
    setTheme(getPreferredTheme());
    function handleChange() {
      setTheme(isDarkTheme() ? Theme.DARK : Theme.LIGHT);
    }
    window.addEventListener(THEME_CHANGE_EVENT, handleChange);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handleChange);
  }, []);

  const isDark = theme === Theme.DARK;
  const label = isDark ? "Light mode" : "Dark mode";

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Chuyển sang light mode" : "Chuyển sang dark mode"}
        title={label}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-muted hover:bg-surface-muted hover:text-ink transition-colors ${className}`}
      >
        <Icon icon={isDark ? "lucide:sun" : "lucide:moon"} className="w-5 h-5 shrink-0" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Chuyển sang light mode" : "Chuyển sang dark mode"}
      title={label}
      className={`flex items-center justify-center w-10 h-10 rounded-lg border border-border-muted bg-surface-elevated text-ink hover:bg-surface-muted transition-colors ${className}`}
    >
      <Icon icon={isDark ? "lucide:sun" : "lucide:moon"} className="w-5 h-5" />
    </button>
  );
}
