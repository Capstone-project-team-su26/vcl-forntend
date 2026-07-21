"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import * as orderConsignmentService from "@/modules/consignments";
import * as consignmentQuotationService from "@/modules/consignments/quotation";
import ConsignmentStatusBadge from "@/app/pages/sales/consignments/components/ConsignmentStatusBadge";
import QuotationPackageConfigSection from "@/app/pages/sales/consignments/components/quotation/QuotationPackageConfigSection";
import * as servicePricingService from "@/modules/service-pricing";
import { formatFeeAmount } from "@/modules/additional-service-fees";
import { getErrorMessage } from "@/utils/apiError";
import { isMockMode } from "@/utils/mocks/dataSource";
import { ROUTES } from "@/utils/appRoutes";
import VndMoneyInput from "@/app/components/VndMoneyInput";
import { useToast } from "@/app/components/ToastProvider";
import {
  mergeConsignmentDetail,
  resolveConsignmentPackageCount,
} from "@/utils/apiMappers";

const {
  canStaffSendConsignmentQuotation,
  formatConsignmentDate,
  formatConsignmentDisplayCode,
} = orderConsignmentService;

const {
  buildDefaultAdditionalFeeLines,
  buildConsignmentQuotationDraft,
  buildEnabledFeeStateFromLines,
  buildPackingFeeLinesFromConsignment,
  calculateQuotationTotal,
  estimateConsignmentQuotation,
  fetchActiveAdditionalFees,
  formatMoney,
  canEditQuotationFeeSelection,
  recalculateAdditionalFeeLine,
  resolvePreferredMainServiceAmount,
  resolveQuotationAdditionalFees,
  resolveConsignmentServiceType,
  resolveInitialSalesNote,
  resolveServicePricingForConsignment,
  mergeSentQuotationSnapshot,
  formatVatRatePercent,
  isPackingFee,
} = consignmentQuotationService;

const {
  findServicePricingForQuotation,
  listInternationalWarehouses,
  listServicePricings,
  buildMainServicePricingBreakdown,
  getAvailableServiceTypes,
  formatServiceTypeLabel,
  formatConsignmentRouteLabel,
  formatVolumeCm3,
  isConfiguredServicePricing,
  isPricingConfigRule,
  isVolumetricDivisorRule,
  normalizeVolumeCm3FromApi,
  resolveVatRate,
  resolveVolumetricDivisor,
  UNIT_TYPE_LABELS,
  VOLUMETRIC_DIVISOR_CM3,
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
  return `${numeric.toLocaleString("vi-VN", { maximumFractionDigits: 6 })} kg`;
}

function formatMainServiceUnitPrice(servicePricing) {
  if (!servicePricing) return { unit: "—", rate: "—" };
  const unitType = servicePricing.unitType;
  const price = Number(servicePricing.price) || 0;
  const pricePerKg = Number(servicePricing.pricePerKg ?? price) || 0;
  const pricePerCbm = Number(servicePricing.pricePerCbm ?? price) || 0;

  if (unitType === "KG") {
    return { unit: "VND/kg", rate: `${consignmentQuotationService.formatMoney(price)}/kg` };
  }
  if (unitType === "CBM") {
    return { unit: "VND/m³", rate: `${consignmentQuotationService.formatMoney(price)}/m³` };
  }
  if (unitType === "KG_OR_CBM") {
    return {
      unit: "VND/kg · m³",
      rate: `${consignmentQuotationService.formatMoney(pricePerKg)}/kg · ${consignmentQuotationService.formatMoney(pricePerCbm)}/m³`,
    };
  }
  return { unit: "—", rate: price > 0 ? consignmentQuotationService.formatMoney(price) : "—" };
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
          <p className="text-sm font-bold text-ink">Cách tính cước chính (ký gửi)</p>
          <p className="text-xs text-muted mt-0.5">
            {breakdown.hasConfiguredPricing
              ? "Lấy đơn giá từ bảng giá tuyến (service-pricings). Cân tính phí = lớn hơn giữa cân thực tế và cân DIM."
              : "Chưa khớp bảng giá tuyến — cần Admin cấu hình service-pricings trước khi gửi báo giá."}
          </p>
          {showSummaryChips ? (
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-border-muted bg-surface-elevated px-2.5 py-1 text-[11px] font-semibold text-ink">
                <Icon icon="lucide:scale" className="w-3 h-3 text-muted" />
                Cân thực {formatKgLabel(breakdown.actualWeightKg)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border-muted bg-surface-elevated px-2.5 py-1 text-[11px] font-semibold text-ink">
                <Icon icon="lucide:box" className="w-3 h-3 text-muted" />
                Cân DIM {formatKgLabel(breakdown.volumetricWeight)}
              </span>
              <Icon icon="lucide:arrow-right" className="w-3.5 h-3.5 text-muted hidden sm:block" />
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                Cân tính phí {formatKgLabel(breakdown.chargeableWeight)}
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
  return <ConsignmentStatusBadge status={status} />;
}

export default function ConsignmentQuotationPanel({ id, backHref, readOnly = false }) {
  const router = useRouter();
  const toast = useToast();
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
  const [salesNote, setSalesNote] = useState("");
  const [estimateSnapshot, setEstimateSnapshot] = useState(null);
  const [taxSnapshot, setTaxSnapshot] = useState({ importTax: 0, vat: null });

  const canSend = detail && !readOnly ? canStaffSendConsignmentQuotation(detail) : false;

  const resolvedWarehouseId = useMemo(
    () => detail?.warehouseId ?? "",
    [detail?.warehouseId]
  );

  const selectedWarehouse = useMemo(
    () =>
      resolvedWarehouseId
        ? warehouses.find((entry) => entry.id === resolvedWarehouseId) ?? null
        : null,
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

  const displayRouteLabel = useMemo(
    () => formatConsignmentRouteLabel(detail, selectedServicePricing),
    [detail, selectedServicePricing]
  );

  const hasConfiguredPricing = Boolean(
    selectedServicePricing && isConfiguredServicePricing(selectedServicePricing)
  );

  const showServiceSummary = Boolean(
    displayRouteLabel !== "—" || hasConfiguredPricing || detail?.quotation
  );

  const feeCalculationContext = useMemo(
    () => ({
      packageCount,
      declaredValue,
      mainServiceAmount: mainServiceAmount === "" ? 0 : Number(mainServiceAmount),
    }),
    [packageCount, declaredValue, mainServiceAmount]
  );

  const allAdditionalFeeLines = useMemo(
    () => additionalFeeLines.filter((line) => line.enabled !== false),
    [additionalFeeLines]
  );

  const packingFeeTotalFromLines = useMemo(
    () =>
      allAdditionalFeeLines
        .filter((line) => isPackingFee(line))
        .reduce((sum, line) => sum + (Number(line.amount) || 0), 0),
    [allAdditionalFeeLines]
  );

  const vatRate = useMemo(() => resolveVatRate(feeCatalog), [feeCatalog]);

  const totals = useMemo(
    () =>
      calculateQuotationTotal({
        mainServiceAmount: mainServiceAmount === "" ? 0 : Number(mainServiceAmount),
        additionalFees: allAdditionalFeeLines,
        discountPercent,
        importTax: taxSnapshot.importTax,
        vatRate,
      }),
    [mainServiceAmount, allAdditionalFeeLines, discountPercent, taxSnapshot.importTax, vatRate]
  );

  const volumetricDivisor = useMemo(
    () => resolveVolumetricDivisor(feeCatalog),
    [feeCatalog]
  );

  const surchargeFeeCatalog = useMemo(
    () => feeCatalog.filter((fee) => !isPricingConfigRule(fee)),
    [feeCatalog]
  );

  const volumetricDivisorRule = useMemo(
    () => feeCatalog.find(isVolumetricDivisorRule) ?? null,
    [feeCatalog]
  );

  const pricingBreakdown = useMemo(
    () =>
      buildMainServicePricingBreakdown(selectedServicePricing, {
        weightKg,
        volumeCm3,
        items: detail?.items,
        volumetricDivisor,
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
    [
      selectedServicePricing,
      weightKg,
      volumeCm3,
      volumetricDivisor,
      estimateSnapshot,
      detail?.quotation,
      detail?.items,
    ]
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

        const whId = consignment.warehouseId ?? "";
        const selectedWh = whId
          ? warehouseList.find((entry) => entry.id === whId) ?? null
          : null;
        const weight = consignment.totalWeight != null ? String(consignment.totalWeight) : "";
        const volumeCm3FromApi = normalizeVolumeCm3FromApi(consignment.totalVolume, {
          totalVolumeM3: consignment.totalVolumeM3,
        });
        const volume = volumeCm3FromApi != null ? String(volumeCm3FromApi) : "";
        const packages = String(
          resolveConsignmentPackageCount({
            packageCount: consignment.packageCount,
            items: consignment.items,
            quantity: consignment.quantity,
          }) ?? 1
        );
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
        const resolvedVolumeCm3 = volumeCm3FromApi ?? (volume ? Number(volume) : 0);
        const divisor = resolveVolumetricDivisor(activeFees);

        const preliminaryDraft = buildConsignmentQuotationDraft({
          servicePricing: pricing,
          weightKg: weight,
          volumeCm3: resolvedVolumeCm3,
          packageCount: packages,
          declaredValue: declared,
          discountPercent: consignment.quotation?.discountPercent ?? 0,
          salesNote: estimateSalesNote,
          volumetricDivisor: divisor,
          pricingRules: activeFees,
        });

        let estimateResult = null;
        if (!isMockMode() && pricing) {
          try {
            estimateResult = await estimateConsignmentQuotation(id, {
              warehouseId: whId || undefined,
              servicePricingId: pricing.id,
              serviceType: pricing.serviceType ?? initialServiceType,
              weightKg: weight ? Number(weight) : undefined,
              // FE giữ cm³; toApiCreateQuotationRequest đổi sang m³ thật cho BE.
              volumeCm3: volumeCm3FromApi ?? (volume ? Number(volume) : undefined),
              packageCount: packages ? Number(packages) : undefined,
              declaredValue: declared !== "" ? Number(declared) : undefined,
              salesNote: estimateSalesNote,
              quotation: preliminaryDraft,
            });
          } catch {
            estimateResult = null;
          }
        }

        const localDraft = preliminaryDraft;

        const apiFreight =
          estimateResult?.estimatedFreightCharge ??
          estimateResult?.quotation?.mainServiceAmount ??
          draftMainAmount;
        const localFreight = Number(localDraft.mainServiceAmount) || 0;
        // Ưu tiên đơn giá × cân/CBM local; estimate BE chỉ khi chưa tính được.
        const draftMainAmountResolved = resolvePreferredMainServiceAmount(
          localFreight,
          apiFreight
        );

        const draft = buildConsignmentQuotationDraft({
          servicePricing: pricing,
          weightKg: weight,
          volumeCm3: resolvedVolumeCm3,
          packageCount: packages,
          declaredValue: declared,
          discountPercent: consignment.quotation?.discountPercent ?? 0,
          mainServiceAmountOverride: draftMainAmountResolved,
          volumetricDivisor: divisor,
          pricingRules: activeFees,
        });

        const selectedPricingRuleIds = consignment.pricingRuleIds ?? [];
        const { lines: feeLines } = resolveQuotationAdditionalFees({
          consignment,
          estimate: estimateResult,
          catalogFees: activeFees,
          packageCount: packages,
          declaredValue: declared,
          mainServiceAmount: draft.mainServiceAmount,
          selectedPricingRuleIds,
        });

        setMainServiceAmount(String(draftMainAmountResolved ?? draft.mainServiceAmount));
        setAdditionalFeeLines(feeLines);
        setEstimateSnapshot(
          estimateResult
            ? {
                volumetricWeight: estimateResult.volumetricWeight,
                chargeableWeight: estimateResult.chargeableWeight,
                estimatedFreightCharge: estimateResult.estimatedFreightCharge,
              }
            : null
        );
        setTaxSnapshot({
          importTax:
            estimateResult?.importTax ??
            estimateResult?.quotation?.importTax ??
            consignment.quotation?.importTax ??
            0,
          vat:
            estimateResult?.vat ??
            estimateResult?.quotation?.vat ??
            consignment.quotation?.vat ??
            null,
        });

        // Gộp snapshot GET quotation (PACKING_FEE, parcels, totals) vào detail để khối thùng đọc được.
        if (estimateResult?.quotation || estimateResult?.parcels) {
          const quote = estimateResult.quotation ?? {};
          setDetail({
            ...consignment,
            quotation: {
              ...consignment.quotation,
              ...quote,
              parcels: estimateResult.parcels ?? quote.parcels ?? consignment.quotation?.parcels ?? [],
              additionalFees:
                quote.additionalFees ?? consignment.quotation?.additionalFees ?? null,
              domesticShippingFee:
                estimateResult.domesticShippingFee ??
                quote.domesticShippingFee ??
                consignment.quotation?.domesticShippingFee ??
                null,
              totalEstimatedCost:
                estimateResult.totalEstimatedCost ??
                quote.totalEstimatedCost ??
                consignment.quotation?.totalEstimatedCost ??
                null,
            },
          });
        }
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
    if (!detail) return;
    const packages = resolveConsignmentPackageCount({
      packageCount: detail.packageCount,
      items: detail.items,
      quantity: detail.quantity,
    });
    if (packages != null) setPackageCount(String(packages));
  }, [detail?.id, detail?.packageCount, detail?.items, detail?.quantity]);

  useEffect(() => {
    if (!selectedServicePricing || !weightKg || !volumeCm3 || !feeCatalog.length) {
      return;
    }

    const draft = buildConsignmentQuotationDraft({
      servicePricing: selectedServicePricing,
      weightKg,
      volumeCm3,
      packageCount,
      declaredValue,
      discountPercent,
      volumetricDivisor,
      pricingRules: feeCatalog,
    });

    setMainServiceAmount(String(draft.mainServiceAmount));
    setAdditionalFeeLines((current) => {
      // Chưa load xong dòng phí — đừng fallback DOMESTIC (gây lệch lúc mở lại trang).
      if (!current.length) return current;

      const { enabledFeeIds, quantityByFeeId } = buildEnabledFeeStateFromLines(
        current,
        feeCatalog
      );
      const selectedPricingRuleIds = detail?.pricingRuleIds ?? [];
      const next = buildDefaultAdditionalFeeLines({
        fees: feeCatalog,
        packageCount,
        declaredValue,
        mainServiceAmount: draft.mainServiceAmount,
        enabledFeeIds,
        quantityByFeeId,
        selectedPricingRuleIds:
          selectedPricingRuleIds.length &&
          canEditQuotationFeeSelection(detail?.quotation, detail?.status)
            ? selectedPricingRuleIds
            : undefined,
        requiresInspection: detail?.requiresInspection === true,
        requiresWoodenCrate: detail?.requiresWoodenCrate === true,
      });

      // Giữ / bổ sung dòng PACKING_FEE từ API hoặc từ cấu hình thùng Customer.
      const packingLines = current.filter((line) => isPackingFee(line));
      const fallbackPacking =
        packingLines.length || !detail
          ? packingLines
          : buildPackingFeeLinesFromConsignment(detail);
      if (!fallbackPacking.length) return next;

      const presentIds = new Set(
        next
          .map((line) => line.feeId)
          .filter(Boolean)
          .map((value) => String(value).toUpperCase())
      );
      // Không so theo code PACKING_FEE — nhiều dòng thùng cùng code nhưng khác feeId.
      const missingPacking = fallbackPacking.filter((line) => {
        const id = line.feeId != null ? String(line.feeId).toUpperCase() : null;
        return !(id && presentIds.has(id));
      });
      return missingPacking.length ? [...missingPacking, ...next] : next;
    });
  }, [
    selectedServicePricing?.id,
    weightKg,
    volumeCm3,
    packageCount,
    declaredValue,
    discountPercent,
    feeCatalog,
    volumetricDivisor,
    detail?.requiresInspection,
    detail?.requiresWoodenCrate,
    detail?.pricingRuleIds,
    detail?.quotation,
    detail?.status,
    detail?.items,
  ]);

  useEffect(() => {
    if (pricingBreakdown.amount <= 0) return;
    setMainServiceAmount(String(pricingBreakdown.amount));
  }, [pricingBreakdown.amount]);

  function resetSubmitState() {
    setSubmitError("");
    setSuccessMessage("");
  }

  function findCatalogFeeEntry(feeId) {
    return (
      feeCatalog.find((entry) => entry.id === feeId || entry.code === feeId) ?? null
    );
  }

  function updateAdditionalFeeQuantity(feeId, value) {
    setAdditionalFeeLines((current) => {
      const target = current.find((line) => line.feeId === feeId);
      if (target && (target.isPackingFee || isPackingFee(target) || !target.quantityEditable)) {
        return current;
      }
      const fee = findCatalogFeeEntry(feeId);
      return current.map((line) => {
        if (line.feeId !== feeId) return line;
        const quantity = value === "" ? "" : Math.max(0, Number(value) || 0);
        if (!fee) {
          const amount = (Number(line.unitPrice) || 0) * (Number(quantity) || 0);
          return { ...line, quantity, amount };
        }
        return recalculateAdditionalFeeLine(fee, { ...line, quantity }, feeCalculationContext);
      });
    });
    resetSubmitState();
  }

  function reloadBasePricing() {
    if (pricingBreakdown.amount > 0) {
      setMainServiceAmount(String(pricingBreakdown.amount));
    }
    setDiscountPercent("0");
    const selectedPricingRuleIds = detail?.pricingRuleIds ?? [];
    setAdditionalFeeLines((current) => {
      const packingLines = current.filter((line) => isPackingFee(line));
      const next = buildDefaultAdditionalFeeLines({
        fees: feeCatalog,
        packageCount,
        declaredValue,
        mainServiceAmount: pricingBreakdown.amount || Number(mainServiceAmount) || 0,
        selectedPricingRuleIds:
          selectedPricingRuleIds.length &&
          canEditQuotationFeeSelection(detail?.quotation, detail?.status)
            ? selectedPricingRuleIds
            : undefined,
        requiresInspection: detail?.requiresInspection === true,
        requiresWoodenCrate: detail?.requiresWoodenCrate === true,
      });
      const fallbackPacking =
        packingLines.length || !detail
          ? packingLines
          : buildPackingFeeLinesFromConsignment(detail);
      return fallbackPacking.length ? [...fallbackPacking, ...next] : next;
    });
    resetSubmitState();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!detail || !canSend || isSubmitting) return;

    if (!selectedServicePricing || !isConfiguredServicePricing(selectedServicePricing)) {
      const message = "Không tìm thấy giá dịch vụ chính cho tuyến/dịch vụ đã chọn.";
      setSubmitError(message);
      toast.error(message);
      return;
    }

    if (
      !selectedServicePricing.unitType ||
      !selectedServicePricing.originCountry ||
      !selectedServicePricing.destinationCountry
    ) {
      const message =
        "Giá dịch vụ thiếu thông tin tuyến (unitType, quốc gia). Kiểm tra cấu hình bảng giá.";
      setSubmitError(message);
      toast.error(message);
      return;
    }

    if (totals.total <= 0) {
      const message = "Tổng báo giá phải lớn hơn 0.";
      setSubmitError(message);
      toast.error(message);
      return;
    }

    if (!salesNote.trim()) {
      const message = "Vui lòng nhập ghi chú tư vấn trước khi gửi báo giá.";
      setSubmitError(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");

    const resolvedVolumeCm3 = volumeCm3 ? Number(volumeCm3) : 0;

    const quotation = buildConsignmentQuotationDraft({
      servicePricing: selectedServicePricing,
      weightKg,
      volumeCm3: resolvedVolumeCm3,
      packageCount,
      declaredValue,
      discountPercent,
      mainServiceAmountOverride: mainServiceAmount,
      additionalFees: allAdditionalFeeLines,
      salesNote,
      volumetricDivisor,
      pricingRules: feeCatalog,
      importTax: taxSnapshot.importTax,
      vat: totals.vat,
    });

    const quotationPayload = {
      ...quotation,
    };

    const sendParams = {
      warehouseId: resolvedWarehouseId,
      servicePricingId: selectedServicePricing.id,
      serviceType,
      weightKg: Number(weightKg),
      volumeCm3: resolvedVolumeCm3,
      packageCount: Number(packageCount),
      declaredValue: declaredValue === "" ? null : Number(declaredValue),
      salesNote,
      quotation: quotationPayload,
    };

    try {
      if (!isMockMode()) {
        try {
          const estimate = await estimateConsignmentQuotation(detail.id, sendParams);
          if (estimate) {
            setTaxSnapshot({
              importTax: estimate.importTax ?? estimate.quotation?.importTax ?? taxSnapshot.importTax,
              vat: estimate.vat ?? estimate.quotation?.vat ?? null,
            });
          }
        } catch {
          // Estimate thất bại không chặn gửi báo giá chính thức.
        }
      }

      const response = await orderConsignmentService.sendConsignmentQuotation(detail.id, sendParams);

      // BE có thể trả snapshot gộp (serviceFee + taxAndDuty) lệch bảng Sales vừa gửi —
      // giữ breakdown local (đơn giá × SL + VAT 8%) khi tổng/phụ phí BE thưa.
      const mergedQuotation = mergeSentQuotationSnapshot(
        response.consignment?.quotation,
        quotationPayload
      );

      if (response.consignment) {
        setDetail(
          mergeConsignmentDetail(detail, {
            ...response.consignment,
            quotation: mergedQuotation,
          })
        );
      } else {
        setDetail({
          ...detail,
          status: response.status ?? "QUOTATION_SENT",
          quotation: mergedQuotation,
        });
      }
      toast.success(response.message || "Gửi báo giá thành công.");
      router.replace(ROUTES.sales.consignment(detail.id));
    } catch (err) {
      const message = getErrorMessage(err);
      setSubmitError(message);
      toast.error(message);
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
    <div
      className={`space-y-8 w-full mx-auto ${readOnly ? "max-w-7xl" : "max-w-5xl"}`}
    >
      <div>
        <Link href={resolvedBackHref} className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink mb-4">
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          Quay lại chi tiết yêu cầu
        </Link>
        {!readOnly ? (
          <p className="text-xs font-bold uppercase tracking-wide text-primary mb-2">Sales / CSKH</p>
        ) : null}
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-['Oswald'] text-ink">
          {!canSend
            ? "Chi tiết báo giá"
            : detail.status === "QUOTATION_REJECTED"
              ? "Gửi báo giá mới"
              : "Tư vấn & gửi báo giá ký gửi"}
        </h1>
        <p className="text-muted text-sm font-medium mt-2">
          {!canSend ? (
            "Nội dung báo giá của yêu cầu này — chỉ xem, không chỉnh sửa."
          ) : (
            <>
              Cước chính tính từ bảng giá tuyến (khóa). Phụ phí theo dịch vụ khách đã chọn — Sales chỉ chỉnh{" "}
              <strong>số lượng</strong>; thành tiền = đơn giá × số lượng.
            </>
          )}
        </p>
      </div>

      <div className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-subtle">Mã ký gửi</p>
            {displayCode ? (
              <p className="text-xl font-bold font-mono text-ink-deep mt-0.5">{displayCode}</p>
            ) : null}
            <div className={`grid gap-2 sm:grid-cols-2 ${displayCode ? "mt-3" : ""}`}>
              <div className="rounded-lg border border-primary bg-surface-elevated px-3 py-2.5">
                <p className="text-xs font-bold uppercase tracking-wide text-secondary">Người gửi</p>
                <p className="text-sm font-bold text-ink mt-0.5">
                  {detail.senderName || detail.customerName || "—"}
                </p>
              </div>
              <div className="rounded-lg border border-primary bg-surface-elevated px-3 py-2.5">
                <p className="text-xs font-bold uppercase tracking-wide text-secondary">Người nhận</p>
                <p className="text-sm font-bold text-ink mt-0.5">
                  {detail.receiverName || detail.customerName || "—"}
                </p>
              </div>
            </div>
            <p className="text-sm text-subtle mt-2">{formatConsignmentDate(detail.createdAt)}</p>
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
            : detail.status === "QUOTATION_CONFIRMED"
              ? "Khách đã xác nhận báo giá."
              : detail.status === "WAITING_DEPOSIT" || detail.status === "WAITING_PAYMENT"
                ? "Khách đang thanh toán đặt cọc — chờ PayOS xác nhận."
                : detail.status === "DEPOSIT_PAID"
                  ? "Khách đã thanh toán đặt cọc. Vào chi tiết yêu cầu để duyệt."
                  : "Yêu cầu này không ở trạng thái gửi báo giá — chỉ xem lại nội dung báo giá."}
        </div>
      ) : null}

      {!successMessage ? (
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-ink">Thông số đơn hàng &amp; cước chính</h2>
              <p className="text-sm text-muted mt-1">
                Thông số lấy từ yêu cầu ký gửi (khóa). Cước chính = đơn giá tuyến × cân tính phí (MAX cân thực tế, cân DIM).
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FieldLabel htmlFor="serviceType" required>Loại hình vận chuyển</FieldLabel>
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
                    Chưa có bảng giá khớp tuyến đơn này — nhờ Admin cấu hình service-pricings.
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="weightKg" required>Cân nặng thực tế (kg)</FieldLabel>
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
                <FieldLabel htmlFor="volumeCm3" required>Thể tích kiện (cm³)</FieldLabel>
                <input
                  id="volumeCm3"
                  type="text"
                  value={volumeCm3 ? formatVolumeCm3(Number(volumeCm3)) : ""}
                  readOnly
                  className={LOCKED_FIELD_CLASS}
                />
                {volumeCm3 && Number(volumeCm3) >= 1000 ? (
                  <p className="text-xs text-muted">
                    {Number(volumeCm3).toLocaleString("vi-VN")} cm³ — dùng để quy đổi cân DIM
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="packageCount" required>Số kiện hàng</FieldLabel>
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
                <p className="text-xs text-muted">Dùng làm cơ sở tính phụ phí % (vd. bảo hiểm), nếu có.</p>
              </div>
            </div>

            {showServiceSummary ? (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-muted">Tuyến vận chuyển</p>
                  <p className="font-semibold text-ink">{displayRouteLabel}</p>
                </div>
                <div>
                  <p className="text-muted">Cân thực tế → cân DIM → cân tính phí</p>
                  <p className="font-semibold text-ink leading-snug">
                    {Number(weightKg) > 0 ? `${weightKg} kg` : "—"} thực tế
                    {volumetricWeight > 0 || pricingBreakdown.volumeCm3 != null ? (
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
                        <span className="text-primary">{chargeableWeight} kg</span> tính cước
                      </>
                    ) : null}
                  </p>
                  {pricingBreakdown.volumeCm3 != null || pricingBreakdown.volumetricWeight > 0 ? (
                    <p className="text-xs text-muted mt-1">
                      Cân DIM = (Dài × Rộng × Cao cm) ÷ {volumetricDivisor.toLocaleString("vi-VN")}
                      {pricingBreakdown.volumetricWeight > 0
                        ? ` = ${pricingBreakdown.volumetricWeight} kg`
                        : null}
                    </p>
                  ) : null}
                </div>
                <div>
                  <p className="text-muted">Cách tính cước chính</p>
                  <p className="font-semibold text-ink">
                    {selectedServicePricing?.unitType
                      ? UNIT_TYPE_LABELS[selectedServicePricing.unitType] ??
                        selectedServicePricing.unitType
                      : "—"}
                  </p>
                </div>
              </div>
            ) : canSend ? (
              <p className="text-sm text-danger">
                Chưa có bảng giá cước chính khớp tuyến/loại hình của đơn. Kiểm tra cấu hình tại Admin.
              </p>
            ) : null}

            {!hasConfiguredPricing && detail?.quotation && readOnly ? (
              <p className="text-xs text-muted">
                Đơn đã có báo giá. Số tiền bên dưới lấy từ báo giá đã lưu trên yêu cầu.
              </p>
            ) : null}

            {pricingBreakdown.show ? <PricingFormulaBreakdown breakdown={pricingBreakdown} /> : null}
          </section>

          {hasConfiguredPricing || surchargeFeeCatalog.length || volumetricDivisor ? (
            <section className="rounded-xl border border-border-muted bg-surface-elevated overflow-hidden">
              <div className="px-6 py-4 border-b border-border-muted">
                <h2 className="text-lg font-bold text-ink">Bảng giá tham chiếu (VND)</h2>
                <p className="text-sm text-muted mt-1">
                  Đơn giá cấu hình theo tuyến/loại hình. Cước chính khóa theo bảng này; phụ phí bên dưới chỉ hiện dịch vụ khách đã chọn.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[520px]">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border-muted bg-surface/50">
                      <th className="px-6 py-3 font-bold">Khoản phí</th>
                      <th className="px-6 py-3 font-bold">Đơn vị</th>
                      <th className="px-6 py-3 font-bold text-right">Đơn giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hasConfiguredPricing ? (
                      (() => {
                        const ref = formatMainServiceUnitPrice(selectedServicePricing);
                        return (
                          <tr className="border-b border-border-muted/60 bg-primary/5">
                            <td className="px-6 py-3 font-bold text-ink">Cước chính (ký gửi quốc tế)</td>
                            <td className="px-6 py-3 text-muted">{ref.unit}</td>
                            <td className="px-6 py-3 text-right font-bold text-primary">{ref.rate}</td>
                          </tr>
                        );
                      })()
                    ) : null}
                    {surchargeFeeCatalog.map((fee) => (
                      <tr key={fee.id} className="border-b border-border-muted/60 last:border-0">
                        <td className="px-6 py-3 font-medium text-ink">{fee.name}</td>
                        <td className="px-6 py-3 text-muted">{fee.unit || "—"}</td>
                        <td className="px-6 py-3 text-right font-semibold text-ink">{formatFeeAmount(fee)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t border-border-muted bg-surface/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-sm">
                <p className="font-semibold text-ink">Hệ số quy đổi thể tích (DIM)</p>
                <p className="text-muted">
                  Cân DIM = (Dài × Rộng × Cao cm) ÷{" "}
                  <span className="font-mono font-bold text-ink">
                    {volumetricDivisor.toLocaleString("vi-VN")}
                  </span>
                  {volumetricDivisorRule ? (
                    <span className="text-xs"> · quy tắc {volumetricDivisorRule.code || "VOLUMETRIC_DIVISOR"}</span>
                  ) : (
                    <span className="text-xs"> · mặc định IATA {VOLUMETRIC_DIVISOR_CM3.toLocaleString("vi-VN")}</span>
                  )}
                  . Cước chính theo cân tính phí = MAX(cân thực tế, cân DIM).
                </p>
              </div>
            </section>
          ) : null}

          {detail ? (
            <QuotationPackageConfigSection
              consignment={detail}
              quotation={detail.quotation}
              packingFeeTotalFromLines={packingFeeTotalFromLines}
            />
          ) : null}

          <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink">Lập báo giá — tính phí theo dịch vụ đã chọn</h2>
                <p className="text-sm text-muted mt-1">
                  Hiện cước chính, phí vận chuyển nội địa, phí vỏ thùng (khóa), và dịch vụ khách đã chọn. Sales chỉnh{" "}
                  <strong>số lượng</strong> phụ phí khác — thành tiền = đơn giá × số lượng.
                </p>
              </div>
              {canSend ? (
                <button
                  type="button"
                  onClick={reloadBasePricing}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border-muted text-xs font-bold text-ink hover:bg-surface shrink-0"
                >
                  <Icon icon="lucide:rotate-ccw" className="w-3.5 h-3.5" />
                  Tải lại biểu phí gốc
                </button>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FieldLabel htmlFor="discountPercent">Chiết khấu (%)</FieldLabel>
                <input id="discountPercent" type="number" min="0" max="100" step="0.1" value={discountPercent} disabled={!canSend} onChange={(e) => { setDiscountPercent(e.target.value); resetSubmitState(); }} className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring disabled:opacity-90 disabled:cursor-not-allowed disabled:bg-surface" />
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border-muted">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border-muted bg-surface/50">
                    <th className="px-4 py-3">Khoản phí</th>
                    <th className="px-4 py-3 text-right">Đơn giá</th>
                    <th className="px-4 py-3 text-center">Số lượng</th>
                    <th className="px-4 py-3 text-right">Thành tiền (VND)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border-muted/60 align-top bg-primary/5">
                    <td className="px-4 py-3">
                      <p className="font-bold text-ink">Cước chính (ký gửi quốc tế)</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                        Bắt buộc · khóa
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-ink">
                      {hasConfiguredPricing
                        ? formatMainServiceUnitPrice(selectedServicePricing).rate
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-muted">
                      {chargeableWeight > 0 ? formatKgLabel(chargeableWeight) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">
                      {formatMoney(mainServiceAmount)}
                    </td>
                  </tr>
                  {allAdditionalFeeLines.map((line, index) => {
                    const isPercentage = line.feeCalculationType === "PERCENTAGE";
                    const packing = line.isPackingFee === true || isPackingFee(line);
                    const locked = packing || line.isRequired || !line.quantityEditable;
                    return (
                    <tr
                      key={`${line.feeId}-${line.code ?? ""}-${index}`}
                      className="border-b border-border-muted/60 align-top"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{line.label}</p>
                        {packing ? (
                          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                            Phí vỏ thùng · khóa
                          </span>
                        ) : line.isRequired ? (
                          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                            Bắt buộc · khóa
                          </span>
                        ) : String(line.code ?? "").toUpperCase().includes("WOOD") ? (
                          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide text-muted">
                            Theo đơn
                          </span>
                        ) : line.description ? (
                          <p className="text-xs text-muted mt-0.5">{line.description}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-ink whitespace-nowrap">
                        {isPercentage
                          ? `${line.unitPrice}%`
                          : line.unitPrice != null
                            ? `${formatMoney(line.unitPrice)}/${line.unitNoun || "đv"}`
                            : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isPercentage ? (
                          <span className="text-xs text-muted">theo %</span>
                        ) : canSend && !locked ? (
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={line.quantity ?? ""}
                            onChange={(e) => updateAdditionalFeeQuantity(line.feeId, e.target.value)}
                            className="w-20 h-10 px-2 rounded-lg border border-border-muted text-sm text-center input-focus-ring"
                          />
                        ) : (
                          <span className="text-ink">{line.quantity ?? "—"} {line.unitNoun || ""}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatMoney(line.amount)}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border-muted bg-surface/50">
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-muted">Tạm tính (cước + phí dịch vụ)</td>
                    <td className="px-4 py-3 text-right font-bold text-ink">{formatMoney(totals.subtotal)}</td>
                  </tr>
                  {totals.discount > 0 ? (
                    <tr className="bg-surface/50">
                      <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-muted">Chiết khấu ({discountPercent}%)</td>
                      <td className="px-4 py-3 text-right font-bold text-danger">-{formatMoney(totals.discount)}</td>
                    </tr>
                  ) : null}
                  {totals.importTax > 0 ? (
                    <tr className="bg-surface/50">
                      <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-muted">Thuế nhập khẩu</td>
                      <td className="px-4 py-3 text-right font-bold text-ink">{formatMoney(totals.importTax)}</td>
                    </tr>
                  ) : null}
                  {totals.vat > 0 ? (
                    <tr className="bg-surface/50">
                      <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-muted">
                        VAT ({formatVatRatePercent(totals.vatRate ?? vatRate)})
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-ink">{formatMoney(totals.vat)}</td>
                    </tr>
                  ) : null}
                  <tr className="bg-primary/5">
                    <td colSpan={3} className="px-4 py-4 text-base font-black text-ink font-['Oswald']">Tổng cộng</td>
                    <td className="px-4 py-4 text-right text-xl font-black text-primary font-['Oswald']">{formatMoney(totals.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-3">
            <FieldLabel htmlFor="salesNote" required>Ghi chú tư vấn</FieldLabel>
            {detail?.notes && detail.notes !== salesNote ? (
              <p className="text-xs text-muted">
                Ghi chú từ đơn hàng: <span className="text-ink">{detail.notes}</span>
              </p>
            ) : null}
            <textarea id="salesNote" rows={3} value={salesNote} readOnly={!canSend} onChange={(e) => { setSalesNote(e.target.value); resetSubmitState(); }} placeholder="Nội dung gửi kèm báo giá cho khách..." className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm input-focus-ring resize-y min-h-[88px] read-only:opacity-90 read-only:cursor-not-allowed read-only:bg-surface" />
          </section>

          {canSend && submitError ? <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{submitError}</div> : null}

          {canSend ? (
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50">
              {isSubmitting ? <><Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" /> Đang gửi...</> : <><Icon icon="lucide:send" className="w-4 h-4" /> Gửi báo giá cho khách</>}
            </button>
          ) : (
            <Link href={resolvedBackHref} className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg border border-border-muted text-sm font-bold text-ink hover:bg-surface-muted">
              <Icon icon="lucide:arrow-left" className="w-4 h-4" /> Quay lại chi tiết yêu cầu
            </Link>
          )}
        </form>
      ) : null}
    </div>
  );
}
