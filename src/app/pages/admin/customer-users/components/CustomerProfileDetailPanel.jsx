"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ActionNotice from "../../components/ActionNotice";
import LockAccountConfirmModal from "../../components/LockAccountConfirmModal";
import CustomerFormModal from "./CustomerFormModal";
import * as customerService from "@/modules/customers";
import * as userService from "@/modules/users";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";

const { CUSTOMER_STATUS_STYLES, formatCustomerStatus } = customerService;

const ACCOUNT_STATUS_LABEL = {
  ACTIVE: "Đang hoạt động",
  LOCKED: "Đã khóa",
  PENDING_VERIFICATION: "Chờ xác minh",
};

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-border-muted/60 last:border-0">
      <dt className="text-sm font-bold text-muted sm:w-40 shrink-0">{label}</dt>
      <dd className="text-sm font-medium text-ink break-all">{value || "—"}</dd>
    </div>
  );
}

export default function CustomerProfileDetailPanel({
  id,
  backHref = ROUTES.admin.customerUsers,
}) {
  const [customer, setCustomer] = useState(null);
  const [linkedUser, setLinkedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [lockPending, setLockPending] = useState(false);
  const [confirmLock, setConfirmLock] = useState(false);

  useEffect(() => {
    if (!id) return undefined;

    let active = true;

    async function load() {
      setIsLoading(true);
      setError("");
      setSuccessMessage("");
      try {
        const [data, users] = await Promise.all([
          customerService.getCustomer(id),
          userService.listUsers(),
        ]);
        if (!active) return;
        setCustomer(data);
        const link = customerService.findLinkedCustomerAccount(data, users);
        setLinkedUser(link?.user ?? null);
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id]);

  function handleUpdated(updated, message) {
    setCustomer(updated);
    setSuccessMessage(message || "Cập nhật hồ sơ thành công.");
    setError("");
  }

  async function handleLockToggle() {
    if (!linkedUser) return;
    setLockPending(true);
    setError("");
    setSuccessMessage("");
    try {
      if (linkedUser.status === "ACTIVE") {
        const response = await userService.lockUser(linkedUser.id);
        setLinkedUser((current) =>
          current ? { ...current, status: "LOCKED", lastSeen: "Đã khóa" } : current
        );
        setSuccessMessage(
          response?.message ||
            `Đã khóa tài khoản ${linkedUser.email || linkedUser.name || ""}.`.trim()
        );
      } else if (linkedUser.status === "LOCKED") {
        const response = await userService.unlockUser(linkedUser.id);
        setLinkedUser((current) =>
          current ? { ...current, status: "ACTIVE", lastSeen: "Vừa mở khóa" } : current
        );
        setSuccessMessage(
          response?.message ||
            `Đã mở khóa tài khoản ${linkedUser.email || linkedUser.name || ""}.`.trim()
        );
      }
      setConfirmLock(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLockPending(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted">
        <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin" />
        <p className="text-sm font-medium">Đang tải hồ sơ khách hàng...</p>
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="space-y-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          Quay lại danh sách
        </Link>
        <ActionNotice message={error} tone="danger" onDismiss={() => setError("")} />
      </div>
    );
  }

  if (!customer) return null;

  const canToggleLock =
    linkedUser && (linkedUser.status === "ACTIVE" || linkedUser.status === "LOCKED");
  const isLocking = linkedUser?.status === "ACTIVE";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink mb-4"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          Quay lại quản lý khách
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight">
                {customer.fullName}
              </h1>
              <span
                className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                  CUSTOMER_STATUS_STYLES[customer.status] || "bg-surface text-muted"
                }`}
              >
                {formatCustomerStatus(customer.status)}
              </span>
            </div>
            <p className="text-muted text-sm mt-1">
              <span className="font-mono text-ink">{customer.customerCode || "—"}</span>
              {customer.email ? (
                <>
                  <span className="mx-1.5 text-border">·</span>
                  {customer.email}
                </>
              ) : null}
              {customer.phone ? (
                <>
                  <span className="mx-1.5 text-border">·</span>
                  {customer.phone}
                </>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border-muted text-sm font-semibold text-ink hover:bg-surface-muted shrink-0"
          >
            <Icon icon="lucide:pencil" className="w-4 h-4" />
            Chỉnh sửa
          </button>
        </div>
      </div>

      <ActionNotice message={error} tone="danger" onDismiss={() => setError("")} />
      <ActionNotice
        message={successMessage}
        tone="success"
        onDismiss={() => setSuccessMessage("")}
      />

      <section className="rounded-xl border border-border-muted bg-surface-elevated p-6">
        <h2 className="text-lg font-bold text-ink mb-4">Thông tin hồ sơ</h2>
        <dl>
          <DetailRow label="Địa chỉ" value={customer.address} />
          <DetailRow label="Công ty" value={customer.companyName} />
          <DetailRow label="MST" value={customer.taxId} />
        </dl>
      </section>

      <section className="rounded-xl border border-border-muted bg-surface-elevated p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-ink">Tài khoản đăng nhập</h2>
            {linkedUser ? (
              <p className="text-sm text-muted mt-1">
                {ACCOUNT_STATUS_LABEL[linkedUser.status] || linkedUser.status}
                <span className="mx-1.5 text-border">·</span>
                <span className="font-mono text-xs break-all">{linkedUser.id}</span>
              </p>
            ) : (
              <p className="text-sm text-muted mt-1">
                Chưa gắn tài khoản (khớp email/SĐT hồ sơ).
              </p>
            )}
          </div>
          {canToggleLock ? (
            <button
              type="button"
              disabled={lockPending}
              onClick={() => setConfirmLock(true)}
              className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-bold text-white disabled:opacity-50 shrink-0 ${
                isLocking ? "bg-danger hover:opacity-90" : "bg-insight hover:bg-secondary"
              }`}
            >
              <Icon icon={isLocking ? "lucide:lock" : "lucide:lock-open"} className="w-4 h-4" />
              {isLocking ? "Khóa TK" : "Mở khóa TK"}
            </button>
          ) : null}
        </div>
      </section>

      <CustomerFormModal
        open={isEditOpen}
        mode="edit"
        customer={customer}
        onClose={() => setIsEditOpen(false)}
        onSaved={handleUpdated}
      />

      <LockAccountConfirmModal
        user={confirmLock ? linkedUser : null}
        pending={lockPending}
        onConfirm={handleLockToggle}
        onClose={() => {
          if (!lockPending) setConfirmLock(false);
        }}
      />
    </div>
  );
}
