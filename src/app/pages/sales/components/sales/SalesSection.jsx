"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import * as staffService from "@/utils/staffService";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/appRoutes";
import styles from "./SalesSection.module.scss";

export default function SalesSection() {
  const { session } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    staffService
      .getSalesWorkspace()
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active) setData(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const displayName = session?.fullName?.split(" ")?.[0] || session?.displayName?.split(" ")?.[0] || "Sale";
  const stats = data?.stats ?? [
    { label: "CHỜ DUYỆT", value: isLoading ? "…" : "00", subtext: "Đang tải từ API ký gửi" },
    { label: "ĐANG XỬ LÝ", value: isLoading ? "…" : "00", subtext: "Đang tải từ API ký gửi" },
    { label: "TỔNG YÊU CẦU", value: isLoading ? "…" : "00", subtext: "Đang tải từ API ký gửi" },
  ];

  return (
    <div className={styles.page}>
      <section>
        <h1 className={styles.heroTitle}>
          Xin chào, <span className={styles.heroAccent}>{displayName}</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Khu vực Sales — tổng quan đơn hàng và yêu cầu ký gửi.
        </p>
      </section>

      <section className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statCard}>
            <p className={styles.statLabel}>{stat.label}</p>
            <p className={styles.statValue}>{stat.value}</p>
            <p className={styles.statSubtext}>{stat.subtext}</p>
          </div>
        ))}
      </section>

      <section>
        <Link href={ROUTES.sales.consignments} className={styles.ctaLink}>
          <h3 className={styles.ctaTitle}>Quản lý ký gửi</h3>
          <p className={styles.ctaDesc}>
            Duyệt yêu cầu và tạo phiếu tiếp nhận kho cho đơn đã APPROVED.
          </p>
        </Link>
      </section>
    </div>
  );
}
