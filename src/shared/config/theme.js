const STORAGE_KEY = "vcl:theme";
const CHANGE_EVENT = "vcl:theme-changed";

export const Theme = {
  LIGHT: "light",
  DARK: "dark",
};

/** Bảng màu dark mode — pastel neon. */
export const darkPalette = {
  lavender: "#B983FF",
  cornflower: "#94B3FD",
  sky: "#94DAFF",
  cyan: "#99FEFF",
};

export function getStoredTheme() {
  if (typeof window === "undefined") return null;

  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === Theme.LIGHT || value === Theme.DARK) return value;
  } catch {
    return null;
  }

  return null;
}

export function getPreferredTheme() {
  if (typeof window === "undefined") return Theme.LIGHT;

  const stored = getStoredTheme();
  if (stored) return stored;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? Theme.DARK : Theme.LIGHT;
}

export function isDarkTheme() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

/**
 * @param {"light" | "dark" | null} theme — null = xóa ghi đè, dùng system
 */
export function setTheme(theme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  if (theme === null) {
    localStorage.removeItem(STORAGE_KEY);
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? Theme.DARK
      : Theme.LIGHT;
    root.classList.toggle("dark", preferred === Theme.DARK);
  } else {
    localStorage.setItem(STORAGE_KEY, theme);
    root.classList.toggle("dark", theme === Theme.DARK);
  }

  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: getPreferredTheme() }));
}

export function toggleTheme() {
  setTheme(isDarkTheme() ? Theme.LIGHT : Theme.DARK);
}

export { CHANGE_EVENT as THEME_CHANGE_EVENT };
