"use client";

import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "@/hooks/useAuth";
import OperationsShell from "@/app/pages/operations/components/OperationsShell";

function formatPdfValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function buildConsolidatePdfRows(detailData) {
  const rows = [
    ["Field", "Value"],
    ["Master code", formatPdfValue(detailData?.masterCode)],
    ["Status", formatPdfValue(detailData?.status)],
    ["Tổng trọng lượng", formatPdfValue(detailData?.totalWeight)],
    ["Tổng thể tích", formatPdfValue(detailData?.totalVolume)],
    ["Số đơn", formatPdfValue(detailData?.orders?.length ?? 0)],
  ];

  (detailData?.orders || []).forEach((order, orderIndex) => {
    rows.push([`Order ${orderIndex + 1} - Mã kiện`, formatPdfValue(order.consignmentCode)]);
    rows.push([`Order ${orderIndex + 1} - Trạng thái`, formatPdfValue(order.status)]);
    rows.push([`Order ${orderIndex + 1} - Tuyến`, formatPdfValue(order.route)]);
    rows.push([`Order ${orderIndex + 1} - Số lượng parcel`, formatPdfValue(order.parcels?.length ?? 0)]);

    (order.parcels || []).forEach((parcel, parcelIndex) => {
      rows.push([
        `Parcel ${parcelIndex + 1} - Mã kiện`,
        formatPdfValue(parcel.packageCode),
      ]);
      rows.push([
        `Parcel ${parcelIndex + 1} - Trạng thái`,
        formatPdfValue(parcel.packageStatus),
      ]);
      rows.push([
        `Parcel ${parcelIndex + 1} - Trọng lượng thực tế`,
        formatPdfValue(parcel.actualWeight),
      ]);
      rows.push([
        `Parcel ${parcelIndex + 1} - Chargeable`,
        formatPdfValue(parcel.chargeableWeight),
      ]);
    });
  });

  return rows;
}

export default function OperationalConsolidate() {
  const { session, isReady } = useAuth();
  const token = session?.token;
  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );
  const [consolidations, setConsolidations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const displayName = session?.fullName?.split(" ")?.[0] || "Ops";
  const authError = isReady && !token ? "Bạn cần đăng nhập để xem consolidation." : null;
  const currentError = error || authError;

  const summary = useMemo(() => {
    const totalWeight = consolidations.reduce((sum, item) => sum + (item.totalWeight ?? 0), 0);
    const totalVolume = consolidations.reduce((sum, item) => sum + (item.totalVolume ?? 0), 0);
    const totalOrders = consolidations.reduce((sum, item) => sum + (item.orders?.length || 0), 0);
    return { totalWeight, totalVolume, totalOrders };
  }, [consolidations]);

  useEffect(() => {
    if (!isReady || !token) return;

    let active = true;
    const API_URL = "https://api-vcl.zushin.io.vn/api/consolidation";

    async function load() {
      try {
        const res = await fetch(API_URL, {
          headers: authHeaders,
        });
        if (!res.ok) throw new Error("Network response was not ok");
        const json = await res.json();
        if (active) {
          setConsolidations(Array.isArray(json) ? json : []);
          setError(null);
          setIsLoading(false);
        }
      } catch (err) {
        if (active) {
          setError("Không tải được data lo gom hang.");
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [authHeaders, isReady, token]);

  async function openDetail(id) {
    if (!id) return;
    setDetailOpen(true);
    setIsDetailLoading(true);
    setDetailData(null);
    setError(null);

    try {
      const res = await fetch(`https://api-vcl.zushin.io.vn/api/consolidation/${id}`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Network response was not ok");
      const json = await res.json();
      setDetailData(json || null);
    } catch (err) {
      console.error(err);
      setDetailData(null);
      setError("Không tải được chi tiết lo gom.");
    } finally {
      setIsDetailLoading(false);
    }
  }

  function createConsolidatePdf() {
    if (!detailData) return;

    const pdf = new jsPDF();
    const fileName = `${formatPdfValue(detailData?.masterCode || "consolidation")}.pdf`;

    pdf.setFontSize(16);
    pdf.text("Consolidation Report", 14, 15);
    pdf.setFontSize(10);
    pdf.text(`Master code: ${formatPdfValue(detailData?.masterCode)}`, 14, 22);

    autoTable(pdf, {
      startY: 30,
      head: [["Field", "Value"]],
      body: buildConsolidatePdfRows(detailData),
      styles: {
        fontSize: 8,
      },
      headStyles: {
        fillColor: [22, 163, 74],
      },
      margin: { left: 14, right: 14 },
    });

    pdf.save(fileName);
  }

  function closeDetail() {
    setDetailOpen(false);
    setDetailData(null);
    setIsDetailLoading(false);
  }

  return (
    <OperationsShell activeNav="consolidation">
      <div className="space-y-8">
        <section>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight">
            Xin chào, <span className="text-secondary">{displayName}</span>
          </h1>
          <p className="text-muted text-sm font-medium mt-2">
            Danh sách gom kien hang — hiển thị dữ liệu từ API consolidation.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-surface-muted shadow-sm">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Số lô gom hàng</p>
            <p className="text-3xl font-bold font-['Oswald'] mt-2">{consolidations.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-surface-muted shadow-sm">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Tổng trọng lượng</p>
            <p className="text-3xl font-bold font-['Oswald'] mt-2">{summary.totalWeight}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-surface-muted shadow-sm">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Tổng thể tích</p>
            <p className="text-3xl font-bold font-['Oswald'] mt-2">{summary.totalVolume}</p>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-surface-muted overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-muted">
            <h2 className="text-lg font-bold font-['Oswald']">lô gom hàng</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-50 text-sm font-bold">
                  <th className="px-6 py-3">Master code</th>
                  <th className="px-6 py-3">Tổng trọng lượng</th>
                  <th className="px-6 py-3">Tổng thể tích</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3">Số đơn</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted">
                      Đang tải...
                    </td>
                  </tr>
                ) : currentError ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-danger">
                      {currentError}
                    </td>
                  </tr>
                ) : consolidations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted">
                      Không có lô gom hàng.
                    </td>
                  </tr>
                ) : (
                  consolidations.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-bold text-secondary">{item.masterCode}</td>
                      <td className="px-6 py-3">{item.totalWeight}</td>
                      <td className="px-6 py-3">{item.totalVolume}</td>
                      <td className="px-6 py-3">{item.status}</td>
                      <td className="px-6 py-3">{item.orders?.length ?? 0}</td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => openDetail(item.id)}
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

        {detailOpen ? (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full mx-4 overflow-auto max-h-[90vh]">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h3 className="font-bold">Chi tiết lô gom hàng</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={createConsolidatePdf}
                    disabled={!detailData || isDetailLoading}
                    className="text-sm px-3 py-1 bg-primary text-white rounded-md disabled:opacity-50"
                  >
                    Create Consolidate PDF
                  </button>
                  <button onClick={closeDetail} className="text-sm px-3 py-1">
                    Đóng
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {isDetailLoading ? (
                  <p>Đang tải chi tiết...</p>
                ) : detailData ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold">Master code</p>
                        <p>{detailData.masterCode}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Trạng thái</p>
                        <p>{detailData.status}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Tổng trọng lượng</p>
                        <p>{detailData.totalWeight}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Tổng thể tích</p>
                        <p>{detailData.totalVolume}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold">Đơn hàng</p>
                      <div className="mt-3 space-y-4">
                        {detailData.orders?.map((order) => (
                          <div key={order.id} className="border rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="font-semibold">Mã kiện</p>
                                <p>{order.consignmentCode}</p>
                              </div>
                              <div>
                                <p className="font-semibold">Trạng thái</p>
                                <p>{order.status}</p>
                              </div>
                              <div>
                                <p className="font-semibold">Tuyến</p>
                                <p>{order.route}</p>
                              </div>
                              <div>
                                <p className="font-semibold">Số lượng kiện</p>
                                <p>{order.parcels?.length ?? 0}</p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <p className="font-semibold">Parcels</p>
                              {order.parcels?.length ? (
                                <div className="mt-2 grid gap-3">
                                  {order.parcels.map((parcel) => (
                                    <div key={parcel.id} className="rounded-md border p-3">
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <p className="font-semibold">Mã kiện</p>
                                          <p>{parcel.packageCode}</p>
                                        </div>
                                        <div>
                                          <p className="font-semibold">Trạng thái</p>
                                          <p>{parcel.packageStatus}</p>
                                        </div>
                                        <div>
                                          <p className="font-semibold">Trọng lượng thực tế</p>
                                          <p>{parcel.actualWeight}</p>
                                        </div>
                                        <div>
                                          <p className="font-semibold">Chargeable</p>
                                          <p>{parcel.chargeableWeight}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-muted">Không có parcel.</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="p-6 text-center text-muted">Không có dữ liệu chi tiết.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </OperationsShell>
  );
}
