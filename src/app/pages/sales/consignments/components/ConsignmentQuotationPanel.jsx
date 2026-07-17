"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import * as orderConsignmentService from "@/utils/orderConsignmentService";
import * as consignmentQuotationService from "@/utils/consignmentQuotationService";
import * as servicePricingService from "@/utils/servicePricingService";
import { getErrorMessage } from "@/utils/apiError";
import { isMockMode } from "@/utils/mocks/dataSource";
import { ROUTES } from "@/utils/appRoutes";
import QuotationHeaderCard from "@/app/pages/sales/consignments/components/quotation/QuotationHeaderCard";
import QuotationServiceSection from "@/app/pages/sales/consignments/components/quotation/QuotationServiceSection";
import QuotationReferencePricingSection from "@/app/pages/sales/consignments/components/quotation/QuotationReferencePricingSection";
import QuotationFeesSection from "@/app/pages/sales/consignments/components/quotation/QuotationFeesSection";
import QuotationSalesNoteSection from "@/app/pages/sales/consignments/components/quotation/QuotationSalesNoteSection";
import styles from "./ConsignmentQuotationPanel.module.scss";
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
  calculateQuotationTotal,
  estimateConsignmentQuotation,
  fetchActiveAdditionalFees,
  formatMoney,
  recalculateAdditionalFeeLine,
  resolveQuotationAdditionalFees,
  resolveConsignmentServiceType,
  resolveInitialSalesNote,
  resolveServicePricingForConsignment,
  formatVatRatePercent,
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

const QUICK_CUSTOM_FEES = [
  "Phí đóng gói lại",
  "Phí bảo hiểm hàng hóa",
  "Phí dán nhãn / barcode",
  "Phụ phí mùa cao điểm",
  "Phí xử lý hàng đặc biệt",
];

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
    return { unit: "VND/cm³", rate: `${consignmentQuotationService.formatMoney(price)}/cm³` };
  }
  if (unitType === "KG_OR_CBM") {
    return {
      unit: "VND/kg · cm³",
      rate: `${consignmentQuotationService.formatMoney(pricePerKg)}/kg · ${consignmentQuotationService.formatMoney(pricePerCbm)}/cm³`,
    };
  }
  return { unit: "—", rate: price > 0 ? consignmentQuotationService.formatMoney(price) : "—" };
}

export default function ConsignmentQuotationPanel({ id, backHref, readOnly = false }) {
  const router = useRouter();
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
  const [taxSnapshot, setTaxSnapshot] = useState({ importTax: 0, vat: null });
  const [customFees, setCustomFees] = useState([]);

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

  const displayRouteLabel = useMemo(
    () => formatConsignmentRouteLabel(detail),
    [detail]
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
    () => [
      ...additionalFeeLines,
      ...customFees.map((fee) => ({
        feeId: fee.id,
        label: fee.label,
        description: "Phí bổ sung do Sales thêm",
        unitPrice: Number(fee.unitPrice) || 0,
        quantity: Number(fee.quantity) || 0,
        amount: (Number(fee.unitPrice) || 0) * (Number(fee.quantity) || 0),
        enabled: true,
        isCustom: true,
        isRequired: false,
      })),
    ],
    [additionalFeeLines, customFees]
  );

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

  const vatRate = useMemo(() => resolveVatRate(feeCatalog), [feeCatalog]);

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
          weightKg: consignment.totalWeight,
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
          mainServiceAmountOverride: draftMainAmount,
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
              // ponytail: swagger field còn tên volumeM3 nhưng BE nhận cm³.
              volumeM3: volumeCm3FromApi ?? (volume ? Number(volume) : undefined),
              packageCount: packages ? Number(packages) : undefined,
              declaredValue: declared !== "" ? Number(declared) : undefined,
              salesNote: estimateSalesNote,
              quotation: preliminaryDraft,
            });
          } catch {
            estimateResult = null;
          }
        }

        const localDraft = buildConsignmentQuotationDraft({
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

        const apiFreight =
          estimateResult?.estimatedFreightCharge ??
          estimateResult?.quotation?.mainServiceAmount ??
          draftMainAmount;
        // ponytail: bỏ cước estimate nếu gấp ≫ local (BE còn tính volume cm³ như m³).
        const apiFreightNumber = apiFreight != null ? Number(apiFreight) : null;
        const localFreight = Number(localDraft.mainServiceAmount) || 0;
        const apiFreightInflated =
          localFreight > 0 &&
          apiFreightNumber != null &&
          apiFreightNumber > localFreight * 50;
        const draftMainAmountResolved = apiFreightInflated
          ? localFreight
          : (apiFreightNumber ?? localFreight);

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
        setCustomFees(
          (consignment.quotation?.customFees ?? []).map((fee, index) => {
            const amount = Number(fee.amount) || 0;
            const quantity = fee.quantity != null ? Number(fee.quantity) || 0 : 1;
            const unitPrice =
              fee.unitPrice != null
                ? Number(fee.unitPrice) || 0
                : quantity
                  ? Math.round(amount / quantity)
                  : amount;
            return {
              id: fee.id ?? `custom-loaded-${index}`,
              label: fee.label ?? "Phí khác",
              unitPrice,
              quantity,
            };
          })
        );
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
      const { enabledFeeIds, quantityByFeeId } = buildEnabledFeeStateFromLines(
        current,
        feeCatalog
      );
      return buildDefaultAdditionalFeeLines({
        fees: feeCatalog,
        packageCount,
        declaredValue,
        mainServiceAmount: draft.mainServiceAmount,
        enabledFeeIds: Object.keys(enabledFeeIds).length ? enabledFeeIds : undefined,
        quantityByFeeId: Object.keys(quantityByFeeId).length ? quantityByFeeId : undefined,
        requiresInspection: detail?.requiresInspection === true,
      });
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
    const fee = findCatalogFeeEntry(feeId);
    setAdditionalFeeLines((current) =>
      current.map((line) => {
        if (line.feeId !== feeId) return line;
        const quantity = value === "" ? "" : Math.max(0, Number(value) || 0);
        if (!fee) {
          const amount = (Number(line.unitPrice) || 0) * (Number(quantity) || 0);
          return { ...line, quantity, amount };
        }
        return recalculateAdditionalFeeLine(fee, { ...line, quantity }, feeCalculationContext);
      })
    );
    resetSubmitState();
  }

  function addCustomFee(label = "Phí khác", unitPrice = 0) {
    setCustomFees((current) => [
      ...current,
      { id: `custom-${Date.now()}-${current.length}`, label, unitPrice, quantity: 1 },
    ]);
    resetSubmitState();
  }

  function reloadBasePricing() {
    if (pricingBreakdown.amount > 0) {
      setMainServiceAmount(String(pricingBreakdown.amount));
    }
    setCustomFees([]);
    setDiscountPercent("0");
    setFeesFromApi(false);
    setAdditionalFeeLines(
      buildDefaultAdditionalFeeLines({
        fees: feeCatalog,
        packageCount,
        declaredValue,
        mainServiceAmount: pricingBreakdown.amount || Number(mainServiceAmount) || 0,
        requiresInspection: detail?.requiresInspection === true,
      })
    );
    resetSubmitState();
  }

  function updateCustomFee(id, field, value) {
    setCustomFees((current) =>
      current.map((fee) =>
        fee.id === id
          ? {
              ...fee,
              [field]:
                field === "label" ? value : value === "" ? "" : Math.max(0, Number(value) || 0),
            }
          : fee
      )
    );
    resetSubmitState();
  }

  function removeCustomFee(id) {
    setCustomFees((current) => current.filter((fee) => fee.id !== id));
    resetSubmitState();
  }

  function toggleAdditionalFee(feeId) {
    const fee = findCatalogFeeEntry(feeId);

    setAdditionalFeeLines((current) =>
      current.map((line) => {
        if (line.feeId !== feeId) return line;
        if (line.isRequired) return line;
        const enabled = line.enabled === false;
        if (fee) {
          return recalculateAdditionalFeeLine(fee, { ...line, enabled }, feeCalculationContext);
        }
        const amount = enabled
          ? (Number(line.unitPrice) || 0) * (Number(line.quantity) || 0)
          : 0;
        return { ...line, enabled, amount };
      })
    );
    resetSubmitState();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!detail || !canSend || isSubmitting) return;

    if (!selectedServicePricing || !isConfiguredServicePricing(selectedServicePricing)) {
      setSubmitError("Không tìm thấy giá dịch vụ chính cho tuyến/dịch vụ đã chọn.");
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
      customFees: customFees.map((fee) => ({
        id: fee.id,
        label: fee.label,
        unitPrice: Number(fee.unitPrice) || 0,
        quantity: Number(fee.quantity) || 0,
        amount: (Number(fee.unitPrice) || 0) * (Number(fee.quantity) || 0),
      })),
    };

    const sendParams = {
      warehouseId: resolvedWarehouseId,
      servicePricingId: selectedServicePricing.id,
      serviceType,
      weightKg: Number(weightKg),
      volumeM3: resolvedVolumeCm3,
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

      // Merge giữ party cũ nếu BE trả payload thưa; rồi về chi tiết (tránh kẹt trang chỉ-xem).
      if (response.consignment) {
        setDetail(
          mergeConsignmentDetail(detail, {
            ...response.consignment,
            quotation: response.consignment.quotation ?? quotationPayload,
          })
        );
      } else {
        setDetail({
          ...detail,
          status: response.status ?? "QUOTATION_SENT",
          quotation: quotationPayload,
        });
      }
      router.replace(ROUTES.sales.consignment(detail.id));
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Icon icon="lucide:loader-2" className={styles.loadingIcon} />
        <p className={styles.loadingText}>Đang tải yêu cầu ký gửi...</p>
      </div>
    );
  }

  if (loadError && !detail) {
    return (
      <div className={styles.errorBlock}>
        <Link href={resolvedBackHref} className={styles.backLink}>
          <Icon icon="lucide:arrow-left" className={styles.iconSm} />
          Quay lại
        </Link>
        <div className={styles.alertDanger}>{loadError}</div>
      </div>
    );
  }

  if (!detail) return null;

  const displayCode = formatConsignmentDisplayCode(detail);
  const volumetricWeight = pricingBreakdown.volumetricWeight ?? 0;
  const chargeableWeight = pricingBreakdown.chargeableWeight ?? 0;

  return (
    <div
      className={`${styles.root} ${readOnly ? styles.readOnly : ""}`}
    >
      <div>
        <Link href={resolvedBackHref} className={styles.backLink}>
          <Icon icon="lucide:arrow-left" className={styles.iconSm} />
          Quay lại chi tiết yêu cầu
        </Link>
        {!readOnly ? (
          <p className={styles.eyebrow}>Sales / CSKH</p>
        ) : null}
        <h1 className={styles.title}>
          {!canSend
            ? "Chi tiết báo giá"
            : detail.status === "QUOTATION_REJECTED"
              ? "Gửi báo giá mới"
              : "Tư vấn & gửi báo giá ký gửi"}
        </h1>
        <p className={styles.subtitle}>
          {!canSend ? (
            "Nội dung báo giá của yêu cầu này — chỉ xem, không chỉnh sửa."
          ) : (
            <>
              Hệ thống tính <strong>dịch vụ chính</strong> từ bảng giá (khóa). Sales chỉ bật/tắt phụ phí và chỉnh
              <strong> số lượng</strong> — thành tiền tự tính theo đơn giá cấu hình.
            </>
          )}
        </p>
      </div>

      <QuotationHeaderCard
        detail={detail}
        displayCode={displayCode}
        formatConsignmentDate={formatConsignmentDate}
      />

      {successMessage ? (
        <div className={styles.alertSuccess}>
          <p className={styles.summaryValue}>{successMessage}</p>
          <Link href={ROUTES.sales.consignment(detail.id)} className={styles.successBtn}>
            Xem chi tiết yêu cầu
          </Link>
        </div>
      ) : null}

      {!canSend && !successMessage ? (
        <div className={styles.alertWarning}>
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
        <form onSubmit={handleSubmit} className={styles.form}>
          <QuotationServiceSection
            availableServiceTypes={availableServiceTypes}
            serviceType={serviceType}
            weightKg={weightKg}
            volumeCm3={volumeCm3}
            packageCount={packageCount}
            declaredValue={declaredValue}
            formatServiceTypeLabel={formatServiceTypeLabel}
            showServiceSummary={showServiceSummary}
            displayRouteLabel={displayRouteLabel}
            volumetricWeight={volumetricWeight}
            pricingBreakdown={pricingBreakdown}
            chargeableWeight={chargeableWeight}
            volumetricDivisor={volumetricDivisor}
            formatVolumeCm3={formatVolumeCm3}
            selectedServicePricing={selectedServicePricing}
            UNIT_TYPE_LABELS={UNIT_TYPE_LABELS}
            canSend={canSend}
            hasConfiguredPricing={hasConfiguredPricing}
            detail={detail}
            readOnly={readOnly}
          />

          {hasConfiguredPricing || surchargeFeeCatalog.length || volumetricDivisor ? (
            <QuotationReferencePricingSection
              hasConfiguredPricing={hasConfiguredPricing}
              selectedServicePricing={selectedServicePricing}
              formatMainServiceUnitPrice={formatMainServiceUnitPrice}
              surchargeFeeCatalog={surchargeFeeCatalog}
              volumetricDivisor={volumetricDivisor}
              volumetricDivisorRule={volumetricDivisorRule}
              VOLUMETRIC_DIVISOR_CM3={VOLUMETRIC_DIVISOR_CM3}
            />
          ) : null}


          <QuotationFeesSection
            canSend={canSend}
            reloadBasePricing={reloadBasePricing}
            discountPercent={discountPercent}
            setDiscountPercent={setDiscountPercent}
            resetSubmitState={resetSubmitState}
            hasConfiguredPricing={hasConfiguredPricing}
            selectedServicePricing={selectedServicePricing}
            formatMainServiceUnitPrice={formatMainServiceUnitPrice}
            chargeableWeight={chargeableWeight}
            formatKgLabel={formatKgLabel}
            formatMoney={formatMoney}
            mainServiceAmount={mainServiceAmount}
            additionalFeeLines={additionalFeeLines}
            toggleAdditionalFee={toggleAdditionalFee}
            updateAdditionalFeeQuantity={updateAdditionalFeeQuantity}
            customFees={customFees}
            removeCustomFee={removeCustomFee}
            updateCustomFee={updateCustomFee}
            totals={totals}
            formatVatRatePercent={formatVatRatePercent}
            vatRate={vatRate}
            addCustomFee={addCustomFee}
            QUICK_CUSTOM_FEES={QUICK_CUSTOM_FEES}
          />


          <QuotationSalesNoteSection
            detail={detail}
            salesNote={salesNote}
            canSend={canSend}
            setSalesNote={setSalesNote}
            resetSubmitState={resetSubmitState}
          />

          {canSend && submitError ? <div className={styles.alertDanger}>{submitError}</div> : null}

          {canSend ? (
            <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
              {isSubmitting ? <><Icon icon="lucide:loader-2" className={`${styles.iconSm} ${styles.loadingIcon}`} /> Đang gửi...</> : <><Icon icon="lucide:send" className={styles.iconSm} /> Gửi báo giá cho khách</>}
            </button>
          ) : (
            <Link href={resolvedBackHref} className={styles.backBtn}>
              <Icon icon="lucide:arrow-left" className={styles.iconSm} /> Quay lại chi tiết yêu cầu
            </Link>
          )}
        </form>
      ) : null}
    </div>
  );
}
