"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import * as shippingMethodService from "@/modules/shipping-methods";
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
            {mode === "create" ? "Thêm phương thức vận chuyển" : "Chỉnh sửa phương thức"}
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
              Tên phương thức <span className="text-danger">*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={shippingMethod?.name ?? ""}
              placeholder="VD: Express Air"
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-semibold text-ink">
              Mã phương thức <span className="text-danger">*</span>
            </label>
            <input
              id="code"
              name="code"
              required
              defaultValue={shippingMethod?.code ?? ""}
              placeholder="VD: EXPRESS"
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring font-mono"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-semibold text-ink">
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={shippingMethod?.description ?? ""}
              placeholder="Mô tả ngắn hiển thị cho Customer/Staff"
              className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm resize-y input-focus-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="estimatedDeliveryTime" className="text-sm font-semibold text-ink">
              Thời gian vận chuyển dự kiến
            </label>
            <input
              id="estimatedDeliveryTime"
              name="estimatedDeliveryTime"
              defaultValue={shippingMethod?.estimatedDeliveryTime ?? ""}
              placeholder="VD: 2–3 ngày làm việc"
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="applicableConditions" className="text-sm font-semibold text-ink">
              Điều kiện áp dụng
            </label>
            <textarea
              id="applicableConditions"
              name="applicableConditions"
              rows={2}
              defaultValue={shippingMethod?.applicableConditions ?? ""}
              placeholder="VD: Hàng dưới 30kg, không thuộc danh mục cấm"
              className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm resize-y input-focus-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="internalNotes" className="text-sm font-semibold text-ink">
              Ghi chú nội bộ
            </label>
            <textarea
              id="internalNotes"
              name="internalNotes"
              rows={2}
              defaultValue={shippingMethod?.internalNotes ?? ""}
              placeholder="Ghi chú chỉ Admin/Staff nội bộ thấy"
              className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm resize-y input-focus-ring"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={shippingMethod?.isActive ?? true}
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
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Thêm phương thức" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
