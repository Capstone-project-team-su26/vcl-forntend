"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import * as orderConsignmentService from "@/utils/orderConsignmentService";
import * as consignmentQuotationService from "@/utils/consignmentQuotationService";
import * as servicePricingService from "@/utils/servicePricingService";
import { getErrorMessage } from "@/utils/apiError";
import { isMockMode } from "@/utils/mocks/dataSource";
import { ROUTES } from "@/utils/appRoutes";
import VndMoneyInput from "@/app/components/VndMoneyInput";

const {
  CONSIGNMENT_STATUS_LABELS,
  CONSIGNMENT_STATUS_STYLES,
  canStaffSendConsignmentQuotation,
  formatConsignmentDate,
  formatConsignmentDisplayCode,
} = orderConsignmentService;

const {
  buildDefaultAdditionalFeeLines,
  buildConsignmentQuotationDraft,
  calculateQuotationTotal,
  estimateConsignmentQuotation,
  fetchActiveAdditionalFees,
  formatMoney,
  recalculateAdditionalFeeLine,
  resolveQuotationAdditionalFees,
  resolveConsignmentServiceType,
  resolveInitialSalesNote,
  resolveServicePricingForConsignment,
} = consignmentQuotationService;

const {
  findServicePricingForQuotation,
  listInternationalWarehouses,
  listServicePricings,
  buildMainServicePricingBreakdown,
  getAvailableServiceTypes,
  formatServiceTypeLabel,
  formatVolumeCm3,
  volumeCm3ToM3,
  volumeM3ToCm3,
  UNIT_TYPE_LABELS,
} = servicePricingService;

function FieldLabel({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
      {children}
      {required ? <span className="text-danger"> *</span> : null}
    </label>
  );
}

const LOCKED_FIELD_CLASS =
  "w-full h-11 px-4 rounded-lg border border-border-muted text-sm bg-surface text-ink cursor-not-allowed opacity-90";

function formatKgLabel(value) {
  const numeric = Number(value) || 0;
  return `${numeric.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} kg`;
}

function FormulaStepCard({ index, title, formula, note, highlight = false }) {
  return (
    <div
      className={`flex gap-3 rounded-xl border p-3.5 ${
        highlight
          ? "border-primary/30 bg-primary/5"
          : "border-border-muted bg-surface-elevated"
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
          highlight
            ? "bg-primary text-ink-deep"
            : "bg-surface-muted text-primary border border-primary/20"
        }`}
      >
        {index}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm font-bold text-ink">{title}</p>
        {formula ? (
          <div
            className={`rounded-lg border px-3 py-2.5 ${
              highlight
                ? "border-primary/25 bg-surface-muted"
                : "border-border-muted bg-surface-muted"
            }`}
          >
            <p className="font-mono text-[13px] sm:text-sm text-ink leading-relaxed break-all">
              {formula}
            </p>
          </div>
        ) : null}
        {note ? <p className="text-xs text-muted leading-relaxed">{note}</p> : null}
      </div>
    </div>
  );
}

function PricingFormulaBreakdown({ breakdown }) {
  if (!breakdown?.show) return null;

  const numberedSteps = breakdown.steps ?? [];
  const freightStep = breakdown.freightStep;
  const allSteps = [
    ...numberedSteps.map((step) => ({ ...step, highlight: false })),
    ...(freightStep?.formula
      ? [{ ...freightStep, highlight: true }]
      : freightStep?.note
        ? [{ key: "freight-note", title: freightStep.title, formula: null, note: freightStep.note, highlight: false }]
        : []),
  ];

  const showSummaryChips =
    breakdown.volumetricWeight > 0 &&
    breakdown.actualWeightKg != null &&
    breakdown.chargeableWeight > 0;

  return (
    <div className="rounded-xl border border-border-muted bg-surface-muted/50 p-4 sm:p-5 space-y-4">
      <div className="flex items-start gap-3 pb-1 border-b border-border-muted/50">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/15">
          <Icon icon="lucide:calculator" className="w-4.5 h-4.5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink">Công thức tính cước dịch vụ chính</p>
          <p className="text-xs text-muted mt-0.5">
            {breakdown.hasConfiguredPricing
              ? "Đơn giá từ bảng giá service-pricings trên BE."
              : "Ước tính tạm — cần cấu hình bảng giá BE để có đơn giá chính xác."}
          </p>
          {showSummaryChips ? (
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-border-muted bg-surface-elevated px-2.5 py-1 text-[11px] font-semibold text-ink">
                <Icon icon="lucide:scale" className="w-3 h-3 text-muted" />
                {formatKgLabel(breakdown.actualWeightKg)} thực
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border-muted bg-surface-elevated px-2.5 py-1 text-[11px] font-semibold text-ink">
                <Icon icon="lucide:box" className="w-3 h-3 text-muted" />
                DIM {formatKgLabel(breakdown.volumetricWeight)}
              </span>
              <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5 text-muted hidden sm:block" />
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                {formatKgLabel(breakdown.chargeableWeight)} tính phí
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {allSteps.length > 0 ? (
        <div className="space-y-2.5">
          {allSteps.map((step, index) => (
            <FormulaStepCard
              key={step.key ?? `${step.title}-${index}`}
              index={index + 1}
              title={step.title}
              formula={step.formula}
              note={step.note}
              highlight={step.highlight}
            />
          ))}
        </div>
      ) : null}
    </div>
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

  const [serviceType, setServiceType] = useState("STANDARD");
  const [weightKg, setWeightKg] = useState("");
  const [volumeCm3, setVolumeCm3] = useState("");
  const [packageCount, setPackageCount] = useState("");
  const [declaredValue, setDeclaredValue] = useState("");
  const [mainServiceAmount, setMainServiceAmount] = useState("");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [additionalFeeLines, setAdditionalFeeLines] = useState([]);
  const [feeCatalog, setFeeCatalog] = useState([]);
  const [feesFromApi, setFeesFromApi] = useState(false);
  const [salesNote, setSalesNote] = useState("");
  const [estimateSnapshot, setEstimateSnapshot] = useState(null);

  const canSend = detail ? canStaffSendConsignmentQuotation(detail) : false;

  const resolvedWarehouseId = useMemo(
    () => detail?.warehouseId ?? warehouses[0]?.id ?? "",
    [detail?.warehouseId, warehouses]
  );

  const selectedWarehouse = useMemo(
    () => warehouses.find((entry) => entry.id === resolvedWarehouseId) ?? null,
    [warehouses, resolvedWarehouseId]
  );

  const quotationPricingContext = useMemo(
    () => ({ warehouse: selectedWarehouse, consignment: detail }),
    [selectedWarehouse, detail]
  );

  const availableServiceTypes = useMemo(
    () => getAvailableServiceTypes(servicePricings, quotationPricingContext),
    [servicePricings, quotationPricingContext]
  );

  const selectedServicePricing = useMemo(
    () =>
      resolveServicePricingForConsignment(
        findServicePricingForQuotation(servicePricings, {
          ...quotationPricingContext,
          serviceType,
        }),
        detail
      ),
    [servicePricings, quotationPricingContext, serviceType, detail]
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

  const volumeM3 = useMemo(
    () => (volumeCm3 === "" ? "" : String(volumeCm3ToM3(volumeCm3))),
    [volumeCm3]
  );

  const pricingBreakdown = useMemo(
    () =>
      buildMainServicePricingBreakdown(selectedServicePricing, {
        weightKg,
        volumeM3,
        estimate:
          estimateSnapshot ??
          (detail?.quotation
            ? {
                volumetricWeight: detail.quotation.volumetricWeight,
                chargeableWeight: detail.quotation.chargeableWeight,
                estimatedFreightCharge:
                  detail.quotation.estimatedFreightCharge ?? detail.quotation.mainServiceAmount,
              }
            : null),
      }),
    [selectedServicePricing, weightKg, volumeM3, estimateSnapshot, detail?.quotation]
  );

  const resolvedBackHref =
    backHref ?? (id ? ROUTES.sales.consignment(id) : ROUTES.sales.consignments);

  useEffect(() => {
    if (!availableServiceTypes.length) return;

    const current = String(serviceType).toUpperCase();
    const hasCurrent = availableServiceTypes.some(
      (type) => String(type).toUpperCase() === current
    );

    if (!hasCurrent) {
      setServiceType(availableServiceTypes[0]);
    }
  }, [availableServiceTypes, resolvedWarehouseId]);

  useEffect(() => {
    if (!id) return;

    let active = true;

    async function load() {
      setIsLoading(true);
      setLoadError("");
      setSubmitError("");
      setSuccessMessage("");

      try {
        const consignment = await orderConsignmentService.getStaffConsignment(id);
        if (!active) return;

        const [warehouseList, pricingList, activeFees] = await Promise.all([
          listInternationalWarehouses().catch(() => []),
          listServicePricings({ isActive: true }),
          fetchActiveAdditionalFees().catch(() => []),
        ]);
        if (!active) return;

        setDetail(consignment);
        setWarehouses(warehouseList);
        setServicePricings(pricingList);
        setFeeCatalog(activeFees);

        const whId = consignment.warehouseId ?? warehouseList[0]?.id ?? "";
        const selectedWh = warehouseList.find((entry) => entry.id === whId) ?? warehouseList[0] ?? null;
        const weight = consignment.totalWeight != null ? String(consignment.totalWeight) : "";
        const volumeM3FromApi =
          consignment.totalVolume != null ? Number(consignment.totalVolume) : null;
        const volume =
          volumeM3FromApi != null ? String(volumeM3ToCm3(volumeM3FromApi)) : "";
        const packages =
          consignment.packageCount != null
            ? String(consignment.packageCount)
            : consignment.quantity != null
              ? String(consignment.quantity)
              : "1";
        const firstItem = consignment.items?.[0];
        const declared =
          firstItem?.declaredValue != null ? String(firstItem.declaredValue) : "";
        const draftMainAmount =
          consignment.quotation?.estimatedFreightCharge ??
          consignment.quotation?.mainServiceAmount ??
          null;

        setDeclaredValue(declared);
        setSalesNote(resolveInitialSalesNote(consignment));
        setWeightKg(weight);
        setVolumeCm3(volume);
        setPackageCount(packages);

        const initialServiceType = resolveConsignmentServiceType(consignment);
        const pricing = resolveServicePricingForConsignment(
          findServicePricingForQuotation(pricingList, {
            warehouse: selectedWh,
            consignment,
            serviceType: initialServiceType,
          }),
          consignment
        );
        setServiceType(pricing?.serviceType ?? initialServiceType);

        const estimateSalesNote =
          resolveInitialSalesNote(consignment) || "Báo giá tạm tính";

        const preliminaryDraft = buildConsignmentQuotationDraft({
          servicePricing: pricing,
          weightKg: weight,
          volumeM3: volumeM3FromApi ?? (volume ? volumeCm3ToM3(volume) : 0),
          packageCount: packages,
          declaredValue: declared,
          discountPercent: consignment.quotation?.discountPercent ?? 0,
          mainServiceAmountOverride: draftMainAmount,
          salesNote: estimateSalesNote,
        });

        let estimateResult = null;
        if (!isMockMode() && pricing) {
          try {
            estimateResult = await estimateConsignmentQuotation(id, {
              warehouseId: whId || undefined,
              servicePricingId: pricing.id,
              serviceType: pricing.serviceType ?? initialServiceType,
              weightKg: weight ? Number(weight) : undefined,
              volumeM3: volumeM3FromApi ?? (volume ? volumeCm3ToM3(volume) : undefined),
              packageCount: packages ? Number(packages) : undefined,
              declaredValue: declared !== "" ? Number(declared) : undefined,
              salesNote: estimateSalesNote,
              quotation: preliminaryDraft,
            });
          } catch {
            estimateResult = null;
          }
        }

        const draftMainAmountResolved =
          estimateResult?.estimatedFreightCharge ??
          estimateResult?.quotation?.mainServiceAmount ??
          draftMainAmount;

        const draft = buildConsignmentQuotationDraft({
          servicePricing: pricing,
          weightKg: weight,
          volumeM3: volumeM3FromApi ?? (volume ? volumeCm3ToM3(volume) : 0),
          packageCount: packages,
          declaredValue: declared,
          discountPercent: consignment.quotation?.discountPercent ?? 0,
          mainServiceAmountOverride: draftMainAmountResolved,
        });

        const { lines: feeLines, fromApi } = resolveQuotationAdditionalFees({
          consignment,
          estimate: estimateResult,
          catalogFees: activeFees,
          packageCount: packages,
          declaredValue: declared,
          mainServiceAmount: draft.mainServiceAmount,
        });

        setMainServiceAmount(String(draftMainAmountResolved ?? draft.mainServiceAmount));
        setAdditionalFeeLines(feeLines);
        setFeesFromApi(fromApi);
        setEstimateSnapshot(
          estimateResult
            ? {
                volumetricWeight: estimateResult.volumetricWeight,
                chargeableWeight: estimateResult.chargeableWeight,
                estimatedFreightCharge: estimateResult.estimatedFreightCharge,
              }
            : null
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
    if (feesFromApi || !selectedServicePricing || !weightKg || !volumeCm3 || !feeCatalog.length) {
      return;
    }

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
        fees: feeCatalog,
        packageCount,
        declaredValue,
        mainServiceAmount: draft.mainServiceAmount,
        enabledFeeIds: Object.keys(enabledMap).length ? enabledMap : undefined,
        requiresInspection: detail?.requiresInspection === true,
      });
    });
  }, [
    selectedServicePricing?.id,
    weightKg,
    volumeM3,
    packageCount,
    declaredValue,
    discountPercent,
    feeCatalog,
    feesFromApi,
    detail?.requiresInspection,
  ]);

  useEffect(() => {
    if (pricingBreakdown.amount > 0) {
      setMainServiceAmount(String(pricingBreakdown.amount));
    }
  }, [pricingBreakdown.amount]);

  function resetSubmitState() {
    setSubmitError("");
    setSuccessMessage("");
  }

  function toggleAdditionalFee(feeId) {
    if (feesFromApi) {
      setAdditionalFeeLines((current) =>
        current.map((line) => {
          if (line.feeId !== feeId || line.isRequired) return line;
          const enabled = line.enabled === false;
          const baseAmount = line.baseAmount ?? line.amount;
          return {
            ...line,
            enabled,
            baseAmount,
            amount: enabled ? baseAmount : 0,
          };
        })
      );
      resetSubmitState();
      return;
    }

    const fee = feeCatalog.find((entry) => entry.id === feeId);
    const context = {
      packageCount,
      declaredValue,
      mainServiceAmount: Number(mainServiceAmount) || 0,
    };

    setAdditionalFeeLines((current) =>
      current.map((line) => {
        if (line.feeId !== feeId) return line;
        const enabled = line.enabled === false;
        if (!fee) return { ...line, enabled, amount: 0 };
        return recalculateAdditionalFeeLine(fee, { ...line, enabled }, context);
      })
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

    if (
      !selectedServicePricing.unitType ||
      !selectedServicePricing.originCountry ||
      !selectedServicePricing.destinationCountry
    ) {
      setSubmitError(
        "Giá dịch vụ thiếu thông tin tuyến (unitType, quốc gia). Kiểm tra cấu hình bảng giá."
      );
      return;
    }

    if (totals.total <= 0) {
      setSubmitError("Tổng báo giá phải lớn hơn 0.");
      return;
    }

    if (!salesNote.trim()) {
      setSubmitError("Vui lòng nhập ghi chú tư vấn trước khi gửi báo giá.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");

    const resolvedVolumeM3 = volumeCm3 ? volumeCm3ToM3(volumeCm3) : 0;

    const quotation = buildConsignmentQuotationDraft({
      servicePricing: selectedServicePricing,
      weightKg,
      volumeM3: resolvedVolumeM3,
      packageCount,
      declaredValue,
      discountPercent,
      mainServiceAmountOverride: mainServiceAmount,
      additionalFees: additionalFeeLines,
      salesNote,
    });

    const sendParams = {
      warehouseId: resolvedWarehouseId,
      servicePricingId: selectedServicePricing.id,
      serviceType,
      weightKg: Number(weightKg),
      volumeM3: resolvedVolumeM3,
      packageCount: Number(packageCount),
      declaredValue: declaredValue === "" ? null : Number(declaredValue),
      salesNote,
      quotation,
    };

    try {
      if (!isMockMode()) {
        await estimateConsignmentQuotation(detail.id, sendParams);
      }

      const response = await orderConsignmentService.sendConsignmentQuotation(detail.id, sendParams);

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

  const displayCode = formatConsignmentDisplayCode(detail);
  const volumetricWeight = pricingBreakdown.volumetricWeight ?? 0;
  const chargeableWeight = pricingBreakdown.chargeableWeight ?? 0;

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
            {displayCode ? (
              <p className="text-xl font-black font-['Oswald'] text-ink">{displayCode}</p>
            ) : null}
            <p className={`text-sm text-muted ${displayCode ? "mt-1" : ""}`}>
              {detail.customerName} · {formatConsignmentDate(detail.createdAt)}
            </p>
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
            <div>
              <h2 className="text-lg font-bold text-ink">Thông số & dịch vụ chính</h2>
              <p className="text-sm text-muted mt-1">
                Các thông số lấy từ yêu cầu ký gửi — không chỉnh tại bước báo giá.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FieldLabel htmlFor="serviceType" required>Loại dịch vụ</FieldLabel>
                <select
                  id="serviceType"
                  value={
                    availableServiceTypes.some(
                      (type) => String(type).toUpperCase() === String(serviceType).toUpperCase()
                    )
                      ? serviceType
                      : availableServiceTypes[0] ?? ""
                  }
                  disabled
                  className="form-select input-focus-ring disabled:opacity-90 disabled:cursor-not-allowed disabled:bg-surface"
                >
                  {!availableServiceTypes.length ? (
                    <option value="">Chưa có bảng giá phù hợp</option>
                  ) : null}
                  {availableServiceTypes.map((type) => (
                    <option key={type} value={type}>
                      {formatServiceTypeLabel(type)}
                    </option>
                  ))}
                </select>
                {!availableServiceTypes.length ? (
                  <p className="text-xs text-muted">
                    Bảng giá BE chưa có tuyến khớp đơn này — liên hệ Admin cấu hình service-pricings.
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="weightKg" required>Khối lượng (kg)</FieldLabel>
                <input
                  id="weightKg"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={weightKg}
                  readOnly
                  className={LOCKED_FIELD_CLASS}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="volumeCm3" required>Thể tích (cm³)</FieldLabel>
                <input
                  id="volumeCm3"
                  type="number"
                  min="1"
                  step="1"
                  value={volumeCm3}
                  readOnly
                  className={LOCKED_FIELD_CLASS}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="packageCount" required>Số kiện</FieldLabel>
                <input
                  id="packageCount"
                  type="number"
                  min="1"
                  value={packageCount}
                  readOnly
                  className={LOCKED_FIELD_CLASS}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="declaredValue">Giá trị khai báo (VND)</FieldLabel>
                <VndMoneyInput
                  id="declaredValue"
                  value={declaredValue}
                  disabled
                  className={LOCKED_FIELD_CLASS}
                />
              </div>
            </div>

            {selectedServicePricing ? (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-muted">Tuyến</p>
                  <p className="font-semibold text-ink">{selectedServicePricing.originCountry} → {selectedServicePricing.destinationCountry}</p>
                </div>
                <div>
                  <p className="text-muted">Cân thực → DIM → Tính phí</p>
                  <p className="font-semibold text-ink leading-snug">
                    {Number(weightKg) > 0 ? `${weightKg} kg` : "—"} thực
                    {volumetricWeight > 0 ? (
                      <>
                        {" · "}
                        <span className="text-muted font-normal">
                          DIM {volumetricWeight} kg
                        </span>
                      </>
                    ) : null}
                    {chargeableWeight > 0 ? (
                      <>
                        {" → "}
                        <span className="text-primary">{chargeableWeight} kg</span> tính phí
                      </>
                    ) : null}
                  </p>
                  {pricingBreakdown.volumeCm3 != null && volumetricWeight > 0 ? (
                    <p className="text-xs text-muted mt-1">
                      DIM = {formatVolumeCm3(pricingBreakdown.volumeCm3)} ÷ 5.000
                    </p>
                  ) : null}
                </div>
                <div>
                  <p className="text-muted">Đơn vị tính</p>
                  <p className="font-semibold text-ink">
                    {UNIT_TYPE_LABELS[selectedServicePricing.unitType] ??
                      selectedServicePricing.unitType}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-danger">Chưa có giá dịch vụ chính cho kho/dịch vụ đã chọn.</p>
            )}

            {pricingBreakdown.show ? <PricingFormulaBreakdown breakdown={pricingBreakdown} /> : null}

            <div className="space-y-2">
              <FieldLabel htmlFor="mainServiceAmount" required>Thành tiền dịch vụ chính (VND)</FieldLabel>
              <VndMoneyInput
                id="mainServiceAmount"
                value={mainServiceAmount}
                required
                disabled
                className={LOCKED_FIELD_CLASS}
              />
              <p className="text-xs text-muted">
                Tự tính từ bảng giá và công thức trên — không chỉnh thủ công.
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-ink">Phụ phí bổ sung</h2>
              <p className="text-sm text-muted mt-1">
                Chọn các khoản phí áp dụng cho báo giá này. Thành tiền tự tính theo số kiện và giá trị khai báo.
              </p>
            </div>
            {!additionalFeeLines.length ? (
              <p className="text-sm text-muted">
                Chưa có phụ phí để hiển thị. Kiểm tra cấu hình tại Admin → Phí dịch vụ bổ sung
                (`/api/pricing-rules` trên BE).
              </p>
            ) : (
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
                      <td className="px-4 py-3 text-right font-semibold">
                        {line.enabled !== false ? formatMoney(line.amount) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
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
              <FieldLabel htmlFor="salesNote" required>Ghi chú tư vấn</FieldLabel>
              {detail?.notes && detail.notes !== salesNote ? (
                <p className="text-xs text-muted">
                  Ghi chú từ đơn hàng: <span className="text-ink">{detail.notes}</span>
                </p>
              ) : null}
              <textarea id="salesNote" rows={3} value={salesNote} onChange={(e) => { setSalesNote(e.target.value); resetSubmitState(); }} placeholder="Nội dung gửi kèm báo giá cho khách..." className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm input-focus-ring resize-y min-h-[88px]" />
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
