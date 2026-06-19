"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import * as restrictedItemService from "@/shared/services/restrictedItemService";
import { getErrorMessage } from "@/shared/utils/apiError";

const { RESTRICTION_TYPE_LABELS } = restrictedItemService;

export type RestrictedItem = {
  id: string;
  name: string;
  country: string | null;
  restrictionType: string;
  notes: string;
  isActive: boolean;
};

type RestrictedItemFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  item?: RestrictedItem | null;
  onClose: () => void;
  onSaved: (item: RestrictedItem, message: string) => void;
};

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
}: RestrictedItemFormModalProps) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const payload = {
      name: form.name.value.trim(),
      country: form.country.value.trim() || null,
      restrictionType: form.restrictionType.value,
      notes: form.notes.value.trim(),
      isActive: form.isActive.checked,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Đóng"
      />
      <div className="relative w-full max-w-lg bg-white rounded-xl border border-border-muted shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-muted">
          <h2 className="text-lg font-bold text-ink">
            {mode === "create" ? "Thêm hàng cấm/hạn chế" : "Chỉnh sửa mặt hàng"}
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
              Tên mặt hàng <span className="text-danger">*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={item?.name ?? ""}
              placeholder="VD: Pin lithium loại lớn"
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="country" className="text-sm font-semibold text-ink">
              Quốc gia áp dụng
            </label>
            <input
              id="country"
              name="country"
              defaultValue={item?.country ?? ""}
              placeholder="VD: VN, US — để trống = tất cả quốc gia"
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="restrictionType" className="text-sm font-semibold text-ink">
              Loại hạn chế <span className="text-danger">*</span>
            </label>
            <select
              id="restrictionType"
              name="restrictionType"
              required
              defaultValue={item?.restrictionType ?? "RESTRICTED"}
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            >
              {restrictionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-semibold text-ink">
              Ghi chú / lý do hạn chế
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={item?.notes ?? ""}
              placeholder="Mô tả lý do hạn chế để Customer và Staff tham khảo..."
              className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm resize-y input-focus-ring"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={item?.isActive ?? true}
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
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Thêm mặt hàng" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
