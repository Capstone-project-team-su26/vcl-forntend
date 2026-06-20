"use client";

import { useEffect } from "react";
import { getPreferredTheme, Theme } from "@/shared/config/theme";

export default function ThemeProvider({ children }) {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", getPreferredTheme() === Theme.DARK);
  }, []);

  return children;
}
