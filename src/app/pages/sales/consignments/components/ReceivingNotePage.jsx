"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CONSIGNMENT_TYPE_LABELS,
  formatConsignmentDate,
} from "@/utils/orderConsignmentService";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";
import * as receivingNoteService from "@/utils/warehouseReceivingNoteService";
import styles from "./ReceivingNotePage.module.scss";

function DetailRow({ label, value }) {
  return (
    <div className={styles.detailRow}>
      <dt className={styles.detailLabel}>{label}</dt>
      <dd className={styles.detailValue}>{value}</dd>
    </div>
  );
}

export default function ReceivingNotePage({ consignmentId }) {
  const [pageData, setPageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdNoteCode, setCreatedNoteCode] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [warehouseNote, setWarehouseNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!consignmentId) return;

    let active = true;

    async function load() {
      setIsLoading(true);
      setLoadError("");
      setSubmitError("");
      setSuccessMessage("");
      setCreatedNoteCode("");

      try {
        const data = await receivingNoteService.getReceivingNotePageData(consignmentId);
        if (active) {
          setPageData(data);
          if (data.warehouses?.length === 1) {
            setWarehouseId(data.warehouses[0].id);
          }
        }
      } catch (err) {
        if (active) setLoadError(getErrorMessage(err));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [consignmentId]);

  const receivingNote = pageData?.receivingNote;

  async function handleCreate() {
    if (!pageData?.canCreate || isSubmitting) return;

    if (!warehouseId) {
      setSubmitError("Vui lòng chọn kho tiếp nhận.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");
    setCreatedNoteCode("");

    try {
      const response = await receivingNoteService.createReceivingNote({
        consignmentOrderId: consignmentId,
        warehouseId,
        warehouseNote,
      });

      const note = response.receivingNote;
      setSuccessMessage(
        response.message ||
          "Gửi phiếu tiếp nhận kho thành công. Kho nhận thông tin online trên hệ thống."
      );
      setCreatedNoteCode(note?.receivingNoteCode ?? "");
      setPageData((current) =>
        current
          ? {
              ...current,
              receivingNote: note,
              canCreate: false,
            }
          : current
      );
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const consignment = pageData?.consignment;
  const warehouses = pageData?.warehouses ?? [];
  const expectedItems = consignment
    ? receivingNoteService.getExpectedItems(consignment)
    : [];
  const expectedQuantity = consignment
    ? receivingNoteService.getExpectedTotalQuantity(consignment)
    : 0;
  const expectedPackages = consignment
    ? receivingNoteService.getExpectedPackageCount(consignment)
    : 0;
  const consignmentCode =
    consignment?.consignmentCode || consignment?.id?.slice(0, 8) || "—";
  const shippingCode = consignment?.trackingCode || consignment?.consignmentCode || "—";
  const noteStatusLabel =
    receivingNoteService.RECEIVING_NOTE_STATUS_LABELS[receivingNote?.status] ||
    receivingNote?.status ||
    "—";

  return (
    <div className={styles.root}>
      <Link href={ROUTES.sales.consignment(consignmentId)} className={styles.backLink}>
        <Icon icon="lucide:arrow-left" className={styles.iconSm} />
        Quay lại chi tiết ký gửi
      </Link>

      <div>
        <h1 className={styles.title}>Phiếu tiếp nhận kho</h1>
        <p className={styles.subtitle}>
          Gửi phiếu tiếp nhận trực tiếp trên hệ thống. Kho xử lý online — không cần in bản cứng
          hay quy trình offline.
        </p>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <Icon icon="lucide:loader-2" className={`${styles.iconMd} ${styles.spin}`} />
          <span className={styles.detailValue}>Đang tải thông tin...</span>
        </div>
      ) : loadError ? (
        <div className={styles.alertDanger}>{loadError}</div>
      ) : consignment ? (
        <>
          {successMessage ? (
            <div className={styles.alertSuccess}>
              <p className={styles.noteSentTitle}>{successMessage}</p>
              {createdNoteCode ? (
                <p className={styles.noteSentText}>
                  Mã phiếu tiếp nhận:{" "}
                  <span className={styles.noteSentHighlight}>{createdNoteCode}</span>
                </p>
              ) : null}
              <p className={styles.alertSuccessSub}>
                Kho có thể tra cứu và xử lý phiếu ngay trên app / web ops.
              </p>
            </div>
          ) : null}

          {submitError ? <div className={styles.alertDanger}>{submitError}</div> : null}

          <div className={styles.card}>
            <section>
              <h2 className={styles.sectionTitle}>Yêu cầu ký gửi</h2>
              <dl>
                <DetailRow label="Mã yêu cầu" value={consignmentCode} />
                <DetailRow
                  label="Người gửi"
                  value={consignment.senderName || consignment.customerName || "—"}
                />
                <DetailRow label="SĐT người gửi" value={consignment.senderPhone || "—"} />
                <DetailRow label="Người nhận" value={consignment.receiverName || "—"} />
                <DetailRow label="SĐT người nhận" value={consignment.receiverPhone || "—"} />
                <DetailRow label="Địa chỉ nhận" value={consignment.receiverAddress || "—"} />
                <DetailRow
                  label="Loại ký gửi"
                  value={
                    CONSIGNMENT_TYPE_LABELS[consignment.consignmentType] ||
                    consignment.consignmentType
                  }
                />
                <DetailRow label="Ngày tạo" value={formatConsignmentDate(consignment.createdAt)} />
                {expectedPackages > 0 ? (
                  <DetailRow label="Số kiện" value={String(expectedPackages)} />
                ) : null}
                <DetailRow
                  label="Mã gửi hàng"
                  value={shippingCode !== "—" ? shippingCode : "Chưa có"}
                />
              </dl>
            </section>

            <section>
              <h2 className={styles.sectionTitle}>Hàng dự kiến nhận</h2>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr className={styles.tableHead}>
                      <th>Sản phẩm</th>
                      <th className={styles.textRight}>Số lượng dự kiến</th>
                    </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                    {expectedItems.length === 0 ? (
                      <tr>
                        <td colSpan={2} className={styles.tableEmpty}>
                          Chưa có danh sách hàng chi tiết.
                        </td>
                      </tr>
                    ) : (
                      expectedItems.map((item, index) => (
                        <tr key={`${item.productName}-${index}`}>
                          <td>{item.productName}</td>
                          <td className={styles.textRight}>{item.quantity}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className={styles.tableFoot}>
                      <td>Tổng số kiện dự kiến</td>
                      <td className={styles.textRight}>{expectedQuantity}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            {receivingNote ? (
              <section className={styles.noteSent}>
                <h2 className={styles.noteSentTitle}>Phiếu tiếp nhận đã gửi</h2>
                <p className={styles.noteSentText}>
                  Mã phiếu:{" "}
                  <span className={styles.noteSentHighlight}>
                    {receivingNote.receivingNoteCode}
                  </span>
                </p>
                <p className={styles.noteSentText}>
                  Kho tiếp nhận:{" "}
                  <span>{receivingNote.warehouseName || "—"}</span>
                </p>
                <p className={styles.noteSentText}>
                  Trạng thái: <span>{noteStatusLabel}</span>
                </p>
                {receivingNote.warehouseNote ? (
                  <p className={styles.noteSentMuted}>Ghi chú: {receivingNote.warehouseNote}</p>
                ) : null}
              </section>
            ) : null}

            {consignment.status !== "APPROVED" ? (
              <div className={styles.alertWarning}>
                Chỉ gửi phiếu tiếp nhận kho khi yêu cầu ký gửi đã được duyệt (APPROVED).
              </div>
            ) : null}

            {pageData.canCreate ? (
              <section className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Gửi phiếu tiếp nhận</h2>
                <p className={styles.subtitle}>
                  Phiếu sẽ được đồng bộ online tới kho đã chọn. Nhân viên kho xử lý trực tiếp trên
                  hệ thống.
                </p>

                <div className={styles.fieldStack}>
                  <label htmlFor="warehouseId" className={styles.fieldLabel}>
                    Kho tiếp nhận <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="warehouseId"
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    disabled={isSubmitting}
                    className={`${styles.select} form-select input-focus-ring`}
                  >
                    <option value="">— Chọn kho tiếp nhận —</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                        {warehouse.code ? ` (${warehouse.code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldStack}>
                  <label htmlFor="warehouseNote" className={styles.fieldLabel}>
                    Ghi chú cho kho
                  </label>
                  <textarea
                    id="warehouseNote"
                    value={warehouseNote}
                    onChange={(e) => setWarehouseNote(e.target.value)}
                    rows={3}
                    disabled={isSubmitting}
                    placeholder="Ví dụ: Hàng dễ vỡ, cần kiểm tra seal trước khi nhập kho..."
                    className={`${styles.textarea} input-focus-ring`}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isSubmitting}
                  className={styles.submitBtn}
                >
                  {isSubmitting ? (
                    <Icon icon="lucide:loader-2" className={`${styles.iconSm} ${styles.spin}`} />
                  ) : (
                    <Icon icon="lucide:send" className={styles.iconSm} />
                  )}
                  {isSubmitting ? "Đang gửi phiếu..." : "Gửi phiếu tiếp nhận kho"}
                </button>
              </section>
            ) : consignment.status === "APPROVED" && receivingNote ? (
              <div className={styles.infoMuted}>
                Yêu cầu đã có phiếu tiếp nhận kho đang hiệu lực — không thể gửi trùng.
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
