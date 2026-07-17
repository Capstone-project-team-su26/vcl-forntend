"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";
import ConsignmentStatusBadge from "@/app/pages/sales/consignments/components/ConsignmentStatusBadge";
import * as orderConsignmentService from "@/utils/orderConsignmentService";
import { resolveConsignmentPackageCount } from "@/utils/apiMappers";
import {
  formatVolumeCm3,
  normalizeVolumeCm3FromApi,
} from "@/utils/servicePricingService";
import { ROUTES } from "@/utils/appRoutes";
import styles from "./ConsignmentCard.module.scss";

const { CONSIGNMENT_TYPE_LABELS, formatConsignmentDate, formatConsignmentDisplayCode } =
  orderConsignmentService;

async function copyText(text) {
  if (!text || typeof navigator === "undefined" || !navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function formatWeight(value) {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${n} kg`;
}

function formatVolume(item) {
  const volumeCm3 = normalizeVolumeCm3FromApi(item.totalVolume, {
    weightKg: item.totalWeight,
  });
  if (volumeCm3 == null) return "—";
  return formatVolumeCm3(volumeCm3);
}

function formatPackageCount(item) {
  const count = resolveConsignmentPackageCount({
    packageCount: item.packageCount,
    items: item.items,
    quantity: item.quantity,
  });
  return count != null ? String(count) : "—";
}

function getRouteLabel(item) {
  return item.route || item.destination || item.warehouseName || null;
}

function getTypeLabel(item) {
  return CONSIGNMENT_TYPE_LABELS[item.consignmentType] || item.consignmentType || "—";
}

export default function ConsignmentCard({ item, onOpen, detailLoading }) {
  const [copied, setCopied] = useState(false);
  const trackingCode = formatConsignmentDisplayCode(item) ?? item.consignmentCode ?? item.id ?? "—";
  const productNames = Array.isArray(item.productNames) ? item.productNames : [];
  const routeLabel = getRouteLabel(item);
  const typeLabel = getTypeLabel(item);

  async function handleCopy(event) {
    event.stopPropagation();
    const ok = await copyText(String(trackingCode));
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(item.id);
        }
      }}
      aria-label={`Xem chi tiết yêu cầu ký gửi ${trackingCode}`}
      className={styles.card}
    >
      <div className={styles.top}>
        <div className={styles.main}>
          <div className={styles.headerRow}>
            <div className={styles.codeBlock}>
              <p className={styles.codeLabel}>Mã vận đơn</p>
              <div className={styles.codeRow}>
                <strong className={styles.code}>{trackingCode}</strong>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={styles.copyBtn}
                  title="Sao chép mã vận đơn"
                  aria-label={`Sao chép mã vận đơn ${trackingCode}`}
                >
                  <Icon
                    icon={copied ? "lucide:check" : "lucide:copy"}
                    className={styles.iconSm}
                  />
                  {copied ? "Đã chép" : "Sao chép"}
                </button>
              </div>

              <div className={styles.badges}>
                <span className={styles.typeBadge}>{typeLabel}</span>
                {routeLabel ? (
                  <span className={styles.routeBadge}>Tuyến {routeLabel}</span>
                ) : null}
                <ConsignmentStatusBadge
                  status={item.status}
                  className={styles.statusCompact}
                />
              </div>
            </div>

            <Link
              href={ROUTES.sales.consignment(item.id)}
              onClick={(event) => event.stopPropagation()}
              className={styles.detailLink}
            >
              Xem chi tiết
              <Icon icon="lucide:arrow-right" className={styles.iconMd} />
            </Link>
          </div>

          <div className={styles.metaRow}>
            <span>
              Khách hàng: <strong className={styles.metaStrong}>{item.customerName || "—"}</strong>
            </span>
            <span>
              Người nhận:{" "}
              <strong className={styles.metaStrong}>
                {item.receiverName || item.customerName || "—"}
              </strong>
            </span>
            <span>
              Ngày tạo:{" "}
              <strong className={styles.metaStrong}>{formatConsignmentDate(item.createdAt)}</strong>
            </span>
            <span className={styles.metaRight}>
              KIỂM HÀNG:{" "}
              <strong
                className={item.requiresInspection ? styles.inspectionYes : styles.metaStrong}
              >
                {item.requiresInspection ? "Có" : "Không"}
              </strong>
            </span>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.products}>
          <div className={styles.productIconWrap}>
            <Icon icon="lucide:package" className={styles.productIcon} />
          </div>
          <div className={styles.productsBody}>
            <div>
              <div className={styles.productsHeader}>
                <span className={styles.productsLabel}>Sản phẩm</span>
                {productNames.length > 0 ? (
                  <span className={styles.countBadge}>
                    <Icon icon="lucide:package" className={styles.iconSm} aria-hidden />
                    {productNames.length} sản phẩm
                  </span>
                ) : detailLoading ? (
                  <span className={styles.loadingHint}>
                    <Icon icon="lucide:loader-2" className={`${styles.iconSm} ${styles.spin}`} />
                    Đang tải…
                  </span>
                ) : null}
              </div>
              {productNames.length > 0 ? (
                <ol className={styles.productList}>
                  {productNames.map((name, index) => (
                    <li key={`${item.id}-${name}-${index}`} className={styles.productItem}>
                      <span className={styles.productIndex}>{index + 1}.</span>
                      <strong className={styles.productName} title={name}>
                        {name}
                      </strong>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={styles.emptyProducts}>
                  {detailLoading ? "Đang tải sản phẩm…" : "Chưa có tên sản phẩm"}
                </p>
              )}
            </div>

            <div className={styles.trackingChip}>Mã đơn: {trackingCode}</div>

            <div className={styles.contactBlock}>
              <p>
                Số điện thoại:{" "}
                <strong className={styles.metaStrong}>
                  {item.receiverPhone || (detailLoading ? "…" : "—")}
                </strong>
              </p>
              <p>
                Địa chỉ:{" "}
                <strong className={`${styles.metaStrong} ${styles.address}`}>
                  {item.receiverAddress || (detailLoading ? "…" : "—")}
                </strong>
              </p>
            </div>
          </div>
        </div>

        <div className={styles.sidebar}>
          <ConsignmentStatusBadge status={item.status} />
          <div>
            <p className={styles.sidebarLabel}>Loại vận chuyển</p>
            <p className={styles.sidebarType}>{typeLabel}</p>
          </div>
          <div className={styles.stats}>
            <p className={styles.statRow}>
              <span>Khối lượng</span>
              <strong className={styles.metaStrong}>{formatWeight(item.totalWeight)}</strong>
            </p>
            <p className={styles.statRow}>
              <span>Số kiện</span>
              <strong className={styles.metaStrong}>{formatPackageCount(item)}</strong>
            </p>
            <p className={styles.statRow}>
              <span>Thể tích</span>
              <strong className={styles.metaStrong}>{formatVolume(item)}</strong>
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
