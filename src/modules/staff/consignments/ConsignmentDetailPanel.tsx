"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as orderConsignmentService from "@/shared/services/orderConsignmentService";
import { getErrorMessage } from "@/shared/utils/apiError";

const {
  CONSIGNMENT_TYPE_LABELS,
  CONSIGNMENT_STATUS_LABELS,
  CONSIGNMENT_STATUS_STYLES,
  formatConsignmentDate,
} = orderConsignmentService;

type ConsignmentDetail = {
  id: string;
  customerName: string;
  consignmentType: string;
  status: string;
  createdAt: string;
  productName?: string;
  quantity?: number;
  destination?: string;
  notes?: string;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-50 last:border-0">
      <dt className="text-sm font-bold text-muted sm:w-44 shrink-0">{label}</dt>
      <dd className="text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

type ConsignmentDetailPanelProps = {
  id: string;
  backHref?: string;
};

export default function ConsignmentDetailPanel({
  id,
  backHref = "/staff?salesTab=consignments",
}: ConsignmentDetailPanelProps) {
  const [detail, setDetail] = useState<ConsignmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    let active = true;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const data = await orderConsignmentService.getStaffConsignment(id);
        if (active) setDetail(data);
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-primary"
      >
        <Icon icon="lucide:arrow-left" className="w-4 h-4" />
        Quay lại danh sách ký gửi
      </Link>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted gap-2">
          <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Đang tải chi tiết...</span>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : detail ? (
        <>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl lg:text-3xl font-black tracking-tight font-['Oswald']">
                {detail.id}
              </h2>
              <p className="text-muted text-sm mt-2">
                Yêu cầu ký gửi của{" "}
                <span className="font-bold text-ink">{detail.customerName}</span>
              </p>
            </div>
            <span
              className={`inline-flex self-start px-4 py-1.5 rounded-full text-sm font-bold ${
                CONSIGNMENT_STATUS_STYLES[detail.status] || "bg-surface text-muted"
              }`}
            >
              {CONSIGNMENT_STATUS_LABELS[detail.status] || detail.status}
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-[0px_2px_4px_0px_#00000012] p-6 border border-surface-muted/50">
            <h3 className="text-lg font-extrabold font-['Oswald'] mb-2">Thông tin yêu cầu</h3>
            <dl>
              <DetailRow label="Mã yêu cầu" value={detail.id} />
              <DetailRow label="Tên khách hàng" value={detail.customerName} />
              <DetailRow
                label="Loại ký gửi"
                value={
                  CONSIGNMENT_TYPE_LABELS[detail.consignmentType] || detail.consignmentType
                }
              />
              <DetailRow label="Ngày tạo" value={formatConsignmentDate(detail.createdAt)} />
              {detail.productName ? <DetailRow label="Sản phẩm" value={detail.productName} /> : null}
              {detail.quantity != null ? (
                <DetailRow label="Số lượng" value={String(detail.quantity)} />
              ) : null}
              {detail.destination ? <DetailRow label="Điểm đến" value={detail.destination} /> : null}
              {detail.notes ? <DetailRow label="Ghi chú" value={detail.notes} /> : null}
            </dl>
          </div>

          {detail.status === "PENDING_REVIEW" ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-success text-white text-sm font-bold opacity-60 cursor-not-allowed"
                title="Chờ API duyệt từ backend"
              >
                <Icon icon="lucide:check" className="w-4 h-4" />
                Duyệt yêu cầu
              </button>
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg border border-danger/40 text-danger text-sm font-bold opacity-60 cursor-not-allowed"
                title="Chờ API từ chối từ backend"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
                Từ chối
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
