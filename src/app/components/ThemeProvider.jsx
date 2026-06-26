"use client";
import { useEffect } from "react";
import { getPreferredTheme, Theme } from "@/utils/theme";
function ThemeProvider({ children }) {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", getPreferredTheme() === Theme.DARK);
  }, []);
  return children;
}
export {
  ThemeProvider as default
};
