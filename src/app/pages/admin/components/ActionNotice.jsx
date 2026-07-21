"use client";

import { Icon } from "@iconify/react";
import { useEffect } from "react";

const AUTO_DISMISS_MS = 5000;

/**
 * Banner thông báo thành công / lỗi trên trang quản trị tài khoản.
 * @param {{ message: string, tone?: "success" | "danger", onDismiss: () => void }} props
 */
export default function ActionNotice({ message, tone = "success", onDismiss }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => onDismiss(), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
    // chỉ reset khi đổi nội dung thông báo
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onDismiss thường inline
  }, [message]);

  if (!message) return null;

  const isDanger = tone === "danger";

  return (
    <div
      role="alert"
      className={`rounded-lg border px-4 py-3 text-sm flex items-start gap-3 ${
        isDanger
          ? "border-danger/30 bg-danger/5 text-danger"
          : "border-success/30 bg-success-bg text-success-text"
      }`}
    >
      <Icon
        icon={isDanger ? "lucide:circle-alert" : "lucide:circle-check"}
        className="w-4 h-4 mt-0.5 shrink-0"
      />
      <p className="flex-1 leading-relaxed">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 p-0.5 rounded hover:opacity-80"
        aria-label="Đóng thông báo"
      >
        <Icon icon="lucide:x" className="w-4 h-4" />
      </button>
    </div>
  );
}
