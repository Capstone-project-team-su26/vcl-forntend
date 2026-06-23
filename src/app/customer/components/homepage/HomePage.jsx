"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";

const purchaseRequests = [
  { id: "PR-2024-001", product: "Logitech MX Master 3S", qty: 5, destination: "HCM Hub", status: "Pending" },
  { id: "PR-2024-002", product: 'Dell UltraSharp 27"', qty: 2, destination: "Hanoi DC", status: "Approved" },
  { id: "PR-2024-003", product: "Keychron K8 Pro", qty: 10, destination: "Bangkok Gateway", status: "Processing" },
  { id: "PR-2024-004", product: "Apple MacBook Pro M3", qty: 1, destination: "Singapore Central", status: "Approved" },
  { id: "PR-2024-005", product: "Herman Miller Aeron", qty: 3, destination: "HCM Hub", status: "Pending" },
];

function getStatusStyles(status) {
  switch (status) {
    case "Pending":
      return "bg-[#FEF9C3] text-[#854D0E] border-[#FEF08A]";
    case "Approved":
      return "bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]";
    case "Processing":
      return "bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-['Open_Sans']">
      <main className="flex-1 bg-[#f3f4f6]/5 px-4 md:px-8 lg:px-32 py-8">
        <section className="bg-[#9ECAD6]/10 rounded-xl p-6 md:p-12 mb-8 flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-6">
            <button
              type="button"
              className="w-full h-[110px] bg-[#9ECAD6] hover:bg-[#8dbbc8] transition-colors rounded-lg shadow-sm flex items-center justify-center gap-2 text-[#19191F] font-semibold text-xl md:text-2xl"
            >
              <Image src="/assets/IMG_4.svg" width={24} height={24} className="w-6 h-6" alt="Plus" />
              Create Purchase Request
            </button>
            <button
              type="button"
              className="w-full h-[110px] bg-[#9ECAD6] hover:bg-[#8dbbc8] transition-colors rounded-lg shadow-sm flex items-center justify-center gap-2 text-[#19191F] font-semibold text-xl md:text-2xl"
            >
              <Image src="/assets/IMG_5.svg" width={24} height={24} className="w-6 h-6" alt="Truck" />
              Track package
            </button>
          </div>

          <div className="w-full lg:w-[380px] bg-white rounded-2xl border border-[#dee1e6] p-6 relative overflow-hidden shadow-sm">
            <div className="relative z-10">
              <p className="text-[12px] font-bold text-[#9ECAD6] tracking-[0.6px] uppercase mb-2">Active Promotion</p>
              <h3 className="font-[Oswald] text-xl font-semibold text-[#171a1f] mb-4">Express Intra-Asia Shipping</h3>
              <p className="text-sm text-[#565d6d] leading-relaxed mb-6 max-w-[240px]">
                Get 15% off on all urgent requests to HCM and Singapore hubs this month.
              </p>
              <button type="button" className="flex items-center gap-1 text-[#9ECAD6] font-semibold text-sm hover:underline">
                Learn more
                <Image src="/assets/IMG_6.svg" width={14} height={14} className="w-3.5 h-3.5" alt="External Link" />
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Image src="/assets/IMG_5.svg" width={176} height={176} className="w-44 h-44" alt="Truck Background" />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Pending Approval", value: "12", color: "#FACC15", bgColor: "#FEF9C3", icon: "IMG_7.svg" },
            { label: "Approved & Active", value: "45", color: "#22C55E", bgColor: "#DCFCE7", icon: "IMG_8.svg" },
            { label: "In Processing", value: "08", color: "#3B82F6", bgColor: "#DBEAFE", icon: "IMG_9.svg" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border-l-4 overflow-hidden flex items-center p-6"
              style={{ borderLeftColor: stat.color }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                style={{ backgroundColor: stat.bgColor }}
              >
                <Image src={`/assets/${stat.icon}`} width={24} height={24} alt={stat.label} className="w-6 h-6" />
              </div>
              <div>
                <p className="font-[Oswald] text-2xl font-bold text-[#171a1f] leading-none">{stat.value}</p>
                <p className="text-[12px] font-bold text-[#565d6d] tracking-[0.6px] uppercase mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
              <div>
                <h2 className="font-[Oswald] text-[28px] font-bold text-[#171a1f]">Purchase History</h2>
                <p className="text-sm text-[#565d6d]">Manage and track your recent procurement requests.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="h-9 px-4 bg-white border border-[#dee1e6] rounded-md flex items-center gap-2 text-sm font-medium text-[#171a1f]"
                >
                  <Icon icon="lucide:filter" className="w-4 h-4" />
                  Status
                </button>
                <button
                  type="button"
                  className="h-9 px-4 bg-white border border-[#dee1e6] rounded-md flex items-center gap-2 text-sm font-medium text-[#171a1f]"
                >
                  <Image src="/assets/IMG_11.svg" width={16} height={16} className="w-4 h-4" alt="Calendar" />
                  Date Range
                </button>
                <button type="button" className="text-[#9ECAD6] font-bold text-base px-2 hover:underline">
                  View All
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-[#dee1e6]/50 overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#F9FAFB] border-b border-[#dee1e6]">
                    <tr>
                      <th className="px-4 py-3.5 text-sm font-semibold text-[#565d6d]">Request ID</th>
                      <th className="px-4 py-3.5 text-sm font-semibold text-[#565d6d]">Product</th>
                      <th className="px-4 py-3.5 text-sm font-semibold text-[#565d6d] text-center">Qty</th>
                      <th className="px-4 py-3.5 text-sm font-semibold text-[#565d6d]">Destination</th>
                      <th className="px-4 py-3.5 text-sm font-semibold text-[#565d6d]">Status</th>
                      <th className="px-4 py-3.5 text-sm font-semibold text-[#565d6d] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dee1e6]/50">
                    {purchaseRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-sm font-bold text-[#171a1f]">{req.id}</td>
                        <td className="px-4 py-4 text-sm text-[#171a1f]">{req.product}</td>
                        <td className="px-4 py-4 text-sm text-[#171a1f] text-center">{req.qty}</td>
                        <td className="px-4 py-4 text-sm text-[#171a1f]">
                          <div className="flex items-center gap-1.5">
                            <Image src="/assets/IMG_14.svg" width={12} height={12} className="w-3 h-3" alt="Pin" />
                            {req.destination}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[12px] font-semibold border ${getStatusStyles(req.status)}`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button type="button" className="p-1.5 hover:bg-gray-100 rounded-md">
                              <Image src="/assets/IMG_12.svg" width={16} height={16} className="w-4 h-4" alt="View" />
                            </button>
                            <button type="button" className="p-1.5 hover:bg-gray-100 rounded-md">
                              <Image src="/assets/IMG_13.svg" width={16} height={16} className="w-4 h-4" alt="More" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="w-full lg:w-[320px] flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-[#dee1e6]/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-[Oswald] text-lg font-semibold text-[#171a1f]">Latest Request Detail</h3>
                <span className="bg-[#f3f4f6] text-[#171a1f] text-[10px] font-bold px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-sm text-[#565d6d] mb-6">Details for PR-2024-001</p>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-[#565d6d]">Product:</span>
                  <span className="text-[#171a1f] font-medium text-right max-w-[140px]">Logitech MX Master 3S</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#565d6d]">Quantity:</span>
                  <span className="text-[#171a1f] font-medium">5 units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#565d6d]">Warehouse:</span>
                  <span className="text-[#171a1f] font-medium">HCM Hub</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#565d6d]">Date Created:</span>
                  <span className="text-[#171a1f] font-medium">Oct 24, 2023</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
