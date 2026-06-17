"use client";

import { useEffect, useState } from "react";
import ConsignmentListPanel from "@/modules/staff/consignments/ConsignmentListPanel";
import type { SalesTab } from "@/modules/staff/staffSections";
import * as staffService from "@/shared/services/staffService";

type SalesSectionProps = {
  activeTab?: SalesTab;
  onTabChange?: (tab: SalesTab) => void;
};

const salesTabs: { id: SalesTab; label: string }[] = [
  { id: "overview", label: "Tổng quan" },
  { id: "consignments", label: "Quản lý ký gửi" },
];

export default function SalesSection({ activeTab = "overview", onTabChange }: SalesSectionProps) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (activeTab === "overview") {
      staffService.getSalesWorkspace().then(setData);
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-surface-muted pb-1">
        {salesTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange?.(tab.id)}
            className={`px-4 py-2.5 text-sm font-bold rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? "bg-primary/10 text-primary border-b-2 border-primary -mb-px"
                : "text-muted hover:text-ink hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "consignments" ? (
        <ConsignmentListPanel />
      ) : (
        <div className="space-y-8">
          <section className="relative bg-surface-alt rounded-xl border border-primary/20 p-6 lg:p-10 overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/50 border border-primary/30 mb-6">
                <span className="text-[10px] lg:text-[12px] font-bold text-primary tracking-wider uppercase">
                  Sales Workspace
                </span>
              </div>
              <h1 className="font-oswald text-3xl lg:text-[36px] font-black leading-tight tracking-tight mb-4">
                Customer orders &amp; declarations
              </h1>
              <p className="text-muted text-base lg:text-lg font-medium mb-8">
                Create customer profiles, open consignment orders, verify unidentified parcels, and
                notify customers about order status.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => onTabChange?.("consignments")}
                  className="flex items-center gap-4 bg-primary text-white p-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all group"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                    <img src="./assets/IMG_11.svg" alt="Plus" className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg leading-none mb-1">Quản lý ký gửi</p>
                    <p className="text-xs text-white/80">Xem và duyệt yêu cầu từ khách hàng</p>
                  </div>
                </button>

                <button
                  type="button"
                  className="flex items-center gap-4 bg-white border border-surface-muted p-4 rounded-xl hover:border-primary/30 transition-all group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <img src="./assets/IMG_12.svg" alt="Customer" className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg leading-none mb-1">Verify Unidentified Parcel</p>
                    <p className="text-xs text-muted/80">Match inbound parcels to customers</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="absolute top-10 right-10 hidden lg:block">
              <div className="relative w-[340px] h-[260px] bg-primary/10 rounded-xl border-4 border-dashed border-primary/20 flex items-center justify-center">
                <img src="./assets/IMG_1.svg" alt="Package" className="w-32 h-32 opacity-45 text-primary" />
                <div className="absolute -top-4 -left-4 bg-white shadow-xl rounded-lg px-4 py-2 border border-surface-muted flex items-center gap-2">
                  <img src="./assets/IMG_10.svg" alt="Clock" className="w-4 h-4" />
                  <span className="text-xs font-bold">Customs Update</span>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white shadow-xl rounded-lg px-4 py-2 border border-surface-muted flex items-center gap-2">
                  <img src="./assets/IMG_13.svg" alt="Shield" className="w-4 h-4" />
                  <span className="text-xs font-bold">Payment Confirm</span>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-surface-tint rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <img src="./assets/IMG_15.svg" alt="Trending" className="w-5 h-5 text-primary" />
                <h2 className="font-oswald text-lg font-bold uppercase tracking-tight">
                  Pricing Insights
                </h2>
              </div>
              <p className="text-sm text-muted mb-6">
                Live fuel surcharges &amp; promo rates for customer quotes
              </p>

              <div className="bg-white/60 rounded-xl p-4 border border-primary/10 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-muted tracking-wider">
                    FUEL SURCHARGE
                  </span>
                  <span className="text-[12px] font-black text-danger">
                    {data?.fuelSurcharge || "+4.2%"}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
                  <div className="h-full bg-danger" style={{ width: "42%" }} />
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {(data?.rates || []).map((rate, index) => (
                  <div
                    key={rate.label}
                    className={`flex items-center justify-between ${index === 0 ? "pb-4 border-b border-primary/10" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${rate.iconBg} rounded flex items-center justify-center`}>
                        <img src="./assets/IMG_11.svg" alt={rate.label} className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-bold">{rate.label}</span>
                    </div>
                    <span className="text-sm font-black">{rate.price}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="w-full py-2.5 bg-white border border-primary/30 rounded-lg text-primary font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Compare All Services
              </button>
            </section>

            <section className="relative bg-surface-panel rounded-xl p-6 shadow-sm overflow-hidden">
              <div className="absolute -top-5 -right-5 w-24 h-24 bg-secondary/10 rounded-full" />
              <h2 className="font-oswald text-lg font-bold mb-4 text-ink">Customer Notifications</h2>
              <p className="text-sm font-medium text-muted leading-relaxed mb-6">
                Notify{" "}
                <span className="text-ink font-black">{data?.pendingNotifications ?? 3} customers</span>{" "}
                about pending payment confirmations and customs declaration updates.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-3 bg-secondary/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary"
                    style={{
                      width: `${((data?.pendingNotifications ?? 3) / (data?.totalNotifications ?? 5)) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-black text-ink">
                  {data?.pendingNotifications ?? 3}/{data?.totalNotifications ?? 5}
                </span>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
