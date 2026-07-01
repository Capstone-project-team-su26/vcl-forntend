"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import * as feeService from "@/utils/additionalServiceFeeService";
import { getErrorMessage } from "@/utils/apiError";

const { FEE_CALCULATION_TYPE_LABELS } = feeService;

const calculationOptions = Object.entries(FEE_CALCULATION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function AdditionalServiceFeeFormModal({
  open,
  mode,
  fee,
  onClose,
  onSaved,
}) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculationType, setCalculationType] = useState(fee?.feeCalculationType ?? "FIXED");

  useEffect(() => {
    if (open) {
      setCalculationType(fee?.feeCalculationType ?? "FIXED");
      setError("");
    }
  }, [open, fee]);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const payload = {
      name: form.elements.namedItem("name").value.trim(),
      code: form.elements.namedItem("code").value.trim(),
      feeCalculationType: form.elements.namedItem("feeCalculationType").value,
      fixedAmount: form.elements.namedItem("fixedAmount").value,
      percentageRate: form.elements.namedItem("percentageRate").value,
      unit: form.elements.namedItem("unit").value.trim(),
      description: form.elements.namedItem("description").value.trim(),
      isActive: form.elements.namedItem("isActive").checked,
    };

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const response = await feeService.createAdditionalServiceFee(payload);
        onSaved(response.fee, response.message || "Thêm loại phí thành công.");
      } else if (fee) {
        const response = await feeService.updateAdditionalServiceFee(fee.id, payload);
        onSaved(response.fee, response.message || "Cập nhật loại phí thành công.");
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
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Đóng"
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface-elevated rounded-xl border border-border-muted shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-muted sticky top-0 bg-surface-elevated">
          <h2 className="text-lg font-bold text-ink">
            {mode === "create" ? "Thêm phí dịch vụ bổ sung" : "Chỉnh sửa loại phí"}
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
            <label htmlFor="name" className="text-sm font-semibold text-ink">
              Tên loại phí <span className="text-danger">*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={fee?.name ?? ""}
              placeholder="VD: Bảo hiểm hàng hóa"
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-semibold text-ink">
              Mã loại phí <span className="text-danger">*</span>
            </label>
            <input
              id="code"
              name="code"
              required
              defaultValue={fee?.code ?? ""}
              placeholder="VD: INSURANCE"
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring font-mono"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="feeCalculationType" className="text-sm font-semibold text-ink">
              Cách tính phí <span className="text-danger">*</span>
            </label>
            <select
              id="feeCalculationType"
              name="feeCalculationType"
              required
              value={calculationType}
              onChange={(event) => setCalculationType(event.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            >
              {calculationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {calculationType === "FIXED" ? (
            <div className="space-y-2">
              <label htmlFor="fixedAmount" className="text-sm font-semibold text-ink">
                Giá cố định (VND) <span className="text-danger">*</span>
              </label>
              <input
                id="fixedAmount"
                name="fixedAmount"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={fee?.fixedAmount ?? ""}
                placeholder="VD: 12.00"
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="percentageRate" className="text-sm font-semibold text-ink">
                Phần trăm phí (%) <span className="text-danger">*</span>
              </label>
              <input
                id="percentageRate"
                name="percentageRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                defaultValue={fee?.percentageRate ?? ""}
                placeholder="VD: 2.5"
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="unit" className="text-sm font-semibold text-ink">
              Đơn vị tính
            </label>
            <input
              id="unit"
              name="unit"
              defaultValue={fee?.unit ?? ""}
              placeholder="VD: VND/kiện, % giá trị khai báo"
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-semibold text-ink">
              Ghi chú mô tả
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={fee?.description ?? ""}
              placeholder="Mô tả cách áp dụng phí cho Staff/Sales khi báo giá"
              className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm resize-y input-focus-ring"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={fee?.isActive ?? true}
              className="w-4 h-4 rounded border-border-muted accent-primary"
            />
            <span className="text-sm text-ink font-medium">Đang hoạt động</span>
          </label>

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
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Thêm loại phí" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
