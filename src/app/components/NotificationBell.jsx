"use client";

import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

/**
 * Header notification bell. Items optional — empty shows a clear empty state.
 * @param {{ items?: Array<{ id: string, title: string, body?: string, createdAt?: string, unread?: boolean }> }} props
 */
export default function NotificationBell({ items = [] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const unreadCount = items.filter((n) => n.unread).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 text-muted hover:text-ink"
        aria-label="Thông báo"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Icon icon="lucide:bell" className="w-5 h-5" />
        {unreadCount > 0 ? (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-surface-elevated rounded-xl border border-border-muted shadow-lg z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border-muted">
            <p className="text-sm font-bold text-ink">Thông báo</p>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Icon
                icon="lucide:bell-off"
                className="w-8 h-8 text-faint mx-auto mb-2"
                aria-hidden
              />
              <p className="text-sm text-muted">Bạn không có thông báo nào</p>
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto custom-scrollbar py-1">
              {items.map((item) => (
                <li key={item.id}>
                  <div
                    role="menuitem"
                    className={`px-4 py-3 border-b border-border-muted last:border-b-0 ${
                      item.unread ? "bg-primary/5" : ""
                    }`}
                  >
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    {item.body ? (
                      <p className="text-xs text-muted mt-0.5 line-clamp-2">{item.body}</p>
                    ) : null}
                    {item.createdAt ? (
                      <p className="text-[10px] text-faint mt-1">{item.createdAt}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
