/**
 * SwiftShip design tokens.
 * Bảng màu chính: primary, secondary, accent, accent-subtle.
 * Các neutral/semantic bổ sung cho UI logistics.
 */
export const colors = {
  /* Brand palette */
  primary: "#9ECAD6",
  primaryHover: "#8dbbc8",
  secondary: "#748DAE",
  secondaryHover: "#637a99",
  accent: "#F5CBCB",
  accentSubtle: "#FFEAEA",

  /* Text */
  ink: "#16181D",
  inkDeep: "#171a1f",
  muted: "#575E6B",
  nav: "#343842",
  subtle: "#6B7280",
  faint: "#9CA3AF",

  /* Surfaces & borders */
  border: "#E0E2E6",
  borderMuted: "#E5E7EB",
  surface: "#F9FAFB",
  surfaceAlt: "#F4F9FA",
  surfaceMuted: "#f3f4f6",
  surfaceSoft: "#F8FAFB",
  surfacePanel: "#F5F7F9",
  surfaceTint: "#E9F3F6",

  /* Semantic */
  danger: "#D92644",
  success: "#22C358",
  insight: "#2C5B68",
  warningBg: "#FEF9C3",
  warningText: "#A16207",
  successBg: "#DCFCE7",
  successText: "#15803D",
  infoBg: "#DBEAFE",
  infoText: "#1D4ED8",
  white: "#ffffff",
  black: "#000000",

  /** Dark mode palette — pastel neon */
  darkPalette: {
    lavender: "#B983FF",
    cornflower: "#94B3FD",
    sky: "#94DAFF",
    cyan: "#99FEFF",
  },
};

/** Dùng khi cần truyền hex vào prop style (PricingCard, chart, v.v.). */
export default colors;
