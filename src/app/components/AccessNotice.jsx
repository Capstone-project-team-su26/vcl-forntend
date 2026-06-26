"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const FORBIDDEN_FLASH_KEY = "vcl_forbidden_flash";

export default function AccessNotice() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [message, setMessage] = useState("");

  useEffect(() => {
    let notice = "";

    if (searchParams.get("error") === "forbidden") {
      notice = "Bạn không có quyền truy cập trang này.";
    }

    try {
      const raw = sessionStorage.getItem(FORBIDDEN_FLASH_KEY);
      if (raw) {
        const flash = JSON.parse(raw);
        if (flash?.message && Date.now() - (flash.at || 0) < 60_000) {
          notice = flash.message;
        }
        sessionStorage.removeItem(FORBIDDEN_FLASH_KEY);
      }
    } catch {
      sessionStorage.removeItem(FORBIDDEN_FLASH_KEY);
    }

    if (notice) {
      setMessage(notice);
      if (searchParams.get("error")) {
        router.replace(pathname);
      }
    }
  }, [searchParams, router, pathname]);

  if (!message) return null;

  return (
    <div
      role="alert"
      className="fixed top-4 left-1/2 z-[10000] -translate-x-1/2 max-w-md w-[calc(100%-2rem)] rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger shadow-lg"
    >
      {message}
    </div>
  );
}
