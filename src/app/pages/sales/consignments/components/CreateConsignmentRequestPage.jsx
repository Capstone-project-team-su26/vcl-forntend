"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import * as customerService from "@/utils/customerService";
import * as orderConsignmentService from "@/utils/orderConsignmentService";
import * as servicePricingService from "@/utils/servicePricingService";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";
import VndMoneyInput from "@/app/components/VndMoneyInput";
import styles from "./CreateConsignmentRequestPage.module.scss";

const { ITEM_VALIDATION_LABELS, ITEM_VALIDATION_STYLES } = orderConsignmentService;
const {
  formatInternationalWarehouseLabel,
  formatServiceTypeLabel,
  isConfiguredServicePricing,
  listServicePricings,
  listServicePricingRouteOptions,
  listInternationalWarehouses,
} = servicePricingService;

function FieldLabel({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className={styles.fieldLabel}>
      {children}
      {required ? <span className={styles.required}> *</span> : null}
    </label>
  );
}

export default function CreateConsignmentRequestPage({ preselectedCustomerId }) {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState([]);
  const [servicePricings, setServicePricings] = useState([]);
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
  const [routeKey, setRouteKey] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [volumeCm3, setVolumeCm3] = useState("");
  const [packageCount, setPackageCount] = useState("");
  const [declaredValue, setDeclaredValue] = useState("");
  const [notes, setNotes] = useState("");

  const [validation, setValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasBannedItem = validation?.hasBanned === true;
  const validationWarnings =
    validation?.items?.filter((entry) => entry.restrictionType) ?? [];

  const routeOptions = useMemo(
    () => listServicePricingRouteOptions(servicePricings),
    [servicePricings]
  );

  const useWarehousePicker = warehouses.length > 0;

  const selectedWarehouse = useMemo(
    () => warehouses.find((entry) => entry.id === warehouseId) ?? null,
    [warehouses, warehouseId]
  );

  const selectedRouteOption = useMemo(
    () => routeOptions.find((entry) => entry.key === routeKey) ?? null,
    [routeOptions, routeKey]
  );

  const selectedPricing = selectedRouteOption?.pricing ?? null;
  const serviceType = selectedRouteOption?.serviceType ?? "STANDARD";
  const routeForCreate = selectedRouteOption?.route ?? null;

  useEffect(() => {
    if (!routeOptions.length) return;
    if (!routeKey || !routeOptions.some((entry) => entry.key === routeKey)) {
      setRouteKey(routeOptions[0].key);
    }
  }, [routeOptions, routeKey]);

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

    async function loadPageData() {
      setIsLoadingPage(true);
      setLoadError("");

      try {
        const [warehouseList, pricingList] = await Promise.all([
          listInternationalWarehouses().catch(() => []),
          listServicePricings({ isActive: true }).catch(() => []),
        ]);
        if (!active) return;

        setWarehouses(Array.isArray(warehouseList) ? warehouseList : []);
        setServicePricings(Array.isArray(pricingList) ? pricingList : []);
        if (warehouseList.length === 1) setWarehouseId(warehouseList[0].id);
      } catch (err) {
        if (active) setLoadError(getErrorMessage(err));
      } finally {
        if (active) setIsLoadingPage(false);
      }
    }

    loadPageData();
    return () => {
      active = false;
    };
  }, []);

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

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting || hasBannedItem) return;

    if (!selectedCustomer) {
      setSubmitError("Vui lòng chọn khách hàng.");
      return;
    }
    if (!productName.trim()) {
      setSubmitError("Vui lòng nhập tên hàng hóa.");
      return;
    }
    if (!selectedRouteOption || !isConfiguredServicePricing(selectedPricing)) {
      setSubmitError(
        "Chưa có bảng giá dịch vụ khả dụng. Liên hệ Admin cấu hình service-pricings trên BE."
      );
      return;
    }
    if (useWarehousePicker && !warehouseId) {
      setSubmitError("Vui lòng chọn kho quốc tế.");
      return;
    }
    if (!weightKg || Number(weightKg) <= 0) {
      setSubmitError("Vui lòng nhập khối lượng (kg).");
      return;
    }
    if (!volumeCm3 || Number(volumeCm3) <= 0) {
      setSubmitError("Vui lòng nhập thể tích (cm³).");
      return;
    }
    if (!packageCount || Number(packageCount) < 1) {
      setSubmitError("Vui lòng nhập số kiện.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await orderConsignmentService.createStaffConsignment({
        customerId: selectedCustomer.id,
        warehouseId: warehouseId || undefined,
        warehouseCode: selectedWarehouse?.code,
        serviceType,
        route: routeForCreate,
        originCountry: selectedPricing.originCountry,
        destinationCountry: selectedPricing.destinationCountry,
        weightKg: Number(weightKg),
        volumeM3: Number(volumeCm3),
        packageCount: Number(packageCount),
        salesNote: notes,
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

      router.push(ROUTES.sales.consignment(response.orderId));
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
        <Link href={ROUTES.sales.consignments} className={styles.backLink}>
          <Icon icon="lucide:arrow-left" className={styles.iconSm} />
          Quay lại danh sách
        </Link>
        <h1 className={styles.title}>Tạo yêu cầu ký gửi thay khách</h1>
        <p className={styles.subtitle}>
          Chỉ ghi nhận yêu cầu. Báo giá được thực hiện riêng sau khi Sales mở chi tiết yêu cầu.
        </p>
      </div>

      {loadError ? <div className={styles.alertDanger}>{loadError}</div> : null}

      {!routeOptions.length ? (
        <div className={styles.alertWarning}>
          Chưa có bảng giá dịch vụ trên hệ thống. Admin cần cấu hình mục Giá dịch vụ chính trước
          khi Sales tạo yêu cầu.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className={styles.form}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Khách hàng</h2>
          {selectedCustomer ? (
            <div className={styles.customerCard}>
              <div>
                <p className={styles.customerName}>{selectedCustomer.fullName}</p>
                <p className={styles.customerId}>Mã: {selectedCustomer.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className={styles.changeBtn}
              >
                Đổi khách
              </button>
            </div>
          ) : (
            <div className={styles.fieldStack}>
              <div className={styles.searchWrap}>
                <Icon icon="lucide:search" className={styles.searchIcon} />
                <input
                  id="customerSearch"
                  type="search"
                  value={customerSearch}
                  onChange={(event) => setCustomerSearch(event.target.value)}
                  placeholder="Tên, email, SĐT, mã khách..."
                  className={`${styles.inputSearch} input-focus-ring`}
                />
              </div>
              {customerSearchError ? (
                <p className={styles.searchError}>{customerSearchError}</p>
              ) : null}
              {customerSearch.trim() && !isSearchingCustomers ? (
                <ul className={styles.resultList}>
                  {customerResults.length === 0 ? (
                    <li className={styles.emptyResult}>Không tìm thấy khách hàng.</li>
                  ) : (
                    customerResults.map((customer) => (
                      <li key={customer.id} className={styles.resultItem}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCustomerSearch("");
                            setCustomerResults([]);
                          }}
                          className={styles.resultBtn}
                        >
                          <p className={styles.resultName}>{customer.fullName}</p>
                          <p className={styles.resultMeta}>
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

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Hàng hóa &amp; tuyến vận chuyển</h2>
          <div className={styles.grid}>
            <div className={`${styles.fieldStack} ${styles.fieldStackWide}`}>
              <FieldLabel htmlFor="productName" required>
                Hàng hóa
              </FieldLabel>
              <input
                id="productName"
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
                placeholder="VD: Loa Bluetooth JBL Charge 5"
                className={`${styles.input} input-focus-ring`}
              />
            </div>
            <div className={styles.fieldStack}>
              <FieldLabel htmlFor="productType">Loại hàng</FieldLabel>
              <input
                id="productType"
                value={productType}
                onChange={(event) => setProductType(event.target.value)}
                placeholder="VD: Điện tử"
                className={`${styles.input} input-focus-ring`}
              />
            </div>
            <div className={styles.fieldStack}>
              <FieldLabel htmlFor="declaredValue">Giá trị khai báo (VND)</FieldLabel>
              <VndMoneyInput
                id="declaredValue"
                value={declaredValue}
                onChange={setDeclaredValue}
              />
            </div>
            <div className={`${styles.fieldStack} ${styles.fieldStackWide}`}>
              <FieldLabel htmlFor="routeKey" required>
                Tuyến &amp; loại dịch vụ
              </FieldLabel>
              <select
                id="routeKey"
                value={routeKey}
                onChange={(event) => setRouteKey(event.target.value)}
                className="form-select input-focus-ring"
                required
              >
                <option value="">Chọn tuyến...</option>
                {routeOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              {routeForCreate ? (
                <p className={styles.routeHint}>
                  Route gửi BE: <span className={styles.routeMono}>{routeForCreate}</span>
                  {" · "}
                  Dịch vụ: {formatServiceTypeLabel(serviceType)}
                </p>
              ) : null}
            </div>
            {useWarehousePicker ? (
              <div className={`${styles.fieldStack} ${styles.fieldStackWide}`}>
                <FieldLabel htmlFor="warehouseId" required>
                  Kho quốc tế
                </FieldLabel>
                <select
                  id="warehouseId"
                  value={warehouseId}
                  onChange={(event) => setWarehouseId(event.target.value)}
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
            ) : null}
            <div className={styles.fieldStack}>
              <FieldLabel htmlFor="weightKg" required>
                Khối lượng (kg)
              </FieldLabel>
              <input
                id="weightKg"
                type="number"
                min="0.01"
                step="0.01"
                value={weightKg}
                onChange={(event) => setWeightKg(event.target.value)}
                className={`${styles.input} input-focus-ring`}
              />
            </div>
            <div className={styles.fieldStack}>
              <FieldLabel htmlFor="volumeCm3" required>
                Thể tích (cm³)
              </FieldLabel>
              <input
                id="volumeCm3"
                type="number"
                min="1"
                step="1"
                value={volumeCm3}
                onChange={(event) => setVolumeCm3(event.target.value)}
                className={`${styles.input} input-focus-ring`}
              />
            </div>
            <div className={styles.fieldStack}>
              <FieldLabel htmlFor="packageCount" required>
                Số kiện
              </FieldLabel>
              <input
                id="packageCount"
                type="number"
                min="1"
                value={packageCount}
                onChange={(event) => setPackageCount(event.target.value)}
                className={`${styles.input} input-focus-ring`}
              />
            </div>
            <div className={`${styles.fieldStack} ${styles.fieldStackWide}`}>
              <FieldLabel htmlFor="notes">Ghi chú</FieldLabel>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className={`${styles.textarea} input-focus-ring`}
              />
            </div>
          </div>

          {(isValidating || validationWarnings.length > 0) && productName.trim() ? (
            <div className={styles.fieldStack}>
              {validationWarnings.map((warning) => (
                <div
                  key={`${warning.productName}-${warning.restrictionType}`}
                  className={`${styles.validationBox} ${
                    ITEM_VALIDATION_STYLES[warning.restrictionType] ||
                    ""
                  }`}
                >
                  <p className={styles.validationTitle}>
                    {ITEM_VALIDATION_LABELS[warning.restrictionType] || warning.restrictionType}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        {submitError ? <div className={styles.alertDanger}>{submitError}</div> : null}

        <button
          type="submit"
          disabled={isSubmitting || hasBannedItem || !routeOptions.length}
          className={styles.submitBtn}
        >
          {isSubmitting ? (
            <>
              <Icon icon="lucide:loader-2" className={`${styles.iconSm} ${styles.loadingIcon}`} />
              Đang tạo...
            </>
          ) : (
            <>
              <Icon icon="lucide:plus" className={styles.iconSm} />
              Tạo yêu cầu ký gửi
            </>
          )}
        </button>
      </form>
    </div>
  );
}
