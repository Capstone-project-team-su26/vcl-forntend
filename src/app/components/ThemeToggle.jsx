"use client";
import { jsx } from "react/jsx-runtime";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import {
  getPreferredTheme,
  isDarkTheme,
  THEME_CHANGE_EVENT,
  Theme,
  toggleTheme
} from "@/utils/theme";
function ThemeToggle() {
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
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: toggleTheme,
      "aria-label": isDark ? "Chuy\u1EC3n sang light mode" : "Chuy\u1EC3n sang dark mode",
      className: "fixed bottom-4 left-4 z-9999 flex items-center justify-center w-10 h-10 rounded-lg border border-border-muted bg-white dark:bg-surface-elevated text-ink shadow-lg hover:bg-surface transition-colors",
      title: isDark ? "Light mode" : "Dark mode",
      children: /* @__PURE__ */ jsx(Icon, { icon: isDark ? "lucide:sun" : "lucide:moon", className: "w-5 h-5" })
    }
  );
}
export {
  ThemeToggle as default
};
