"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CustomerFormModal from "@/app/pages/sales/customers/components/CustomerFormModal";
import * as customerService from "@/modules/customers";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";

const {
  CUSTOMER_STATUS_STYLES,
  buildCreateConsignmentUrl,
  formatCustomerStatus,
} = customerService;

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-border-muted/60 last:border-0">
      <dt className="text-sm font-bold text-muted sm:w-40 shrink-0">{label}</dt>
      <dd className="text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export default function CustomerDetailPanel({ id, backHref = ROUTES.sales.customers }) {
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    let active = true;

    async function load() {
      setIsLoading(true);
      setError("");
      setSuccessMessage("");

      try {
        const data = await customerService.getCustomer(id);
        if (active) setCustomer(data);
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
    setSuccessMessage(message);
    setError("");
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
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink mb-4"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          Quay lại danh sách
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-['Oswald'] text-ink">
              {customer.fullName}
            </h1>
            <p className="text-muted text-sm font-medium mt-2">
              Mã khách hàng:{" "}
              <span className="font-mono text-ink">{customer.customerCode}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border-muted text-sm font-semibold text-ink hover:bg-surface shrink-0"
          >
            <Icon icon="lucide:pencil" className="w-4 h-4" />
            Chỉnh sửa
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text">
          {successMessage}
        </div>
      ) : null}

      <section className="rounded-xl border border-border-muted bg-surface-elevated p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-ink">Thông tin hồ sơ</h2>
          <span
            className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
              CUSTOMER_STATUS_STYLES[customer.status] || "bg-surface text-muted"
            }`}
          >
            {formatCustomerStatus(customer.status)}
          </span>
        </div>
        <dl>
          <DetailRow label="Họ tên" value={customer.fullName} />
          <DetailRow label="Số điện thoại" value={customer.phone} />
          <DetailRow label="Email" value={customer.email} />
          <DetailRow label="Địa chỉ" value={customer.address} />
          <DetailRow label="Công ty" value={customer.companyName} />
          <DetailRow label="MST" value={customer.taxId} />
          <DetailRow label="Trạng thái" value={formatCustomerStatus(customer.status)} />
        </dl>
      </section>

      <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
        <h2 className="text-lg font-bold text-ink">Tạo đơn thay khách</h2>
        <p className="text-sm text-muted">
          Chọn loại yêu cầu để tiếp tục với khách hàng đã chọn.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={buildCreateConsignmentUrl(customer.id)}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90"
          >
            <Icon icon="lucide:package-plus" className="w-4 h-4" />
            Tạo ký gửi thay khách
          </Link>
          <Link
            href={buildCreateConsignmentUrl(customer.id, "PURCHASE_ORDER")}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg border border-border-muted text-sm font-semibold text-ink hover:bg-surface"
          >
            <Icon icon="lucide:shopping-cart" className="w-4 h-4" />
            Mua hộ thay khách
          </Link>
        </div>
      </section>

      <CustomerFormModal
        open={isEditOpen}
        mode="edit"
        customer={customer}
        onClose={() => setIsEditOpen(false)}
        onSaved={handleUpdated}
      />
    </div>
  );
}
