"use client";
import styles from "./OperationalDashboardPage.module.scss";

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
      <div className={styles.t793f9e}>
        <section>
          <h1 className={styles.td8c90b}>
            Xin chào, <span className={styles.t5436d5}>{displayName}</span>
          </h1>
          <p className={styles.t466889}>
            Dashboard vận hành — {dashboard?.activeShipments ?? 0} lô hàng đang vận chuyển.
          </p>
        </section>

        <section className={styles.taf6ac6}>
          {isLoading ? (
            <p className={styles.tf3f97e}>Đang tải dữ liệu...</p>
          ) : (
            stats.map((stat) => (
              <div
                key={stat.label}
                className={styles.t4513df}
              >
                <div>
                  <p className={styles.t08d99f}>{stat.label}</p>
                  <p className={styles.t05612a}>{stat.value}</p>
                  <p className={styles.t9bdd28}>{stat.sub}</p>
                </div>
                {stat.icon ? (
                  <img src={stat.icon} className={styles.t75feb7} alt="" />
                ) : null}
              </div>
            ))
          )}
        </section>

        <section className={styles.t6fe022}>
          <div className={styles.td44d55}>
            <h2 className={styles.tb7327e}>Hoạt động gần đây</h2>
            <div className={styles.tb9fc95}>
              <button
                onClick={handleCreateConsolidation}
                disabled={isLoading || isSubmitting || selectedIds.length === 0}
                className={styles.tfc8f05}
              >
                {isSubmitting ? "Đang tạo..." : "Tạo consolidation"}
              </button>
            </div>
          </div>
          <div className={styles.t1384f6}>
            <table className={styles.t072da3}>
              <thead>
                <tr className={styles.t7accfb}>
                  <th className={styles.taa6b74}>
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={selectedIds.length === consignments.length && consignments.length > 0}
                      aria-label="select all"
                    />
                  </th>
                  <th className={styles.taa6b74}>Mã</th>
                  <th className={styles.taa6b74}>Người gửi</th>
                  <th className={styles.taa6b74}>Điểm đến</th>
                  <th className={styles.taa6b74}>Trạng thái</th>
                  <th className={styles.taa6b74}>Trọng lượng</th>
                  <th className={styles.t8c8bec}>Ngày</th>
                  <th className={styles.taa6b74}>Hành động</th>
                </tr>
              </thead>
              <tbody className={styles.t6951c1}>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className={styles.t1a3904}>
                      Đang tải...
                    </td>
                  </tr>
                ) : recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.t1a3904}>
                      Chưa có hoạt động.
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((row) => (
                    <tr key={row.orderId || row.consignmentCode} className={styles.t6c0fe2}>
                      <td className={styles.taa6b74}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(row.orderId)}
                          onChange={() => toggleSelectOne(row.orderId)}
                        />
                      </td>
                      <td className={styles.tc86580}>{row.consignmentCode}</td>
                      <td className={styles.taa6b74}>{row.customerName}</td>
                      <td className={styles.te7ed48}>{row.route}</td>
                      <td className={styles.taa6b74}>
                        <span className={styles.td931c9}>
                          {row.status}
                        </span>
                      </td>
                      <td className={styles.taa6b74}>{row.totalWeight ?? "-"} kg</td>
                      <td className={styles.t8c8bec}>{row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}</td>
                      <td className={styles.taa6b74}>
                        <button
                          onClick={() => openDetail(row.orderId)}
                          className={styles.tfa5e2f}
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
          <div className={styles.ta8894f}>
            <div className={styles.t85c26e}>
              <div className={styles.t0eb8bf}>
                <h3 className={styles.t69450e}>Chi tiết yêu cầu ký gửi</h3>
                <button onClick={closeModal} className={styles.tb77982}>Đóng</button>
              </div>
              <div className={styles.t0478c8}>
                {isDetailLoading ? (
                  <p>Đang tải...</p>
                ) : detailData ? (
                  <div className={styles.t3e9ee8}>
                    <div className={styles.t11d413}>
                      <div>
                        <p className={styles.te83a70}>Mã</p>
                        <p>{detailData.consignmentCode}</p>
                      </div>
                      <div>
                        <p className={styles.te83a70}>Loại</p>
                        <p>{detailData.consignmentType}</p>
                      </div>
                      <div>
                        <p className={styles.te83a70}>Trạng thái</p>
                        <p>{detailData.status}</p>
                      </div>
                      <div>
                        <p className={styles.te83a70}>Tổng trọng lượng</p>
                        <p>{detailData.totalWeight ?? '-'} kg</p>
                      </div>
                      {detailData.packageCount != null ? (
                        <div>
                          <p className={styles.te83a70}>Số kiện</p>
                          <p>{detailData.packageCount}</p>
                        </div>
                      ) : null}
                      <div>
                        <p className={styles.te83a70}>Tuyến</p>
                        <p>{detailData.route}</p>
                      </div>
                      <div>
                        <p className={styles.te83a70}>Ngày tạo</p>
                        <p>{detailData.createdAt ? new Date(detailData.createdAt).toLocaleString() : '-'}</p>
                      </div>
                    </div>

                    <div>
                      <p className={styles.te83a70}>Người nhận</p>
                      <p>{detailData.receiverName || '-'} - {detailData.receiverPhone || '-'}</p>
                      <p className={styles.t9a12f0}>{detailData.receiverAddress || '-'}</p>
                    </div>

                    <div>
                      <p className={styles.te83a70}>Khách hàng</p>
                      <p>{detailData.customer?.fullName || '-'}</p>
                      <p className={styles.t9a12f0}>{detailData.customer?.phone || ''} {detailData.customer?.email ? ` - ${detailData.customer.email}` : ''}</p>
                    </div>

                    <div>
                      <p className={styles.te83a70}>Mặt hàng</p>
                      <div className={styles.t813892}>
                        {Array.isArray(detailData.items) && detailData.items.length > 0 ? (
                          detailData.items.map((it) => (
                            <div key={it.id} className={styles.ta056dc}>
                              <p className={styles.t2689f3}>{it.productName}</p>
                              <p className={styles.t9a12f0}>
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
                        <p className={styles.te83a70}>Báo giá</p>
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
