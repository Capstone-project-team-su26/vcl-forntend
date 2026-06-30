"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import * as orderConsignmentService from "@/utils/orderConsignmentService";
import * as consignmentQuotationService from "@/utils/consignmentQuotationService";
import * as servicePricingService from "@/utils/servicePricingService";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";

const {
  CONSIGNMENT_STATUS_LABELS,
  CONSIGNMENT_STATUS_STYLES,
  canStaffSendConsignmentQuotation,
  formatConsignmentDate,
} = orderConsignmentService;

const {
  buildConsignmentQuotationDraft,
  buildDefaultAdditionalFeeLines,
  calculateQuotationTotal,
  formatMoney,
  listActiveAdditionalFees,
} = consignmentQuotationService;

const {
  findServicePricingForWarehouse,
  listInternationalWarehouses,
  listServicePricings,
  calculateChargeableWeight,
  calculateVolumetricWeight,
  formatInternationalWarehouseLabel,
} = servicePricingService;

function FieldLabel({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
      {children}
      {required ? <span className="text-danger"> *</span> : null}
    </label>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
        CONSIGNMENT_STATUS_STYLES[status] || "bg-surface text-muted"
      }`}
    >
      {CONSIGNMENT_STATUS_LABELS[status] || status}
    </span>
  );
}

export default function ConsignmentQuotationPanel({ id, backHref }) {
  const [detail, setDetail] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [servicePricings, setServicePricings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [warehouseId, setWarehouseId] = useState("");
  const [serviceType, setServiceType] = useState("STANDARD");
  const [weightKg, setWeightKg] = useState("");
  const [volumeM3, setVolumeM3] = useState("");
  const [packageCount, setPackageCount] = useState("");
  const [declaredValue, setDeclaredValue] = useState("");
  const [mainServiceAmount, setMainServiceAmount] = useState("");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [additionalFeeLines, setAdditionalFeeLines] = useState([]);
  const [salesNote, setSalesNote] = useState("");

  const canSend = detail ? canStaffSendConsignmentQuotation(detail) : false;

  const selectedServicePricing = useMemo(
    () =>
      servicePricings.find(
        (entry) => entry.warehouseId === warehouseId && entry.serviceType === serviceType
      ) ?? findServicePricingForWarehouse(servicePricings, warehouseId, serviceType),
    [servicePricings, warehouseId, serviceType]
  );

  const totals = useMemo(
    () =>
      calculateQuotationTotal({
        mainServiceAmount: mainServiceAmount === "" ? 0 : Number(mainServiceAmount),
        additionalFees: additionalFeeLines,
        discountPercent,
      }),
    [mainServiceAmount, additionalFeeLines, discountPercent]
  );

  const resolvedBackHref =
    backHref ?? (id ? ROUTES.sales.consignment(id) : ROUTES.sales.consignments);

  useEffect(() => {
    if (!id) return;

    let active = true;

    async function load() {
      setIsLoading(true);
      setLoadError("");
      setSubmitError("");
      setSuccessMessage("");

      try {
        const [consignment, warehouseList, pricingList] = await Promise.all([
          orderConsignmentService.getStaffConsignment(id),
          listInternationalWarehouses(),
          listServicePricings({ isActive: true }),
        ]);
        if (!active) return;

        setDetail(consignment);
        setWarehouses(warehouseList);
        setServicePricings(pricingList);

        const whId = consignment.warehouseId ?? warehouseList[0]?.id ?? "";
        const weight = consignment.totalWeight != null ? String(consignment.totalWeight) : "";
        const volume = consignment.totalVolume != null ? String(consignment.totalVolume) : "";
        const packages =
          consignment.packageCount != null
            ? String(consignment.packageCount)
            : consignment.quantity != null
              ? String(consignment.quantity)
              : "1";

        setWarehouseId(whId);
        setWeightKg(weight);
        setVolumeM3(volume);
        setPackageCount(packages);
        setSalesNote(consignment.quotation?.salesNote ?? "");

        const pricing =
          pricingList.find((entry) => entry.warehouseId === whId) ??
          findServicePricingForWarehouse(pricingList, whId);
        if (pricing) setServiceType(pricing.serviceType);

        const draft = buildConsignmentQuotationDraft({
          servicePricing: pricing,
          weightKg: weight,
          volumeM3: volume,
          packageCount: packages,
          discountPercent: consignment.quotation?.discountPercent ?? 0,
        });
        setMainServiceAmount(String(draft.mainServiceAmount));
        setAdditionalFeeLines(
          buildDefaultAdditionalFeeLines({
            fees: listActiveAdditionalFees(),
            packageCount: packages,
            mainServiceAmount: draft.mainServiceAmount,
          })
        );
      } catch (err) {
        if (active) setLoadError(getErrorMessage(err));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!selectedServicePricing || !weightKg || !volumeM3) return;

    const draft = buildConsignmentQuotationDraft({
      servicePricing: selectedServicePricing,
      weightKg,
      volumeM3,
      packageCount,
      declaredValue,
      discountPercent,
    });

    setMainServiceAmount(String(draft.mainServiceAmount));
    setAdditionalFeeLines((current) => {
      const enabledMap = Object.fromEntries(
        current.map((line) => [line.feeId, line.enabled !== false])
      );
      return buildDefaultAdditionalFeeLines({
        fees: listActiveAdditionalFees(),
        packageCount,
        declaredValue,
        mainServiceAmount: draft.mainServiceAmount,
        enabledFeeIds: Object.keys(enabledMap).length ? enabledMap : undefined,
      });
    });
  }, [
    selectedServicePricing?.id,
    weightKg,
    volumeM3,
    packageCount,
    declaredValue,
    discountPercent,
  ]);

  function resetSubmitState() {
    setSubmitError("");
    setSuccessMessage("");
  }

  function toggleAdditionalFee(feeId) {
    setAdditionalFeeLines((current) =>
      current.map((line) =>
        line.feeId === feeId
          ? { ...line, enabled: line.enabled === false, amount: line.enabled === false ? line.amount : 0 }
          : line
      )
    );
    resetSubmitState();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!detail || !canSend || isSubmitting) return;

    if (!selectedServicePricing) {
      setSubmitError("Không tìm thấy giá dịch vụ chính cho kho đã chọn.");
      return;
    }

    if (totals.total <= 0) {
      setSubmitError("Tổng báo giá phải lớn hơn 0.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");

    const quotation = buildConsignmentQuotationDraft({
      servicePricing: selectedServicePricing,
      weightKg,
      volumeM3,
      packageCount,
      declaredValue,
      discountPercent,
      mainServiceAmountOverride: mainServiceAmount,
      additionalFees: additionalFeeLines,
      salesNote,
    });

    try {
      const response = await orderConsignmentService.sendConsignmentQuotation(detail.id, {
        warehouseId,
        servicePricingId: selectedServicePricing.id,
        serviceType,
        weightKg: Number(weightKg),
        volumeM3: Number(volumeM3),
        packageCount: Number(packageCount),
        declaredValue: declaredValue === "" ? null : Number(declaredValue),
        salesNote,
        quotation,
      });

      const updated = response.consignment ?? {
        ...detail,
        status: response.status ?? "QUOTATION_SENT",
        quotation,
      };

      setDetail(updated);
      setSuccessMessage(
        `${response.message || "Đã gửi báo giá cho khách hàng."} Trạng thái: ${
          CONSIGNMENT_STATUS_LABELS[response.status] || response.status
        }.`
      );
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted">
        <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin" />
        <p className="text-sm font-medium">Đang tải yêu cầu ký gửi...</p>
      </div>
    );
  }

  if (loadError && !detail) {
    return (
      <div className="space-y-4">
        <Link href={resolvedBackHref} className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          Quay lại
        </Link>
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{loadError}</div>
      </div>
    );
  }

  if (!detail) return null;

  const volumetricWeight = calculateVolumetricWeight(volumeM3);
  const chargeableWeight = calculateChargeableWeight(weightKg, volumeM3);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <Link href={resolvedBackHref} className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink mb-4">
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          Quay lại chi tiết yêu cầu
        </Link>
        <p className="text-xs font-bold uppercase tracking-wide text-primary mb-2">Sales / CSKH</p>
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-['Oswald'] text-ink">
          {detail.status === "QUOTATION_REJECTED" ? "Gửi báo giá mới" : "Tư vấn & gửi báo giá ký gửi"}
        </h1>
        <p className="text-muted text-sm font-medium mt-2">
          Hệ thống tính <strong>dịch vụ chính</strong> từ bảng giá. Phụ phí lấy từ cấu hình Admin — Sales
          bật/tắt và gửi cho khách.
        </p>
      </div>

      <div className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Yêu cầu</p>
            <p className="text-xl font-black font-['Oswald'] text-ink">{detail.id}</p>
            <p className="text-sm text-muted mt-1">{detail.customerName} · {formatConsignmentDate(detail.createdAt)}</p>
          </div>
          <StatusBadge status={detail.status} />
        </div>
      </div>

      {successMessage ? (
        <div className="rounded-lg border border-success/30 bg-success-bg px-4 py-4 text-sm text-success-text space-y-3">
          <p className="font-semibold">{successMessage}</p>
          <Link href={ROUTES.sales.consignment(detail.id)} className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-primary text-white text-sm font-bold">
            Xem chi tiết yêu cầu
          </Link>
        </div>
      ) : null}

      {!canSend && !successMessage ? (
        <div className="rounded-lg border border-warning/30 bg-warning-bg/40 px-4 py-3 text-sm text-ink">
          {detail.status === "QUOTATION_SENT"
            ? "Báo giá đã gửi — đang chờ khách xác nhận hoặc từ chối."
            : "Yêu cầu này không thể gửi báo giá ở trạng thái hiện tại."}
        </div>
      ) : null}

      {canSend && !successMessage ? (
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
            <h2 className="text-lg font-bold text-ink">Thông số & dịch vụ chính</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <FieldLabel htmlFor="warehouseId" required>Kho quốc tế</FieldLabel>
                <select
                  id="warehouseId"
                  value={warehouseId}
                  onChange={(e) => {
                    setWarehouseId(e.target.value);
                    resetSubmitState();
                  }}
                  className="form-select input-focus-ring"
                >
                  <option value="">Chọn kho...</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {formatInternationalWarehouseLabel(warehouse)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="serviceType" required>Loại dịch vụ</FieldLabel>
                <select
                  id="serviceType"
                  value={serviceType}
                  onChange={(e) => {
                    setServiceType(e.target.value);
                    resetSubmitState();
                  }}
                  className="form-select input-focus-ring"
                >
                  {[...new Set(servicePricings.filter((p) => p.warehouseId === warehouseId).map((p) => p.serviceType))].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="weightKg" required>Khối lượng (kg)</FieldLabel>
                <input id="weightKg" type="number" min="0.01" step="0.01" value={weightKg} onChange={(e) => { setWeightKg(e.target.value); resetSubmitState(); }} className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring" />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="volumeM3" required>Thể tích (m³)</FieldLabel>
                <input id="volumeM3" type="number" min="0.001" step="0.001" value={volumeM3} onChange={(e) => { setVolumeM3(e.target.value); resetSubmitState(); }} className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring" />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="packageCount" required>Số kiện</FieldLabel>
                <input id="packageCount" type="number" min="1" value={packageCount} onChange={(e) => { setPackageCount(e.target.value); resetSubmitState(); }} className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring" />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="declaredValue">Giá trị khai báo (USD)</FieldLabel>
                <input id="declaredValue" type="number" min="0" step="0.01" value={declaredValue} onChange={(e) => { setDeclaredValue(e.target.value); resetSubmitState(); }} className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring" />
              </div>
            </div>

            {selectedServicePricing ? (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-muted">Tuyến</p>
                  <p className="font-semibold text-ink">{selectedServicePricing.originCountry} → {selectedServicePricing.destinationCountry}</p>
                </div>
                <div>
                  <p className="text-muted">Trọng lượng tính cước</p>
                  <p className="font-semibold text-ink">{chargeableWeight} kg (quy đổi {volumetricWeight} kg)</p>
                </div>
                <div>
                  <p className="text-muted">Đơn vị tính</p>
                  <p className="font-semibold text-ink">{selectedServicePricing.unitType}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-danger">Chưa có giá dịch vụ chính cho kho/dịch vụ đã chọn.</p>
            )}

            <div className="space-y-2">
              <FieldLabel htmlFor="mainServiceAmount" required>Thành tiền dịch vụ chính (USD)</FieldLabel>
              <input id="mainServiceAmount" type="number" min="0" step="0.01" value={mainServiceAmount} onChange={(e) => { setMainServiceAmount(e.target.value); resetSubmitState(); }} className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring" />
              <p className="text-xs text-muted">Tự tính từ bảng giá dịch vụ chính. Sales có thể chỉnh trước khi gửi.</p>
            </div>
          </section>

          <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-ink">Phụ phí (từ cấu hình Admin)</h2>
              <p className="text-sm text-muted mt-1">Quản lý tại mục Phí dịch vụ bổ sung. Sales chỉ bật/tắt khi báo giá.</p>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border-muted">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border-muted bg-surface/50">
                    <th className="px-4 py-3 w-10" />
                    <th className="px-4 py-3">Phụ phí</th>
                    <th className="px-4 py-3">Mô tả</th>
                    <th className="px-4 py-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {additionalFeeLines.map((line) => (
                    <tr key={line.feeId} className="border-b border-border-muted/60">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={line.enabled !== false} disabled={line.isRequired} onChange={() => toggleAdditionalFee(line.feeId)} />
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">{line.label}</td>
                      <td className="px-4 py-3 text-muted">{line.description}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatMoney(line.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
            <h2 className="text-lg font-bold text-ink">Tổng báo giá</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FieldLabel htmlFor="discountPercent">Chiết khấu (%)</FieldLabel>
                <input id="discountPercent" type="number" min="0" max="100" step="0.1" value={discountPercent} onChange={(e) => { setDiscountPercent(e.target.value); resetSubmitState(); }} className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring" />
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Dịch vụ chính</dt><dd className="font-semibold">{formatMoney(totals.mainServiceAmount)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Phụ phí</dt><dd className="font-semibold">{formatMoney(totals.additionalTotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Tạm tính</dt><dd className="font-semibold">{formatMoney(totals.subtotal)}</dd></div>
              {totals.discount > 0 ? (
                <div className="flex justify-between text-danger"><dt>Chiết khấu</dt><dd className="font-semibold">-{formatMoney(totals.discount)}</dd></div>
              ) : null}
              <div className="flex justify-between pt-2 border-t border-border-muted">
                <dt className="text-base font-black font-['Oswald']">Tổng cộng</dt>
                <dd className="text-xl font-black text-primary font-['Oswald']">{formatMoney(totals.total)}</dd>
              </div>
            </dl>
            <div className="space-y-2">
              <FieldLabel htmlFor="salesNote">Ghi chú tư vấn</FieldLabel>
              <textarea id="salesNote" rows={3} value={salesNote} onChange={(e) => { setSalesNote(e.target.value); resetSubmitState(); }} className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm input-focus-ring resize-y min-h-[88px]" />
            </div>
          </section>

          {submitError ? <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{submitError}</div> : null}

          <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50">
            {isSubmitting ? <><Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> Đang gửi...</> : <><Icon icon="lucide:send" className="w-4 h-4" /> Gửi báo giá cho khách</>}
          </button>
        </form>
      ) : null}
    </div>
  );
}
