"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/shared/hooks/useAuth";

type UserNavMenuProps = {
  displayName?: string;
  roleLabel?: string;
  className?: string;
};

export default function UserNavMenu({
  displayName = "User",
  roleLabel = "USER",
  className = "",
}: UserNavMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { session, isLoggedIn, logout } = useAuth();

  const name = session?.displayName || displayName;
  const role = session?.role || roleLabel;
  const email = session?.email;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-ink leading-none">{name}</p>
          <p className="text-[10px] font-bold text-faint tracking-wider mt-1">{role}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center shrink-0">
          <Icon icon="lucide:user" className="w-5 h-5 text-insight" />
        </div>
        <Icon
          icon="lucide:chevron-down"
          className={`w-4 h-4 text-muted hidden sm:block transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 bg-surface-elevated rounded-xl border border-border-muted shadow-lg py-2 z-50"
        >
          <div className="px-4 py-3 border-b border-border-muted">
            <p className="text-sm font-bold text-ink truncate">{name}</p>
            {email ? (
              <p className="text-xs text-muted truncate mt-0.5">{email}</p>
            ) : (
              <p className="text-[10px] font-bold text-faint tracking-wider mt-1">{role}</p>
            )}
          </div>

          {isLoggedIn ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger/5 transition-colors"
            >
              <Icon icon="lucide:log-out" className="w-4 h-4" />
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-secondary hover:bg-primary/10 transition-colors"
            >
              <Icon icon="lucide:log-in" className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
