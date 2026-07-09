"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import OperationsShell from "@/app/pages/operations/components/OperationsShell";

export default function OperationalBlankPage() {
  const { session } = useAuth();
  const [consolidations, setConsolidations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const displayName = session?.fullName?.split(" ")?.[0] || "Ops";

  const summary = useMemo(() => {
    const totalWeight = consolidations.reduce((sum, item) => sum + (item.totalWeight ?? 0), 0);
    const totalVolume = consolidations.reduce((sum, item) => sum + (item.totalVolume ?? 0), 0);
    const totalOrders = consolidations.reduce((sum, item) => sum + (item.orders?.length || 0), 0);
    return { totalWeight, totalVolume, totalOrders };
  }, [consolidations]);

  useEffect(() => {
    let active = true;
    const API_URL = "https://api-vcl.zushin.io.vn/api/consolidation";

    async function load() {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Network response was not ok");
        const json = await res.json();
        if (active) {
          setConsolidations(Array.isArray(json) ? json : []);
          setError(null);
          setIsLoading(false);
        }
      } catch (err) {
        if (active) {
          setError("Không tải được consolidation data.");
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  async function openDetail(id) {
    if (!id) return;
    setDetailOpen(true);
    setIsDetailLoading(true);
    setDetailData(null);

    try {
      const res = await fetch(`https://api-vcl.zushin.io.vn/api/consolidation/${id}`);
      if (!res.ok) throw new Error("Network response was not ok");
      const json = await res.json();
      setDetailData(json || null);
    } catch (err) {
      console.error(err);
      setDetailData(null);
      setError("Không tải được chi tiết consolidation.");
    } finally {
      setIsDetailLoading(false);
    }
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
                  <th className="px-6 py-3">Mã master</th>
                  <th className="px-6 py-3">Tổng trọng lượng</th>
                  <th className="px-6 py-3">Tổng thể tích</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3">Số đơn</th>
                  <th className="px-6 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted">
                      Đang tải...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-danger">
                      {error}
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
                <button onClick={closeDetail} className="text-sm px-3 py-1">
                  Đóng
                </button>
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
