"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import * as feeService from "@/modules/additional-service-fees";
import { getErrorMessage } from "@/utils/apiError";
import VndMoneyInput from "@/app/components/VndMoneyInput";
import { isVatRule, isVolumetricDivisorRule } from "@/modules/service-pricing";

const { FEE_CALCULATION_TYPE_LABELS } = feeService;

const calculationOptions = Object.entries(FEE_CALCULATION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function readFormValue(form, name) {
  const element = form.elements.namedItem(name);
  if (!element || "value" in element === false) return "";
  return element.value;
}

function readFormChecked(form, name) {
  const element = form.elements.namedItem(name);
  return element?.checked === true;
}

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
  const [fixedAmount, setFixedAmount] = useState("");

  useEffect(() => {
    if (open) {
      setCalculationType(fee?.feeCalculationType ?? "FIXED");
      setFixedAmount(fee?.fixedAmount != null ? String(fee.fixedAmount) : "");
      setError("");
    }
  }, [open, fee]);

  if (!open) return null;

  const isDivisorRule = Boolean(fee && isVolumetricDivisorRule(fee));
  const isVatConfigRule = Boolean(fee && isVatRule(fee));
  const lockSystemCode = isDivisorRule || isVatConfigRule;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const feeCalculationType = isVatConfigRule
      ? "PERCENTAGE"
      : readFormValue(form, "feeCalculationType") || "FIXED";
    const payload = {
      name: readFormValue(form, "name").trim(),
      code: readFormValue(form, "code").trim(),
      ruleCode: fee?.ruleCode ?? readFormValue(form, "code").trim(),
      ruleType: fee?.ruleType ?? undefined,
      feeCalculationType,
      fixedAmount: feeCalculationType === "FIXED" ? fixedAmount : "",
      percentageRate:
        feeCalculationType === "PERCENTAGE" ? readFormValue(form, "percentageRate") : "",
      unit: readFormValue(form, "unit").trim(),
      description: readFormValue(form, "description").trim(),
      isActive: readFormChecked(form, "isActive"),
      isRequired: readFormChecked(form, "isRequired"),
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
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Đóng"
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface rounded-xl border border-border shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-muted sticky top-0 bg-surface-elevated">
          <h2 className="text-lg font-bold text-ink">
            {isVatConfigRule
              ? mode === "create"
                ? "Tạo quy tắc VAT"
                : "Chỉnh sửa VAT"
              : mode === "create"
                ? "Thêm phí dịch vụ bổ sung"
                : "Chỉnh sửa loại phí"}
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
              readOnly={lockSystemCode}
              defaultValue={fee?.code ?? ""}
              placeholder="VD: INSURANCE"
              className={`w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring font-mono ${
                lockSystemCode ? "bg-surface text-muted cursor-not-allowed" : ""
              }`}
            />
            {isVatConfigRule ? (
              <p className="text-xs text-muted">
                Mã hệ thống <span className="font-mono">VAT</span> — Sales không bật/tắt như phụ phí.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="feeCalculationType" className="text-sm font-semibold text-ink">
              Cách tính phí <span className="text-danger">*</span>
            </label>
            <select
              id="feeCalculationType"
              name="feeCalculationType"
              required
              value={isVatConfigRule ? "PERCENTAGE" : calculationType}
              disabled={isVatConfigRule}
              onChange={(event) => setCalculationType(event.target.value)}
              className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring disabled:opacity-90 disabled:cursor-not-allowed disabled:bg-surface"
            >
              {calculationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {calculationType === "FIXED" && !isVatConfigRule ? (
            <div className="space-y-2">
              <label htmlFor="fixedAmount" className="text-sm font-semibold text-ink">
                {isDivisorRule ? "Hệ số quy đổi thể tích" : "Giá cố định (VND)"}{" "}
                <span className="text-danger">*</span>
              </label>
              <VndMoneyInput
                id="fixedAmount"
                name="fixedAmount"
                value={fixedAmount}
                onChange={setFixedAmount}
                required
                placeholder={isDivisorRule ? "VD: 5.000" : undefined}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="percentageRate" className="text-sm font-semibold text-ink">
                {isVatConfigRule ? "Tỷ lệ VAT (%)" : "Phần trăm phí (%)"}{" "}
                <span className="text-danger">*</span>
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
                placeholder="VD: 8"
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              />
              {isVatConfigRule ? (
                <p className="text-xs text-muted">
                  Áp dụng trên tổng cước vận chuyển + phí dịch vụ.
                </p>
              ) : null}
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

          {!isDivisorRule && !isVatConfigRule ? (
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="isRequired"
                defaultChecked={fee?.isRequired === true}
                className="w-4 h-4 mt-0.5 rounded border-border-muted accent-primary"
              />
              <span>
                <span className="text-sm text-ink font-medium block">Phí bắt buộc</span>
                <span className="text-xs text-muted">
                  Sales không được tắt khi lập báo giá.
                </span>
              </span>
            </label>
          ) : null}

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
              className="h-11 px-5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Thêm mới" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
