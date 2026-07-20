"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import VndMoneyInput from "@/app/components/VndMoneyInput";
import * as packageConfigurationService from "@/utils/packageConfigurationService";
import { getErrorMessage } from "@/utils/apiError";

function readFormValue(form, name) {
  const element = form.elements.namedItem(name);
  if (!element || "value" in element === false) return "";
  return element.value;
}

function validatePositiveNumber(value, label) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return `${label} phải lớn hơn 0.`;
  }
  return null;
}

export default function PackageConfigurationFormModal({
  open,
  mode,
  item,
  onClose,
  onSaved,
}) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [packageFee, setPackageFee] = useState("");

  useEffect(() => {
    if (open) {
      setPackageFee(item?.packageFee != null ? String(item.packageFee) : "");
      setError("");
    }
  }, [open, item]);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const payload = {
      code: readFormValue(form, "code").trim(),
      name: readFormValue(form, "name").trim(),
      length: readFormValue(form, "length"),
      width: readFormValue(form, "width"),
      height: readFormValue(form, "height"),
      maxWeight: readFormValue(form, "maxWeight"),
      packageFee,
    };

    if (mode === "create" && !payload.code) {
      setError("Vui lòng nhập mã cấu hình.");
      return;
    }
    if (!payload.name) {
      setError("Vui lòng nhập tên cấu hình.");
      return;
    }

    for (const [field, label] of [
      ["length", "Chiều dài"],
      ["width", "Chiều rộng"],
      ["height", "Chiều cao"],
      ["maxWeight", "Khối lượng tối đa"],
    ]) {
      const validationError = validatePositiveNumber(payload[field], label);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (payload.packageFee === "" || Number(payload.packageFee) < 0) {
      setError("Vui lòng nhập phí vỏ thùng hợp lệ.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const response = await packageConfigurationService.createPackageConfiguration(payload);
        onSaved(response.item, response.message || "Thêm cấu hình đóng gói thành công.");
      } else if (item) {
        const response = await packageConfigurationService.updatePackageConfiguration(
          item.id,
          payload
        );
        onSaved(response.item, response.message || "Cập nhật cấu hình đóng gói thành công.");
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Đóng"
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface rounded-xl border border-border shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-muted sticky top-0 bg-surface-elevated">
          <h2 className="text-lg font-bold text-ink">
            {mode === "create" ? "Thêm cấu hình đóng gói" : "Chỉnh sửa cấu hình đóng gói"}
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-muted hover:text-ink">
            <Icon icon="lucide:x" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error ? (
            <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-semibold text-ink">
              Mã cấu hình {mode === "create" ? <span className="text-danger">*</span> : null}
            </label>
            <input
              id="code"
              name="code"
              required={mode === "create"}
              readOnly={mode === "edit"}
              defaultValue={item?.code ?? ""}
              placeholder="VD: CARTON-M"
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring disabled:bg-surface-muted disabled:text-muted font-mono uppercase"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold text-ink">
              Tên cấu hình <span className="text-danger">*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={item?.name ?? ""}
              placeholder="VD: Thùng carton size M"
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              ["length", "Dài (cm)"],
              ["width", "Rộng (cm)"],
              ["height", "Cao (cm)"],
            ].map(([field, label]) => (
              <div key={field} className="space-y-2">
                <label htmlFor={field} className="text-sm font-semibold text-ink">
                  {label} <span className="text-danger">*</span>
                </label>
                <input
                  id={field}
                  name={field}
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  defaultValue={item?.[field] ?? ""}
                  className="w-full h-11 px-3 rounded-lg border border-border-muted text-sm input-focus-ring"
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label htmlFor="maxWeight" className="text-sm font-semibold text-ink">
              Khối lượng tối đa (kg) <span className="text-danger">*</span>
            </label>
            <input
              id="maxWeight"
              name="maxWeight"
              type="number"
              min="0.01"
              step="0.01"
              required
              defaultValue={item?.maxWeight ?? ""}
              placeholder="VD: 10"
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="packageFee" className="text-sm font-semibold text-ink">
              Phí vỏ thùng (VND) <span className="text-danger">*</span>
            </label>
            <VndMoneyInput
              id="packageFee"
              name="packageFee"
              value={packageFee}
              onChange={setPackageFee}
              required
              placeholder="VD: 25.000"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-lg border border-border-muted text-sm font-semibold text-muted hover:bg-surface"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-5 rounded-lg bg-insight hover:bg-secondary text-white text-sm font-bold disabled:opacity-60"
            >
              {isSubmitting
                ? "Đang lưu..."
                : mode === "create"
                  ? "Thêm cấu hình"
                  : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
