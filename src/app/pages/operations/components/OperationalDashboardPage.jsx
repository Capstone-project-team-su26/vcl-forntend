"use client";

import { useEffect, useState } from "react";
import * as operationsService from "@/utils/operationsService";
import { useAuth } from "@/hooks/useAuth";
import OperationsShell from "@/app/pages/operations/components/OperationsShell";

export default function OperationalDashboardPage() {
  const { session } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    operationsService
      .getOperationalDashboard()
      .then((data) => {
        if (active) {
          setDashboard(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const recentActivity = dashboard?.recentActivity ?? [];
  const stats = dashboard?.stats ?? [];
  const displayName =
    session?.fullName?.split(" ")?.[0] || dashboard?.userName?.split(" ")?.[0] || "Ops";

  return (
    <OperationsShell activeNav={["dashboard", "consolidation"]}>
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
          <div className="px-6 py-4 border-b border-surface-muted">
            <h2 className="text-lg font-bold font-['Oswald']">Hoạt động gần đây</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-50 text-sm font-bold">
                  <th className="px-6 py-3">Mã</th>
                  <th className="px-6 py-3">Người nhận</th>
                  <th className="px-6 py-3">Điểm đến</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted">
                      Đang tải...
                    </td>
                  </tr>
                ) : recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted">
                      Chưa có hoạt động.
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-bold text-secondary">{row.id}</td>
                      <td className="px-6 py-3">{row.recipient}</td>
                      <td className="px-6 py-3 text-muted">{row.destination}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${row.statusColor || ""}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">{row.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </OperationsShell>
  );
}
