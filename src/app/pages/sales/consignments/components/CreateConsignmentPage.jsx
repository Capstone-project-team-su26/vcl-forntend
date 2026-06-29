"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import * as customerService from "@/utils/customerService";
import * as shippingMethodService from "@/utils/shippingMethodService";
import * as orderConsignmentService from "@/utils/orderConsignmentService";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";

const {
  ITEM_VALIDATION_LABELS,
  ITEM_VALIDATION_STYLES,
} = orderConsignmentService;

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

export default function CreateConsignmentPage() {
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get("customerId");
  const orderType = searchParams.get("orderType");
  const isPurchaseOrder = orderType === "PURCHASE_ORDER";

  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [customerSearchError, setCustomerSearchError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [shippingMethods, setShippingMethods] = useState([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [item, setItem] = useState(emptyItem);
  const [shippingMethodId, setShippingMethodId] = useState("");
  const [additionalServiceIds, setAdditionalServiceIds] = useState([]);
  const [salesNote, setSalesNote] = useState("");

  const [validation, setValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdConsignmentCode, setCreatedConsignmentCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedShippingMethod = useMemo(
    () => shippingMethods.find((entry) => entry.id === shippingMethodId) ?? null,
    [shippingMethods, shippingMethodId]
  );

  const hasBannedItem = validation?.hasBanned === true;
  const validationWarnings =
    validation?.items?.filter((entry) => entry.restrictionType) ?? [];

  useEffect(() => {
    if (!preselectedCustomerId) return;

    let active = true;

    async function loadPreselectedCustomer() {
      try {
        const customer = await customerService.getCustomer(preselectedCustomerId);
        if (active && customer) {
          setSelectedCustomer(customer);
        }
      } catch {
        // Khách không tồn tại — Sales có thể chọn lại thủ công.
      }
    }

    loadPreselectedCustomer();
    return () => {
      active = false;
    };
  }, [preselectedCustomerId]);

  useEffect(() => {
    let active = true;

    async function loadShippingMethods() {
      setIsLoadingPage(true);
      setLoadError("");

      try {
        const methods = await shippingMethodService.listShippingMethods({ activeOnly: true });
        if (!active) return;

        setShippingMethods(methods);
        if (methods.length === 1) {
          setShippingMethodId(methods[0].id);
        }
      } catch (err) {
        if (active) setLoadError(getErrorMessage(err));
      } finally {
        if (active) setIsLoadingPage(false);
      }
    }

    loadShippingMethods();
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
    setAdditionalServiceIds([]);
  }, [shippingMethodId]);

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
  }, [item]);

  function handleSelectCustomer(customer) {
    setSelectedCustomer(customer);
    setCustomerSearch("");
    setCustomerResults([]);
    setSubmitError("");
    setSuccessMessage("");
    setCreatedConsignmentCode("");
  }

  function handleClearCustomer() {
    setSelectedCustomer(null);
    setCustomerSearch("");
    setCustomerResults([]);
  }

  function updateItemField(field, value) {
    setItem((current) => ({ ...current, [field]: value }));
    setSubmitError("");
    setSuccessMessage("");
    setCreatedConsignmentCode("");
  }

  function toggleAdditionalService(serviceId) {
    setAdditionalServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId]
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSubmitting || hasBannedItem) return;

    if (!selectedCustomer) {
      setSubmitError("Vui lòng chọn khách hàng.");
      return;
    }

    if (!item.productName.trim()) {
      setSubmitError("Vui lòng nhập tên hàng.");
      return;
    }

    if (!item.quantity || Number(item.quantity) < 1) {
      setSubmitError("Số lượng phải lớn hơn 0.");
      return;
    }

    if (!shippingMethodId) {
      setSubmitError("Vui lòng chọn phương thức vận chuyển.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");
    setCreatedConsignmentCode("");

    try {
      const response = await orderConsignmentService.createStaffConsignment({
        customerId: selectedCustomer.id,
        shippingMethodId,
        additionalServiceIds,
        salesNote,
        items: [item],
      });

      setSuccessMessage(
        response.message || "Tạo yêu cầu ký gửi thay khách thành công."
      );
      setCreatedConsignmentCode(response.consignmentCode || "");
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
          {isPurchaseOrder ? "Tạo yêu cầu mua hộ" : "Tạo yêu cầu ký gửi"}
        </h1>
        <p className="text-muted text-sm font-medium mt-2">
          {isPurchaseOrder
            ? "Nhập thông tin đơn mua hộ thay khách khi khách không tự tạo trên hệ thống."
            : "Nhập thông tin đơn ký gửi thay khách khi khách không tự tạo trên hệ thống."}
        </p>
      </div>

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
          {selectedCustomer ? (
            <p className="text-success-text/90">
              Khách hàng: <span className="font-semibold">{selectedCustomer.fullName}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-8">
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
                <CustomerInfoRow label="Công ty" value={selectedCustomer.companyName} />
                <CustomerInfoRow label="MST" value={selectedCustomer.taxId} />
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
                {isSearchingCustomers ? (
                  <Icon
                    icon="lucide:loader-2"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted"
                  />
                ) : null}
              </div>

              {customerSearchError ? (
                <p className="text-sm text-danger">{customerSearchError}</p>
              ) : null}

              {customerSearch.trim() && !isSearchingCustomers ? (
                <ul className="rounded-lg border border-border-muted divide-y divide-border-muted overflow-hidden">
                  {customerResults.length === 0 ? (
                    <li className="px-4 py-3 text-sm text-muted">
                      Không tìm thấy khách hàng phù hợp.
                    </li>
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
                            {[customer.email, customer.phone, customer.id]
                              .filter(Boolean)
                              .join(" · ")}
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
          <h2 className="text-lg font-bold text-ink">Thông tin hàng hóa</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <FieldLabel htmlFor="productName" required>
                Tên hàng
              </FieldLabel>
              <input
                id="productName"
                required
                value={item.productName}
                onChange={(event) => updateItemField("productName", event.target.value)}
                placeholder="VD: Logitech MX Master 3S"
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              />
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="productType">Loại hàng</FieldLabel>
              <input
                id="productType"
                value={item.productType}
                onChange={(event) => updateItemField("productType", event.target.value)}
                placeholder="VD: Điện tử, Thời trang..."
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              />
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="quantity" required>
                Số lượng
              </FieldLabel>
              <input
                id="quantity"
                type="number"
                min="1"
                required
                value={item.quantity}
                onChange={(event) => updateItemField("quantity", event.target.value)}
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              />
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="estimatedSize">Kích thước ước tính</FieldLabel>
              <input
                id="estimatedSize"
                value={item.estimatedSize}
                onChange={(event) => updateItemField("estimatedSize", event.target.value)}
                placeholder="VD: 30×20×15 cm"
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              />
            </div>

            <div className="space-y-2">
              <FieldLabel htmlFor="estimatedWeight">Trọng lượng ước tính (kg)</FieldLabel>
              <input
                id="estimatedWeight"
                type="number"
                min="0"
                step="0.01"
                value={item.estimatedWeight}
                onChange={(event) => updateItemField("estimatedWeight", event.target.value)}
                placeholder="VD: 1.5"
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <FieldLabel htmlFor="declaredValue">Giá trị khai báo (USD)</FieldLabel>
              <input
                id="declaredValue"
                type="number"
                min="0"
                step="0.01"
                value={item.declaredValue}
                onChange={(event) => updateItemField("declaredValue", event.target.value)}
                placeholder="VD: 250"
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              />
            </div>
          </div>

          {(isValidating || validationWarnings.length > 0) && item.productName.trim() ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Icon icon="lucide:shield-alert" className="w-4 h-4" />
                Cảnh báo hàng cấm/hạn chế
                {isValidating ? (
                  <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin text-muted" />
                ) : null}
              </div>

              {validationWarnings.length === 0 && !isValidating ? (
                <p className="text-sm text-muted">Không phát hiện hàng thuộc danh mục cấm/hạn chế.</p>
              ) : null}

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
                    {warning.matchedItemName ? ` — ${warning.matchedItemName}` : ""}
                  </p>
                  {warning.message ? (
                    <p className="mt-1 opacity-90">{warning.message}</p>
                  ) : null}
                  {warning.restrictionType === "BANNED" ? (
                    <p className="mt-2 font-semibold">
                      Không thể tạo yêu cầu với hàng thuộc danh mục cấm tuyệt đối.
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
          <h2 className="text-lg font-bold text-ink">Vận chuyển & dịch vụ</h2>

          {shippingMethods.length === 0 ? (
            <p className="text-sm text-muted">Không có phương thức vận chuyển đang hoạt động.</p>
          ) : (
            <div className="space-y-3">
              <FieldLabel required>Phương thức vận chuyển</FieldLabel>
              <div className="grid grid-cols-1 gap-3">
                {shippingMethods.map((method) => {
                  const isSelected = shippingMethodId === method.id;

                  return (
                    <label
                      key={method.id}
                      className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border-muted hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method.id}
                        checked={isSelected}
                        onChange={() => setShippingMethodId(method.id)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-bold text-ink">{method.name}</span>
                        {method.description ? (
                          <span className="block text-xs text-muted mt-1">{method.description}</span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {selectedShippingMethod?.additionalServices?.length ? (
            <div className="space-y-3 pt-2">
              <FieldLabel>Dịch vụ bổ sung</FieldLabel>
              <div className="space-y-2">
                {selectedShippingMethod.additionalServices.map((service) => (
                  <label
                    key={service.id}
                    className="flex items-start gap-3 rounded-lg border border-border-muted p-3 cursor-pointer hover:bg-surface"
                  >
                    <input
                      type="checkbox"
                      checked={additionalServiceIds.includes(service.id)}
                      onChange={() => toggleAdditionalService(service.id)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-ink">{service.name}</span>
                      {service.description ? (
                        <span className="block text-xs text-muted mt-0.5">{service.description}</span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-3">
          <FieldLabel htmlFor="salesNote">Ghi chú từ Sales</FieldLabel>
          <textarea
            id="salesNote"
            rows={4}
            value={salesNote}
            onChange={(event) => setSalesNote(event.target.value)}
            placeholder="Ghi chú nội bộ hoặc yêu cầu đặc biệt từ khách..."
            className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm input-focus-ring resize-y min-h-[100px]"
          />
        </section>

        {submitError ? (
          <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {submitError}
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              hasBannedItem ||
              !selectedCustomer ||
              shippingMethods.length === 0
            }
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                Đang tạo yêu cầu...
              </>
            ) : (
              "Tạo yêu cầu ký gửi"
            )}
          </button>
          <Link
            href={ROUTES.sales.consignments}
            className="inline-flex items-center justify-center h-11 px-6 rounded-lg border border-border-muted text-sm font-semibold text-ink hover:bg-surface"
          >
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
}
