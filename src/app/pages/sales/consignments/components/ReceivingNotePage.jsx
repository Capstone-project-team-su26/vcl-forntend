"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CONSIGNMENT_TYPE_LABELS,
  formatConsignmentDate,
} from "@/modules/consignments";
import { useToast } from "@/app/components/ToastProvider";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";
import * as receivingNoteService from "@/modules/consignments";

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-50 last:border-0">
      <dt className="text-sm font-bold text-muted sm:w-44 shrink-0">{label}</dt>
      <dd className="text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export default function ReceivingNotePage({ consignmentId }) {
  const toast = useToast();
  const [pageData, setPageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
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
      toast.error("Vui lòng chọn kho tiếp nhận.");
      return;
    }

    setIsSubmitting(true);
    setCreatedNoteCode("");

    try {
      const response = await receivingNoteService.createReceivingNote({
        consignmentOrderId: consignmentId,
        warehouseId,
        warehouseNote,
      });

      const note = response.receivingNote;
      const message =
        response.message ||
        "Gửi phiếu tiếp nhận kho thành công. Kho nhận thông tin online trên hệ thống.";
      setCreatedNoteCode(note?.receivingNoteCode ?? "");
      toast.success(
        note?.receivingNoteCode
          ? `${message} Mã phiếu: ${note.receivingNoteCode}`
          : message
      );
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
      toast.error(getErrorMessage(err));
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
    <div className="space-y-6">
      <Link
        href={ROUTES.sales.consignment(consignmentId)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-primary"
      >
        <Icon icon="lucide:arrow-left" className="w-4 h-4" />
        Quay lại chi tiết ký gửi
      </Link>

      <div>
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight font-['Oswald'] text-ink">
          Phiếu tiếp nhận kho
        </h1>
        <p className="text-muted text-sm mt-2 max-w-xl">
          Thông báo kho đích chờ nhận hàng. Phiếu chưa ghi tồn kho — kho check-in / put-away trên
          hệ thống riêng.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted gap-2">
          <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Đang tải thông tin...</span>
        </div>
      ) : loadError ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {loadError}
        </div>
      ) : consignment ? (
        <>
          {createdNoteCode ? (
            <div className="rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text">
              <p className="font-semibold">Phiếu tiếp nhận đã gửi.</p>
              <p className="mt-1">
                Mã phiếu tiếp nhận:{" "}
                <span className="font-bold text-ink">{createdNoteCode}</span>
              </p>
              <p className="mt-2 text-success-text/90">
                Kho có thể tra cứu và xử lý phiếu ngay trên app / web ops.
              </p>
            </div>
          ) : null}

          <div className="bg-white rounded-xl shadow-[0px_2px_4px_0px_#00000012] p-6 border border-surface-muted/50 space-y-6">
            <section>
              <h2 className="text-lg font-extrabold font-['Oswald'] mb-2">Yêu cầu ký gửi</h2>
              <dl>
                <DetailRow label="Mã yêu cầu" value={consignmentCode} />
                <DetailRow
                  label="Người gửi"
                  value={consignment.senderName || consignment.customerName || "—"}
                />
                <DetailRow
                  label="SĐT người gửi"
                  value={consignment.senderPhone || "—"}
                />
                <DetailRow
                  label="Người nhận"
                  value={consignment.receiverName || "—"}
                />
                <DetailRow
                  label="SĐT người nhận"
                  value={consignment.receiverPhone || "—"}
                />
                <DetailRow
                  label="Địa chỉ nhận"
                  value={consignment.receiverAddress || "—"}
                />
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
              <h2 className="text-lg font-extrabold font-['Oswald'] mb-3">Hàng dự kiến nhận</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-muted text-sm font-bold">
                      <th className="px-4 py-3">Sản phẩm</th>
                      <th className="px-4 py-3 text-right">Số lượng dự kiến</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-muted text-sm">
                    {expectedItems.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-4 py-6 text-center text-muted">
                          Chưa có danh sách hàng chi tiết.
                        </td>
                      </tr>
                    ) : (
                      expectedItems.map((item, index) => (
                        <tr key={`${item.productName}-${index}`}>
                          <td className="px-4 py-3 font-medium">{item.productName}</td>
                          <td className="px-4 py-3 text-right">{item.quantity}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border-muted bg-surface-soft">
                      <td className="px-4 py-3 text-sm font-bold">Tổng số kiện dự kiến</td>
                      <td className="px-4 py-3 text-right text-sm font-bold">
                        {expectedQuantity}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            {receivingNote ? (
              <section className="rounded-lg border border-info-bg bg-info-bg/30 px-4 py-4 space-y-2">
                <h2 className="text-sm font-bold text-ink">Phiếu tiếp nhận đã gửi</h2>
                <p className="text-sm">
                  Mã phiếu:{" "}
                  <span className="font-bold text-secondary">
                    {receivingNote.receivingNoteCode}
                  </span>
                </p>
                <p className="text-sm">
                  Kho tiếp nhận:{" "}
                  <span className="font-medium">{receivingNote.warehouseName || "—"}</span>
                </p>
                <p className="text-sm">
                  Trạng thái: <span className="font-medium">{noteStatusLabel}</span>
                </p>
                {receivingNote.warehouseNote ? (
                  <p className="text-sm text-muted">Ghi chú: {receivingNote.warehouseNote}</p>
                ) : null}
              </section>
            ) : null}

            {consignment.status !== "APPROVED" ? (
              <div className="rounded-lg border border-warning-bg bg-warning-bg/40 px-4 py-3 text-sm text-ink">
                Chỉ gửi phiếu tiếp nhận kho khi yêu cầu ký gửi đã được duyệt (APPROVED).
              </div>
            ) : null}

            {pageData.canCreate ? (
              <section className="space-y-4 pt-2 border-t border-surface-muted">
                <h2 className="text-lg font-extrabold font-['Oswald']">Gửi phiếu tiếp nhận</h2>
                <p className="text-sm text-muted">
                  Chỉ chọn kho đích (Destination). Phiếu đồng bộ online — kho check-in và xếp vị trí
                  sau khi hàng về.
                </p>

                {!warehouses.length ? (
                  <div className="rounded-lg border border-warning-bg bg-warning-bg/40 px-4 py-3 text-sm text-ink">
                    Chưa có kho đích đang hoạt động. Nhờ Admin tạo kho loại Destination trước khi gửi
                    phiếu.
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label htmlFor="warehouseId" className="text-sm font-bold text-ink">
                    Kho đích tiếp nhận <span className="text-danger">*</span>
                  </label>
                  <select
                    id="warehouseId"
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    disabled={isSubmitting || !warehouses.length}
                    className="w-full h-11 px-4 rounded-lg border border-border-muted bg-surface-elevated text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                  >
                    <option value="">— Chọn kho đích —</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                        {warehouse.code ? ` (${warehouse.code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="warehouseNote" className="text-sm font-bold text-ink">
                    Ghi chú cho kho
                  </label>
                  <textarea
                    id="warehouseNote"
                    value={warehouseNote}
                    onChange={(e) => setWarehouseNote(e.target.value)}
                    rows={3}
                    disabled={isSubmitting}
                    placeholder="Ví dụ: Hàng dễ vỡ, cần kiểm tra seal trước khi nhập kho..."
                    className="w-full px-4 py-3 rounded-lg border border-border-muted text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={isSubmitting || !warehouses.length}
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  {isSubmitting ? (
                    <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon icon="lucide:send" className="w-4 h-4" />
                  )}
                  {isSubmitting ? "Đang gửi phiếu..." : "Gửi phiếu tiếp nhận kho"}
                </button>
              </section>
            ) : consignment.status === "APPROVED" && receivingNote ? (
              <div className="rounded-lg border border-surface-muted bg-surface px-4 py-3 text-sm text-muted">
                Yêu cầu đã có phiếu tiếp nhận kho đang hiệu lực — không thể gửi trùng.
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
