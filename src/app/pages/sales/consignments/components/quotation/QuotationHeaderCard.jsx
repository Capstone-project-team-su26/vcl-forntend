"use client";

import ConsignmentStatusBadge from "@/app/pages/sales/consignments/components/ConsignmentStatusBadge";
import styles from "@/app/pages/sales/consignments/components/ConsignmentQuotationPanel.module.scss";

export default function QuotationHeaderCard({ detail, displayCode, formatConsignmentDate }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <p className={styles.eyebrowMuted}>Mã ký gửi</p>
          {displayCode ? <p className={styles.code}>{displayCode}</p> : null}
          <div className={`${styles.partyGrid} ${displayCode ? styles.withCode : ""}`}>
            <div className={styles.partyBox}>
              <p className={styles.partyLabel}>Người gửi</p>
              <p className={styles.partyName}>{detail.senderName || detail.customerName || "—"}</p>
            </div>
            <div className={styles.partyBox}>
              <p className={styles.partyLabel}>Người nhận</p>
              <p className={styles.partyName}>{detail.receiverName || "—"}</p>
            </div>
          </div>
          <p className={styles.dateText}>{formatConsignmentDate(detail.createdAt)}</p>
        </div>
        <ConsignmentStatusBadge status={detail.status} />
      </div>
    </div>
  );
}
