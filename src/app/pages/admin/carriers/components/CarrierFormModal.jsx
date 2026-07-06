"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import * as carrierService from "@/utils/carrierService";
import * as shippingMethodService from "@/utils/shippingMethodService";
import { getErrorMessage } from "@/utils/apiError";

function parseListInput(value) {
  if (!value) return [];
  return String(value)
    .split(/[,;\n]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

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
        const methods = await shippingMethodService.listShippingMethods({ activeOnly: true });
        if (active) setShippingMethods(methods);
      } catch {
        if (active) setShippingMethods([]);
      }
    }

    loadShippingMethods();
    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setSelectedMethods(carrier?.supportedShippingMethods ?? []);
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
      carrierType: form.elements.namedItem("carrierType").value,
      supportedShippingMethods: selectedMethods,
      supportedCountriesRegions: parseListInput(
        form.elements.namedItem("supportedCountriesRegions").value
      ),
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
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Đóng"
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-elevated rounded-xl border border-border-muted shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-muted sticky top-0 bg-surface-elevated z-10">
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
                placeholder="VD: DHL Express"
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
                placeholder="VD: DHL"
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="carrierType" className="text-sm font-semibold text-ink">
              Loại đơn vị <span className="text-danger">*</span>
            </label>
            <select
              id="carrierType"
              name="carrierType"
              required
              defaultValue={carrier?.carrierType ?? "CARRIER"}
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring bg-surface-elevated"
            >
              {carrierService.CARRIER_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-ink">Phương thức vận chuyển hỗ trợ</p>
            {shippingMethods.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-border-muted p-3 max-h-40 overflow-y-auto">
                {shippingMethods.map((method) => (
                  <label
                    key={method.id}
                    className="flex items-center gap-2.5 cursor-pointer text-sm text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMethods.includes(method.code)}
                      onChange={() => toggleShippingMethod(method.code)}
                      className="w-4 h-4 rounded border-border-muted accent-primary"
                    />
                    <span>
                      <span className="font-mono text-xs text-muted">{method.code}</span>
                      {" · "}
                      {method.name}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">
                Chưa có phương thức vận chuyển hoạt động. Cấu hình tại mục Vận chuyển trước.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="supportedCountriesRegions" className="text-sm font-semibold text-ink">
              Quốc gia/khu vực hỗ trợ
            </label>
            <textarea
              id="supportedCountriesRegions"
              name="supportedCountriesRegions"
              rows={2}
              defaultValue={(carrier?.supportedCountriesRegions ?? []).join(", ")}
              placeholder="VD: US, UK, AU hoặc mỗi mã trên một dòng"
              className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm resize-y input-focus-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contactInfo" className="text-sm font-semibold text-ink">
              Thông tin liên hệ
            </label>
            <input
              id="contactInfo"
              name="contactInfo"
              defaultValue={carrier?.contactInfo ?? ""}
              placeholder="VD: ops@carrier.com · +84 901 234 567"
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
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
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Thêm đơn vị" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
