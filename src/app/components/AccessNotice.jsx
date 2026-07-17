"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import styles from "./AccessNotice.module.scss";

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
    <div role="alert" className={styles.alert}>
      <p className={styles.message}>{message}</p>
      <button
        type="button"
        onClick={() => setMessage("")}
        className={styles.closeBtn}
        aria-label="Đóng thông báo"
      >
        <Icon icon="lucide:x" className={styles.closeIcon} />
      </button>
    </div>
  );
}
