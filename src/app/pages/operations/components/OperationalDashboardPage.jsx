"use client";

import { useEffect, useState } from "react";
// Fetch consignments directly from the API
import { useAuth } from "@/hooks/useAuth";
import OperationsShell from "@/app/pages/operations/components/OperationsShell";
import { formatProductTypeLabel } from "@/utils/productTypeService";
import { normalizeConsignmentDetail } from "@/utils/apiMappers";

export default function OperationalDashboardPage() {
  const { session, isReady } = useAuth();
  const token = session?.token;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  const [dashboard, setDashboard] = useState(null);
  const [consignments, setConsignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!token) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const API_URL =
      "https://api-vcl.zushin.io.vn/api/orders/consignments?pageNumber=1&pageSize=10&status=approved";

    async function load() {
      try {
        const res = await fetch(API_URL, {
          headers: authHeaders,
        });
        if (!res.ok) throw new Error("Network response was not ok");
        const json = await res.json();
        const items = (json?.data?.items) || [];
        if (active) {
          setConsignments(items);
          setIsLoading(false);
        }
      } catch (err) {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [authHeaders, isReady, token]);

  function toggleSelectOne(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === consignments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(consignments.map((c) => c.orderId).filter(Boolean));
    }
  }

  async function handleCreateConsolidation() {
    if (selectedIds.length === 0) return;
    const ok = window.confirm(`Tạo consolidation cho ${selectedIds.length} lô hàng?`);
    if (!ok) return;

    const API_URL = "https://api-vcl.zushin.io.vn/api/consolidation";
    setIsSubmitting(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ orderIds: selectedIds, status: "waiting" }),
      });
      if (!res.ok) throw new Error("Network response was not ok");
      // optionally read response.json()
      alert("Tạo consolidation thành công.");
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi tạo consolidation.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function openDetail(orderId) {
    if (!orderId) return;
    setModalOpen(true);
    setIsDetailLoading(true);
    setDetailData(null);
    try {
      const res = await fetch(`https://api-vcl.zushin.io.vn/api/orders/consignments/${orderId}`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const json = await res.json();
      setDetailData(normalizeConsignmentDetail(json) ?? null);
    } catch (err) {
      console.error(err);
      alert('Không thể tải chi tiết.');
      setDetailData(null);
    } finally {
      setIsDetailLoading(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setDetailData(null);
    setIsDetailLoading(false);
  }

  const recentActivity = consignments;
  const stats = dashboard?.stats ?? [];
  const displayName = session?.fullName?.split(" ")?.[0] || "Ops";

  return (
    <OperationsShell activeNav="dashboard">
      <div className="space-y-8">
        <section>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight">
            Xin chào, <span className="text-secondary">{displayName}</span>
          </h1>
          <p className="text-muted text-sm font-medium mt-2">
            Dashboard vận hành — {dashboard?.activeShipments ?? 0} lô hàng đang vận chuyển.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            <p className="text-sm text-muted col-span-full">Đang tải dữ liệu...</p>
          ) : (
            stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white p-6 rounded-xl border border-surface-muted shadow-sm flex justify-between items-start"
              >
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wide">{stat.label}</p>
                  <p className="text-3xl font-bold font-['Oswald'] mt-2">{stat.value}</p>
                  <p className="text-xs text-muted mt-2">{stat.sub}</p>
                </div>
                {stat.icon ? (
                  <img src={stat.icon} className="w-6 h-6" alt="" />
                ) : null}
              </div>
            ))
          )}
        </section>

        <section className="bg-white rounded-xl border border-surface-muted overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-muted flex items-center justify-between">
            <h2 className="text-lg font-bold font-['Oswald']">Hoạt động gần đây</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCreateConsolidation}
                disabled={isLoading || isSubmitting || selectedIds.length === 0}
                className="bg-primary text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
              >
                {isSubmitting ? "Đang tạo..." : "Tạo consolidation"}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-50 text-sm font-bold">
                  <th className="px-6 py-3">
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={selectedIds.length === consignments.length && consignments.length > 0}
                      aria-label="select all"
                    />
                  </th>
                  <th className="px-6 py-3">Mã</th>
                  <th className="px-6 py-3">Người gửi</th>
                  <th className="px-6 py-3">Điểm đến</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3">Trọng lượng</th>
                  <th className="px-6 py-3 text-right">Ngày</th>
                  <th className="px-6 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-muted">
                      Đang tải...
                    </td>
                  </tr>
                ) : recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-muted">
                      Chưa có hoạt động.
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((row) => (
                    <tr key={row.orderId || row.consignmentCode} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(row.orderId)}
                          onChange={() => toggleSelectOne(row.orderId)}
                        />
                      </td>
                      <td className="px-6 py-3 font-bold text-secondary">{row.consignmentCode}</td>
                      <td className="px-6 py-3">{row.customerName}</td>
                      <td className="px-6 py-3 text-muted">{row.route}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-3">{row.totalWeight ?? "-"} kg</td>
                      <td className="px-6 py-3 text-right">{row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}</td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => openDetail(row.orderId)}
                          className="text-sm px-3 py-1 bg-surface-muted rounded-md"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
        {modalOpen ? (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full mx-4 overflow-auto max-h-[90vh]">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="font-bold">Chi tiết yêu cầu ký gửi</h3>
                <button onClick={closeModal} className="text-sm px-3 py-1">Đóng</button>
              </div>
              <div className="p-6">
                {isDetailLoading ? (
                  <p>Đang tải...</p>
                ) : detailData ? (
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold">Mã</p>
                        <p>{detailData.consignmentCode}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Loại</p>
                        <p>{detailData.consignmentType}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Trạng thái</p>
                        <p>{detailData.status}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Tổng trọng lượng</p>
                        <p>{detailData.totalWeight ?? '-'} kg</p>
                      </div>
                      {detailData.packageCount != null ? (
                        <div>
                          <p className="font-semibold">Số kiện</p>
                          <p>{detailData.packageCount}</p>
                        </div>
                      ) : null}
                      <div>
                        <p className="font-semibold">Tuyến</p>
                        <p>{detailData.route}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Ngày tạo</p>
                        <p>{detailData.createdAt ? new Date(detailData.createdAt).toLocaleString() : '-'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold">Người nhận</p>
                      <p>{detailData.receiverName || '-'} - {detailData.receiverPhone || '-'}</p>
                      <p className="text-muted">{detailData.receiverAddress || '-'}</p>
                    </div>

                    <div>
                      <p className="font-semibold">Khách hàng</p>
                      <p>{detailData.customer?.fullName || '-'}</p>
                      <p className="text-muted">{detailData.customer?.phone || ''} {detailData.customer?.email ? ` - ${detailData.customer.email}` : ''}</p>
                    </div>

                    <div>
                      <p className="font-semibold">Mặt hàng</p>
                      <div className="mt-2 space-y-2">
                        {Array.isArray(detailData.items) && detailData.items.length > 0 ? (
                          detailData.items.map((it) => (
                            <div key={it.id} className="p-3 border rounded-md">
                              <p className="font-medium">{it.productName}</p>
                              <p className="text-muted">
                                Loại: {formatProductTypeLabel(it.productType) || "—"}
                              </p>
                              <p>Số lượng: {it.quantity}</p>
                              <p>Trọng lượng: {it.weight ?? '-'} kg</p>
                              <p>Giá khai báo: {it.declaredValue ? it.declaredValue.toLocaleString() : '-'}</p>
                            </div>
                          ))
                        ) : (
                          <p>Không có mặt hàng</p>
                        )}
                      </div>
                    </div>

                    {detailData.quotation ? (
                      <div>
                        <p className="font-semibold">Báo giá</p>
                        <p>ID: {detailData.quotation.quotationId}</p>
                        <p>Loại: {detailData.quotation.quoteType}</p>
                        <p>Phí vận chuyển ước tính: {detailData.quotation.estimatedFreightCharge?.toLocaleString() ?? '-'}</p>
                        <p>Tổng ước tính: {detailData.quotation.totalEstimatedCost?.toLocaleString() ?? '-'}</p>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p>Không có dữ liệu.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </OperationsShell>
  );
}
