"use client";
import styles from "./CustomerDetailPanel.module.scss";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CustomerFormModal from "@/app/pages/sales/customers/components/CustomerFormModal";
import * as customerService from "@/utils/customerService";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";

const {
  CUSTOMER_STATUS_STYLES,
  buildCreateConsignmentUrl,
  formatCustomerStatus,
} = customerService;

function DetailRow({ label, value }) {
  return (
    <div className={styles.tf32257}>
      <dt className={styles.t3898ba}>{label}</dt>
      <dd className={styles.t1ad995}>{value}</dd>
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
      <div className={styles.t9ad5d8}>
        <Icon icon="lucide:loader-2" className={styles.t27b8b3} />
        <p className={styles.taaa307}>Đang tải hồ sơ khách hàng...</p>
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className={styles.t3e7ce5}>
        <Link
          href={backHref}
          className={styles.t025913}
        >
          <Icon icon="lucide:arrow-left" className={styles.t0bfbea} />
          Quay lại danh sách
        </Link>
        <div className={styles.te12bff}>
          {error}
        </div>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className={styles.tdb1f81}>
      <div>
        <Link
          href={backHref}
          className={styles.t197bd0}
        >
          <Icon icon="lucide:arrow-left" className={styles.t0bfbea} />
          Quay lại danh sách
        </Link>
        <div className={styles.tbccecd}>
          <div>
            <h1 className={styles.t4d16e2}>
              {customer.fullName}
            </h1>
            <p className={styles.t466889}>
              Mã khách hàng:{" "}
              <span className={styles.t971bb3}>{customer.customerCode}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className={styles.t987d56}
          >
            <Icon icon="lucide:pencil" className={styles.t0bfbea} />
            Chỉnh sửa
          </button>
        </div>
      </div>

      {error ? (
        <div className={styles.te12bff}>
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className={styles.te918f5}>
          {successMessage}
        </div>
      ) : null}

      <section className={styles.td78253}>
        <div className={styles.tb0e3e3}>
          <h2 className={styles.te817d8}>Thông tin hồ sơ</h2>
          <span
            className={`${styles.t5f03d3}  ${
              CUSTOMER_STATUS_STYLES[customer.status] || "status-badge--surface"
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

      <section className={styles.tbe759f}>
        <h2 className={styles.te817d8}>Tạo đơn thay khách</h2>
        <p className={styles.ta7b499}>
          Chọn loại yêu cầu để tiếp tục với khách hàng đã chọn.
        </p>
        <div className={styles.te6fe74}>
          <Link
            href={buildCreateConsignmentUrl(customer.id)}
            className={styles.t7e47b0}
          >
            <Icon icon="lucide:package-plus" className={styles.t0bfbea} />
            Tạo ký gửi thay khách
          </Link>
          <Link
            href={buildCreateConsignmentUrl(customer.id, "PURCHASE_ORDER")}
            className={styles.t206827}
          >
            <Icon icon="lucide:shopping-cart" className={styles.t0bfbea} />
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
