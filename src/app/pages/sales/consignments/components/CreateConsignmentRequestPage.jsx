"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import * as customerService from "@/modules/customers";
import * as orderConsignmentService from "@/modules/consignments";
import * as servicePricingService from "@/modules/service-pricing";
import * as productTypeService from "@/modules/product-types";
import * as uploadsService from "@/modules/uploads";
import { formatFeeAmount } from "@/modules/additional-service-fees";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";
import VndMoneyInput from "@/app/components/VndMoneyInput";
import { toast } from "@/app/components/ToastProvider";

const { ITEM_VALIDATION_LABELS, ITEM_VALIDATION_STYLES } = orderConsignmentService;
const {
  formatServiceTypeLabel,
  formatVolumeCm3,
  isConfiguredServicePricing,
  listServicePricings,
  listServicePricingRouteOptions,
} = servicePricingService;

const MAX_IMAGES_PER_ITEM = 3;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);

function FieldLabel({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
      {children}
      {required ? <span className="text-danger"> *</span> : null}
    </label>
  );
}

function createEmptyItem() {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productName: "",
    productType: "",
    quantity: "1",
    declaredValue: "",
    weightKg: "",
    lengthCm: "",
    widthCm: "",
    heightCm: "",
    imageUrls: [],
  };
}

function itemVolumeCm3(item) {
  const length = Number(item.lengthCm);
  const width = Number(item.widthCm);
  const height = Number(item.heightCm);
  if (!(length > 0 && width > 0 && height > 0)) return null;
  return length * width * height;
}

export default function CreateConsignmentRequestPage({ preselectedCustomerId }) {
  const router = useRouter();
  const [servicePricings, setServicePricings] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [customerSearchError, setCustomerSearchError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [routeGroupKey, setRouteGroupKey] = useState("");
  const [serviceOptionKey, setServiceOptionKey] = useState("");
  const [items, setItems] = useState([createEmptyItem()]);
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedPricingRuleIds, setSelectedPricingRuleIds] = useState([]);

  const [validation, setValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [uploadingItemKey, setUploadingItemKey] = useState("");
  const [dragOverItemKey, setDragOverItemKey] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasBannedItem = validation?.hasBanned === true;
  const validationWarnings =
    validation?.items?.filter((entry) => entry.restrictionType) ?? [];

  const routeOptions = useMemo(
    () => listServicePricingRouteOptions(servicePricings),
    [servicePricings]
  );

  const routeGroups = useMemo(() => {
    const map = new Map();
    for (const option of routeOptions) {
      const key = `${String(option.originCountry ?? "").toUpperCase()}|${String(option.destinationCountry ?? "").toUpperCase()}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: `${option.originCountry ?? "—"} → ${option.destinationCountry ?? "—"}`,
          originCountry: option.originCountry,
          destinationCountry: option.destinationCountry,
          options: [],
        });
      }
      map.get(key).options.push(option);
    }
    return [...map.values()];
  }, [routeOptions]);

  const selectedRouteGroup = useMemo(
    () => routeGroups.find((entry) => entry.key === routeGroupKey) ?? null,
    [routeGroups, routeGroupKey]
  );

  const serviceOptions = selectedRouteGroup?.options ?? [];

  const selectedRouteOption = useMemo(
    () => serviceOptions.find((entry) => entry.key === serviceOptionKey) ?? null,
    [serviceOptions, serviceOptionKey]
  );

  const selectedPricing = selectedRouteOption?.pricing ?? null;
  const serviceType = selectedRouteOption?.serviceType ?? "STANDARD";
  const routeForCreate = selectedRouteOption?.route ?? null;
  const boxPricingRules = useMemo(
    () => (selectedPricing?.boxPricingRules ?? []).filter((rule) => rule.isActive !== false),
    [selectedPricing]
  );
  const activePricingRuleIds = useMemo(() => {
    const availableIds = new Set(boxPricingRules.map((rule) => rule.id).filter(Boolean));
    const requiredIds = boxPricingRules
      .filter((rule) => rule.isRequired)
      .map((rule) => rule.id);
    return [...new Set([...requiredIds, ...selectedPricingRuleIds])].filter((id) =>
      availableIds.has(id)
    );
  }, [boxPricingRules, selectedPricingRuleIds]);

  function applyCustomerReceiverDefaults(customer) {
    if (!customer) return;
    setReceiverName((current) => current.trim() || customer.fullName || "");
    setReceiverPhone((current) => current.trim() || customer.phone || "");
    setReceiverAddress((current) => current.trim() || customer.address || "");
  }

  function updateItem(key, patch) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item))
    );
  }

  function addItem() {
    setItems((current) => [...current, createEmptyItem()]);
  }

  function removeItem(key) {
    setItems((current) => (current.length <= 1 ? current : current.filter((item) => item.key !== key)));
  }

  useEffect(() => {
    if (!routeGroups.length) return;
    if (!routeGroupKey || !routeGroups.some((entry) => entry.key === routeGroupKey)) {
      setRouteGroupKey(routeGroups[0].key);
    }
  }, [routeGroups, routeGroupKey]);

  useEffect(() => {
    if (!serviceOptions.length) {
      setServiceOptionKey("");
      return;
    }
    if (!serviceOptionKey || !serviceOptions.some((entry) => entry.key === serviceOptionKey)) {
      setServiceOptionKey(serviceOptions[0].key);
    }
  }, [serviceOptions, serviceOptionKey]);

  useEffect(() => {
    if (!preselectedCustomerId) return;
    let active = true;
    customerService
      .getCustomer(preselectedCustomerId)
      .then((customer) => {
        if (!active || !customer) return;
        setSelectedCustomer(customer);
        applyCustomerReceiverDefaults(customer);
      })
      .catch(() => {});
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
        const [pricingList, typeList] = await Promise.all([
          listServicePricings({ isActive: true }).catch(() => []),
          productTypeService.listProductTypes().catch(() => []),
        ]);
        if (!active) return;
        setServicePricings(Array.isArray(pricingList) ? pricingList : []);
        setProductTypes(Array.isArray(typeList) ? typeList : []);
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
    const payloadItems = items
      .map((item) => ({
        productName: item.productName.trim(),
        productType: item.productType,
        quantity: item.quantity || "1",
      }))
      .filter((item) => item.productName);
    if (!payloadItems.length) {
      setValidation(null);
      return;
    }
    let active = true;
    const timer = window.setTimeout(async () => {
      setIsValidating(true);
      try {
        const result = await orderConsignmentService.validateConsignmentItems({
          items: payloadItems,
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
  }, [items]);

  async function handleUploadImages(itemKey, fileList) {
    const files = [...(fileList || [])];
    if (!files.length) return;

    const item = items.find((entry) => entry.key === itemKey);
    if (!item) return;

    const remaining = MAX_IMAGES_PER_ITEM - item.imageUrls.length;
    if (remaining <= 0) {
      toast.error(`Mỗi kiện tối đa ${MAX_IMAGES_PER_ITEM} ảnh.`);
      return;
    }

    const accepted = [];
    for (const file of files.slice(0, remaining)) {
      if (!ALLOWED_IMAGE_TYPES.has(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
        toast.error(`File ${file.name} không đúng định dạng (JPG/PNG/WEBP).`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`File ${file.name} vượt quá 5MB.`);
        continue;
      }
      accepted.push(file);
    }
    if (!accepted.length) return;

    setUploadingItemKey(itemKey);
    try {
      const urls = await uploadsService.uploadImages(accepted);
      if (!urls.length) throw new Error("Upload không trả về URL.");
      setItems((current) =>
        current.map((entry) =>
          entry.key !== itemKey
            ? entry
            : {
                ...entry,
                imageUrls: [...entry.imageUrls, ...urls].slice(0, MAX_IMAGES_PER_ITEM),
              }
        )
      );
      toast.success(`Đã tải ${urls.length} ảnh.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Upload ảnh thất bại."));
    } finally {
      setUploadingItemKey("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting || hasBannedItem) return;

    if (!selectedCustomer) {
      setSubmitError("Vui lòng chọn khách hàng.");
      return;
    }
    if (!selectedRouteOption || !isConfiguredServicePricing(selectedPricing)) {
      setSubmitError("Vui lòng chọn tuyến hàng và hình thức vận chuyển.");
      return;
    }
    if (!receiverName.trim() || !receiverPhone.trim() || !receiverAddress.trim()) {
      setSubmitError("Vui lòng nhập đủ thông tin người nhận (tên, SĐT, địa chỉ).");
      return;
    }
    if (notes.length > 1000) {
      setSubmitError("Ghi chú tối đa 1000 ký tự.");
      return;
    }

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const label = `Kiện ${index + 1}`;
      if (!item.productName.trim()) {
        setSubmitError(`${label}: vui lòng nhập tên sản phẩm.`);
        return;
      }
      if (!item.productType) {
        setSubmitError(`${label}: vui lòng chọn loại hàng hóa.`);
        return;
      }
      if (!item.quantity || Number(item.quantity) < 1) {
        setSubmitError(`${label}: vui lòng nhập số lượng.`);
        return;
      }
      if (!item.weightKg || Number(item.weightKg) <= 0) {
        setSubmitError(`${label}: vui lòng nhập cân nặng (kg).`);
        return;
      }
      if (
        !item.lengthCm ||
        !item.widthCm ||
        !item.heightCm ||
        Number(item.lengthCm) <= 0 ||
        Number(item.widthCm) <= 0 ||
        Number(item.heightCm) <= 0
      ) {
        setSubmitError(`${label}: vui lòng nhập kích thước D × R × C (cm).`);
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await orderConsignmentService.createStaffConsignment({
        customerId: selectedCustomer.id,
        serviceType,
        route: routeForCreate,
        originCountry: selectedPricing.originCountry,
        destinationCountry: selectedPricing.destinationCountry,
        pricingRuleIds: activePricingRuleIds,
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        receiverAddress: receiverAddress.trim(),
        salesNote: notes,
        items: items.map((item) => ({
          productName: item.productName.trim(),
          productType: item.productType,
          quantity: Number(item.quantity),
          estimatedWeight: item.weightKg,
          length: item.lengthCm,
          width: item.widthCm,
          height: item.heightCm,
          declaredValue: item.declaredValue,
          referenceUrls: item.imageUrls,
        })),
      });

      toast.success(response.message || "Tạo yêu cầu ký gửi thành công.");
      router.push(ROUTES.sales.consignment(response.orderId));
    } catch (err) {
      const message = getErrorMessage(err);
      setSubmitError(message);
      toast.error(message);
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
          Quay lại
        </Link>
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-['Oswald'] text-ink">
          Ký gửi hàng hóa
        </h1>
        <p className="text-muted text-sm font-medium mt-2">
          Tạo đơn hàng mới thay khách — cùng luồng với web khách.
        </p>
      </div>

      {loadError ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {loadError}
        </div>
      ) : null}

      {!routeOptions.length ? (
        <div className="rounded-lg border border-warning/30 bg-warning-bg px-4 py-3 text-sm text-warning-text">
          Chưa có bảng giá dịch vụ. Admin cần cấu hình Giá dịch vụ chính trước khi tạo yêu cầu.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
          <h2 className="text-lg font-bold text-ink">Khách hàng</h2>
          {selectedCustomer ? (
            <div className="rounded-lg border border-border-muted bg-surface p-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold text-ink">{selectedCustomer.fullName}</p>
                <p className="text-xs text-muted mt-1">
                  {[selectedCustomer.email, selectedCustomer.phone].filter(Boolean).join(" · ") ||
                    `Mã: ${selectedCustomer.id}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-sm font-semibold text-primary hover:underline shrink-0"
              >
                Đổi khách
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Icon
                  icon="lucide:search"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
                />
                <input
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
                          onClick={() => {
                            setSelectedCustomer(customer);
                            applyCustomerReceiverDefaults(customer);
                            setCustomerSearch("");
                            setCustomerResults([]);
                          }}
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
          <h2 className="text-lg font-bold text-ink">Tuyến hàng</h2>
          <p className="text-xs text-muted -mt-2">
            Chọn đúng tuyến vận chuyển phù hợp với nơi gửi và nơi nhận hàng.
          </p>
          <select
            value={routeGroupKey}
            onChange={(event) => setRouteGroupKey(event.target.value)}
            className="form-select input-focus-ring"
            required
          >
            <option value="">Chọn tuyến...</option>
            {routeGroups.map((group) => (
              <option key={group.key} value={group.key}>
                {group.label}
              </option>
            ))}
          </select>
        </section>

        <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
          <h2 className="text-lg font-bold text-ink">Hình thức vận chuyển</h2>
          <select
            value={serviceOptionKey}
            onChange={(event) => setServiceOptionKey(event.target.value)}
            className="form-select input-focus-ring"
            required
            disabled={!serviceOptions.length}
          >
            <option value="">Chọn hình thức...</option>
            {serviceOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {formatServiceTypeLabel(option.serviceType)}
              </option>
            ))}
          </select>
          {routeForCreate ? (
            <p className="text-xs text-muted">
              Route gửi BE: <span className="font-mono">{routeForCreate}</span>
            </p>
          ) : null}
        </section>

        <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
          <h2 className="text-lg font-bold text-ink">Người nhận</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <FieldLabel htmlFor="receiverName" required>
                Tên người nhận
              </FieldLabel>
              <input
                id="receiverName"
                value={receiverName}
                onChange={(event) => setReceiverName(event.target.value)}
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              />
            </div>
            <div className="space-y-2">
              <FieldLabel htmlFor="receiverPhone" required>
                Số điện thoại
              </FieldLabel>
              <input
                id="receiverPhone"
                value={receiverPhone}
                onChange={(event) => setReceiverPhone(event.target.value)}
                className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <FieldLabel htmlFor="receiverAddress" required>
                Địa chỉ nhận hàng
              </FieldLabel>
              <textarea
                id="receiverAddress"
                rows={2}
                value={receiverAddress}
                onChange={(event) => setReceiverAddress(event.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm input-focus-ring resize-y"
              />
            </div>
          </div>
        </section>

        {items.map((item, index) => {
          const volume = itemVolumeCm3(item);
          const isUploading = uploadingItemKey === item.key;
          return (
            <section
              key={item.key}
              className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                    {index + 1}
                  </span>
                  <h2 className="text-lg font-bold text-ink">
                    Thông tin sản phẩm kiện thứ {index + 1}
                  </h2>
                </div>
                {items.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="text-sm font-semibold text-danger hover:underline"
                  >
                    Xóa kiện
                  </button>
                ) : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <FieldLabel htmlFor={`productName-${item.key}`} required>
                    Tên sản phẩm
                  </FieldLabel>
                  <input
                    id={`productName-${item.key}`}
                    value={item.productName}
                    onChange={(event) => updateItem(item.key, { productName: event.target.value })}
                    placeholder="VD: Loa Bluetooth JBL Charge 5"
                    className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor={`productType-${item.key}`} required>
                    Loại hàng hóa
                  </FieldLabel>
                  <select
                    id={`productType-${item.key}`}
                    value={item.productType}
                    onChange={(event) => updateItem(item.key, { productType: event.target.value })}
                    className="form-select input-focus-ring"
                  >
                    <option value="">Chọn loại hàng...</option>
                    {productTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor={`quantity-${item.key}`} required>
                    Số lượng sản phẩm
                  </FieldLabel>
                  <input
                    id={`quantity-${item.key}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) => updateItem(item.key, { quantity: event.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor={`declaredValue-${item.key}`}>
                    Giá trị kiện hàng (VND)
                  </FieldLabel>
                  <VndMoneyInput
                    id={`declaredValue-${item.key}`}
                    value={item.declaredValue}
                    onChange={(value) => updateItem(item.key, { declaredValue: value })}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor={`weightKg-${item.key}`} required>
                    Cân nặng kiện hàng (kg)
                  </FieldLabel>
                  <input
                    id={`weightKg-${item.key}`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.weightKg}
                    onChange={(event) => updateItem(item.key, { weightKg: event.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor={`lengthCm-${item.key}`} required>
                    Dài (cm)
                  </FieldLabel>
                  <input
                    id={`lengthCm-${item.key}`}
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={item.lengthCm}
                    onChange={(event) => updateItem(item.key, { lengthCm: event.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor={`widthCm-${item.key}`} required>
                    Rộng (cm)
                  </FieldLabel>
                  <input
                    id={`widthCm-${item.key}`}
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={item.widthCm}
                    onChange={(event) => updateItem(item.key, { widthCm: event.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor={`heightCm-${item.key}`} required>
                    Cao (cm)
                  </FieldLabel>
                  <input
                    id={`heightCm-${item.key}`}
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={item.heightCm}
                    onChange={(event) => updateItem(item.key, { heightCm: event.target.value })}
                    className="w-full h-11 px-4 rounded-lg border border-border-muted text-sm input-focus-ring"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor={`volume-${item.key}`}>Thể tích (tự tính)</FieldLabel>
                  <p
                    id={`volume-${item.key}`}
                    className="h-11 px-4 rounded-lg border border-border-muted bg-surface text-sm flex items-center text-muted"
                  >
                    {volume != null
                      ? `${volume.toLocaleString("vi-VN")} cm³ ≈ ${formatVolumeCm3(volume)}`
                      : "Nhập D × R × C"}
                  </p>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <FieldLabel htmlFor={`images-${item.key}`}>
                    Ảnh sản phẩm kiện {index + 1}
                  </FieldLabel>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (isUploading || item.imageUrls.length >= MAX_IMAGES_PER_ITEM) return;
                      document.getElementById(`images-${item.key}`)?.click();
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      if (isUploading || item.imageUrls.length >= MAX_IMAGES_PER_ITEM) return;
                      document.getElementById(`images-${item.key}`)?.click();
                    }}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (!isUploading && item.imageUrls.length < MAX_IMAGES_PER_ITEM) {
                        setDragOverItemKey(item.key);
                      }
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (event.currentTarget.contains(event.relatedTarget)) return;
                      setDragOverItemKey((current) => (current === item.key ? "" : current));
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setDragOverItemKey("");
                      if (isUploading || item.imageUrls.length >= MAX_IMAGES_PER_ITEM) return;
                      void handleUploadImages(item.key, event.dataTransfer.files);
                    }}
                    className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center cursor-pointer transition-colors ${
                      isUploading ? "opacity-60 pointer-events-none " : ""
                    }${
                      dragOverItemKey === item.key
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border-muted bg-surface hover:bg-surface-elevated"
                    }`}
                  >
                    <Icon
                      icon={
                        isUploading
                          ? "lucide:loader-2"
                          : dragOverItemKey === item.key
                            ? "lucide:download"
                            : "lucide:image-plus"
                      }
                      className={`w-6 h-6 ${
                        dragOverItemKey === item.key ? "text-primary" : "text-muted"
                      } ${isUploading ? "animate-spin" : ""}`}
                    />
                    <span className="text-sm font-semibold text-ink">
                      {isUploading
                        ? "Đang tải ảnh..."
                        : dragOverItemKey === item.key
                          ? "Thả ảnh vào đây"
                          : "Kéo ảnh vào đây hoặc bấm để chọn"}
                    </span>
                    <span className="text-xs text-muted">
                      JPG, PNG, WEBP — tối đa 5MB/ảnh — tối đa {MAX_IMAGES_PER_ITEM} ảnh/kiện
                    </span>
                    <span className="text-xs font-medium text-muted">
                      {item.imageUrls.length}/{MAX_IMAGES_PER_ITEM} ảnh
                    </span>
                  </div>
                  <input
                    id={`images-${item.key}`}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                    multiple
                    className="sr-only"
                    disabled={isUploading || item.imageUrls.length >= MAX_IMAGES_PER_ITEM}
                    onChange={(event) => {
                      void handleUploadImages(item.key, event.target.files);
                      event.target.value = "";
                    }}
                  />
                  {item.imageUrls.length ? (
                    <ul className="flex flex-wrap gap-3 pt-1">
                      {item.imageUrls.map((url) => (
                        <li key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(item.key, {
                                imageUrls: item.imageUrls.filter((entry) => entry !== url),
                              })
                            }
                            className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white"
                            aria-label="Xóa ảnh"
                          >
                            <Icon icon="lucide:x" className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </section>
          );
        })}

        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-lg border border-border-muted text-sm font-bold text-ink hover:bg-surface"
        >
          <Icon icon="lucide:plus" className="w-4 h-4" />
          Thêm kiện hàng mới
        </button>

        <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
          <h2 className="text-lg font-bold text-ink">
            Ghi chú chung cho đơn ký gửi &amp; lựa chọn dịch vụ
          </h2>

          {boxPricingRules.length ? (
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-ink">Chọn loại dịch vụ</legend>
              <p className="text-xs text-muted">Dịch vụ áp dụng cho toàn bộ đơn — không bắt buộc</p>
              <div className="grid gap-2">
                {boxPricingRules.map((rule) => {
                  const checked =
                    rule.isRequired || selectedPricingRuleIds.includes(rule.id);
                  return (
                    <label
                      key={rule.id}
                      className="flex items-start gap-3 rounded-lg border border-border-muted bg-surface px-4 py-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={rule.isRequired}
                        onChange={(event) =>
                          setSelectedPricingRuleIds((current) =>
                            event.target.checked
                              ? [...new Set([...current, rule.id])]
                              : current.filter((id) => id !== rule.id)
                          )
                        }
                        className="mt-0.5 h-4 w-4 accent-primary"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink">
                          {rule.name}
                          {rule.isRequired ? " (bắt buộc)" : ""}
                        </span>
                        <span className="block text-xs text-muted mt-0.5">
                          {[rule.description, formatFeeAmount(rule)].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : (
            <p className="text-sm text-muted">Không có dịch vụ phụ cho tuyến này.</p>
          )}

          <div className="space-y-2">
            <FieldLabel htmlFor="notes">Ghi chú đơn hàng</FieldLabel>
            <textarea
              id="notes"
              rows={3}
              maxLength={1000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm input-focus-ring resize-y"
            />
            <p className="text-xs text-muted text-right">{notes.length}/1000 ký tự</p>
          </div>

          <p className="text-xs text-muted rounded-lg border border-border-muted bg-surface px-4 py-3">
            Lưu ý: Đơn hàng sẽ được nhân viên kiểm tra và xác nhận lại thông tin trước khi xử lý
            (trạng thái chờ báo giá).
          </p>
        </section>

        {(isValidating || validationWarnings.length > 0) && (
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
                  {warning.productName ? ` — ${warning.productName}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}

        {submitError ? (
          <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {submitError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || hasBannedItem || !routeOptions.length || Boolean(uploadingItemKey)}
          className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <Icon icon="lucide:check" className="w-4 h-4" />
              Xác nhận yêu cầu ký gửi
            </>
          )}
        </button>
      </form>
    </div>
  );
}
