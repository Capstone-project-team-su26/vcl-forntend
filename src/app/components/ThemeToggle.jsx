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
import styles from "./ThemeToggle.module.scss";

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
        className={`${styles.sidebarBtn} ${className}`}
      >
        <Icon icon={isDark ? "lucide:sun" : "lucide:moon"} className={styles.icon} />
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
      className={`${styles.compactBtn} ${className}`}
    >
      <Icon icon={isDark ? "lucide:sun" : "lucide:moon"} className={styles.icon} />
    </button>
  );
}
