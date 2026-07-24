"use client";

import { Icon } from "@iconify/react";
import { useEffect, useId, useRef, useState } from "react";

/**
 * Select theo theme app — thay native &lt;select&gt; (popup OS không sync dark mode).
 * options: [{ value, label }]
 */
export default function ThemeSelect({
  value,
  onChange,
  options,
  className = "",
  disabled = false,
  "aria-label": ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();
  const selected = options.find((option) => String(option.value) === String(value));
  const label = selected?.label ?? "—";

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function pick(nextValue) {
    onChange(nextValue);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className="form-select flex h-10 w-full cursor-pointer appearance-none items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="min-w-0 truncate">{label}</span>
        <Icon
          icon="lucide:chevron-down"
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-[60] max-h-60 overflow-auto rounded-lg border border-border-muted bg-surface-elevated py-1 shadow-lg"
        >
          {options.map((option) => {
            const isActive = String(option.value) === String(value);
            return (
              <li key={option.value === "" ? "__all__" : String(option.value)} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => pick(option.value)}
                  className={`flex w-full px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-secondary/15 font-semibold text-secondary"
                      : "text-ink hover:bg-surface-muted"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
