"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import * as customerService from "@/modules/customers";
import * as shippingMethodService from "@/modules/shipping-methods";
import * as orderConsignmentService from "@/modules/consignments";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";

const { ITEM_VALIDATION_LABELS, ITEM_VALIDATION_STYLES } = orderConsignmentService;

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
    <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
      {children}
      {required ? <span className="text-danger"> *</span> : null}
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
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted">
        <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin" />
        <p className="text-sm font-medium">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <Link
          href={ROUTES.sales.consignments}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink mb-4"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          Quay lại danh sách
        </Link>
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-['Oswald'] text-ink">
          Tạo yêu cầu mua hộ
        </h1>
        <p className="text-muted text-sm font-medium mt-2">
          Nhập thông tin đơn mua hộ thay khách.
        </p>
      </div>

      {loadError ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {loadError}
        </div>
      ) : null}
      {successMessage ? (
        <div className="rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text">
          {successMessage}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
          <h2 className="text-lg font-bold text-ink">Khách hàng</h2>
          {selectedCustomer ? (
            <div className="flex items-center justify-between gap-3">
              <p className="font-bold text-ink">{selectedCustomer.fullName}</p>
              <button type="button" onClick={() => setSelectedCustomer(null)} className="text-sm text-primary font-semibold">
                Đổi khách
              </button>
            </div>
          ) : (
            <>
              <input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Tìm khách hàng..."
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              />
              {customerResults.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => setSelectedCustomer(customer)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-border-muted hover:bg-surface"
                >
                  {customer.fullName}
                </button>
              ))}
            </>
          )}
        </section>

        <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
          <h2 className="text-lg font-bold text-ink">Hàng hóa</h2>
          <input
            required
            value={item.productName}
            onChange={(e) => setItem((c) => ({ ...c, productName: e.target.value }))}
            placeholder="Tên hàng"
            className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
          />
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => setItem((c) => ({ ...c, quantity: e.target.value }))}
            placeholder="Số lượng"
            className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
          />
          {validationWarnings.map((warning) => (
            <div key={warning.restrictionType} className="text-sm text-warning-text">
              {ITEM_VALIDATION_LABELS[warning.restrictionType]}
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
          <h2 className="text-lg font-bold text-ink">Vận chuyển</h2>
          {shippingMethods.map((method) => (
            <label key={method.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="shippingMethod"
                checked={shippingMethodId === method.id}
                onChange={() => setShippingMethodId(method.id)}
              />
              <span className="text-sm font-semibold">{method.name}</span>
            </label>
          ))}
        </section>

        <textarea
          value={salesNote}
          onChange={(e) => setSalesNote(e.target.value)}
          placeholder="Ghi chú"
          className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm input-focus-ring min-h-[88px]"
        />

        {submitError ? <p className="text-sm text-danger">{submitError}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting || hasBannedItem}
          className="h-11 px-6 rounded-lg bg-primary text-white text-sm font-bold disabled:opacity-50"
        >
          {isSubmitting ? "Đang tạo..." : "Tạo yêu cầu mua hộ"}
        </button>
      </form>
    </div>
  );
}
