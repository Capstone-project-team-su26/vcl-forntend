"use client";
import styles from "./PricingRuleFormModal.module.scss";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import * as carrierService from "@/utils/carrierService";
import * as servicePricingService from "@/utils/servicePricingService";
import * as warehouseService from "@/utils/warehouseService";
import { getErrorMessage } from "@/utils/apiError";
import VndMoneyInput from "@/app/components/VndMoneyInput";
import { extractGuid } from "@/utils/apiMappers";

const { SERVICE_TYPE_LABELS, UNIT_TYPE_LABELS, listWarehouseCountryCodes } = servicePricingService;

const serviceTypeOptions = Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const unitTypeOptions = Object.entries(UNIT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function pickDefaultCountry(options, preferred) {
  if (preferred && options.includes(preferred)) return preferred;
  return options[0] ?? "";
}

/** API cần carrierId = UUID; item cũ có thể lưu code. */
function resolveCarrierId(carriers, preferred) {
  if (!carriers?.length) return "";
  if (!preferred) return carriers[0].id;

  const byId = carriers.find((entry) => entry.id === preferred);
  if (byId) return byId.id;

  const byCode = carriers.find((entry) => entry.code === preferred);
  if (byCode) return byCode.id;

  const guid = String(preferred).match(
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
  );
  if (guid) {
    const byGuid = carriers.find(
      (entry) => String(entry.id).toLowerCase() === guid[0].toLowerCase()
    );
    if (byGuid) return byGuid.id;
  }

  return carriers[0].id;
}

export default function ServicePricingFormModal({ open, mode, item, onClose, onSaved }) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unitType, setUnitType] = useState(item?.unitType ?? "KG");
  const [price, setPrice] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [pricePerCbm, setPricePerCbm] = useState("");
  const [carriers, setCarriers] = useState([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState(item?.carrierId ?? "");
  const [warehouses, setWarehouses] = useState([]);
  const [originCountry, setOriginCountry] = useState(item?.originCountry ?? "");
  const [destinationCountry, setDestinationCountry] = useState(item?.destinationCountry ?? "");

  useEffect(() => {
    if (open) {
      setUnitType(item?.unitType ?? "KG");
      setPrice(item?.price != null ? String(item.price) : "");
      setPricePerKg(
        item?.pricePerKg != null
          ? String(item.pricePerKg)
          : item?.price != null
            ? String(item.price)
            : ""
      );
      setPricePerCbm(item?.pricePerCbm != null ? String(item.pricePerCbm) : "");
      setSelectedCarrierId(item?.carrierId ?? "");
      setOriginCountry(item?.originCountry ?? "");
      setDestinationCountry(item?.destinationCountry ?? "");
    }
  }, [open, item]);

  useEffect(() => {
    if (!open) return;

    let active = true;

    async function loadLookups() {
      try {
        const [carrierData, warehouseData] = await Promise.all([
          carrierService.listCarriers({ activeOnly: true }),
          warehouseService.listWarehouses({ isActive: true }),
        ]);
        if (!active) return;

        setCarriers(carrierData);
        setSelectedCarrierId((current) =>
          resolveCarrierId(carrierData, current || item?.carrierId)
        );

        setWarehouses(warehouseData);

        const origins = listWarehouseCountryCodes(warehouseData, {
          warehouseType: "Origin",
          include: item?.originCountry,
        });
        const destinations = listWarehouseCountryCodes(warehouseData, {
          warehouseType: "Destination",
          include: item?.destinationCountry,
        });

        setOriginCountry((current) =>
          pickDefaultCountry(origins, current || item?.originCountry || "US")
        );
        setDestinationCountry((current) =>
          pickDefaultCountry(destinations, current || item?.destinationCountry || "VN")
        );
      } catch {
        if (active) {
          setCarriers([]);
          setWarehouses([]);
        }
      }
    }

    loadLookups();
    return () => {
      active = false;
    };
  }, [open, item?.carrierId, item?.originCountry, item?.destinationCountry]);

  const originOptions = useMemo(
    () =>
      listWarehouseCountryCodes(warehouses, {
        warehouseType: "Origin",
        include: item?.originCountry,
      }),
    [warehouses, item?.originCountry]
  );
  const destinationOptions = useMemo(
    () =>
      listWarehouseCountryCodes(warehouses, {
        warehouseType: "Destination",
        include: item?.destinationCountry,
      }),
    [warehouses, item?.destinationCountry]
  );

  if (!open) return null;

  const showKg = unitType === "KG" || unitType === "KG_OR_CBM";
  const showCbm = unitType === "CBM" || unitType === "KG_OR_CBM";
  const showSinglePrice = unitType === "KG" || unitType === "CBM";
  const selectedCarrier =
    carriers.find((entry) => entry.id === selectedCarrierId) ?? null;
  const routeReady = originOptions.length > 0 && destinationOptions.length > 0;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const payload = {
      carrierId: extractGuid(selectedCarrierId) || selectedCarrierId,
      carrierName: selectedCarrier?.name ?? null,
      serviceType: form.serviceType.value,
      originCountry,
      destinationCountry,
      unitType: form.unitType.value,
      price: showSinglePrice ? price : null,
      pricePerKg: showKg ? pricePerKg : null,
      pricePerCbm: showCbm ? pricePerCbm : null,
      currency: form.currency.value,
      effectiveDate: form.effectiveDate.value
        ? new Date(form.effectiveDate.value).toISOString()
        : new Date().toISOString(),
      isActive: form.isActive.checked,
    };

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const response = await servicePricingService.createServicePricing(payload);
        onSaved(response.item, response.message || "Thêm giá dịch vụ chính thành công.");
      } else if (item) {
        const response = await servicePricingService.updateServicePricing(item.id, payload);
        onSaved(response.item, response.message || "Cập nhật giá dịch vụ chính thành công.");
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.ta73cc4}>
      <button
        type="button"
        className={styles.tf04169}
        onClick={onClose}
        aria-label="Đóng"
      />
      <div className={styles.t9905e7}>
        <div className={styles.t098018}>
          <h2 className={styles.te817d8}>
            {mode === "create" ? "Thêm giá dịch vụ chính" : "Chỉnh sửa giá dịch vụ chính"}
          </h2>
          <button type="button" onClick={onClose} className={styles.t6265d4}>
            <Icon icon="lucide:x" className={styles.ta8600f} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.tcccb28}>
          {error ? (
            <div className={styles.te12bff}>
              {error}
            </div>
          ) : null}

          <div className={styles.t4c017d}>
            <div className={styles.t3e53e3}>
              <label htmlFor="carrierId" className={styles.tae03fc}>
                Đơn vị vận chuyển <span className={styles.tf3fb31}>*</span>
              </label>
              {carriers.length === 0 ? (
                <p className={styles.ta7b499}>
                  Chưa có đơn vị vận chuyển đang hoạt động. Vui lòng cấu hình tại mục Đơn vị vận
                  chuyển.
                </p>
              ) : (
                <select
                  id="carrierId"
                  name="carrierId"
                  required
                  value={selectedCarrierId}
                  onChange={(event) => setSelectedCarrierId(event.target.value)}
                  className="form-select input-focus-ring"
                >
                  {carriers.map((carrier) => (
                    <option key={carrier.id} value={carrier.id}>
                      {carrier.code} · {carrier.name}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="hidden"
                name="carrierName"
                value={selectedCarrier?.name ?? item?.carrierName ?? ""}
              />
            </div>
            <div className={styles.t6f7e01}>
              <label htmlFor="serviceType" className={styles.tae03fc}>
                Loại dịch vụ <span className={styles.tf3fb31}>*</span>
              </label>
              <select
                id="serviceType"
                name="serviceType"
                required
                defaultValue={item?.serviceType ?? "STANDARD"}
                className="form-select input-focus-ring"
              >
                {serviceTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.t6f7e01}>
              <label htmlFor="originCountry" className={styles.tae03fc}>
                Xuất phát <span className={styles.tf3fb31}>*</span>
              </label>
              {originOptions.length === 0 ? (
                <p className={styles.ta7b499}>
                  Chưa có kho loại Origin đang hoạt động. Thêm kho xuất phát trước.
                </p>
              ) : (
                <select
                  id="originCountry"
                  name="originCountry"
                  required
                  value={originCountry}
                  onChange={(event) => setOriginCountry(event.target.value)}
                  className="form-select input-focus-ring"
                >
                  {originOptions.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className={styles.t6f7e01}>
              <label htmlFor="destinationCountry" className={styles.tae03fc}>
                Đích <span className={styles.tf3fb31}>*</span>
              </label>
              {destinationOptions.length === 0 ? (
                <p className={styles.ta7b499}>
                  Chưa có kho loại Destination đang hoạt động. Thêm kho đích trước.
                </p>
              ) : (
                <select
                  id="destinationCountry"
                  name="destinationCountry"
                  required
                  value={destinationCountry}
                  onChange={(event) => setDestinationCountry(event.target.value)}
                  className="form-select input-focus-ring"
                >
                  {destinationOptions.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className={styles.t6f7e01}>
              <label htmlFor="unitType" className={styles.tae03fc}>
                Đơn vị tính <span className={styles.tf3fb31}>*</span>
              </label>
              <select
                id="unitType"
                name="unitType"
                required
                value={unitType}
                onChange={(event) => setUnitType(event.target.value)}
                className="form-select input-focus-ring"
              >
                {unitTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.t6f7e01}>
              <label htmlFor="currency" className={styles.tae03fc}>
                Tiền tệ
              </label>
              <input
                id="currency"
                name="currency"
                defaultValue={item?.currency ?? "VND"}
                className={`${styles.t870ae3} input-focus-ring`}
              />
            </div>
            {showSinglePrice ? (
              <div className={styles.t6f7e01}>
                <label htmlFor="price" className={styles.tae03fc}>
                  Đơn giá <span className={styles.tf3fb31}>*</span>
                </label>
                <VndMoneyInput
                  id="price"
                  value={price}
                  onChange={setPrice}
                  required={showSinglePrice}
                />
              </div>
            ) : null}
            {showKg ? (
              <div className={styles.t6f7e01}>
                <label htmlFor="pricePerKg" className={styles.tae03fc}>
                  Giá/kg {unitType === "KG_OR_CBM" ? <span className={styles.tf3fb31}>*</span> : null}
                </label>
                <VndMoneyInput
                  id="pricePerKg"
                  value={pricePerKg}
                  onChange={setPricePerKg}
                  required={unitType === "KG_OR_CBM"}
                />
              </div>
            ) : null}
            {showCbm ? (
              <div className={styles.t6f7e01}>
                <label htmlFor="pricePerCbm" className={styles.tae03fc}>
                  Giá/cm³ {unitType === "KG_OR_CBM" ? <span className={styles.tf3fb31}>*</span> : null}
                </label>
                <VndMoneyInput
                  id="pricePerCbm"
                  value={pricePerCbm}
                  onChange={setPricePerCbm}
                  required={unitType === "KG_OR_CBM"}
                />
              </div>
            ) : null}
            <div className={styles.t6f7e01}>
              <label htmlFor="effectiveDate" className={styles.tae03fc}>
                Ngày hiệu lực
              </label>
              <input
                id="effectiveDate"
                name="effectiveDate"
                type="date"
                defaultValue={
                  item?.effectiveDate
                    ? new Date(item.effectiveDate).toISOString().slice(0, 10)
                    : new Date().toISOString().slice(0, 10)
                }
                className={`${styles.t752d10} input-focus-ring`}
              />
            </div>
          </div>

          <label className={styles.tbec2b1}>
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={item?.isActive !== false}
              className={styles.tb44025}
            />
            Đang hoạt động
          </label>

          <div className={styles.tfb9b0c}>
            <button
              type="button"
              onClick={onClose}
              className={styles.tb4182f}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || carriers.length === 0 || !routeReady}
              className={styles.te3d938}
            >
              {isSubmitting ? "Đang lưu..." : mode === "create" ? "Thêm" : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
