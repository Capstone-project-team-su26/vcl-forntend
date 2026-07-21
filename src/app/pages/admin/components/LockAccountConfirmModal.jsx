"use client";

import { Icon } from "@iconify/react";

/**
 * Xác nhận khóa / mở khóa tài khoản (nhân viên hoặc khách).
 * @param {{ user: { name?: string, email?: string, status?: string } | null, pending?: boolean, onConfirm: () => void, onClose: () => void }} props
 */
export default function LockAccountConfirmModal({ user, pending, onConfirm, onClose }) {
  if (!user) return null;
  const isLocking = user.status === "ACTIVE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        aria-label="Đóng"
        onClick={pending ? undefined : onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lock-confirm-title"
        className="relative w-full max-w-md rounded-xl border border-border bg-surface shadow-xl p-5"
      >
        <div className="flex items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isLocking ? "bg-danger/10 text-danger" : "bg-success-bg text-success-text"
            }`}
          >
            <Icon icon={isLocking ? "lucide:lock" : "lucide:lock-open"} className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <h2 id="lock-confirm-title" className="text-base font-bold text-ink">
              {isLocking ? "Khóa tài khoản?" : "Mở khóa tài khoản?"}
            </h2>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              {isLocking
                ? "Tài khoản sẽ không đăng nhập được cho đến khi được mở khóa."
                : "Tài khoản sẽ đăng nhập lại được như bình thường."}
            </p>
            <div className="mt-3 rounded-lg border border-border-muted bg-surface px-3 py-2.5">
              <p className="text-sm font-semibold text-ink leading-snug">
                {user.name || "—"}
              </p>
              <p className="text-sm text-muted leading-snug mt-0.5">{user.email || "—"}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-border-muted text-sm font-semibold text-muted hover:text-ink hover:bg-surface-muted disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-bold text-white disabled:opacity-50 ${
              isLocking ? "bg-danger hover:opacity-90" : "bg-insight hover:bg-secondary"
            }`}
          >
            {pending ? (
              <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
            ) : (
              <Icon icon={isLocking ? "lucide:lock" : "lucide:lock-open"} className="w-4 h-4" />
            )}
            {pending ? "Đang xử lý..." : isLocking ? "Khóa tài khoản" : "Mở khóa"}
          </button>
        </div>
      </div>
    </div>
  );
}
