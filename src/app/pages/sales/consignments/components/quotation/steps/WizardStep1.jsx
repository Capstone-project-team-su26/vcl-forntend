"use client";

import { Icon } from "@iconify/react";
import { ITEM_VALIDATION_LABELS } from "@/utils/orderConsignmentService";
import QuotationFieldLabel from "@/app/pages/sales/consignments/components/quotation/QuotationFieldLabel";
import CustomerInfoRow from "@/app/pages/sales/consignments/components/quotation/steps/CustomerInfoRow";
import styles from "@/app/pages/sales/consignments/components/ConsignmentQuotationWizard.module.scss";
import stepStyles from "./WizardStep1.module.scss";

const VALIDATION_CLASS = {
  BANNED: stepStyles.validationBanned,
  RESTRICTED: stepStyles.validationRestricted,
  CONDITIONAL: stepStyles.validationConditional,
};

export default function WizardStep1({
  selectedCustomer,
  handleClearCustomer,
  customerSearch,
  setCustomerSearch,
  customerSearchError,
  customerResults,
  isSearchingCustomers,
  handleSelectCustomer,
  productName,
  setProductName,
  resetSuccessState,
  productType,
  setProductType,
  declaredValue,
  setDeclaredValue,
  warehouses,
  warehouseId,
  setWarehouseId,
  weightKg,
  setWeightKg,
  volumeCm3,
  setVolumeCm3,
  packageCount,
  setPackageCount,
  isValidating,
  validationWarnings,
}) {
  return (
    <div className={styles.stepContent}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Khách hàng</h2>
        {selectedCustomer ? (
          <div className={styles.customerCard}>
            <div className={styles.customerHeader}>
              <div>
                <p className={styles.customerName}>{selectedCustomer.fullName}</p>
                <p className={styles.customerId}>Mã: {selectedCustomer.id}</p>
              </div>
              <button type="button" onClick={handleClearCustomer} className={styles.changeBtn}>
                Đổi khách
              </button>
            </div>
            <dl className={styles.infoList}>
              <CustomerInfoRow label="Email" value={selectedCustomer.email} />
              <CustomerInfoRow label="Điện thoại" value={selectedCustomer.phone} />
            </dl>
          </div>
        ) : (
          <div className={styles.fieldStack}>
            <QuotationFieldLabel htmlFor="customerSearch">Tìm kiếm khách hàng</QuotationFieldLabel>
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
                    <li key={customer.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectCustomer(customer)}
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
        <h2 className={styles.sectionTitle}>Hàng hóa &amp; kho quốc tế</h2>
        <div className={styles.grid}>
          <div className={`${styles.fieldStack} ${styles.fieldStackWide}`}>
            <QuotationFieldLabel htmlFor="productName" required>
              Hàng hóa
            </QuotationFieldLabel>
            <input
              id="productName"
              value={productName}
              onChange={(event) => {
                setProductName(event.target.value);
                resetSuccessState();
              }}
              placeholder="VD: Loa Bluetooth JBL Charge 5"
              className={`${styles.input} input-focus-ring`}
            />
          </div>
          <div className={styles.infoList}>
            <QuotationFieldLabel htmlFor="productType">Loại hàng</QuotationFieldLabel>
            <input
              id="productType"
              value={productType}
              onChange={(event) => setProductType(event.target.value)}
              placeholder="VD: Điện tử"
              className={`${styles.input} input-focus-ring`}
            />
          </div>
          <div className={styles.infoList}>
            <QuotationFieldLabel htmlFor="declaredValue">Giá trị khai báo (VND)</QuotationFieldLabel>
            <input
              id="declaredValue"
              type="number"
              min="0"
              step="0.01"
              value={declaredValue}
              onChange={(event) => setDeclaredValue(event.target.value)}
              className={`${styles.input} input-focus-ring`}
            />
          </div>
          <div className={`${styles.fieldStack} ${styles.fieldStackWide}`}>
            <QuotationFieldLabel required>Kho quốc tế</QuotationFieldLabel>
            <div className={styles.warehouseGrid}>
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
                    className={`${styles.warehouseBtn} ${isSelected ? styles.selected : ""}`}
                  >
                    <span className={styles.warehouseFlag}>{warehouse.flag}</span>
                    <span className={styles.warehouseName}>{warehouse.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className={styles.infoList}>
            <QuotationFieldLabel htmlFor="weightKg" required>
              Khối lượng (kg)
            </QuotationFieldLabel>
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
              className={`${styles.input} input-focus-ring`}
            />
          </div>
          <div className={styles.infoList}>
            <QuotationFieldLabel htmlFor="volumeCm3" required>
              Thể tích (cm³)
            </QuotationFieldLabel>
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
              className={`${styles.input} input-focus-ring`}
            />
          </div>
          <div className={styles.infoList}>
            <QuotationFieldLabel htmlFor="packageCount" required>
              Số kiện
            </QuotationFieldLabel>
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
              className={`${styles.input} input-focus-ring`}
            />
          </div>
        </div>

        {(isValidating || validationWarnings.length > 0) && productName.trim() ? (
          <div className={styles.infoList}>
            {validationWarnings.map((warning) => (
              <div
                key={`${warning.productName}-${warning.restrictionType}`}
                className={`${stepStyles.validationBox} ${
                  VALIDATION_CLASS[warning.restrictionType] ?? stepStyles.validationDefault
                }`}
              >
                <p className={stepStyles.validationTitle}>
                  {ITEM_VALIDATION_LABELS[warning.restrictionType] || warning.restrictionType}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
