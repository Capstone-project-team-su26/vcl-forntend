"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import * as pricingRuleService from "@/shared/services/pricingRuleService";
import { getErrorMessage } from "@/shared/utils/apiError";

const {
  SHIPPING_SERVICE_TYPE_LABELS,
  CONSIGNMENT_TYPE_LABELS,
  BILLING_UNIT_LABELS,
} = pricingRuleService;

export type PricingRule = {
  id: string;
  shippingServiceType: string;
  consignmentType: string;
  route: string | null;
  billingUnit: string;
  pricePerKg: number | null;
  pricePerCbm: number | null;
  serviceFee: number;
  isActive: boolean;
};

type PricingRuleFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  item?: PricingRule | null;
  onClose: () => void;
  onSaved: (item: PricingRule, message: string) => void;
};

const shippingOptions = Object.entries(SHIPPING_SERVICE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const consignmentOptions = Object.entries(CONSIGNMENT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const billingOptions = Object.entries(BILLING_UNIT_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function PricingRuleFormModal({
  open,
  mode,
  item,
  onClose,
  onSaved,
}: PricingRuleFormModalProps) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billingUnit, setBillingUnit] = useState(item?.billingUnit ?? "KG");

  useEffect(() => {
    if (open) setBillingUnit(item?.billingUnit ?? "KG");
  }, [open, item]);

  if (!open) return null;

  const showKg = billingUnit === "KG" || billingUnit === "KG_OR_CBM";
  const showCbm = billingUnit === "CBM" || billingUnit === "KG_OR_CBM";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const payload = {
      shippingServiceType: form.shippingServiceType.value,
      consignmentType: form.consignmentType.value,
      route: form.route.value.trim() || null,
      billingUnit: form.billingUnit.value,
      pricePerKg: showKg ? form.pricePerKg.value : null,
      pricePerCbm: showCbm ? form.pricePerCbm.value : null,
      serviceFee: form.serviceFee.value,
      isActive: form.isActive.checked,
    };

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const response = await pricingRuleService.createPricingRule(payload);
        onSaved(response.item, response.message || "Thêm cấu hình giá thành công.");
      } else if (item) {
        const response = await pricingRuleService.updatePricingRule(item.id, payload);
        onSaved(response.item, response.message || "Cập nhật cấu hình giá thành công.");
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
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Đóng" />
      <div className="relative w-full max-w-xl bg-white rounded-xl border border-border-muted shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-muted sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-ink">
            {mode === "create" ? "Thêm cấu hình giá" : "Chỉnh sửa cấu hình giá"}
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
              <label htmlFor="shippingServiceType" className="text-sm font-semibold text-ink">
                Loại dịch vụ vận chuyển <span className="text-danger">*</span>
              </label>
              <select
                id="shippingServiceType"
                name="shippingServiceType"
                required
                defaultValue={item?.shippingServiceType ?? "STANDARD"}
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              >
                {shippingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="consignmentType" className="text-sm font-semibold text-ink">
                Loại ký gửi <span className="text-danger">*</span>
              </label>
              <select
                id="consignmentType"
                name="consignmentType"
                required
                defaultValue={item?.consignmentType ?? "CONSIGNMENT"}
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              >
                {consignmentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="route" className="text-sm font-semibold text-ink">
              Quốc gia / tuyến vận chuyển
            </label>
            <input
              id="route"
              name="route"
              defaultValue={item?.route ?? ""}
              placeholder="VD: VN-US, VN-JP — để trống = tất cả tuyến"
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="billingUnit" className="text-sm font-semibold text-ink">
              Đơn vị tính phí <span className="text-danger">*</span>
            </label>
            <select
              id="billingUnit"
              name="billingUnit"
              required
              value={billingUnit}
              onChange={(e) => setBillingUnit(e.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
            >
              {billingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {showKg ? (
              <div className="space-y-2">
                <label htmlFor="pricePerKg" className="text-sm font-semibold text-ink">
                  Giá theo cân nặng (USD/kg) <span className="text-danger">*</span>
                </label>
                <input
                  id="pricePerKg"
                  name="pricePerKg"
                  type="number"
                  min="0"
                  step="0.01"
                  required={showKg}
                  defaultValue={item?.pricePerKg ?? ""}
                  className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                />
              </div>
            ) : null}

            {showCbm ? (
              <div className="space-y-2">
                <label htmlFor="pricePerCbm" className="text-sm font-semibold text-ink">
                  Giá theo thể tích (USD/CBM) <span className="text-danger">*</span>
                </label>
                <input
                  id="pricePerCbm"
                  name="pricePerCbm"
                  type="number"
                  min="0"
                  step="0.01"
                  required={showCbm}
                  defaultValue={item?.pricePerCbm ?? ""}
                  className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <label htmlFor="serviceFee" className="text-sm font-semibold text-ink">
                Phí dịch vụ (USD) <span className="text-danger">*</span>
              </label>
              <input
                id="serviceFee"
                name="serviceFee"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={item?.serviceFee ?? ""}
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              />
            </div>
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
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Thêm cấu hình" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
