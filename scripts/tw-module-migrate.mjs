/**
 * ponytail: convert remaining Tailwind className strings → colocated CSS modules.
 * Usage: bun run scripts/tw-module-migrate.mjs [--dry] <file-or-dir>...
 */
import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { basename, dirname, join, relative } from "path";

const ROOT = join(import.meta.dir, "..");
const DRY = process.argv.includes("--dry");
const targets = process.argv.slice(2).filter((a) => a !== "--dry");

const KEEP = new Set([
  "input-focus-ring",
  "form-select",
  "btn-destructive",
  "status-badge",
  "glass-card",
  "auth-gradient-bg",
  "btn-delete-icon",
  "custom-scrollbar",
  "no-print",
  "quotation-locked-field",
  "table-row-hover",
  "step-number",
  "active-nav-item",
]);

const SPACE = {
  0: "0",
  px: "1px",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  11: "2.75rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  28: "7rem",
  32: "8rem",
  36: "9rem",
  40: "10rem",
  44: "11rem",
  48: "12rem",
  52: "13rem",
  56: "14rem",
  60: "15rem",
  64: "16rem",
  72: "18rem",
  80: "20rem",
  96: "24rem",
};

const THEME_COLOR = {
  primary: "var(--theme-primary)",
  "primary-hover": "var(--theme-primary-hover)",
  secondary: "var(--theme-secondary)",
  "secondary-hover": "var(--theme-secondary-hover)",
  accent: "var(--theme-accent)",
  "accent-subtle": "var(--theme-accent-subtle)",
  insight: "var(--theme-insight)",
  ink: "var(--theme-ink)",
  "ink-deep": "var(--theme-ink-deep)",
  muted: "var(--theme-muted)",
  nav: "var(--theme-nav)",
  subtle: "var(--theme-subtle)",
  faint: "var(--theme-faint)",
  border: "var(--theme-border)",
  "border-muted": "var(--theme-border-muted)",
  surface: "var(--theme-surface)",
  "surface-elevated": "var(--theme-surface-elevated)",
  "surface-alt": "var(--theme-surface-alt)",
  "surface-muted": "var(--theme-surface-muted)",
  "surface-soft": "var(--theme-surface-soft)",
  "surface-panel": "var(--theme-surface-panel)",
  "surface-tint": "var(--theme-surface-tint)",
  danger: "var(--theme-danger)",
  "danger-bg": "var(--theme-danger-bg)",
  "danger-border": "var(--theme-danger-border)",
  "danger-hover-bg": "var(--theme-danger-hover-bg)",
  success: "var(--theme-success)",
  "success-bg": "var(--theme-success-bg)",
  "success-text": "var(--theme-success-text)",
  warning: "var(--theme-warning-text)",
  "warning-bg": "var(--theme-warning-bg)",
  "warning-text": "var(--theme-warning-text)",
  info: "var(--theme-info-text)",
  "info-bg": "var(--theme-info-bg)",
  "info-text": "var(--theme-info-text)",
  background: "var(--theme-background)",
  foreground: "var(--theme-foreground)",
  "on-solid": "var(--theme-on-solid)",
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
  current: "currentColor",
  gray: "#9ca3af",
  "gray-50": "#f9fafb",
  "gray-100": "#f3f4f6",
  "gray-200": "#e5e7eb",
};

const MEDIA = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
};

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.jsx?$/.test(name)) out.push(p);
  }
  return out;
}

function space(v) {
  if (v == null) return null;
  if (SPACE[v] != null) return SPACE[v];
  if (v === "1/2") return "50%";
  if (v === "1/3") return "33.333333%";
  if (v === "2/3") return "66.666667%";
  if (v === "1/4") return "25%";
  if (v === "3/4") return "75%";
  if (v === "full") return "100%";
  if (/^\d+(\.\d+)?$/.test(v)) return `${Number(v) * 0.25}rem`;
  if (v.endsWith("%")) return v;
  if (v.startsWith("[") && v.endsWith("]")) return v.slice(1, -1).replace(/_/g, " ");
  return null;
}

function colorValue(raw) {
  if (!raw) return null;
  if (raw.startsWith("[") && raw.endsWith("]")) return raw.slice(1, -1);
  const m = raw.match(/^(.+?)\/(\d+)$/);
  if (m) {
    const base = THEME_COLOR[m[1]] || (m[1].startsWith("#") ? m[1] : null);
    if (!base) return null;
    if (base === "transparent") return base;
    return `color-mix(in srgb, ${base} ${m[2]}%, transparent)`;
  }
  if (THEME_COLOR[raw]) return THEME_COLOR[raw];
  if (raw.startsWith("#")) return raw;
  return null;
}

function parseToken(token) {
  let rest = token;
  let variant = null;
  let state = null;

  const variantMatch = rest.match(/^(sm|md|lg|xl|2xl):(.+)$/);
  if (variantMatch) {
    variant = variantMatch[1];
    rest = variantMatch[2];
  }

  const stateMatch = rest.match(/^(hover|focus|active|disabled|group-hover|placeholder|last):(.+)$/);
  if (stateMatch) {
    state = stateMatch[1];
    rest = stateMatch[2];
  }

  return { variant, state, util: rest };
}

function utilToDecls(util) {
  const decls = [];
  const push = (prop, val) => {
    if (val != null) decls.push([prop, val]);
  };

  // display / flex / grid
  if (util === "block") push("display", "block");
  else if (util === "inline-block") push("display", "inline-block");
  else if (util === "inline") push("display", "inline");
  else if (util === "flex") push("display", "flex");
  else if (util === "inline-flex") push("display", "inline-flex");
  else if (util === "grid") push("display", "grid");
  else if (util === "hidden") push("display", "none");
  else if (util === "contents") push("display", "contents");
  else if (util === "flex-col") push("flex-direction", "column");
  else if (util === "flex-row") push("flex-direction", "row");
  else if (util === "flex-wrap") push("flex-wrap", "wrap");
  else if (util === "flex-nowrap") push("flex-wrap", "nowrap");
  else if (util === "flex-1") {
    push("flex", "1 1 0%");
  } else if (util === "flex-shrink-0" || util === "shrink-0") push("flex-shrink", "0");
  else if (util === "shrink") push("flex-shrink", "1");
  else if (util === "grow") push("flex-grow", "1");
  else if (util === "grow-0") push("flex-grow", "0");
  else if (util === "items-start") push("align-items", "flex-start");
  else if (util === "items-center") push("align-items", "center");
  else if (util === "items-end") push("align-items", "flex-end");
  else if (util === "items-baseline") push("align-items", "baseline");
  else if (util === "items-stretch") push("align-items", "stretch");
  else if (util === "justify-start") push("justify-content", "flex-start");
  else if (util === "justify-center") push("justify-content", "center");
  else if (util === "justify-end") push("justify-content", "flex-end");
  else if (util === "justify-between") push("justify-content", "space-between");
  else if (util === "justify-around") push("justify-content", "space-around");
  else if (util === "self-start") push("align-self", "flex-start");
  else if (util === "self-center") push("align-self", "center");
  else if (util === "self-end") push("align-self", "flex-end");
  else if (util === "self-stretch") push("align-self", "stretch");
  else if (util.startsWith("gap-")) push("gap", space(util.slice(4)));
  else if (util.startsWith("space-x-")) {
    const s = space(util.slice(7));
    decls.push(["& > :not([hidden]) ~ :not([hidden])", { "margin-left": s }]);
  } else if (util.startsWith("space-y-")) {
    const s = space(util.slice(7));
    decls.push(["& > :not([hidden]) ~ :not([hidden])", { "margin-top": s }]);
  } else if (util.startsWith("-space-x-")) {
    const s = space(util.slice(8));
    decls.push(["& > :not([hidden]) ~ :not([hidden])", { "margin-left": `-${s}` }]);
  } else if (util.startsWith("grid-cols-")) {
    const n = util.slice(10);
    if (n === "none") push("grid-template-columns", "none");
    else if (n.startsWith("[")) push("grid-template-columns", n.slice(1, -1).replace(/_/g, " "));
    else push("grid-template-columns", `repeat(${n}, minmax(0, 1fr))`);
  } else if (util.startsWith("col-span-")) {
    const n = util.slice(9);
    push("grid-column", n === "full" ? "1 / -1" : `span ${n} / span ${n}`);
  }
  // sizing
  else if (util === "w-full") push("width", "100%");
  else if (util === "w-screen") push("width", "100vw");
  else if (util === "w-auto") push("width", "auto");
  else if (util === "w-fit") push("width", "fit-content");
  else if (util.startsWith("w-")) push("width", space(util.slice(2)) || util.slice(2));
  else if (util === "h-full") push("height", "100%");
  else if (util === "h-screen") push("height", "100vh");
  else if (util === "h-auto") push("height", "auto");
  else if (util === "h-fit") push("height", "fit-content");
  else if (util.startsWith("h-")) push("height", space(util.slice(2)) || util.slice(2));
  else if (util === "min-h-screen") push("min-height", "100vh");
  else if (util === "min-h-full") push("min-height", "100%");
  else if (util === "min-w-0") push("min-width", "0");
  else if (util.startsWith("min-h-")) push("min-height", space(util.slice(6)) || util.slice(6));
  else if (util.startsWith("min-w-")) push("min-width", space(util.slice(6)) || util.slice(6));
  else if (util === "max-w-none") push("max-width", "none");
  else if (util === "max-w-full") push("max-width", "100%");
  else if (util === "max-w-md") push("max-width", "28rem");
  else if (util === "max-w-lg") push("max-width", "32rem");
  else if (util === "max-w-xl") push("max-width", "36rem");
  else if (util === "max-w-2xl") push("max-width", "42rem");
  else if (util === "max-w-3xl") push("max-width", "48rem");
  else if (util === "max-w-4xl") push("max-width", "56rem");
  else if (util === "max-w-5xl") push("max-width", "64rem");
  else if (util === "max-w-6xl") push("max-width", "72rem");
  else if (util === "max-w-7xl") push("max-width", "80rem");
  else if (util.startsWith("max-w-")) push("max-width", space(util.slice(6)) || util.slice(6));
  else if (util.startsWith("max-h-")) push("max-height", space(util.slice(6)) || util.slice(6));
  // spacing
  else if (util.startsWith("p-")) push("padding", space(util.slice(2)));
  else if (util.startsWith("px-")) {
    const s = space(util.slice(3));
    push("padding-left", s);
    push("padding-right", s);
  } else if (util.startsWith("py-")) {
    const s = space(util.slice(3));
    push("padding-top", s);
    push("padding-bottom", s);
  } else if (util.startsWith("pt-")) push("padding-top", space(util.slice(3)));
  else if (util.startsWith("pb-")) push("padding-bottom", space(util.slice(3)));
  else if (util.startsWith("pl-")) push("padding-left", space(util.slice(3)));
  else if (util.startsWith("pr-")) push("padding-right", space(util.slice(3)));
  else if (util.startsWith("m-")) push("margin", space(util.slice(2)));
  else if (util.startsWith("mx-")) {
    const s = space(util.slice(3));
    push("margin-left", s);
    push("margin-right", s);
  } else if (util.startsWith("my-")) {
    const s = space(util.slice(3));
    push("margin-top", s);
    push("margin-bottom", s);
  } else if (util.startsWith("mt-")) push("margin-top", space(util.slice(3)));
  else if (util.startsWith("mb-")) push("margin-bottom", space(util.slice(3)));
  else if (util.startsWith("ml-")) push("margin-left", space(util.slice(3)));
  else if (util.startsWith("mr-")) push("margin-right", space(util.slice(3)));
  else if (util === "-mx-1.5") {
    push("margin-left", "-0.375rem");
    push("margin-right", "-0.375rem");
  }
  // typography
  else if (util === "font-sans") push("font-family", "var(--font-geist-sans), ui-sans-serif, sans-serif");
  else if (util === "font-mono") push("font-family", "var(--font-geist-mono), ui-monospace, monospace");
  else if (util === "font-['Oswald']" || util === "font-[Oswald]")
    push("font-family", '"Oswald", ui-sans-serif, sans-serif');
  else if (util === "font-thin") push("font-weight", "100");
  else if (util === "font-light") push("font-weight", "300");
  else if (util === "font-normal") push("font-weight", "400");
  else if (util === "font-medium") push("font-weight", "500");
  else if (util === "font-semibold") push("font-weight", "600");
  else if (util === "font-bold") push("font-weight", "700");
  else if (util === "font-extrabold") push("font-weight", "800");
  else if (util === "font-black") push("font-weight", "900");
  else if (util === "italic") push("font-style", "italic");
  else if (util === "not-italic") push("font-style", "normal");
  else if (util === "uppercase") push("text-transform", "uppercase");
  else if (util === "lowercase") push("text-transform", "lowercase");
  else if (util === "capitalize") push("text-transform", "capitalize");
  else if (util === "underline") push("text-decoration-line", "underline");
  else if (util === "line-through") push("text-decoration-line", "line-through");
  else if (util === "no-underline") push("text-decoration-line", "none");
  else if (util === "truncate") {
    push("overflow", "hidden");
    push("text-overflow", "ellipsis");
    push("white-space", "nowrap");
  } else if (util === "whitespace-nowrap") push("white-space", "nowrap");
  else if (util === "whitespace-pre-wrap") push("white-space", "pre-wrap");
  else if (util === "break-words") push("overflow-wrap", "break-word");
  else if (util === "break-all") push("word-break", "break-all");
  else if (util === "text-left") push("text-align", "left");
  else if (util === "text-center") push("text-align", "center");
  else if (util === "text-right") push("text-align", "right");
  else if (util === "mx-auto") {
    push("margin-left", "auto");
    push("margin-right", "auto");
  } else if (util === "ml-auto") push("margin-left", "auto");
  else if (util === "mr-auto") push("margin-right", "auto");
  else if (util === "rounded-tr-2xl") push("border-top-right-radius", "1rem");
  else if (util === "rounded-br-2xl") push("border-bottom-right-radius", "1rem");
  else if (util === "rounded-bl-2xl") push("border-bottom-left-radius", "1rem");
  else if (util === "rounded-tl-2xl") push("border-top-left-radius", "1rem");
  else if (util === "rounded-tr-lg") push("border-top-right-radius", "0.5rem");
  else if (util === "rounded-br-lg") push("border-bottom-right-radius", "0.5rem");
  else if (util === "rounded-bl-lg") push("border-bottom-left-radius", "0.5rem");
  else if (util === "rounded-tl-lg") push("border-top-left-radius", "0.5rem");
  else if (util === "leading-none") push("line-height", "1");
  else if (util === "leading-tight") push("line-height", "1.25");
  else if (util === "leading-snug") push("line-height", "1.375");
  else if (util === "leading-normal") push("line-height", "1.5");
  else if (util === "leading-relaxed") push("line-height", "1.625");
  else if (util.startsWith("leading-[") && util.endsWith("]")) {
    push("line-height", util.slice("leading-[".length, -1));
  } else if (util === "tracking-tight") push("letter-spacing", "-0.025em");
  else if (util === "tracking-normal") push("letter-spacing", "0");
  else if (util === "tracking-wide") push("letter-spacing", "0.025em");
  else if (util === "tracking-wider") push("letter-spacing", "0.05em");
  else if (util === "tracking-widest") push("letter-spacing", "0.1em");
  else if (util.startsWith("tracking-[") && util.endsWith("]")) {
    push("letter-spacing", util.slice("tracking-[".length, -1));
  } else if (util === "text-xs") push("font-size", "0.75rem");
  else if (util === "text-sm") push("font-size", "0.875rem");
  else if (util === "text-base") push("font-size", "1rem");
  else if (util === "text-lg") push("font-size", "1.125rem");
  else if (util === "text-xl") push("font-size", "1.25rem");
  else if (util === "text-2xl") push("font-size", "1.5rem");
  else if (util === "text-3xl") push("font-size", "1.875rem");
  else if (util === "text-4xl") push("font-size", "2.25rem");
  else if (util.startsWith("text-[") && util.endsWith("]")) {
    const inner = util.slice("text-[".length, -1);
    if (/^\d/.test(inner) || inner.endsWith("px") || inner.endsWith("rem") || inner.endsWith("em"))
      push("font-size", inner);
    else {
      const c = colorValue(inner);
      if (c) push("color", c);
    }
  } else if (util.startsWith("shadow-[") && util.endsWith("]")) {
    push("box-shadow", util.slice("shadow-[".length, -1).replace(/_/g, " "));
  } else if (util.startsWith("text-")) {
    const c = colorValue(util.slice(5));
    if (c) push("color", c);
  }
  // background
  else if (util.startsWith("bg-gradient-to-")) {
    const dir = { r: "to right", l: "to left", t: "to top", b: "to bottom", br: "to bottom right" }[
      util.slice(15)
    ];
    push("background-image", `linear-gradient(${dir || "to right"}, var(--tw-gradient-stops))`);
  } else if (util.startsWith("from-")) {
    const c = colorValue(util.slice(5));
    if (c) push("--tw-gradient-from", c);
    push("--tw-gradient-stops", "var(--tw-gradient-from), var(--tw-gradient-to, transparent)");
  } else if (util.startsWith("via-")) {
    const c = colorValue(util.slice(4));
    if (c)
      push(
        "--tw-gradient-stops",
        `var(--tw-gradient-from), ${c}, var(--tw-gradient-to, transparent)`
      );
  } else if (util.startsWith("to-")) {
    const c = colorValue(util.slice(3));
    if (c) push("--tw-gradient-to", c);
  } else if (util.startsWith("bg-")) {
    const c = colorValue(util.slice(3));
    if (c) push("background-color", c);
  }
  // border
  else if (util === "border") {
    push("border-width", "1px");
    push("border-style", "solid");
  } else if (util === "border-0") push("border-width", "0");
  else if (util === "border-2") {
    push("border-width", "2px");
    push("border-style", "solid");
  } else if (util === "border-t") {
    push("border-top-width", "1px");
    push("border-top-style", "solid");
  } else if (util === "border-b") {
    push("border-bottom-width", "1px");
    push("border-bottom-style", "solid");
  } else if (util === "border-r") {
    push("border-right-width", "1px");
    push("border-right-style", "solid");
  } else if (util === "border-l") {
    push("border-left-width", "1px");
    push("border-left-style", "solid");
  } else if (util.startsWith("border-") && !util.startsWith("border-[")) {
    const c = colorValue(util.slice(7));
    if (c) push("border-color", c);
  } else if (util === "rounded") push("border-radius", "0.25rem");
  else if (util === "rounded-md") push("border-radius", "0.375rem");
  else if (util === "rounded-lg") push("border-radius", "0.5rem");
  else if (util === "rounded-xl") push("border-radius", "0.75rem");
  else if (util === "rounded-2xl") push("border-radius", "1rem");
  else if (util === "rounded-full") push("border-radius", "9999px");
  else if (util === "rounded-none") push("border-radius", "0");
  // effects / position
  else if (util === "shadow-sm")
    push("box-shadow", "0 1px 2px color-mix(in srgb, var(--theme-secondary) 6%, transparent)");
  else if (util === "shadow")
    push("box-shadow", "0 1px 3px color-mix(in srgb, var(--theme-secondary) 10%, transparent)");
  else if (util === "shadow-md")
    push("box-shadow", "0 4px 6px color-mix(in srgb, var(--theme-secondary) 10%, transparent)");
  else if (util === "shadow-lg")
    push("box-shadow", "0 10px 15px color-mix(in srgb, var(--theme-secondary) 12%, transparent)");
  else if (util === "shadow-xl")
    push("box-shadow", "0 25px 50px -12px color-mix(in srgb, var(--theme-secondary) 25%, transparent)");
  else if (util.startsWith("shadow-[")) push("box-shadow", util.slice(8, -1).replace(/_/g, " "));
  else if (util === "ring-1") push("box-shadow", "0 0 0 1px var(--theme-primary)");
  else if (util.startsWith("ring-")) {
    const c = colorValue(util.slice(5));
    if (c) push("box-shadow", `0 0 0 1px ${c}`);
  } else if (util === "opacity-0") push("opacity", "0");
  else if (util === "opacity-50") push("opacity", "0.5");
  else if (util === "opacity-60") push("opacity", "0.6");
  else if (util === "opacity-90") push("opacity", "0.9");
  else if (util === "opacity-95") push("opacity", "0.95");
  else if (util === "opacity-100") push("opacity", "1");
  else if (util.startsWith("opacity-[")) push("opacity", util.slice(9, -1));
  else if (util === "pointer-events-none") push("pointer-events", "none");
  else if (util === "cursor-pointer") push("cursor", "pointer");
  else if (util === "cursor-not-allowed") push("cursor", "not-allowed");
  else if (util === "cursor-default") push("cursor", "default");
  else if (util === "select-none") push("user-select", "none");
  else if (util === "overflow-hidden") push("overflow", "hidden");
  else if (util === "overflow-auto") push("overflow", "auto");
  else if (util === "overflow-y-auto") push("overflow-y", "auto");
  else if (util === "overflow-x-auto") push("overflow-x", "auto");
  else if (util === "overflow-x-hidden") push("overflow-x", "hidden");
  else if (util === "relative") push("position", "relative");
  else if (util === "absolute") push("position", "absolute");
  else if (util === "fixed") push("position", "fixed");
  else if (util === "sticky") push("position", "sticky");
  else if (util === "inset-0") {
    push("top", "0");
    push("right", "0");
    push("bottom", "0");
    push("left", "0");
  } else if (util === "inset-y-0") {
    push("top", "0");
    push("bottom", "0");
  } else if (util === "top-0") push("top", "0");
  else if (util === "bottom-0") push("bottom", "0");
  else if (util === "left-0") push("left", "0");
  else if (util === "right-0") push("right", "0");
  else if (util.startsWith("top-")) push("top", space(util.slice(4)) || util.slice(4));
  else if (util.startsWith("bottom-")) push("bottom", space(util.slice(7)) || util.slice(7));
  else if (util.startsWith("left-")) push("left", space(util.slice(5)) || util.slice(5));
  else if (util.startsWith("right-")) push("right", space(util.slice(6)) || util.slice(6));
  else if (util === "z-10") push("z-index", "10");
  else if (util === "z-20") push("z-index", "20");
  else if (util === "z-40") push("z-index", "40");
  else if (util === "z-50") push("z-index", "50");
  else if (util.startsWith("z-[")) push("z-index", util.slice(3, -1));
  else if (util === "object-cover") push("object-fit", "cover");
  else if (util === "object-contain") push("object-fit", "contain");
  else if (util === "object-center") push("object-position", "center");
  else if (util === "backdrop-blur-sm") push("backdrop-filter", "blur(4px)");
  else if (util === "backdrop-blur") push("backdrop-filter", "blur(8px)");
  else if (util === "transition") push("transition", "all 0.15s ease");
  else if (util === "transition-colors")
    push("transition", "color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease");
  else if (util === "transition-opacity") push("transition", "opacity 0.15s ease");
  else if (util === "transition-transform") push("transition", "transform 0.15s ease");
  else if (util === "duration-200") push("transition-duration", "200ms");
  else if (util === "duration-300") push("transition-duration", "300ms");
  else if (util === "ease-in-out") push("transition-timing-function", "ease-in-out");
  else if (util === "transform") push("transform", "translateZ(0)");
  else if (util === "translate-x-0") push("transform", "translateX(0)");
  else if (util === "-translate-x-full") push("transform", "translateX(-100%)");
  else if (util === "translate-x-full") push("transform", "translateX(100%)");
  else if (util === "lg:translate-x-0") {
    /* handled via variant parse */
  } else if (util === "-translate-y-1/2") push("transform", "translateY(-50%)");
  else if (util === "translate-y-1/2") push("transform", "translateY(50%)");
  else if (util === "-translate-y-full") push("transform", "translateY(-100%)");
  else if (util === "w-90") push("width", "22.5rem");
  else if (util === "w-80") push("width", "20rem");
  else if (util === "table-cell") push("display", "table-cell");
  else if (util === "table-row") push("display", "table-row");
  else if (util === "divide-y") {
    decls.push([
      "& > :not([hidden]) ~ :not([hidden])",
      { "border-top-width": "1px", "border-top-style": "solid" },
    ]);
  } else if (util.startsWith("divide-")) {
    const c = colorValue(util.slice(7));
    if (c)
      decls.push([
        "& > :not([hidden]) ~ :not([hidden])",
        { "border-color": c },
      ]);
  } else if (util === "group") {
    /* marker class — no CSS */
  } else if (util === "animate-spin") {
    push("animation", "spin 1s linear infinite");
  } else if (util === "line-clamp-1") {
    push("display", "-webkit-box");
    push("-webkit-line-clamp", "1");
    push("-webkit-box-orient", "vertical");
    push("overflow", "hidden");
  } else if (util === "line-clamp-2") {
    push("display", "-webkit-box");
    push("-webkit-line-clamp", "2");
    push("-webkit-box-orient", "vertical");
    push("overflow", "hidden");
  } else if (util === "appearance-none") push("appearance", "none");
  else if (util === "outline-none") push("outline", "none");
  else if (util === "resize-y") push("resize", "vertical");
  else if (util === "resize-none") push("resize", "none");
  else if (util === "accent-primary") push("accent-color", "var(--theme-primary)");
  else return null;

  return decls.length ? decls : null;
}

function classNameToRules(classStr) {
  const tokens = classStr.split(/\s+/).filter(Boolean);
  const keep = [];
  const base = {};
  const byVariant = {};
  const byState = {};
  const nested = [];
  let unknown = [];

  for (const token of tokens) {
    if (KEEP.has(token)) {
      keep.push(token);
      continue;
    }
    if (token.startsWith("styles.") || token.startsWith("${")) continue;

    const { variant, state, util } = parseToken(token);
    const decls = utilToDecls(util);
    if (!decls) {
      unknown.push(token);
      continue;
    }

    const apply = (target) => {
      for (const [k, v] of decls) {
        if (typeof v === "object") nested.push({ sel: k, decls: v, variant, state });
        else target[k] = v;
      }
    };

    if (variant && state) {
      const key = `${variant}|${state}`;
      byState[key] ||= {};
      apply(byState[key]);
    } else if (variant) {
      byVariant[variant] ||= {};
      apply(byVariant[variant]);
    } else if (state) {
      byState[state] ||= {};
      apply(byState[state]);
    } else apply(base);
  }

  return { keep, base, byVariant, byState, nested, unknown };
}

function declsToScss(decls, indent = "  ") {
  return Object.entries(decls)
    .map(([k, v]) => `${indent}${k}: ${v};`)
    .join("\n");
}

function emitClass(name, parsed) {
  const lines = [`.${name} {`];
  if (Object.keys(parsed.base).length) lines.push(declsToScss(parsed.base));

  for (const [state, decls] of Object.entries(parsed.byState)) {
    if (state.includes("|")) {
      const [variant, st] = state.split("|");
      const media = MEDIA[variant];
      const sel = st === "placeholder" ? "&::placeholder" : `&:${st}`;
      lines.push(`  @media ${media} {`);
      lines.push(`    ${sel} {`);
      lines.push(declsToScss(decls, "      "));
      lines.push(`    }`);
      lines.push(`  }`);
    } else {
      const sel =
        state === "placeholder"
          ? "&::placeholder"
          : state === "last"
            ? "&:last-child"
            : `&:${state}`;
      lines.push(`  ${sel} {`);
      lines.push(declsToScss(decls, "    "));
      lines.push(`  }`);
    }
  }

  for (const [variant, decls] of Object.entries(parsed.byVariant)) {
    const media = MEDIA[variant];
    if (!media) continue;
    lines.push(`  @media ${media} {`);
    lines.push(declsToScss(decls, "    "));
    lines.push(`  }`);
  }

  for (const n of parsed.nested) {
    if (n.variant) {
      lines.push(`  @media ${MEDIA[n.variant]} {`);
      lines.push(`    ${n.sel} {`);
      lines.push(declsToScss(n.decls, "      "));
      lines.push(`    }`);
      lines.push(`  }`);
    } else if (n.state) {
      lines.push(`  &:${n.state} {`);
      lines.push(`    ${n.sel} {`);
      lines.push(declsToScss(n.decls, "      "));
      lines.push(`    }`);
      lines.push(`  }`);
    } else {
      lines.push(`  ${n.sel} {`);
      lines.push(declsToScss(n.decls, "    "));
      lines.push(`  }`);
    }
  }

  lines.push(`}`);
  if (parsed.base.animation?.includes("spin")) {
    lines.push(`@keyframes spin { to { transform: rotate(360deg); } }`);
  }
  return lines.join("\n");
}

function hashName(str) {
  const h = createHash("sha1").update(str).digest("hex").slice(0, 6);
  return `t${h}`;
}

function ensureStylesImport(content, moduleImport) {
  if (/from\s+["']\.\/[^"']+\.module\.scss["']/.test(content)) return content;
  const line = `import styles from "${moduleImport}";\n`;
  if (content.startsWith('"use client"') || content.startsWith("'use client'")) {
    const idx = content.indexOf("\n") + 1;
    return content.slice(0, idx) + line + content.slice(idx);
  }
  return line + content;
}

function replaceLiteral(content, literal, classExpr) {
  const esc = literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let out = content;
  out = out.replaceAll(`className="${literal}"`, `className={${classExpr}}`);
  out = out.replaceAll(`className='${literal}'`, `className={${classExpr}}`);
  out = out.replaceAll(`className: "${literal}"`, `className: ${classExpr}`);
  out = out.replaceAll(`className: '${literal}'`, `className: ${classExpr}`);
  out = out.replaceAll(`className={\`${literal}\`}`, `className={${classExpr}}`);
  out = out.replaceAll(`className: \`${literal}\``, `className: ${classExpr}`);
  // Inside mixed templates — replace static segment with ${styles.x}
  out = out.replace(new RegExp(`(className=\\{\`[^\\\`]*?)(${esc})([^\\\`]*?\`\\})`, "g"), (_, a, _lit, rest) => {
    // avoid double-wrapping if already ${styles.
    if (a.endsWith("${") || a.endsWith("${styles.")) return `${a}${_lit}${rest}`;
    return `${a}\${${classExpr}} ${rest}`.replace(/\$\{styles\.(\w+)\} \$\{styles\./, "${styles.$1} ${styles.");
  });
  // ternary arms inside className={...}
  out = out.replace(
    new RegExp(`(className=\\{(?:[^{}]|\\{[^}]*\\})*?)("${esc}")`, "g"),
    (full, pre) => {
      if (pre.includes(`styles.`)) {
        // still replace status fallbacks etc.
      }
      return `${pre}${classExpr}`;
    }
  );
  out = out.replace(new RegExp(`return \`${esc}\``, "g"), `return ${classExpr}`);
  out = out.replace(new RegExp(`return "${esc}"`, "g"), `return ${classExpr}`);
  return out;
}

function migrateFile(filePath, sharedImport = null) {
  let content = readFileSync(filePath, "utf8");
  const moduleFile = filePath.replace(/\.jsx?$/, ".module.scss");
  const moduleImport = `./${basename(moduleFile)}`;

  // collect unique pure string classNames (no ${})
  const literals = new Set();
  const re = /className(?:=|:)\s*(?:\{\s*)?(?:"([^"]+)"|'([^']+)'|`([^`$]+)`)/g;
  let m;
  while ((m = re.exec(content))) {
    const lit = m[1] || m[2] || m[3];
    if (!lit) continue;
    if (lit.includes("styles.")) continue;
    const tokens = lit.split(/\s+/).filter(Boolean);
    const tw = tokens.filter((t) => !KEEP.has(t));
    if (!tw.length) continue;
    // skip if looks like only keep + empty
    if (tw.some((t) => /^(flex|grid|gap-|p-|px-|py-|pt-|pb-|pl-|pr-|m-|mx-|my-|mt-|mb-|ml-|mr-|text-|bg-|rounded|border|w-|h-|space-|items-|justify-|relative|absolute|fixed|hidden|block|inline|min-|max-|overflow|shadow|font-|leading|tracking|opacity|cursor|z-|inset|sm:|md:|lg:|xl:|hover:|focus:|disabled:|divide-|table-|break-|translate|transform|duration|ease|transition)/.test(t))) {
      literals.add(lit);
    }
  }

  // Mixed templates: className={`STATIC ${expr}`} — convert STATIC prefix/suffix chunks
  const mixedRe = /className=\{`([^`]*?)`\}/g;
  while ((m = mixedRe.exec(content))) {
    const tpl = m[1];
    if (!tpl.includes("${")) continue;
    const staticParts = tpl.split(/\$\{[^}]+\}/g).map((s) => s.trim()).filter(Boolean);
    for (const part of staticParts) {
      const tokens = part.split(/\s+/).filter(Boolean);
      if (
        tokens.some((t) =>
          /^(flex|grid|gap-|p-|px-|py-|pt-|pb-|pl-|pr-|m-|mx-|my-|mt-|mb-|ml-|mr-|text-|bg-|rounded|border|w-|h-|space-|items-|justify-|relative|absolute|fixed|hidden|block|inline|min-|max-|overflow|shadow|font-|leading|tracking|opacity|cursor|z-|inset|sm:|md:|lg:|xl:|hover:|focus:|disabled:|divide-|table-|break-|translate|transform|duration|ease|transition)/.test(
            t
          )
        )
      ) {
        literals.add(part);
      }
    }
  }

  if (!literals.size) return { changed: false, file: filePath };

  const classMap = new Map(); // literal -> { name, keep, scss }
  const scssBlocks = [];
  const unknowns = [];

  for (const lit of [...literals].sort()) {
    const parsed = classNameToRules(lit);
    if (parsed.unknown.length) unknowns.push([lit, parsed.unknown]);
    const name = hashName(lit);
    classMap.set(lit, { name, keep: parsed.keep, parsed });
    scssBlocks.push(emitClass(name, parsed));
  }

  content = ensureStylesImport(content, moduleImport);

  // Fix local `styles` shadowing CSS module import (e.g. StatusBadge maps)
  if (/function\s+\w*[Bb]adge[\s\S]{0,200}?const styles\s*=/.test(content)) {
    content = content.replace(
      /(function\s+\w*[Bb]adge[\s\S]{0,200}?)const styles\s*=/,
      "$1const statusTone ="
    );
    content = content.replace(
      /(function\s+\w*[Bb]adge[\s\S]{0,800}?)styles\[/g,
      "$1statusTone["
    );
  }

  const sorted = [...classMap.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [lit, { name, keep }] of sorted) {
    const expr = keep.length
      ? `\`\${styles.${name}} ${keep.join(" ")}\``
      : `styles.${name}`;
    content = replaceLiteral(content, lit, expr);
  }

  let scssHeader = "";
  if (sharedImport) scssHeader = `@import "${sharedImport}";\n\n`;
  else if (existsSync(moduleFile)) {
    const existing = readFileSync(moduleFile, "utf8");
    const importLine = existing.split("\n").find((l) => l.startsWith("@import") || l.startsWith("@use"));
    if (importLine) scssHeader = `${importLine}\n\n`;
  }

  // If module already has semantic classes, append generated ones
  let scssOut = scssHeader + scssBlocks.join("\n\n") + "\n";
  if (existsSync(moduleFile)) {
    const existing = readFileSync(moduleFile, "utf8").trimEnd();
    const withoutDup = existing
      .split(/\n(?=\.[a-zA-Z])/)
      .filter((block) => !scssBlocks.some((b) => block.includes(b.split("\n")[0])));
    // simpler: append only new class names not present
    const missing = scssBlocks.filter((b) => {
      const n = b.match(/^\.(\w+)/)?.[1];
      return n && !existing.includes(`.${n} {`);
    });
    scssOut = existing + (missing.length ? "\n\n" + missing.join("\n\n") + "\n" : "\n");
  }

  if (!DRY) {
    writeFileSync(filePath, content);
    writeFileSync(moduleFile, scssOut);
  }

  return {
    changed: true,
    file: filePath,
    classes: classMap.size,
    unknowns,
  };
}

function resolveTargets(args) {
  const files = [];
  for (const a of args) {
    const p = join(ROOT, a);
    if (!existsSync(p)) {
      console.error("missing", a);
      continue;
    }
    if (statSync(p).isDirectory()) files.push(...walk(p));
    else files.push(p);
  }
  return files;
}

const files = resolveTargets(targets);
let changed = 0;
for (const f of files) {
  // skip already fully semantic pages we shouldn't overwrite heavily? migrate all with TW left
  const src = readFileSync(f, "utf8");
  if (!/(className|className:)/.test(src)) continue;
  const rel = relative(ROOT, f).replace(/\\/g, "/");
  // pick shared import hints
  let shared = null;
  if (/\/admin\/.+\/components\//.test(rel) && /FormModal/.test(rel)) shared = "../../components/admin-form-modal";
  else if (/\/admin\/.+\/components\//.test(rel) && /Page\.jsx$/.test(rel)) shared = "../../components/admin-crud-page";

  const result = migrateFile(f, shared);
  if (result.changed) {
    changed++;
    console.log("ok", result.classes, rel);
    if (result.unknowns?.length) {
      for (const [lit, unk] of result.unknowns.slice(0, 3)) {
        console.log("  ? unknown:", unk.join(", "), "in", lit.slice(0, 60));
      }
    }
  }
}
console.log(`Done. Migrated ${changed}/${files.length} files. dry=${DRY}`);
