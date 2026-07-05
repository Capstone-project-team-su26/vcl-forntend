"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const FORBIDDEN_FLASH_KEY = "vcl_forbidden_flash";
const AUTO_DISMISS_MS = 5000;

export default function AccessNotice() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [message, setMessage] = useState("");

  useEffect(() => {
    let notice = "";

    if (searchParams.get("error") === "forbidden") {
      notice = "Bạn không có quyền truy cập trang này.";
      router.replace(pathname);
    }

    try {
      sessionStorage.removeItem(FORBIDDEN_FLASH_KEY);
    } catch {
      // ignore
    }

    if (notice) {
      setMessage(notice);
    }
  }, [searchParams, router, pathname]);

  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => setMessage(""), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div
      role="alert"
      className="fixed top-4 left-1/2 z-[10000] -translate-x-1/2 max-w-md w-[calc(100%-2rem)] rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger shadow-lg flex items-start gap-3"
    >
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={() => setMessage("")}
        className="shrink-0 p-1 rounded-md hover:bg-danger/10"
        aria-label="Đóng thông báo"
      >
        <Icon icon="lucide:x" className="w-4 h-4" />
      </button>
    </div>
  );
}
