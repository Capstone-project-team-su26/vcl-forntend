"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import * as customerService from "@/utils/customerService";
import * as orderConsignmentService from "@/utils/orderConsignmentService";
import * as pricingService from "@/utils/internationalWarehousePricingService";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";
import StepIndicator, { WIZARD_STEPS } from "@/app/pages/sales/consignments/components/quotation/steps/StepIndicator";
import WizardStep1 from "@/app/pages/sales/consignments/components/quotation/steps/WizardStep1";
import WizardStep2 from "@/app/pages/sales/consignments/components/quotation/steps/WizardStep2";
import WizardStep3 from "@/app/pages/sales/consignments/components/quotation/steps/WizardStep3";
import styles from "./ConsignmentQuotationWizard.module.scss";

const { buildDefaultQuotationLines, calculateQuotationTotal } = pricingService;

const QUICK_CUSTOM_FEES = [
  { label: "Phí thủ tục hải quan", amount: 25 },
  { label: "Phí bảo hiểm hàng hóa", amount: 15 },
  { label: "Phí xử lý đặc biệt", amount: 10 },
];

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
        volumeCm3,
        packageCount,
        storageMonths,
        enabledFees: Object.keys(enabledMap).length ? enabledMap : undefined,
      });
    });
  }, [warehouseId, weightKg, volumeCm3, packageCount, storageMonths]);

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
                      volumeCm3,
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
        volumeM3: volumeCm3 ? Number(volumeCm3) : 0,
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
      <div className={styles.loading}>
        <Icon icon="lucide:loader-2" className={styles.loadingIcon} />
        <p className={styles.loadingText}>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div>
        <Link
          href={ROUTES.sales.consignments}
          className={styles.backLink}
        >
          <Icon icon="lucide:arrow-left" className={styles.iconSm} />
          Quay lại danh sách
        </Link>
        <p className={styles.eyebrow}>
          Bước 1.2 · Sales / CSKH
        </p>
        <h1 className={styles.title}>
          Tư vấn &amp; báo giá ký gửi
        </h1>
        <p className={styles.subtitle}>
          Dựa vào bảng giá kho quốc tế, chỉnh từng khoản phí và gửi báo giá cho khách. Sau khi khách
          duyệt, Sales tạo phiếu nhập kho.
        </p>
      </div>

      <StepIndicator currentStep={currentStep} />

      {loadError ? (
        <div className={styles.alertDanger}>
          {loadError}
        </div>
      ) : null}

      {successMessage ? (
        <div className={styles.alertSuccess}>
          <p className={styles.summaryValue}>{successMessage}</p>
          {createdConsignmentCode ? (
            <p>
              Mã yêu cầu ký gửi:{" "}
              <span className={styles.confirmTotal}>{createdConsignmentCode}</span>
            </p>
          ) : null}
          <p className={styles.alertSuccessSub}>
            Khách duyệt xong, Sales sẽ tạo phiếu nhập kho.
          </p>
        </div>
      ) : null}

      {stepError ? (
        <div className={styles.alertWarning}>
          {stepError}
        </div>
      ) : null}

      {currentStep === 1 ? (
        <WizardStep1
          selectedCustomer={selectedCustomer}
          handleClearCustomer={handleClearCustomer}
          customerSearch={customerSearch}
          setCustomerSearch={setCustomerSearch}
          customerSearchError={customerSearchError}
          customerResults={customerResults}
          isSearchingCustomers={isSearchingCustomers}
          handleSelectCustomer={handleSelectCustomer}
          productName={productName}
          setProductName={setProductName}
          resetSuccessState={resetSuccessState}
          productType={productType}
          setProductType={setProductType}
          declaredValue={declaredValue}
          setDeclaredValue={setDeclaredValue}
          warehouses={warehouses}
          warehouseId={warehouseId}
          setWarehouseId={setWarehouseId}
          weightKg={weightKg}
          setWeightKg={setWeightKg}
          volumeCm3={volumeCm3}
          setVolumeCm3={setVolumeCm3}
          packageCount={packageCount}
          setPackageCount={setPackageCount}
          isValidating={isValidating}
          validationWarnings={validationWarnings}
        />
      ) : null}

      {currentStep === 2 ? (
        <WizardStep2
          productName={productName}
          selectedWarehouse={selectedWarehouse}
          weightKg={weightKg}
          volumeCm3={volumeCm3}
          packageCount={packageCount}
          pricingMatrix={pricingMatrix}
          warehouseId={warehouseId}
          storageMonths={storageMonths}
          setStorageMonths={setStorageMonths}
          resetSuccessState={resetSuccessState}
          discountPercent={discountPercent}
          setDiscountPercent={setDiscountPercent}
          feeLines={feeLines}
          toggleFeeLine={toggleFeeLine}
          updateFeeLineAmount={updateFeeLineAmount}
          customFees={customFees}
          removeCustomFee={removeCustomFee}
          updateCustomFee={updateCustomFee}
          addCustomFee={addCustomFee}
          QUICK_CUSTOM_FEES={QUICK_CUSTOM_FEES}
          salesNote={salesNote}
          setSalesNote={setSalesNote}
          totals={totals}
        />
      ) : null}

      {currentStep === 3 && !successMessage ? (
        <WizardStep3
          selectedCustomer={selectedCustomer}
          selectedWarehouse={selectedWarehouse}
          productName={productName}
          totals={totals}
        />
      ) : null}

      {submitError ? (
        <div className={styles.alertDanger}>
          {submitError}
        </div>
      ) : null}

      {!successMessage ? (
        <div className={styles.nav}>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={isSubmitting}
              className={styles.secondaryBtn}
            >
              Quay lại
            </button>
          ) : null}

          {currentStep < WIZARD_STEPS.length ? (
            <button
              type="button"
              onClick={handleNextStep}
              disabled={hasBannedItem}
              className={styles.primaryBtn}
            >
              Tiếp tục
              <Icon icon="lucide:arrow-right" className={styles.iconSm} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || hasBannedItem}
              className={styles.primaryBtn}
            >
              {isSubmitting ? (
                <>
                  <Icon icon="lucide:loader-2" className={`${styles.iconSm} ${styles.loadingIcon}`} />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Icon icon="lucide:send" className={styles.iconSm} />
                  Gửi báo giá cho khách
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <Link
          href={ROUTES.sales.consignments}
          className={styles.primaryBtn}
        >
          Về danh sách ký gửi
        </Link>
      )}
    </div>
  );
}
