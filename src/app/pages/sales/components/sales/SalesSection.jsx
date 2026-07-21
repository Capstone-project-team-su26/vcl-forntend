"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import * as staffService from "@/modules/staff";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/appRoutes";

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
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-ink font-['Oswald']">
          Xin chào, <span className="text-secondary">{displayName}</span>
        </h1>
        <p className="text-muted text-sm font-medium mt-2">
          Khu vực Sales — tổng quan đơn hàng và yêu cầu ký gửi.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-elevated p-6 rounded-xl border border-border-muted shadow-sm"
          >
            <p className="text-xs font-semibold text-muted uppercase tracking-wide">{stat.label}</p>
            <p className="text-3xl font-bold text-ink font-['Oswald'] mt-2">{stat.value}</p>
            <p className="text-xs text-muted mt-2">{stat.subtext}</p>
          </div>
        ))}
      </section>

      <section>
        <Link
          href={ROUTES.sales.consignments}
          className="block rounded-xl bg-primary p-6 text-white hover:opacity-95 transition-opacity max-w-xl"
        >
          <h3 className="text-lg font-bold font-['Oswald']">Quản lý ký gửi</h3>
          <p className="text-sm text-white/80 mt-1">
            Duyệt yêu cầu và tạo phiếu tiếp nhận kho cho đơn đã APPROVED.
          </p>
        </Link>
      </section>
    </div>
  );
}
