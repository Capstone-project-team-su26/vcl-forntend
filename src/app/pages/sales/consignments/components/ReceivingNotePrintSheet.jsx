"use client";

import {
  CONSIGNMENT_TYPE_LABELS,
  formatConsignmentDate,
} from "@/utils/orderConsignmentService";

function PrintRow({ label, value, wide }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">
        {label}
      </p>
      <p className="text-sm font-semibold text-black leading-snug">{value || "—"}</p>
    </div>
  );
}

/**
 * Bố cục in A4 — ẩn trên màn hình, chỉ hiện khi window.print().
 * Kho offline dùng bản in để nhận hàng, sau đó scan/nhập mã phiếu khi có mạng.
 */
export default function ReceivingNotePrintSheet({
  receivingNote,
  consignment,
  expectedItems = [],
  expectedQuantity = 0,
  noteStatusLabel = "—",
}) {
  if (!receivingNote || !consignment) return null;

  const consignmentCode =
    consignment.consignmentCode || consignment.id?.slice(0, 12) || "—";
  const shippingCode =
    consignment.trackingCode || consignment.consignmentCode || "Chưa có";
  const printedAt = new Date().toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      id="receiving-note-print-sheet"
      className="hidden print:block bg-white text-black p-8 max-w-[210mm] mx-auto"
      aria-hidden="true"
    >
      <header className="border-b-2 border-black pb-4 mb-5 flex justify-between items-start gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-600">
            VCL Logistics
          </p>
          <h1 className="text-2xl font-black uppercase tracking-tight mt-1">
            Phiếu tiếp nhận kho
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Warehouse Receiving Note — dán tại kho / mang theo khi nhận hàng offline
          </p>
        </div>
        <div className="text-right shrink-0 border-2 border-black px-4 py-2 min-w-[160px]">
          <p className="text-[10px] font-bold uppercase text-gray-600">Mã phiếu</p>
          <p className="text-lg font-black font-mono tracking-wide break-all">
            {receivingNote.receivingNoteCode}
          </p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5">
        <PrintRow label="Mã yêu cầu ký gửi" value={consignmentCode} />
        <PrintRow label="Trạng thái phiếu" value={noteStatusLabel} />
        <PrintRow label="Tên khách hàng" value={consignment.customerName} />
        <PrintRow
          label="Loại ký gửi"
          value={
            CONSIGNMENT_TYPE_LABELS[consignment.consignmentType] ||
            consignment.consignmentType
          }
        />
        <PrintRow
          label="Ngày tạo yêu cầu"
          value={formatConsignmentDate(consignment.createdAt)}
        />
        <PrintRow label="Mã gửi hàng" value={shippingCode} />
        <PrintRow
          label="Kho tiếp nhận"
          value={receivingNote.warehouseName || "—"}
          wide
        />
        {receivingNote.warehouseNote ? (
          <PrintRow label="Ghi chú cho kho" value={receivingNote.warehouseNote} wide />
        ) : null}
      </section>

      <section className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-wider border-b border-gray-400 pb-1 mb-2">
          Danh sách hàng dự kiến nhận
        </h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-400">
              <th className="text-left py-2 pr-2 font-bold">STT</th>
              <th className="text-left py-2 pr-2 font-bold">Sản phẩm</th>
              <th className="text-right py-2 font-bold w-28">SL dự kiến</th>
              <th className="text-right py-2 font-bold w-28">SL thực nhận</th>
            </tr>
          </thead>
          <tbody>
            {expectedItems.length === 0 ? (
              <tr className="border-b border-gray-200">
                <td colSpan={4} className="py-3 text-gray-600">
                  Chưa có chi tiết hàng — ghi tay khi nhận.
                </td>
              </tr>
            ) : (
              expectedItems.map((item, index) => (
                <tr key={`${item.productName}-${index}`} className="border-b border-gray-200">
                  <td className="py-2 pr-2">{index + 1}</td>
                  <td className="py-2 pr-2 font-medium">{item.productName}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right text-gray-400">________</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black font-bold">
              <td colSpan={2} className="py-2">
                Tổng số lượng dự kiến
              </td>
              <td className="py-2 text-right">{expectedQuantity}</td>
              <td className="py-2 text-right text-gray-400">________</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="border border-dashed border-gray-500 rounded p-4 mb-5 text-sm">
        <p className="font-bold uppercase text-xs tracking-wider mb-3">
          Xác nhận nhận hàng tại kho (offline)
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <label className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-black" />
            Đã kiểm tra &amp; nhận đủ hàng
          </label>
          <label className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-black" />
            Hàng thiếu / lỗi (ghi chú bên dưới)
          </label>
        </div>
        <p className="text-xs text-gray-600 mb-1">Ghi chú khi nhận thực tế:</p>
        <div className="border-b border-gray-400 h-8 mb-3" />
        <div className="border-b border-gray-400 h-8 mb-4" />
        <div className="grid grid-cols-2 gap-8 mt-6">
          <div>
            <p className="text-xs text-gray-600 mb-8">Nhân viên kho nhận hàng</p>
            <div className="border-t border-black pt-1 text-xs">Họ tên &amp; chữ ký</div>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-8">Ngày giờ nhận hàng</p>
            <div className="border-t border-black pt-1 text-xs">__ / __ / ____  __:__</div>
          </div>
        </div>
      </section>

      <footer className="text-[10px] text-gray-500 flex justify-between border-t border-gray-300 pt-3">
        <span>In lúc: {printedAt}</span>
        <span>
          Scan mã phiếu <strong>{receivingNote.receivingNoteCode}</strong> trên app mobile khi
          có mạng
        </span>
      </footer>
    </div>
  );
}

export function printReceivingNote() {
  if (typeof window === "undefined") return;
  window.print();
}
