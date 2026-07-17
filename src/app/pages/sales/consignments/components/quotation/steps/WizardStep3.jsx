"use client";

import * as pricingService from "@/utils/internationalWarehousePricingService";
import styles from "@/app/pages/sales/consignments/components/ConsignmentQuotationWizard.module.scss";

const { formatMoney } = pricingService;

export default function WizardStep3({
  selectedCustomer,
  selectedWarehouse,
  productName,
  totals,
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Xác nhận gửi báo giá</h2>
      <dl className={styles.confirmGrid}>
        <div>
          <dt className={styles.summaryLabel}>Khách hàng</dt>
          <dd className={styles.summaryValue}>{selectedCustomer?.fullName}</dd>
        </div>
        <div>
          <dt className={styles.summaryLabel}>Kho</dt>
          <dd className={styles.summaryValue}>
            {selectedWarehouse?.flag} {selectedWarehouse?.name}
          </dd>
        </div>
        <div>
          <dt className={styles.summaryLabel}>Hàng hóa</dt>
          <dd className={styles.summaryValue}>{productName}</dd>
        </div>
        <div>
          <dt className={styles.summaryLabel}>Tổng báo giá</dt>
          <dd className={styles.confirmTotal}>{formatMoney(totals.total)}</dd>
        </div>
      </dl>
      <p className={styles.confirmHint}>
        Hệ thống sẽ ghi nhận yêu cầu ký gửi và gửi báo giá cho khách. Sau khi khách duyệt, Sales tạo
        phiếu nhập kho.
      </p>
    </section>
  );
}
