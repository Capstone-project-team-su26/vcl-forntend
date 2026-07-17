"use client";
import styles from "./CustomerFormModal.module.scss";

import { Icon } from "@iconify/react";
import { useState } from "react";
import * as customerService from "@/utils/customerService";
import { getErrorMessage } from "@/utils/apiError";

const { CUSTOMER_STATUS_LABELS } = customerService;

const statusOptions = Object.entries(CUSTOMER_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function CustomerFormModal({ open, mode, customer, onClose, onSaved }) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const payload = {
      fullName: form.elements.namedItem("fullName").value.trim(),
      phone: form.elements.namedItem("phone").value.trim(),
      email: form.elements.namedItem("email").value.trim(),
      address: form.elements.namedItem("address").value.trim(),
      companyName: form.elements.namedItem("companyName").value.trim(),
      taxId: form.elements.namedItem("taxId").value.trim(),
      status: form.elements.namedItem("status").value,
    };

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const response = await customerService.createCustomer(payload);
        onSaved(response.customer, response.message || "Tạo hồ sơ khách hàng thành công.");
      } else if (customer) {
        const response = await customerService.updateCustomer(customer.id, payload);
        onSaved(response.customer, response.message || "Cập nhật hồ sơ khách hàng thành công.");
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.ta73cc4}>
      <button
        type="button"
        className={styles.td54a21}
        onClick={onClose}
        aria-label="Đóng"
      />
      <div className={styles.tfadd7d}>
        <div className={styles.t098018}>
          <h2 className={styles.te817d8}>
            {mode === "create" ? "Thêm khách hàng" : "Chỉnh sửa khách hàng"}
          </h2>
          <button type="button" onClick={onClose} className={styles.t6265d4}>
            <Icon icon="lucide:x" className={styles.ta8600f} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.tcccb28}>
          {error ? (
            <div className={styles.te12bff}>
              {error}
            </div>
          ) : null}

          <div className={styles.t6f7e01}>
            <label htmlFor="fullName" className={styles.tae03fc}>
              Họ tên <span className={styles.tf3fb31}>*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              required
              defaultValue={customer?.fullName ?? ""}
              placeholder="VD: Nguyen Van A"
              className={`${styles.t752d10} input-focus-ring`}
            />
          </div>

          <div className={styles.t4c017d}>
            <div className={styles.t6f7e01}>
              <label htmlFor="phone" className={styles.tae03fc}>
                Số điện thoại <span className={styles.tf3fb31}>*</span>
              </label>
              <input
                id="phone"
                name="phone"
                required
                defaultValue={customer?.phone ?? ""}
                placeholder="VD: +84 901 234 567"
                className={`${styles.t752d10} input-focus-ring`}
              />
            </div>
            <div className={styles.t6f7e01}>
              <label htmlFor="email" className={styles.tae03fc}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={customer?.email ?? ""}
                placeholder="email@example.com"
                className={`${styles.t752d10} input-focus-ring`}
              />
            </div>
          </div>

          <div className={styles.t6f7e01}>
            <label htmlFor="address" className={styles.tae03fc}>
              Địa chỉ
            </label>
            <textarea
              id="address"
              name="address"
              rows={2}
              defaultValue={customer?.address ?? ""}
              placeholder="Địa chỉ liên hệ của khách"
              className={`${styles.tf65383} input-focus-ring`}
            />
          </div>

          <div className={styles.t4c017d}>
            <div className={styles.t6f7e01}>
              <label htmlFor="companyName" className={styles.tae03fc}>
                Công ty
              </label>
              <input
                id="companyName"
                name="companyName"
                defaultValue={customer?.companyName ?? ""}
                className={`${styles.t752d10} input-focus-ring`}
              />
            </div>
            <div className={styles.t6f7e01}>
              <label htmlFor="taxId" className={styles.tae03fc}>
                MST
              </label>
              <input
                id="taxId"
                name="taxId"
                defaultValue={customer?.taxId ?? ""}
                className={`${styles.t752d10} input-focus-ring`}
              />
            </div>
          </div>

          <div className={styles.t6f7e01}>
            <label htmlFor="status" className={styles.tae03fc}>
              Trạng thái hồ sơ
            </label>
            <select
              id="status"
              name="status"
              defaultValue={customer?.status ?? "ACTIVE"}
              className={`${styles.t752d10} input-focus-ring`}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.tfb9b0c}>
            <button
              type="button"
              onClick={onClose}
              className={styles.t622a81}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.t006f0b}
            >
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Tạo hồ sơ" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
