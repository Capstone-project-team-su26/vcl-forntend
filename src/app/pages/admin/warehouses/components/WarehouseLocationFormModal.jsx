"use client";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Đóng"
      />
      <div className="relative w-full max-w-lg bg-surface-elevated rounded-xl border border-border-muted shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-muted">
          <h2 className="text-lg font-bold text-ink">
            {mode === "create" ? "Thêm vị trí lưu trữ" : "Chỉnh sửa vị trí"}
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
            <label htmlFor="locationType" className="text-sm font-semibold text-ink">
              Loại vị trí <span className="text-danger">*</span>
            </label>
            <select
              id="locationType"
              name="locationType"
              required
              defaultValue={location?.locationType ?? "ZONE"}
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            >
              {locationTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-semibold text-ink">
                Mã vị trí <span className="text-danger">*</span>
              </label>
              <input
                id="code"
                name="code"
                required
                defaultValue={location?.code ?? ""}
                placeholder="VD: Z-A"
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="capacity" className="text-sm font-semibold text-ink">
                Sức chứa
              </label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min="0"
                defaultValue={location?.capacity ?? ""}
                placeholder="VD: 100"
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold text-ink">
              Tên vị trí <span className="text-danger">*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={location?.name ?? ""}
              placeholder="VD: Zone A — Hàng thường"
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="parentId" className="text-sm font-semibold text-ink">
              Vị trí cha
            </label>
            <select
              id="parentId"
              name="parentId"
              defaultValue={location?.parentId ?? ""}
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            >
              <option value="">— Không có —</option>
              {parentOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  [{warehouseService.formatLocationType(item.locationType)}] {item.code} — {item.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={location?.isActive ?? true}
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
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Thêm vị trí" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
