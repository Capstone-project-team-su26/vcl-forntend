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
import ReceivingNotePrintSheet, {
  printReceivingNote,
} from "@/app/pages/sales/consignments/components/ReceivingNotePrintSheet";

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-50 last:border-0">
      <dt className="text-sm font-bold text-muted sm:w-44 shrink-0">{label}</dt>
      <dd className="text-sm font-medium text-ink">{value}</dd>
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
  const [printAfterCreate, setPrintAfterCreate] = useState(false);

  useEffect(() => {
    if (!consignmentId) return;

    let active = true;

    async function load() {
      setIsLoading(true);
      setLoadError("");
      setSubmitError("");
      setSuccessMessage("");
      setCreatedNoteCode("");
      setPrintAfterCreate(false);

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

  useEffect(() => {
    if (!printAfterCreate || !receivingNote) return;

    const timer = window.setTimeout(() => {
      printReceivingNote();
      setPrintAfterCreate(false);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [printAfterCreate, receivingNote]);

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
          "Tạo phiếu tiếp nhận kho thành công. Hộp thoại in sẽ mở — in phiếu cho kho offline."
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
      setPrintAfterCreate(true);
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
  const consignmentCode =
    consignment?.consignmentCode || consignment?.id?.slice(0, 8) || "—";
  const shippingCode = consignment?.trackingCode || consignment?.consignmentCode || "—";
  const noteStatusLabel =
    receivingNoteService.RECEIVING_NOTE_STATUS_LABELS[receivingNote?.status] ||
    receivingNote?.status ||
    "—";

  return (
    <>
      <ReceivingNotePrintSheet
        receivingNote={receivingNote}
        consignment={consignment}
        expectedItems={expectedItems}
        expectedQuantity={expectedQuantity}
        noteStatusLabel={noteStatusLabel}
      />

      <div className="no-print space-y-6">
        <Link
          href={ROUTES.sales.consignment(consignmentId)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-primary"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          Quay lại chi tiết ký gửi
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight font-['Oswald'] text-ink">
              Phiếu tiếp nhận kho
            </h1>
            <p className="text-muted text-sm mt-2 max-w-xl">
              Tạo phiếu trên hệ thống rồi <strong className="text-ink">in bản cứng</strong> giao
              cho kho. Nhân viên kho nhận hàng offline theo phiếu, sau đó scan mã phiếu trên
              mobile khi có mạng.
            </p>
          </div>

          {receivingNote ? (
            <button
              type="button"
              onClick={printReceivingNote}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-lg border-2 border-secondary text-secondary text-sm font-bold hover:bg-secondary/5 transition-colors shrink-0"
            >
              <Icon icon="lucide:printer" className="w-4 h-4" />
              In phiếu tiếp nhận
            </button>
          ) : null}
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
            {successMessage ? (
              <div className="rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text">
                <p className="font-semibold">{successMessage}</p>
                {createdNoteCode ? (
                  <p className="mt-1">
                    Mã phiếu tiếp nhận:{" "}
                    <span className="font-bold text-ink">{createdNoteCode}</span>
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={printReceivingNote}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-secondary hover:underline"
                >
                  <Icon icon="lucide:printer" className="w-4 h-4" />
                  In lại phiếu
                </button>
              </div>
            ) : null}

            {submitError ? (
              <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
                {submitError}
              </div>
            ) : null}

            <div className="bg-white rounded-xl shadow-[0px_2px_4px_0px_#00000012] p-6 border border-surface-muted/50 space-y-6">
              <section>
                <h2 className="text-lg font-extrabold font-['Oswald'] mb-2">Yêu cầu ký gửi</h2>
                <dl>
                  <DetailRow label="Mã yêu cầu" value={consignmentCode} />
                  <DetailRow label="Tên khách hàng" value={consignment.customerName} />
                  <DetailRow
                    label="Loại ký gửi"
                    value={
                      CONSIGNMENT_TYPE_LABELS[consignment.consignmentType] ||
                      consignment.consignmentType
                    }
                  />
                  <DetailRow
                    label="Ngày tạo"
                    value={formatConsignmentDate(consignment.createdAt)}
                  />
                  <DetailRow
                    label="Mã gửi hàng"
                    value={shippingCode !== "—" ? shippingCode : "Chưa có"}
                  />
                </dl>
              </section>

              <section>
                <h2 className="text-lg font-extrabold font-['Oswald'] mb-3">
                  Hàng dự kiến nhận
                </h2>
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
                        <td className="px-4 py-3 text-sm font-bold">Tổng số lượng dự kiến</td>
                        <td className="px-4 py-3 text-right text-sm font-bold">
                          {expectedQuantity}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>

              {receivingNote ? (
                <section className="rounded-lg border border-info-bg bg-info-bg/30 px-4 py-4 space-y-3">
                  <h2 className="text-sm font-bold text-ink">Phiếu tiếp nhận hiện tại</h2>
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
                  <button
                    type="button"
                    onClick={printReceivingNote}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-secondary text-white text-sm font-bold hover:opacity-90"
                  >
                    <Icon icon="lucide:printer" className="w-4 h-4" />
                    In phiếu cho kho offline
                  </button>
                </section>
              ) : null}

              {consignment.status !== "APPROVED" ? (
                <div className="rounded-lg border border-warning-bg bg-warning-bg/40 px-4 py-3 text-sm text-ink">
                  Chỉ tạo phiếu tiếp nhận kho khi yêu cầu ký gửi đã được duyệt (APPROVED).
                </div>
              ) : null}

              {pageData.canCreate ? (
                <section className="space-y-4 pt-2 border-t border-surface-muted">
                  <h2 className="text-lg font-extrabold font-['Oswald']">Tạo phiếu tiếp nhận</h2>
                  <p className="text-sm text-muted">
                    Sau khi tạo, hệ thống sẽ mở hộp thoại in — in phiếu và giao cho kho để nhận
                    hàng offline.
                  </p>

                  <div className="space-y-2">
                    <label htmlFor="warehouseId" className="text-sm font-bold text-ink">
                      Kho tiếp nhận <span className="text-danger">*</span>
                    </label>
                    <select
                      id="warehouseId"
                      value={warehouseId}
                      onChange={(e) => setWarehouseId(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full h-11 px-4 rounded-lg border border-border-muted bg-surface-elevated text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
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
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
                  >
                    {isSubmitting ? (
                      <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon icon="lucide:clipboard-plus" className="w-4 h-4" />
                    )}
                    {isSubmitting ? "Đang tạo phiếu..." : "Tạo & in phiếu tiếp nhận kho"}
                  </button>
                </section>
              ) : consignment.status === "APPROVED" && receivingNote ? (
                <div className="rounded-lg border border-surface-muted bg-surface px-4 py-3 text-sm text-muted">
                  Yêu cầu đã có phiếu tiếp nhận kho đang hiệu lực — không thể tạo lại. Dùng nút
                  in ở trên nếu cần in lại bản cứng.
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
