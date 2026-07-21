"use client";

import { Icon } from "@iconify/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const ToastContext = createContext(null);

/** @type {null | ((toast: { message: string, type?: string, duration?: number }) => void)} */
let pushExternal = null;

/**
 * Imperative toast API (works outside React components once provider is mounted).
 * @param {string} message
 * @param {{ type?: "success" | "error" | "info", duration?: number }} [options]
 */
export function toast(message, options = {}) {
  pushExternal?.({ message, type: options.type ?? "info", duration: options.duration });
}

toast.success = (message, duration) =>
  toast(message, { type: "success", duration });
toast.error = (message, duration) =>
  toast(message, { type: "error", duration });
toast.info = (message, duration) =>
  toast(message, { type: "info", duration });

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      success: toast.success,
      error: toast.error,
      info: toast.info,
      push: toast,
    };
  }
  return ctx;
}

const TYPE_STYLES = {
  success:
    "border-success/40 bg-success-bg text-success-text shadow-lg shadow-black/5",
  error: "border-danger/40 bg-danger/10 text-danger shadow-lg shadow-black/5",
  info: "border-border-muted bg-surface-elevated text-ink shadow-lg shadow-black/10",
};

const TYPE_ICONS = {
  success: "lucide:check-circle-2",
  error: "lucide:alert-circle",
  info: "lucide:info",
};

function ToastItem({ item, onDismiss }) {
  const type = item.type in TYPE_STYLES ? item.type : "info";

  return (
    <div
      role="status"
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm ${TYPE_STYLES[type]}`}
    >
      <Icon icon={TYPE_ICONS[type]} className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <p className="flex-1 font-medium leading-snug">{item.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        className="shrink-0 rounded-md p-0.5 opacity-60 hover:opacity-100"
        aria-label="Đóng thông báo"
      >
        <Icon icon="lucide:x" className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const dismiss = useCallback((id) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    ({ message, type = "info", duration = 3500 }) => {
      if (!message) return;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setItems((current) => [...current.slice(-4), { id, message, type, duration }]);
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  const api = {
    push,
    success: (message, duration) => push({ message, type: "success", duration }),
    error: (message, duration) => push({ message, type: "error", duration }),
    info: (message, duration) => push({ message, type: "info", duration }),
  };

  useEffect(() => {
    pushExternal = push;
    return () => {
      pushExternal = null;
    };
  }, [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-100 flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
        aria-live="polite"
        aria-relevant="additions"
      >
        {items.map((item) => (
          <ToastItem key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
