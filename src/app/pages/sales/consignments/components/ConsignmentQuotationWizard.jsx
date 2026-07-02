"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import * as customerService from "@/utils/customerService";
import * as orderConsignmentService from "@/utils/orderConsignmentService";
import * as pricingService from "@/utils/internationalWarehousePricingService";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";
import { volumeCm3ToM3 } from "@/utils/servicePricingService";

const { ITEM_VALIDATION_LABELS, ITEM_VALIDATION_STYLES } = orderConsignmentService;
const { FEE_CODES, buildDefaultQuotationLines, calculateQuotationTotal, formatMoney } =
  pricingService;

const WIZARD_STEPS = [
  { id: 1, label: "Thông tin hàng & kho" },
  { id: 2, label: "Tư vấn & báo giá" },
  { id: 3, label: "Xác nhận gửi" },
];

const QUICK_CUSTOM_FEES = [
  { label: "Phí thủ tục hải quan", amount: 25 },
  { label: "Phí bảo hiểm hàng hóa", amount: 15 },
  { label: "Phí xử lý đặc biệt", amount: 10 },
];

function FieldLabel({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
      {children}
      {required ? <span className="text-danger"> *</span> : null}
    </label>
  );
}

function CustomerInfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
      <dt className="text-xs font-bold uppercase tracking-wide text-muted sm:w-28 shrink-0">
        {label}
      </dt>
      <dd className="text-sm font-medium text-ink">{value || "—"}</dd>
    </div>
  );
}

function StepIndicator({ currentStep }) {
  return (
    <ol className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center">
      {WIZARD_STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isDone = step.id < currentStep;

        return (
          <li key={step.id} className="flex items-center gap-3 sm:flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                  isActive
                    ? "bg-primary text-white"
                    : isDone
                      ? "bg-success-bg text-success-text"
                      : "bg-surface text-muted border border-border-muted"
                }`}
              >
                {isDone ? <Icon icon="lucide:check" className="w-4 h-4" /> : step.id}
              </span>
              <span
                className={`text-sm font-semibold truncate ${
                  isActive ? "text-ink" : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < WIZARD_STEPS.length - 1 ? (
              <div className="hidden sm:block flex-1 h-px bg-border-muted mx-3" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export default function ConsignmentQuotationWizard({ preselectedCustomerId }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [warehouses, setWarehouses] = useState([]);
  const [pricingMatrix, setPricingMatrix] = useState(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [customerSearchError, setCustomerSearchError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [volumeCm3, setVolumeCm3] = useState("");
  const [packageCount, setPackageCount] = useState("");
  const [declaredValue, setDeclaredValue] = useState("");

  const [storageMonths, setStorageMonths] = useState("1");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [feeLines, setFeeLines] = useState([]);
  const [customFees, setCustomFees] = useState([]);
  const [salesNote, setSalesNote] = useState("");

  const [validation, setValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const [stepError, setStepError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdConsignmentCode, setCreatedConsignmentCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedWarehouse = useMemo(
    () => warehouses.find((entry) => entry.id === warehouseId) ?? null,
    [warehouses, warehouseId]
  );

  const hasBannedItem = validation?.hasBanned === true;
  const validationWarnings =
    validation?.items?.filter((entry) => entry.restrictionType) ?? [];

  const volumeM3 = useMemo(
    () => (volumeCm3 === "" ? "" : volumeCm3ToM3(volumeCm3)),
    [volumeCm3]
  );

  const totals = useMemo(
    () =>
      calculateQuotationTotal({
        lines: feeLines,
        customFees,
        discountPercent,
      }),
    [feeLines, customFees, discountPercent]
  );

  useEffect(() => {
    if (!preselectedCustomerId) return;

    let active = true;

    async function loadPreselectedCustomer() {
      try {
        const customer = await customerService.getCustomer(preselectedCustomerId);
        if (active && customer) setSelectedCustomer(customer);
      } catch {
        // Sales có thể chọn lại thủ công.
      }
    }

    loadPreselectedCustomer();
    return () => {
      active = false;
    };
  }, [preselectedCustomerId]);

  useEffect(() => {
    let active = true;

    async function loadWarehouses() {
      setIsLoadingPage(true);
      setLoadError("");

      try {
        const list = await pricingService.listInternationalWarehouses();
        if (!active) return;

        setWarehouses(list);
        if (list.length === 1) setWarehouseId(list[0].id);
      } catch (err) {
        if (active) setLoadError(getErrorMessage(err));
      } finally {
        if (active) setIsLoadingPage(false);
      }
    }

    loadWarehouses();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!warehouseId) {
      setPricingMatrix(null);
      return;
    }

    let active = true;

    async function loadPricing() {
      try {
        const data = await pricingService.getInternationalWarehousePricing(warehouseId);
        if (active) setPricingMatrix(data);
      } catch {
        if (active) setPricingMatrix(null);
      }
    }

    loadPricing();
    return () => {
      active = false;
    };
  }, [warehouseId]);

  useEffect(() => {
    if (!customerSearch.trim()) {
      setCustomerResults([]);
      setCustomerSearchError("");
      return;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setIsSearchingCustomers(true);
      setCustomerSearchError("");

      try {
        const results = await customerService.listCustomers({
          search: customerSearch.trim(),
        });
        if (active) setCustomerResults(results);
      } catch (err) {
        if (active) setCustomerSearchError(getErrorMessage(err));
      } finally {
        if (active) setIsSearchingCustomers(false);
      }
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [customerSearch]);

  useEffect(() => {
    const name = productName.trim();
    if (!name) {
      setValidation(null);
      return;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      setIsValidating(true);

      try {
        const result = await orderConsignmentService.validateConsignmentItems({
          items: [{ productName: name, productType, quantity: "1" }],
        });
        if (active) setValidation(result);
      } catch {
        if (active) setValidation(null);
      } finally {
        if (active) setIsValidating(false);
      }
    }, 500);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [productName, productType]);

  useEffect(() => {
    if (!warehouseId) return;

    setFeeLines((current) => {
      const enabledMap = Object.fromEntries(
        current.map((line) => [line.feeCode, line.enabled !== false])
      );

      return buildDefaultQuotationLines({
        warehouseId,
        weightKg,
        volumeM3,
        packageCount,
        storageMonths,
        enabledFees: Object.keys(enabledMap).length ? enabledMap : undefined,
      });
    });
  }, [warehouseId, weightKg, volumeM3, packageCount, storageMonths]);

  function resetSuccessState() {
    setSubmitError("");
    setSuccessMessage("");
    setCreatedConsignmentCode("");
  }

  function handleSelectCustomer(customer) {
    setSelectedCustomer(customer);
    setCustomerSearch("");
    setCustomerResults([]);
    resetSuccessState();
  }

  function handleClearCustomer() {
    setSelectedCustomer(null);
    setCustomerSearch("");
    setCustomerResults([]);
  }

  function updateFeeLineAmount(feeCode, amount) {
    setFeeLines((current) =>
      current.map((line) =>
        line.feeCode === feeCode ? { ...line, amount: amount === "" ? "" : Number(amount) } : line
      )
    );
    resetSuccessState();
  }

  function toggleFeeLine(feeCode) {
    setFeeLines((current) =>
      current.map((line) =>
        line.feeCode === feeCode
          ? {
              ...line,
              enabled: line.enabled === false,
              amount:
                line.enabled === false
                  ? buildDefaultQuotationLines({
                      warehouseId,
                      weightKg,
                      volumeM3,
                      packageCount,
                      storageMonths,
                      enabledFees: { [feeCode]: true },
                    }).find((entry) => entry.feeCode === feeCode)?.amount ?? 0
                  : 0,
            }
          : line
      )
    );
    resetSuccessState();
  }

  function addCustomFee(preset) {
    setCustomFees((current) => [
      ...current,
      {
        id: `custom-${Date.now()}-${current.length}`,
        label: preset.label,
        amount: preset.amount,
      },
    ]);
    resetSuccessState();
  }

  function updateCustomFee(id, field, value) {
    setCustomFees((current) =>
      current.map((fee) =>
        fee.id === id
          ? {
              ...fee,
              [field]: field === "amount" ? (value === "" ? "" : Number(value)) : value,
            }
          : fee
      )
    );
    resetSuccessState();
  }

  function removeCustomFee(id) {
    setCustomFees((current) => current.filter((fee) => fee.id !== id));
    resetSuccessState();
  }

  function validateStep1() {
    if (!selectedCustomer) return "Vui lòng chọn khách hàng.";
    if (!productName.trim()) return "Vui lòng nhập tên hàng hóa.";
    if (!warehouseId) return "Vui lòng chọn kho quốc tế.";
    if (!weightKg || Number(weightKg) <= 0) return "Vui lòng nhập khối lượng (kg).";
    if (!volumeCm3 || Number(volumeCm3) <= 0) return "Vui lòng nhập thể tích (cm³).";
    if (!packageCount || Number(packageCount) < 1) return "Vui lòng nhập số kiện.";
    if (hasBannedItem) return "Không thể tiếp tục vì hàng thuộc danh mục cấm tuyệt đối.";
    return "";
  }

  function handleNextStep() {
    setStepError("");
    if (currentStep === 1) {
      const error = validateStep1();
      if (error) {
        setStepError(error);
        return;
      }
    }
    if (currentStep === 2 && totals.total <= 0) {
      setStepError("Tổng báo giá phải lớn hơn 0.");
      return;
    }
    setCurrentStep((step) => Math.min(step + 1, WIZARD_STEPS.length));
  }

  function handlePrevStep() {
    setStepError("");
    setCurrentStep((step) => Math.max(step - 1, 1));
  }

  async function handleSubmit() {
    if (isSubmitting || hasBannedItem) return;

    const error = validateStep1();
    if (error) {
      setStepError(error);
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");
    setCreatedConsignmentCode("");

    try {
      const response = await orderConsignmentService.createStaffConsignment({
        customerId: selectedCustomer.id,
        warehouseId,
        warehouseCode: selectedWarehouse?.code,
        weightKg: Number(weightKg),
        volumeM3: volumeCm3 ? volumeCm3ToM3(volumeCm3) : 0,
        packageCount: Number(packageCount),
        salesNote,
        quotation: {
          storageMonths: Number(storageMonths) || 1,
          discountPercent: Number(discountPercent) || 0,
          lines: feeLines.filter((line) => line.enabled !== false),
          customFees,
          ...totals,
          currency: "VND",
        },
        items: [
          {
            productName: productName.trim(),
            productType: productType.trim(),
            quantity: packageCount,
            estimatedWeight: weightKg,
            declaredValue,
          },
        ],
      });

      setSuccessMessage(
        response.message ||
          "Đã gửi yêu cầu ký gửi và báo giá cho khách hàng. Chờ khách duyệt để tạo phiếu nhập kho."
      );
      setCreatedConsignmentCode(response.consignmentCode || "");
      setCurrentStep(WIZARD_STEPS.length);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingPage) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted">
        <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin" />
        <p className="text-sm font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <Link
          href={ROUTES.sales.consignments}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink mb-4"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          Quay lại danh sách
        </Link>
        <p className="text-xs font-bold uppercase tracking-wide text-primary mb-2">
          Bước 1.2 · Sales / CSKH
        </p>
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-['Oswald'] text-ink">
          Tư vấn &amp; báo giá ký gửi
        </h1>
        <p className="text-muted text-sm font-medium mt-2">
          Dựa vào bảng giá kho quốc tế, chỉnh từng khoản phí và gửi báo giá cho khách. Sau khi khách
          duyệt, Sales tạo phiếu nhập kho.
        </p>
      </div>

      <StepIndicator currentStep={currentStep} />

      {loadError ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {loadError}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-lg border border-success/30 bg-success-bg px-4 py-4 text-sm text-success-text space-y-2">
          <p className="font-semibold">{successMessage}</p>
          {createdConsignmentCode ? (
            <p>
              Mã yêu cầu ký gửi:{" "}
              <span className="font-black text-base">{createdConsignmentCode}</span>
            </p>
          ) : null}
          <p className="text-success-text/90">
            Khách duyệt xong, Sales sẽ tạo phiếu nhập kho.
          </p>
        </div>
      ) : null}

      {stepError ? (
        <div className="rounded-lg border border-warning/30 bg-warning-bg/40 px-4 py-3 text-sm text-ink">
          {stepError}
        </div>
      ) : null}

      {currentStep === 1 ? (
        <div className="space-y-8">
          <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
            <h2 className="text-lg font-bold text-ink">Khách hàng</h2>
            {selectedCustomer ? (
              <div className="rounded-lg border border-border-muted bg-surface p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-ink">{selectedCustomer.fullName}</p>
                    <p className="text-xs text-muted mt-1">Mã: {selectedCustomer.id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearCustomer}
                    className="text-sm font-semibold text-primary hover:underline shrink-0"
                  >
                    Đổi khách
                  </button>
                </div>
                <dl className="space-y-2">
                  <CustomerInfoRow label="Email" value={selectedCustomer.email} />
                  <CustomerInfoRow label="Điện thoại" value={selectedCustomer.phone} />
                </dl>
              </div>
            ) : (
              <div className="space-y-3">
                <FieldLabel htmlFor="customerSearch">Tìm kiếm khách hàng</FieldLabel>
                <div className="relative">
                  <Icon
                    icon="lucide:search"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
                  />
                  <input
                    id="customerSearch"
                    type="search"
                    value={customerSearch}
                    onChange={(event) => setCustomerSearch(event.target.value)}
                    placeholder="Tên, email, SĐT, mã khách..."
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                  />
                </div>
                {customerSearchError ? (
                  <p className="text-sm text-danger">{customerSearchError}</p>
                ) : null}
                {customerSearch.trim() && !isSearchingCustomers ? (
                  <ul className="rounded-lg border border-border-muted divide-y divide-border-muted overflow-hidden">
                    {customerResults.length === 0 ? (
                      <li className="px-4 py-3 text-sm text-muted">Không tìm thấy khách hàng.</li>
                    ) : (
                      customerResults.map((customer) => (
                        <li key={customer.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectCustomer(customer)}
                            className="w-full text-left px-4 py-3 hover:bg-surface transition-colors"
                          >
                            <p className="text-sm font-semibold text-ink">{customer.fullName}</p>
                            <p className="text-xs text-muted mt-0.5">
                              {[customer.email, customer.phone].filter(Boolean).join(" · ")}
                            </p>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                ) : null}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
            <h2 className="text-lg font-bold text-ink">Hàng hóa &amp; kho quốc tế</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <FieldLabel htmlFor="productName" required>
                  Hàng hóa
                </FieldLabel>
                <input
                  id="productName"
                  value={productName}
                  onChange={(event) => {
                    setProductName(event.target.value);
                    resetSuccessState();
                  }}
                  placeholder="VD: Loa Bluetooth JBL Charge 5"
                  className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="productType">Loại hàng</FieldLabel>
                <input
                  id="productType"
                  value={productType}
                  onChange={(event) => setProductType(event.target.value)}
                  placeholder="VD: Điện tử"
                  className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="declaredValue">Giá trị khai báo (VND)</FieldLabel>
                <input
                  id="declaredValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={declaredValue}
                  onChange={(event) => setDeclaredValue(event.target.value)}
                  className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <FieldLabel required>Kho quốc tế</FieldLabel>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {warehouses.map((warehouse) => {
                    const isSelected = warehouseId === warehouse.id;
                    return (
                      <button
                        key={warehouse.id}
                        type="button"
                        onClick={() => {
                          setWarehouseId(warehouse.id);
                          resetSuccessState();
                        }}
                        className={`rounded-lg border p-4 text-left transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border-muted hover:border-primary/40"
                        }`}
                      >
                        <span className="text-2xl">{warehouse.flag}</span>
                        <span className="block text-sm font-bold text-ink mt-2">
                          {warehouse.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="weightKg" required>
                  Khối lượng (kg)
                </FieldLabel>
                <input
                  id="weightKg"
                  type="number"
                  min="0"
                  step="0.01"
                  value={weightKg}
                  onChange={(event) => {
                    setWeightKg(event.target.value);
                    resetSuccessState();
                  }}
                  placeholder="120"
                  className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="volumeCm3" required>
                  Thể tích (cm³)
                </FieldLabel>
                <input
                  id="volumeCm3"
                  type="number"
                  min="1"
                  step="1"
                  value={volumeCm3}
                  onChange={(event) => {
                    setVolumeCm3(event.target.value);
                    resetSuccessState();
                  }}
                  placeholder="900000"
                  className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="packageCount" required>
                  Số kiện
                </FieldLabel>
                <input
                  id="packageCount"
                  type="number"
                  min="1"
                  value={packageCount}
                  onChange={(event) => {
                    setPackageCount(event.target.value);
                    resetSuccessState();
                  }}
                  placeholder="8"
                  className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                />
              </div>
            </div>

            {(isValidating || validationWarnings.length > 0) && productName.trim() ? (
              <div className="space-y-2">
                {validationWarnings.map((warning) => (
                  <div
                    key={`${warning.productName}-${warning.restrictionType}`}
                    className={`rounded-lg border px-4 py-3 text-sm ${
                      ITEM_VALIDATION_STYLES[warning.restrictionType] ||
                      "bg-surface text-muted border-border-muted"
                    }`}
                  >
                    <p className="font-bold">
                      {ITEM_VALIDATION_LABELS[warning.restrictionType] || warning.restrictionType}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      {currentStep === 2 ? (
        <div className="space-y-8">
          <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-3">
            <h2 className="text-lg font-bold text-ink">Tóm tắt yêu cầu</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted">Hàng hóa</p>
                <p className="font-semibold text-ink">{productName}</p>
              </div>
              <div>
                <p className="text-muted">Kho</p>
                <p className="font-semibold text-ink">
                  {selectedWarehouse?.flag} {selectedWarehouse?.name}
                </p>
              </div>
              <div>
                <p className="text-muted">Khối lượng</p>
                <p className="font-semibold text-ink">
                  {weightKg} kg · {volumeCm3} cm³ · {packageCount} kiện
                </p>
              </div>
            </div>
          </section>

          {pricingMatrix?.allWarehouses?.length ? (
            <section className="rounded-xl border border-border-muted bg-surface-elevated overflow-hidden">
              <div className="px-6 py-4 border-b border-border-muted">
                <h2 className="text-lg font-bold text-ink">
                  Bảng giá kho quốc tế (VND) — tham chiếu
                </h2>
                <p className="text-sm text-muted mt-1">
                  Cột {selectedWarehouse?.name} được tự động áp dụng. Số tiền dưới đây có thể chỉnh
                  tay.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border-muted bg-surface/50">
                      <th className="px-6 py-3 font-bold">Khoản phí</th>
                      <th className="px-6 py-3 font-bold">Đơn vị</th>
                      {pricingMatrix.allWarehouses.map((warehouse) => (
                        <th
                          key={warehouse.id}
                          className={`px-6 py-3 font-bold ${
                            warehouse.id === warehouseId ? "text-primary" : ""
                          }`}
                        >
                          {warehouse.flag} {warehouse.name.replace("Kho ", "")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(FEE_CODES).map((feeCode) => {
                      const sample = pricingMatrix.allWarehouses[0]?.pricing?.[feeCode];
                      if (!sample) return null;

                      return (
                        <tr
                          key={feeCode}
                          className="border-b border-border-muted/60 last:border-0"
                        >
                          <td className="px-6 py-3 font-medium text-ink">{sample.label}</td>
                          <td className="px-6 py-3 text-muted">{sample.unit}</td>
                          {pricingMatrix.allWarehouses.map((warehouse) => (
                            <td
                              key={warehouse.id}
                              className={`px-6 py-3 ${
                                warehouse.id === warehouseId ? "font-bold text-primary" : "text-ink"
                              }`}
                            >
                              {formatMoney(Number(warehouse.pricing?.[feeCode]?.rate ?? 0))}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
            <h2 className="text-lg font-bold text-ink">Lập báo giá — chỉnh sửa từng khoản phí</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FieldLabel htmlFor="storageMonths">Số tháng lưu kho</FieldLabel>
                <input
                  id="storageMonths"
                  type="number"
                  min="1"
                  value={storageMonths}
                  onChange={(event) => {
                    setStorageMonths(event.target.value);
                    resetSuccessState();
                  }}
                  className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel htmlFor="discountPercent">Chiết khấu (%)</FieldLabel>
                <input
                  id="discountPercent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={discountPercent}
                  onChange={(event) => {
                    setDiscountPercent(event.target.value);
                    resetSuccessState();
                  }}
                  className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border-muted">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border-muted bg-surface/50">
                    <th className="px-4 py-3 font-bold w-10" />
                    <th className="px-4 py-3 font-bold">Khoản phí</th>
                    <th className="px-4 py-3 font-bold">Diễn giải</th>
                    <th className="px-4 py-3 font-bold text-right">Thành tiền (VND)</th>
                  </tr>
                </thead>
                <tbody>
                  {feeLines.map((line) => (
                    <tr key={line.feeCode} className="border-b border-border-muted/60">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={line.enabled !== false}
                          onChange={() => toggleFeeLine(line.feeCode)}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">{line.label}</td>
                      <td className="px-4 py-3 text-muted">{line.description}</td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          disabled={line.enabled === false}
                          value={line.amount}
                          onChange={(event) =>
                            updateFeeLineAmount(line.feeCode, event.target.value)
                          }
                          className="w-28 h-10 px-3 rounded-lg border border-border-muted text-sm text-right input-focus-ring disabled:opacity-50"
                        />
                      </td>
                    </tr>
                  ))}
                  {customFees.map((fee) => (
                    <tr key={fee.id} className="border-b border-border-muted/60">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeCustomFee(fee.id)}
                          className="text-danger hover:text-danger/80"
                          aria-label="Xóa phí"
                        >
                          <Icon icon="lucide:trash-2" className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={fee.label}
                          onChange={(event) =>
                            updateCustomFee(fee.id, "label", event.target.value)
                          }
                          className="w-full h-10 px-3 rounded-lg border border-border-muted text-sm input-focus-ring"
                        />
                      </td>
                      <td className="px-4 py-3 text-muted">Phí bổ sung</td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={fee.amount}
                          onChange={(event) =>
                            updateCustomFee(fee.id, "amount", event.target.value)
                          }
                          className="w-28 h-10 px-3 rounded-lg border border-border-muted text-sm text-right input-focus-ring"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border-muted bg-surface/50">
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-muted">
                      Tạm tính
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-ink">
                      {formatMoney(totals.subtotal)}
                    </td>
                  </tr>
                  {totals.discount > 0 ? (
                    <tr className="bg-surface/50">
                      <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-muted">
                        Chiết khấu ({discountPercent}%)
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-danger">
                        -{formatMoney(totals.discount)}
                      </td>
                    </tr>
                  ) : null}
                  <tr className="bg-primary/5">
                    <td colSpan={3} className="px-4 py-4 text-base font-black text-ink">
                      Tổng cộng
                    </td>
                    <td className="px-4 py-4 text-right text-xl font-black text-ink font-['Oswald']">
                      {formatMoney(totals.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-ink">Hoặc thêm nhanh:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_CUSTOM_FEES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => addCustomFee(preset)}
                    className="inline-flex items-center gap-1 h-9 px-3 rounded-full border border-border-muted text-xs font-bold text-ink hover:bg-surface"
                  >
                    <Icon icon="lucide:plus" className="w-3.5 h-3.5" />
                    {preset.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => addCustomFee({ label: "Phí khác", amount: 0 })}
                  className="inline-flex items-center gap-1 h-9 px-3 rounded-full border border-primary/30 bg-primary/5 text-xs font-bold text-primary hover:bg-primary/10"
                >
                  <Icon icon="lucide:plus" className="w-3.5 h-3.5" />
                  Thêm phí tùy chỉnh
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="salesNote">Ghi chú tư vấn</FieldLabel>
              <textarea
                id="salesNote"
                rows={3}
                value={salesNote}
                onChange={(event) => setSalesNote(event.target.value)}
                placeholder="Ghi chú gửi kèm báo giá cho khách..."
                className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm input-focus-ring resize-y min-h-[88px]"
              />
            </div>
          </section>
        </div>
      ) : null}

      {currentStep === 3 && !successMessage ? (
        <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
          <h2 className="text-lg font-bold text-ink">Xác nhận gửi báo giá</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted">Khách hàng</dt>
              <dd className="font-semibold text-ink">{selectedCustomer?.fullName}</dd>
            </div>
            <div>
              <dt className="text-muted">Kho</dt>
              <dd className="font-semibold text-ink">
                {selectedWarehouse?.flag} {selectedWarehouse?.name}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Hàng hóa</dt>
              <dd className="font-semibold text-ink">{productName}</dd>
            </div>
            <div>
              <dt className="text-muted">Tổng báo giá</dt>
              <dd className="font-black text-lg text-primary font-['Oswald']">
                {formatMoney(totals.total)}
              </dd>
            </div>
          </dl>
          <p className="text-sm text-muted">
            Hệ thống sẽ ghi nhận yêu cầu ký gửi và gửi báo giá cho khách. Sau khi khách duyệt,
            Sales tạo phiếu nhập kho.
          </p>
        </section>
      ) : null}

      {submitError ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {submitError}
        </div>
      ) : null}

      {!successMessage ? (
        <div className="flex flex-col sm:flex-row gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center h-11 px-6 rounded-lg border border-border-muted text-sm font-semibold text-ink hover:bg-surface disabled:opacity-50"
            >
              Quay lại
            </button>
          ) : null}

          {currentStep < WIZARD_STEPS.length ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={hasBannedItem}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
            >
              Tiếp tục
              <Icon icon="lucide:arrow-right" className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || hasBannedItem}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Icon icon="lucide:send" className="w-4 h-4" />
                  Gửi báo giá cho khách
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <Link
          href={ROUTES.sales.consignments}
          className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90"
        >
          Về danh sách ký gửi
        </Link>
      )}
    </div>
  );
}
