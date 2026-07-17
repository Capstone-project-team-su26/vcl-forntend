"use client";
import styles from "./AdditionalServiceFeeFormModal.module.scss";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import * as feeService from "@/utils/additionalServiceFeeService";
import { getErrorMessage } from "@/utils/apiError";
import VndMoneyInput from "@/app/components/VndMoneyInput";
import { isVatRule, isVolumetricDivisorRule } from "@/utils/servicePricingService";

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
    <div className={styles.overlay}>
      <button
        type="button"
        className={styles.backdrop}
        onClick={onClose}
        aria-label="Đóng"
      />
      <div className={styles.panelScroll}>
        <div className={styles.stickyHeader}>
          <h2 className={styles.title}>
            {isVatConfigRule
              ? mode === "create"
                ? "Tạo quy tắc VAT"
                : "Chỉnh sửa VAT"
              : mode === "create"
                ? "Thêm phí dịch vụ bổ sung"
                : "Chỉnh sửa loại phí"}
          </h2>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <Icon icon="lucide:x" className={styles.closeIcon} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error ? (
            <div className={styles.alertError}>
              {error}
            </div>
          ) : null}

          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              Tên loại phí <span className={styles.required}>*</span>
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={fee?.name ?? ""}
              placeholder="VD: Bảo hiểm hàng hóa"
              className={`${styles.textField} input-focus-ring`}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="code" className={styles.label}>
              Mã loại phí <span className={styles.required}>*</span>
            </label>
            <input
              id="code"
              name="code"
              required
              readOnly={lockSystemCode}
              defaultValue={fee?.code ?? ""}
              placeholder="VD: INSURANCE"
              className={`${styles.textFieldMono} input-focus-ring ${
                lockSystemCode ? styles.disabledField : ""
              }`}
            />
            {isVatConfigRule ? (
              <p className={styles.fieldHint}>
                Mã hệ thống <span className={styles.monoHint}>VAT</span> — Sales không bật/tắt như phụ phí.
              </p>
            ) : null}
          </div>

          <div className={styles.field}>
            <label htmlFor="feeCalculationType" className={styles.label}>
              Cách tính phí <span className={styles.required}>*</span>
            </label>
            <select
              id="feeCalculationType"
              name="feeCalculationType"
              required
              value={isVatConfigRule ? "PERCENTAGE" : calculationType}
              disabled={isVatConfigRule}
              onChange={(event) => setCalculationType(event.target.value)}
              className={`${styles.selectField} input-focus-ring`}
            >
              {calculationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {calculationType === "FIXED" && !isVatConfigRule ? (
            <div className={styles.field}>
              <label htmlFor="fixedAmount" className={styles.label}>
                {isDivisorRule ? "Hệ số quy đổi thể tích" : "Giá cố định (VND)"}{" "}
                <span className={styles.required}>*</span>
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
            <div className={styles.field}>
              <label htmlFor="percentageRate" className={styles.label}>
                {isVatConfigRule ? "Tỷ lệ VAT (%)" : "Phần trăm phí (%)"}{" "}
                <span className={styles.required}>*</span>
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
                className={`${styles.textField} input-focus-ring`}
              />
              {isVatConfigRule ? (
                <p className={styles.fieldHint}>
                  Áp dụng trên tổng cước vận chuyển + phí dịch vụ.
                </p>
              ) : null}
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="unit" className={styles.label}>
              Đơn vị tính
            </label>
            <input
              id="unit"
              name="unit"
              defaultValue={fee?.unit ?? ""}
              placeholder="VD: VND/kiện, % giá trị khai báo"
              className={`${styles.textField} input-focus-ring`}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="description" className={styles.label}>
              Ghi chú mô tả
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={fee?.description ?? ""}
              placeholder="Mô tả cách áp dụng phí cho Staff/Sales khi báo giá"
              className={`${styles.textArea} input-focus-ring`}
            />
          </div>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={fee?.isActive ?? true}
              className={styles.checkbox}
            />
            <span className={styles.checkboxLabel}>Đang hoạt động</span>
          </label>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitBtn}
            >
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Thêm mới" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
