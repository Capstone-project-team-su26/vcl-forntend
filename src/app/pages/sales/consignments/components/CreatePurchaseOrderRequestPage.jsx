"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import * as customerService from "@/utils/customerService";
import * as shippingMethodService from "@/utils/shippingMethodService";
import * as orderConsignmentService from "@/utils/orderConsignmentService";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";
import styles from "./CreatePurchaseOrderRequestPage.module.scss";

const { ITEM_VALIDATION_LABELS } = orderConsignmentService;

const emptyItem = {
  productName: "",
  productType: "",
  quantity: "1",
  estimatedSize: "",
  estimatedWeight: "",
  declaredValue: "",
};

function FieldLabel({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className={styles.fieldLabel}>
      {children}
      {required ? <span className={styles.required}> *</span> : null}
    </label>
  );
}

export default function CreatePurchaseOrderRequestPage({ preselectedCustomerId }) {
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [shippingMethods, setShippingMethods] = useState([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [item, setItem] = useState(emptyItem);
  const [shippingMethodId, setShippingMethodId] = useState("");
  const [salesNote, setSalesNote] = useState("");
  const [validation, setValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasBannedItem = validation?.hasBanned === true;
  const validationWarnings = validation?.items?.filter((entry) => entry.restrictionType) ?? [];

  const selectedShippingMethod = useMemo(
    () => shippingMethods.find((entry) => entry.id === shippingMethodId) ?? null,
    [shippingMethods, shippingMethodId]
  );

  useEffect(() => {
    if (!preselectedCustomerId) return;
    let active = true;
    customerService.getCustomer(preselectedCustomerId).then((customer) => {
      if (active && customer) setSelectedCustomer(customer);
    });
    return () => {
      active = false;
    };
  }, [preselectedCustomerId]);

  useEffect(() => {
    let active = true;
    shippingMethodService
      .listShippingMethods({ activeOnly: true })
      .then((methods) => {
        if (!active) return;
        setShippingMethods(methods);
        if (methods.length === 1) setShippingMethodId(methods[0].id);
      })
      .catch((err) => active && setLoadError(getErrorMessage(err)))
      .finally(() => active && setIsLoadingPage(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!customerSearch.trim()) {
      setCustomerResults([]);
      return;
    }
    let active = true;
    const timer = window.setTimeout(async () => {
      setIsSearchingCustomers(true);
      try {
        const results = await customerService.listCustomers({ search: customerSearch.trim() });
        if (active) setCustomerResults(results);
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
    const productName = item.productName.trim();
    if (!productName) {
      setValidation(null);
      return;
    }
    let active = true;
    const timer = window.setTimeout(async () => {
      setIsValidating(true);
      try {
        const result = await orderConsignmentService.validateConsignmentItems({
          items: [{ ...item, productName }],
        });
        if (active) setValidation(result);
      } finally {
        if (active) setIsValidating(false);
      }
    }, 500);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [item]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting || hasBannedItem || !selectedCustomer || !shippingMethodId) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");

    try {
      const response = await orderConsignmentService.createStaffConsignment({
        customerId: selectedCustomer.id,
        shippingMethodId,
        shippingOption: "PURCHASE_ORDER",
        salesNote,
        items: [item],
      });
      setSuccessMessage(response.message || "Tạo yêu cầu mua hộ thành công.");
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
      <div className={styles.header}>
        <Link href={ROUTES.sales.consignments} className={styles.backLink}>
          <Icon icon="lucide:arrow-left" className={styles.iconSm} />
          Quay lại danh sách
        </Link>
        <h1 className={styles.title}>Tạo yêu cầu mua hộ</h1>
        <p className={styles.subtitle}>Nhập thông tin đơn mua hộ thay khách.</p>
      </div>

      {loadError ? <div className={styles.alertDanger}>{loadError}</div> : null}
      {successMessage ? <div className={styles.alertSuccess}>{successMessage}</div> : null}

      <form onSubmit={handleSubmit} className={styles.form}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Khách hàng</h2>
          {selectedCustomer ? (
            <div className={styles.customerRow}>
              <p className={styles.customerName}>{selectedCustomer.fullName}</p>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className={styles.changeBtn}
              >
                Đổi khách
              </button>
            </div>
          ) : (
            <>
              <input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Tìm khách hàng..."
                className={`${styles.input} input-focus-ring`}
              />
              {customerResults.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => setSelectedCustomer(customer)}
                  className={styles.customerResultBtn}
                >
                  {customer.fullName}
                </button>
              ))}
            </>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Hàng hóa</h2>
          <input
            required
            value={item.productName}
            onChange={(e) => setItem((c) => ({ ...c, productName: e.target.value }))}
            placeholder="Tên hàng"
            className={`${styles.input} input-focus-ring`}
          />
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => setItem((c) => ({ ...c, quantity: e.target.value }))}
            placeholder="Số lượng"
            className={`${styles.input} input-focus-ring`}
          />
          {validationWarnings.map((warning) => (
            <div key={warning.restrictionType} className={styles.warningText}>
              {ITEM_VALIDATION_LABELS[warning.restrictionType]}
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Vận chuyển</h2>
          {shippingMethods.map((method) => (
            <label key={method.id} className={styles.radioLabel}>
              <input
                type="radio"
                name="shippingMethod"
                checked={shippingMethodId === method.id}
                onChange={() => setShippingMethodId(method.id)}
              />
              <span className={styles.radioText}>{method.name}</span>
            </label>
          ))}
        </section>

        <textarea
          value={salesNote}
          onChange={(e) => setSalesNote(e.target.value)}
          placeholder="Ghi chú"
          className={`${styles.textarea} input-focus-ring`}
        />

        {submitError ? <p className={styles.submitError}>{submitError}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting || hasBannedItem}
          className={styles.submitBtn}
        >
          {isSubmitting ? "Đang tạo..." : "Tạo yêu cầu mua hộ"}
        </button>
      </form>
    </div>
  );
}
