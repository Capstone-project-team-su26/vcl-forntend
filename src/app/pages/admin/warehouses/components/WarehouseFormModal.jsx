"use client";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Đóng"
      />
      <div className="relative w-full max-w-lg bg-surface rounded-xl border border-border shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-muted">
          <h2 className="text-lg font-bold text-ink">
            {mode === "create" ? "Thêm kho mới" : "Chỉnh sửa kho"}
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
              Tên kho <span className="text-danger">*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={warehouse?.name ?? ""}
              placeholder="VD: Kho HCM Hub"
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-semibold text-ink">
              Mã kho <span className="text-danger">*</span>
            </label>
            <input
              id="code"
              name="code"
              required
              defaultValue={warehouse?.code ?? ""}
              placeholder="VD: VN-HCM"
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-semibold text-ink">
              Địa chỉ kho
            </label>
            <textarea
              id="address"
              name="address"
              rows={2}
              defaultValue={warehouse?.address ?? ""}
              placeholder="Địa chỉ đầy đủ của kho"
              className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm resize-y input-focus-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="warehouseType" className="text-sm font-semibold text-ink">
              Loại kho
            </label>
            <select
              id="warehouseType"
              name="warehouseType"
              defaultValue={warehouse?.warehouseType ?? ""}
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            >
              {warehouseTypeOptions.map((option) => (
                <option key={option.value || "none"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={warehouse?.isActive ?? true}
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
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Thêm kho" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
