"use client";
import styles from "./ShippingMethodFormModal.module.scss";

import { Icon } from "@iconify/react";
import { useState } from "react";
import * as shippingMethodService from "@/utils/shippingMethodService";
import { getErrorMessage } from "@/utils/apiError";

export default function ShippingMethodFormModal({
  open,
  mode,
  shippingMethod,
  onClose,
  onSaved,
}) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const payload = {
      name: form.elements.namedItem("name").value.trim(),
      code: form.elements.namedItem("code").value.trim(),
      description: form.elements.namedItem("description").value.trim(),
      estimatedDeliveryTime: form.elements.namedItem("estimatedDeliveryTime").value.trim(),
      applicableConditions: form.elements.namedItem("applicableConditions").value.trim(),
      internalNotes: form.elements.namedItem("internalNotes").value.trim(),
      isActive: form.elements.namedItem("isActive").checked,
    };

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const response = await shippingMethodService.createShippingMethod(payload);
        onSaved(
          response.shippingMethod,
          response.message || "Thêm phương thức vận chuyển thành công."
        );
      } else if (shippingMethod) {
        const response = await shippingMethodService.updateShippingMethod(
          shippingMethod.id,
          payload
        );
        onSaved(
          response.shippingMethod,
          response.message || "Cập nhật phương thức vận chuyển thành công."
        );
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <button
        type="button"
        className={styles.backdrop}
        onClick={onClose}
        aria-label="Đóng"
      />
      <div className={styles.panelScroll}>
        <div className={styles.stickyHeader}>
          <h2 className={styles.title}>
            {mode === "create" ? "Thêm phương thức vận chuyển" : "Chỉnh sửa phương thức"}
          </h2>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <Icon icon="lucide:x" className={styles.closeIcon} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error ? (
            <div className={styles.alertError}>
              {error}
            </div>
          ) : null}

          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              Tên phương thức <span className={styles.required}>*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={shippingMethod?.name ?? ""}
              placeholder="VD: Express Air"
              className={`${styles.textField} input-focus-ring`}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="code" className={styles.label}>
              Mã phương thức <span className={styles.required}>*</span>
            </label>
            <input
              id="code"
              name="code"
              required
              defaultValue={shippingMethod?.code ?? ""}
              placeholder="VD: EXPRESS"
              className={`${styles.textFieldMono} input-focus-ring`}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="description" className={styles.label}>
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={shippingMethod?.description ?? ""}
              placeholder="Mô tả ngắn hiển thị cho Customer/Staff"
              className={`${styles.textArea} input-focus-ring`}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="estimatedDeliveryTime" className={styles.label}>
              Thời gian vận chuyển dự kiến
            </label>
            <input
              id="estimatedDeliveryTime"
              name="estimatedDeliveryTime"
              defaultValue={shippingMethod?.estimatedDeliveryTime ?? ""}
              placeholder="VD: 2–3 ngày làm việc"
              className={`${styles.textField} input-focus-ring`}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="applicableConditions" className={styles.label}>
              Điều kiện áp dụng
            </label>
            <textarea
              id="applicableConditions"
              name="applicableConditions"
              rows={2}
              defaultValue={shippingMethod?.applicableConditions ?? ""}
              placeholder="VD: Hàng dưới 30kg, không thuộc danh mục cấm"
              className={`${styles.textArea} input-focus-ring`}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="internalNotes" className={styles.label}>
              Ghi chú nội bộ
            </label>
            <textarea
              id="internalNotes"
              name="internalNotes"
              rows={2}
              defaultValue={shippingMethod?.internalNotes ?? ""}
              placeholder="Ghi chú chỉ Admin/Staff nội bộ thấy"
              className={`${styles.textArea} input-focus-ring`}
            />
          </div>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={shippingMethod?.isActive ?? true}
              className={styles.checkbox}
            />
            <span className={styles.checkboxLabel}>Đang hoạt động</span>
          </label>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitBtn}
            >
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Thêm phương thức" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
