"use client";

import { Icon } from "@iconify/react";
import VndMoneyInput from "@/app/components/VndMoneyInput";
import QuotationFieldLabel from "@/app/pages/sales/consignments/components/quotation/QuotationFieldLabel";
import styles from "@/app/pages/sales/consignments/components/ConsignmentQuotationPanel.module.scss";

export default function QuotationSalesNoteSection({
  detail,
  salesNote,
  canSend,
  setSalesNote,
  resetSubmitState,
}) {
  return (
    <section className={styles.section}>
      <QuotationFieldLabel htmlFor="salesNote" required>
        Ghi chú tư vấn
      </QuotationFieldLabel>
      {detail?.notes && detail.notes !== salesNote ? (
        <p className={styles.hintXs}>
          Ghi chú từ đơn hàng: <span className={styles.summaryValue}>{detail.notes}</span>
        </p>
      ) : null}
      <textarea
        id="salesNote"
        rows={3}
        value={salesNote}
        readOnly={!canSend}
        onChange={(e) => {
          setSalesNote(e.target.value);
          resetSubmitState();
        }}
        placeholder="Nội dung gửi kèm báo giá cho khách..."
        className={`${styles.textarea} input-focus-ring ${styles.readOnlyField}`}
      />
    </section>
  );
}
