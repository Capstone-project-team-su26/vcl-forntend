"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import {
  getPreferredTheme,
  isDarkTheme,
  THEME_CHANGE_EVENT,
  Theme,
  toggleTheme,
} from "@/shared/config/theme";

export default function ThemeToggle() {
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

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Chuyển sang light mode" : "Chuyển sang dark mode"}
      className="fixed bottom-4 left-4 z-9999 flex items-center justify-center w-10 h-10 rounded-lg border border-border-muted bg-white dark:bg-surface-elevated text-ink shadow-lg hover:bg-surface transition-colors"
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <Icon icon={isDark ? "lucide:sun" : "lucide:moon"} className="w-5 h-5" />
    </button>
  );
}
