import { Icon } from "@iconify/react";
import Link from "next/link";
import { isDraftConsignmentQuotation } from "@/utils/consignmentQuotationService";
import { ROUTES } from "@/utils/appRoutes";
import styles from "./NextStepCard.module.scss";

export default function NextStepCard({ detail, canSendQuotation }) {
  if (!canSendQuotation) return null;

  const isRejected = detail.status === "QUOTATION_REJECTED";
  const hasDraft = detail.quotation && isDraftConsignmentQuotation(detail.quotation);

  const title = isRejected
    ? "Gửi báo giá mới"
    : hasDraft
      ? "Kiểm tra và gửi báo giá"
      : "Lập báo giá cho khách";

  const description = isRejected
    ? "Khách đã từ chối báo giá trước đó. Bạn cần rà soát lại phí và gửi báo giá mới."
    : hasDraft
      ? "Hệ thống đã tạo báo giá tạm tính. Bạn cần kiểm tra phí, điều chỉnh nếu cần và gửi cho khách."
      : "Yêu cầu mới cần được tư vấn. Bạn cần lập báo giá và gửi cho khách xác nhận.";

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <div className={styles.iconWrap}>
          <Icon icon="lucide:clipboard-check" className={styles.icon} />
        </div>
        <div className={styles.text}>
          <p className={styles.eyebrow}>Việc cần làm</p>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>
      </div>
      <Link href={ROUTES.sales.consignmentQuotation(detail.id)} className={styles.action}>
        <Icon icon="lucide:calculator" className={styles.actionIcon} />
        {isRejected ? "Gửi báo giá mới" : "Tư vấn & báo giá"}
      </Link>
    </div>
  );
}
