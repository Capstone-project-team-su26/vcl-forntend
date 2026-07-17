"use client";
import styles from "./CarrierFormModal.module.scss";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import * as carrierService from "@/utils/carrierService";
import * as shippingMethodService from "@/utils/shippingMethodService";
import { getErrorMessage } from "@/utils/apiError";

const { CARRIER_TYPE_LABELS } = carrierService;

const carrierTypeOptions = Object.entries(CARRIER_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function CarrierFormModal({ open, mode, carrier, onClose, onSaved }) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedMethods, setSelectedMethods] = useState([]);

  useEffect(() => {
    if (!open) return;

    let active = true;

    async function loadShippingMethods() {
      try {
        const data = await shippingMethodService.listShippingMethods({ activeOnly: true });
        if (active) setShippingMethods(data);
      } catch {
        if (active) setShippingMethods([]);
      }
    }

    setSelectedMethods(carrier?.supportedShippingMethods ?? []);
    loadShippingMethods();

    return () => {
      active = false;
    };
  }, [open, carrier]);

  if (!open) return null;

  function toggleShippingMethod(code) {
    setSelectedMethods((current) =>
      current.includes(code) ? current.filter((entry) => entry !== code) : [...current, code]
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const payload = {
      name: form.elements.namedItem("name").value.trim(),
      code: form.elements.namedItem("code").value.trim(),
      type: form.elements.namedItem("type").value,
      supportedShippingMethods: selectedMethods,
      supportedRegions: form.elements.namedItem("supportedRegions").value.trim(),
      contactInfo: form.elements.namedItem("contactInfo").value.trim(),
      internalNotes: form.elements.namedItem("internalNotes").value.trim(),
      isActive: form.elements.namedItem("isActive").checked,
    };

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const response = await carrierService.createCarrier(payload);
        onSaved(response.carrier, response.message || "Thêm đơn vị vận chuyển thành công.");
      } else if (carrier) {
        const response = await carrierService.updateCarrier(carrier.id, payload);
        onSaved(response.carrier, response.message || "Cập nhật đơn vị vận chuyển thành công.");
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
      <div className={styles.panelWideScroll}>
        <div className={styles.stickyHeader}>
          <h2 className={styles.title}>
            {mode === "create" ? "Thêm đơn vị vận chuyển" : "Chỉnh sửa đơn vị vận chuyển"}
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

          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>
                Tên đơn vị <span className={styles.required}>*</span>
              </label>
              <input
                id="name"
                name="name"
                required
                defaultValue={carrier?.name ?? ""}
                placeholder="VD: VCL Logistics"
                className={`${styles.textField} input-focus-ring`}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="code" className={styles.label}>
                Mã đơn vị <span className={styles.required}>*</span>
              </label>
              <input
                id="code"
                name="code"
                required
                defaultValue={carrier?.code ?? ""}
                placeholder="VD: VCL"
                className={`${styles.textFieldMono} input-focus-ring`}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="type" className={styles.label}>
              Loại đơn vị <span className={styles.required}>*</span>
            </label>
            <select
              id="type"
              name="type"
              required
              defaultValue={carrier?.type ?? "FORWARDER"}
              className="form-select input-focus-ring"
            >
              {carrierTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <p className={styles.label}>Phương thức vận chuyển hỗ trợ</p>
            {shippingMethods.length === 0 ? (
              <p className={styles.fieldHint}>
                Chưa có phương thức vận chuyển đang hoạt động. Cấu hình tại mục Vận chuyển trước.
              </p>
            ) : (
              <div className={styles.methodGrid}>
                {shippingMethods.map((method) => (
                  <label
                    key={method.id}
                    className={styles.methodOption}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMethods.includes(method.code)}
                      onChange={() => toggleShippingMethod(method.code)}
                      className={styles.checkbox}
                    />
                    <span className={styles.methodLabel}>
                      <span className={styles.methodCode}>{method.code}</span>
                      <span className={styles.methodDot}>·</span>
                      {method.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="supportedRegions" className={styles.label}>
              Quốc gia / khu vực hỗ trợ
            </label>
            <input
              id="supportedRegions"
              name="supportedRegions"
              defaultValue={carrier?.supportedRegions ?? ""}
              placeholder="VD: US, EU, CN, VN"
              className={`${styles.textField} input-focus-ring`}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="contactInfo" className={styles.label}>
              Thông tin liên hệ
            </label>
            <textarea
              id="contactInfo"
              name="contactInfo"
              rows={2}
              defaultValue={carrier?.contactInfo ?? ""}
              placeholder="Email, hotline, người phụ trách..."
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
              defaultValue={carrier?.internalNotes ?? ""}
              placeholder="Ghi chú chỉ Admin/Staff nội bộ thấy"
              className={`${styles.textArea} input-focus-ring`}
            />
          </div>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={carrier?.isActive ?? true}
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
              {isSubmitting
                ? "Đang lưu..."
                : mode === "create"
                  ? "Thêm đơn vị"
                  : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
