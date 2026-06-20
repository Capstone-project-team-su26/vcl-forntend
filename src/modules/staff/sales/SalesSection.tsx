"use client";
import { Icon } from '@iconify/react';
import { useEffect, useState } from "react";
import ConsignmentListPanel from "@/modules/staff/consignments/ConsignmentListPanel";
import type { SalesTab } from "@/modules/staff/staffSections";
import * as staffService from "@/shared/services/staffService";
import Link from "next/link";

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
    staffService.getSalesWorkspace().then(setData);
  }, []);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: './assets/IMG_2.svg', label: 'Dashboard', active: false },
    { icon: './assets/IMG_3.svg', label: 'Transfer Package', active: false },
    { icon: './assets/IMG_4.svg', label: 'Track & Receive', active: false },
    { icon: './assets/IMG_5.svg', label: 'Pricing & Services', active: false },
  ];

  const stats = [
    { label: 'PURCHASE ORDER', value: '12', subtext: '4 arriving today', icon: './assets/IMG_11.svg', color: 'bg-[#9ECAD6]/20', iconColor: 'text-[#9ECAD6]' },
    { label: 'IN STORAGE', value: '03', subtext: 'Scheduled for tomorrow', icon: './assets/IMG_10.svg', color: 'bg-[#748DAE]/20', iconColor: 'text-[#748DAE]' },
    { label: 'IN SHIPMENT', value: '03', subtext: 'Scheduled for tomorrow', icon: './assets/IMG_10.svg', color: 'bg-[#748DAE]/20', iconColor: 'text-[#748DAE]' },
  ];

  const activities = [
    { id: 'SW-90234', recipient: 'Sarah Jenkins', destination: 'London, UK', status: 'In Transit', date: 'Oct 24, 2024', statusColor: 'bg-[#9ECAD6]/15 text-[#9ECAD6]' },
    { id: 'SW-90112', recipient: 'TechnoCorp Ltd', destination: 'Tokyo, JP', status: 'Delivered', date: 'Oct 22, 2024', statusColor: 'text-[#16181D]' },
    { id: 'SW-89982', recipient: 'Michael Chen', destination: 'San Francisco, US', status: 'Pending', date: 'Oct 25, 2024', statusColor: 'text-[#16181D]' },
    { id: 'SW-89551', recipient: 'Global Logistics', destination: 'Berlin, DE', status: 'On Hold', date: 'Oct 21, 2024', statusColor: 'bg-[#F5CBCB]/15 text-[#F5CBCB]' },
    { id: 'SW-89400', recipient: 'Anna Schmidt', destination: 'Munich, DE', status: 'Delivered', date: 'Oct 20, 2024', statusColor: 'text-[#16181D]' },
  ];

 return (
    <div className="flex min-h-screen bg-white font-['Open_Sans']">
    
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-[#F9FAFB] z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-[#f3f4f6]">
          <span className="font-['Oswald'] text-xl font-black text-[#9ECAD6]">SwiftShip</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="ml-auto">
            <Icon icon="lucide:x" className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item, idx) => (
            <button key={idx} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${item.active ? 'bg-[#9ECAD6]/10 text-[#9ECAD6]' : 'text-[#575E6B]'}`}>
              <img src={item.icon} className="w-5 h-5" alt="" />
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#f3f4f6] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
          <button className="lg:hidden p-2" onClick={() => setIsMobileMenuOpen(true)}>
            <Icon icon="lucide:menu" className="w-6 h-6 text-gray-600" />
          </button>

        </header>

        {/* Content */}
        <div className="p-4 lg:p-8 space-y-8 overflow-x-hidden">
          {/* Welcome Section */}
          <section>
            <h1 className="text-4xl font-black tracking-tight text-[#16181D] font-['Oswald']">
              Welcome back, <span className="text-[#748DAE] font-['Open_Sans'] uppercase-none">Alex</span>
            </h1>
            <p className="text-lg font-medium text-[#575E6B] mt-2">
              You have <span className="text-[#9ECAD6] font-bold">12 Purchase Order</span> in transit today.
            </p>
          </section>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-[10px] shadow-sm border border-gray-50 flex justify-between items-start">
                <div>
                  <p className="text-[14px] font-medium text-[#575E6B] tracking-wider uppercase">{stat.label}</p>
                  <p className="text-3xl font-bold text-[#16181D] font-['Oswald'] mt-2">{stat.value}</p>
                  <p className="text-[12px] font-medium text-[#575E6B] mt-2">{stat.subtext}</p>
                </div>
                <div className={`w-14 h-14 rounded-full ${stat.color} flex items-center justify-center`}>
                  <img src={stat.icon} className={`w-6 h-6 ${stat.iconColor}`} alt="" />
                </div>
              </div>
            ))}
          </section>

          {/* Action Cards */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#9ECAD6] rounded-xl p-6 flex items-center gap-6 cursor-pointer hover:opacity-95 transition-opacity group">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <img src="./assets/IMG_12.svg" className="w-8 h-8 text-white" alt="" />
              </div>
              <Link href="/transfer" className="flex-1">
                <h3 className="text-xl font-bold text-white font-['Oswald']">
                  Start New Transfer
                </h3>

                <p className="text-sm font-medium text-white/80">
                  Calculate rates and ship your package instantly.
                </p>
              </Link>
              <img src="./assets/IMG_13.svg" className="w-6 h-6 text-white/50 group-hover:translate-x-1 transition-transform" alt="" />
            </div>

            <div className="bg-[#748DAE] rounded-xl p-6 flex items-center gap-6 cursor-pointer hover:opacity-95 transition-opacity group">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <img src="./assets/IMG_14.svg" className="w-8 h-8 text-white" alt="" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white font-['Oswald']">Track Shipment</h3>
                <p className="text-sm font-medium text-white/80">Enter a tracking ID to get real-time updates.</p>
              </div>
              <img src="./assets/IMG_13.svg" className="w-6 h-6 text-white/50 group-hover:translate-x-1 transition-transform" alt="" />
            </div>
          </section>

          {/* Recent Activity Table */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-[#16181D] font-['Oswald']">Recent Activity</h2>
              <button className="px-4 py-2 border border-[#748DAE]/30 rounded-lg text-sm font-bold text-[#748DAE] hover:bg-gray-50 transition-colors">
                View All Activity
              </button>
            </div>
            <div className="bg-white rounded-[10px] shadow-sm border border-gray-50 overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-sm font-bold text-[#16181D]">Tracking ID</th>
                    <th className="px-6 py-4 text-sm font-bold text-[#16181D]">Recipient</th>
                    <th className="px-6 py-4 text-sm font-bold text-[#16181D]">Destination</th>
                    <th className="px-6 py-4 text-sm font-bold text-[#16181D]">Status</th>
                    <th className="px-6 py-4 text-sm font-bold text-[#16181D] text-right">Est. Delivery</th>
                    <th className="px-6 py-4 text-sm font-semibold text-[#565d6d] font-['Oswald']">87 ₫</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((row, idx) => (
                    <tr key={idx} className="table-row-hover border-b border-gray-50 last:border-0">
                      <td className="px-6 py-4 text-sm font-bold text-[#748DAE]">{row.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-[#16181D]">{row.recipient}</td>
                      <td className="px-6 py-4 text-sm text-[#575E6B]">{row.destination}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[12px] font-bold ${row.statusColor}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-[#16181D] text-right">{row.date}</td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Reports Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-extrabold text-[#16181D] font-['Oswald']">Report</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Chart 1 */}
              <div className="bg-[#F4F9FA] p-6 rounded-[10px] shadow-sm border border-gray-50">
                <div className="relative h-[170px] mb-6">
                  <img src="./assets/IMG_15.svg" className="w-full h-full object-contain" alt="Chart" />
                  {/* Chart Labels Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-between text-[11px] text-[#171a1f] py-1">
                    <span>16</span><span>12</span><span>8</span><span>4</span><span>0</span>
                  </div>
                  <div className="absolute bottom-[-20px] left-0 right-0 flex justify-between px-8 text-[11px] text-[#16181D]">
                    <span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-8">
                  <img src="./assets/IMG_16.svg" className="w-5 h-5 text-[#2C5B68]" alt="" />
                  <span className="text-lg font-bold text-[#2C5B68] tracking-tight">Monthly Shipment</span>
                </div>
              </div>

              {/* Chart 2 */}
              <div className="bg-[#F4F9FA] p-6 rounded-[10px] shadow-sm border border-gray-50">
                <div className="relative h-[170px] mb-6">
                  <img src="./assets/IMG_15.svg" className="w-full h-full object-contain" alt="Chart" />
                  <div className="absolute inset-0 flex flex-col justify-between text-[11px] text-[#171a1f] py-1">
                    <span>16</span><span>12</span><span>8</span><span>4</span><span>0</span>
                  </div>
                  <div className="absolute bottom-[-20px] left-0 right-0 flex justify-between px-8 text-[11px] text-[#16181D]">
                    <span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-8">
                  <img src="./assets/IMG_16.svg" className="w-5 h-5 text-[#2C5B68]" alt="" />
                  <span className="text-lg font-bold text-[#2C5B68] tracking-tight">Monthly Purchase request</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <style>{`
        .table-row-hover:hover {
          background-color: rgba(241, 245, 249, 0.5);
          transition: background-color 0.2s ease;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );

}
