"use client";
import styles from "./WarehouseLocationFormModal.module.scss";

import { Icon } from "@iconify/react";
import { useState } from "react";
import * as warehouseService from "@/utils/warehouseService";
import { getErrorMessage } from "@/utils/apiError";

const { LOCATION_TYPE_LABELS } = warehouseService;

const locationTypeOptions = Object.entries(LOCATION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function WarehouseLocationFormModal({
  open,
  mode,
  warehouseId,
  location,
  locations,
  onClose,
  onSaved,
}) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const parentOptions = locations.filter((item) => item.id !== location?.id);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const payload = {
      locationType: form.elements.namedItem("locationType").value,
      code: form.elements.namedItem("code").value.trim(),
      name: form.elements.namedItem("name").value.trim(),
      parentId: form.elements.namedItem("parentId").value || null,
      capacity: form.elements.namedItem("capacity").value,
      isActive: form.elements.namedItem("isActive").checked,
    };

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const response = await warehouseService.createWarehouseLocation(warehouseId, payload);
        onSaved(response.location, response.message || "Thêm vị trí lưu trữ thành công.");
      } else if (location) {
        const response = await warehouseService.updateWarehouseLocation(location.id, payload);
        onSaved(response.location, response.message || "Cập nhật vị trí lưu trữ thành công.");
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
            {mode === "create" ? "Thêm vị trí lưu trữ" : "Chỉnh sửa vị trí"}
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
            <label htmlFor="locationType" className={styles.label}>
              Loại vị trí <span className={styles.required}>*</span>
            </label>
            <select
              id="locationType"
              name="locationType"
              required
              defaultValue={location?.locationType ?? "ZONE"}
              className={`${styles.textField} input-focus-ring`}
            >
              {locationTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label htmlFor="code" className={styles.label}>
                Mã vị trí <span className={styles.required}>*</span>
              </label>
              <input
                id="code"
                name="code"
                required
                defaultValue={location?.code ?? ""}
                placeholder="VD: Z-A"
                className={`${styles.textField} input-focus-ring`}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="capacity" className={styles.label}>
                Sức chứa
              </label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min="0"
                defaultValue={location?.capacity ?? ""}
                placeholder="VD: 100"
                className={`${styles.textField} input-focus-ring`}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              Tên vị trí <span className={styles.required}>*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={location?.name ?? ""}
              placeholder="VD: Zone A — Hàng thường"
              className={`${styles.textField} input-focus-ring`}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="parentId" className={styles.label}>
              Vị trí cha
            </label>
            <select
              id="parentId"
              name="parentId"
              defaultValue={location?.parentId ?? ""}
              className={`${styles.textField} input-focus-ring`}
            >
              <option value="">— Không có —</option>
              {parentOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  [{warehouseService.formatLocationType(item.locationType)}] {item.code} — {item.name}
                </option>
              ))}
            </select>
          </div>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={location?.isActive ?? true}
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
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Thêm vị trí" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
