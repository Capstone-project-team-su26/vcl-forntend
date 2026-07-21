"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import * as carrierService from "@/modules/carriers";
import * as shippingMethodService from "@/modules/shipping-methods";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Đóng"
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface rounded-xl border border-border shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-muted sticky top-0 bg-surface-elevated">
          <h2 className="text-lg font-bold text-ink">
            {mode === "create" ? "Thêm đơn vị vận chuyển" : "Chỉnh sửa đơn vị vận chuyển"}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-ink">
                Tên đơn vị <span className="text-danger">*</span>
              </label>
              <input
                id="name"
                name="name"
                required
                defaultValue={carrier?.name ?? ""}
                placeholder="VD: VCL Logistics"
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-semibold text-ink">
                Mã đơn vị <span className="text-danger">*</span>
              </label>
              <input
                id="code"
                name="code"
                required
                defaultValue={carrier?.code ?? ""}
                placeholder="VD: VCL"
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-semibold text-ink">
              Loại đơn vị <span className="text-danger">*</span>
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

          <div className="space-y-2">
            <p className="text-sm font-semibold text-ink">Phương thức vận chuyển hỗ trợ</p>
            {shippingMethods.length === 0 ? (
              <p className="text-sm text-muted">
                Chưa có phương thức vận chuyển đang hoạt động. Cấu hình tại mục Vận chuyển trước.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {shippingMethods.map((method) => (
                  <label
                    key={method.id}
                    className="flex items-center gap-2.5 rounded-lg border border-border-muted px-3 py-2.5 cursor-pointer hover:bg-surface"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMethods.includes(method.code)}
                      onChange={() => toggleShippingMethod(method.code)}
                      className="w-4 h-4 rounded border-border-muted accent-primary"
                    />
                    <span className="text-sm text-ink">
                      <span className="font-mono text-xs text-muted">{method.code}</span>
                      <span className="mx-1.5">·</span>
                      {method.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="supportedRegions" className="text-sm font-semibold text-ink">
              Quốc gia / khu vực hỗ trợ
            </label>
            <input
              id="supportedRegions"
              name="supportedRegions"
              defaultValue={carrier?.supportedRegions ?? ""}
              placeholder="VD: US, EU, CN, VN"
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contactInfo" className="text-sm font-semibold text-ink">
              Thông tin liên hệ
            </label>
            <textarea
              id="contactInfo"
              name="contactInfo"
              rows={2}
              defaultValue={carrier?.contactInfo ?? ""}
              placeholder="Email, hotline, người phụ trách..."
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
              defaultValue={carrier?.internalNotes ?? ""}
              placeholder="Ghi chú chỉ Admin/Staff nội bộ thấy"
              className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm resize-y input-focus-ring"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={carrier?.isActive ?? true}
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
