"use client";
import styles from "./WarehouseFormModal.module.scss";

import { Icon } from "@iconify/react";
import { useState } from "react";
import * as warehouseService from "@/utils/warehouseService";
import { getErrorMessage } from "@/utils/apiError";

const { WAREHOUSE_TYPE_LABELS } = warehouseService;

const warehouseTypeOptions = [
  { value: "", label: "— Không chọn —" },
  ...Object.entries(WAREHOUSE_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

export default function WarehouseFormModal({ open, mode, warehouse, onClose, onSaved }) {
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
      address: form.elements.namedItem("address").value.trim(),
      warehouseType: form.elements.namedItem("warehouseType").value || null,
      isActive: form.elements.namedItem("isActive").checked,
    };

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const response = await warehouseService.createWarehouse(payload);
        onSaved(response.warehouse, response.message || "Thêm kho thành công.");
      } else if (warehouse) {
        const response = await warehouseService.updateWarehouse(warehouse.id, payload);
        onSaved(response.warehouse, response.message || "Cập nhật kho thành công.");
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
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {mode === "create" ? "Thêm kho mới" : "Chỉnh sửa kho"}
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
              Tên kho <span className={styles.required}>*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={warehouse?.name ?? ""}
              placeholder="VD: Kho HCM Hub"
              className={`${styles.textField} input-focus-ring`}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="code" className={styles.label}>
              Mã kho <span className={styles.required}>*</span>
            </label>
            <input
              id="code"
              name="code"
              required
              defaultValue={warehouse?.code ?? ""}
              placeholder="VD: VN-HCM"
              className={`${styles.textField} input-focus-ring`}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="address" className={styles.label}>
              Địa chỉ kho
            </label>
            <textarea
              id="address"
              name="address"
              rows={2}
              defaultValue={warehouse?.address ?? ""}
              placeholder="Địa chỉ đầy đủ của kho"
              className={`${styles.textArea} input-focus-ring`}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="warehouseType" className={styles.label}>
              Loại kho
            </label>
            <select
              id="warehouseType"
              name="warehouseType"
              defaultValue={warehouse?.warehouseType ?? ""}
              className={`${styles.textField} input-focus-ring`}
            >
              {warehouseTypeOptions.map((option) => (
                <option key={option.value || "none"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={warehouse?.isActive ?? true}
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
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Thêm kho" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
