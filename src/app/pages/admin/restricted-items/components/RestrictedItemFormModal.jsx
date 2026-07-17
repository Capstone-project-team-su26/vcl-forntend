"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import * as restrictedItemService from "@/utils/restrictedItemService";
import { getErrorMessage } from "@/utils/apiError";
import styles from "./RestrictedItemFormModal.module.scss";

const { RESTRICTION_TYPE_LABELS } = restrictedItemService;
const restrictionOptions = Object.entries(RESTRICTION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function RestrictedItemFormModal({
  open,
  mode,
  item,
  onClose,
  onSaved,
}) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const payload = {
      name: form.elements.namedItem("name").value.trim(),
      country: form.elements.namedItem("country").value.trim() || null,
      restrictionType: form.elements.namedItem("restrictionType").value,
      notes: form.elements.namedItem("notes").value.trim(),
      isActive: form.elements.namedItem("isActive").checked,
    };
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const response = await restrictedItemService.createRestrictedItem(payload);
        onSaved(response.item, response.message || "Thêm mặt hàng thành công.");
      } else if (item) {
        const response = await restrictedItemService.updateRestrictedItem(item.id, payload);
        onSaved(response.item, response.message || "Cập nhật mặt hàng thành công.");
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
            {mode === "create" ? "Thêm hàng cấm/hạn chế" : "Chỉnh sửa mặt hàng"}
          </h2>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <Icon icon="lucide:x" className={styles.closeIcon} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error ? <div className={styles.alertError}>{error}</div> : null}
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              Tên mặt hàng <span className={styles.required}>*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={item?.name ?? ""}
              placeholder="VD: Pin lithium loại lớn"
              className={`${styles.textField} input-focus-ring`}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="country" className={styles.label}>
              Quốc gia áp dụng
            </label>
            <input
              id="country"
              name="country"
              defaultValue={item?.country ?? ""}
              placeholder="VD: VN, US — để trống = tất cả quốc gia"
              className={`${styles.textField} input-focus-ring`}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="restrictionType" className={styles.label}>
              Loại hạn chế <span className={styles.required}>*</span>
            </label>
            <select
              id="restrictionType"
              name="restrictionType"
              required
              defaultValue={item?.restrictionType ?? "RESTRICTED"}
              className={`${styles.textField} input-focus-ring`}
            >
              {restrictionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="notes" className={styles.label}>
              Ghi chú / lý do hạn chế
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={item?.notes ?? ""}
              placeholder="Mô tả lý do hạn chế để Customer và Staff tham khảo..."
              className={`${styles.textArea} input-focus-ring`}
            />
          </div>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={item?.isActive ?? true}
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
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Thêm mặt hàng" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
