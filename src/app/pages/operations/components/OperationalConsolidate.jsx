"use client";
import styles from "./OperationalConsolidate.module.scss";

import { useEffect, useMemo, useState } from "react";
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

  async function createConsolidatePdf() {
    if (!detailData) return;

    const [{ jsPDF }, autoTableModule] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);
    const autoTable = autoTableModule.default;

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
      <div className={styles.t793f9e}>
        <section>
          <h1 className={styles.td8c90b}>
            Xin chào, <span className={styles.t5436d5}>{displayName}</span>
          </h1>
          <p className={styles.t466889}>
            Danh sách gom kien hang — hiển thị dữ liệu từ API consolidation.
          </p>
        </section>

        <section className={styles.taf6ac6}>
          <div className={styles.t071318}>
            <p className={styles.t08d99f}>Số lô gom hàng</p>
            <p className={styles.t05612a}>{consolidations.length}</p>
          </div>
          <div className={styles.t071318}>
            <p className={styles.t08d99f}>Tổng trọng lượng</p>
            <p className={styles.t05612a}>{summary.totalWeight}</p>
          </div>
          <div className={styles.t071318}>
            <p className={styles.t08d99f}>Tổng thể tích</p>
            <p className={styles.t05612a}>{summary.totalVolume}</p>
          </div>
        </section>

        <section className={styles.t6fe022}>
          <div className={styles.tdeced1}>
            <h2 className={styles.tb7327e}>lô gom hàng</h2>
          </div>
          <div className={styles.t1384f6}>
            <table className={styles.t072da3}>
              <thead>
                <tr className={styles.t7accfb}>
                  <th className={styles.taa6b74}>Mã master</th>
                  <th className={styles.taa6b74}>Tổng trọng lượng</th>
                  <th className={styles.taa6b74}>Tổng thể tích</th>
                  <th className={styles.taa6b74}>Trạng thái</th>
                  <th className={styles.taa6b74}>Số đơn</th>
                  <th className={styles.taa6b74}>Hành động</th>
                </tr>
              </thead>
              <tbody className={styles.t6951c1}>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className={styles.t1a3904}>
                      Đang tải...
                    </td>
                  </tr>
                ) : currentError ? (
                  <tr>
                    <td colSpan={6} className={styles.t9bddcb}>
                      {currentError}
                    </td>
                  </tr>
                ) : consolidations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.t1a3904}>
                      Không có lô gom hàng.
                    </td>
                  </tr>
                ) : (
                  consolidations.map((item) => (
                    <tr key={item.id} className={styles.t6c0fe2}>
                      <td className={styles.tc86580}>{item.masterCode}</td>
                      <td className={styles.taa6b74}>{item.totalWeight}</td>
                      <td className={styles.taa6b74}>{item.totalVolume}</td>
                      <td className={styles.taa6b74}>{item.status}</td>
                      <td className={styles.taa6b74}>{item.orders?.length ?? 0}</td>
                      <td className={styles.taa6b74}>
                        <button
                          onClick={() => openDetail(item.id)}
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

        {detailOpen ? (
          <div className={styles.ta8894f}>
            <div className={styles.t0a0088}>
              <div className={styles.t0eb8bf}>
                <h3 className={styles.t69450e}>Chi tiết lô gom hàng</h3>
                <div className={styles.t6cfc7e}>
                  <button
                    onClick={createConsolidatePdf}
                    disabled={!detailData || isDetailLoading}
                    className={styles.ta526df}
                  >
                    Create Consolidate PDF
                  </button>
                  <button onClick={closeDetail} className={styles.tb77982}>
                    Đóng
                  </button>
                </div>
              </div>
              <div className={styles.t895934}>
                {isDetailLoading ? (
                  <p>Đang tải chi tiết...</p>
                ) : detailData ? (
                  <>
                    <div className={styles.t11d413}>
                      <div>
                        <p className={styles.te83a70}>Master code</p>
                        <p>{detailData.masterCode}</p>
                      </div>
                      <div>
                        <p className={styles.te83a70}>Trạng thái</p>
                        <p>{detailData.status}</p>
                      </div>
                      <div>
                        <p className={styles.te83a70}>Tổng trọng lượng</p>
                        <p>{detailData.totalWeight}</p>
                      </div>
                      <div>
                        <p className={styles.te83a70}>Tổng thể tích</p>
                        <p>{detailData.totalVolume}</p>
                      </div>
                    </div>

                    <div>
                      <p className={styles.te83a70}>Đơn hàng</p>
                      <div className={styles.t0e7a5a}>
                        {detailData.orders?.map((order) => (
                          <div key={order.id} className={styles.t6908dc}>
                            <div className={styles.t11d413}>
                              <div>
                                <p className={styles.te83a70}>Mã kiện</p>
                                <p>{order.consignmentCode}</p>
                              </div>
                              <div>
                                <p className={styles.te83a70}>Trạng thái</p>
                                <p>{order.status}</p>
                              </div>
                              <div>
                                <p className={styles.te83a70}>Tuyến</p>
                                <p>{order.route}</p>
                              </div>
                              <div>
                                <p className={styles.te83a70}>Số lượng kiện</p>
                                <p>{order.parcels?.length ?? 0}</p>
                              </div>
                            </div>
                            <div className={styles.t0ab866}>
                              <p className={styles.te83a70}>Parcels</p>
                              {order.parcels?.length ? (
                                <div className={styles.te5b1dd}>
                                  {order.parcels.map((parcel) => (
                                    <div key={parcel.id} className={styles.t98b25b}>
                                      <div className={styles.tbf2aed}>
                                        <div>
                                          <p className={styles.te83a70}>Mã kiện</p>
                                          <p>{parcel.packageCode}</p>
                                        </div>
                                        <div>
                                          <p className={styles.te83a70}>Trạng thái</p>
                                          <p>{parcel.packageStatus}</p>
                                        </div>
                                        <div>
                                          <p className={styles.te83a70}>Trọng lượng thực tế</p>
                                          <p>{parcel.actualWeight}</p>
                                        </div>
                                        <div>
                                          <p className={styles.te83a70}>Chargeable</p>
                                          <p>{parcel.chargeableWeight}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className={styles.t9a12f0}>Không có parcel.</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className={styles.t424e1f}>Không có dữ liệu chi tiết.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </OperationsShell>
  );
}
