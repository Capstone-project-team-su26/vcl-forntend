"use client";

import { useEffect, useState } from "react";
import * as staffService from "@/shared/services/staffService";
import { Icon } from '@iconify/react';

export default function DomesticWarehouseSection() {
  const [data, setData] = useState({ stats: [], outboundShipments: [] });
   const stats = [
    { label: 'INCOMING', value: '12', subtext: '4 arriving today', icon: './assets/IMG_11.svg', color: 'bg-[#9ECAD6]/20', iconColor: 'text-[#9ECAD6]' },
    { label: 'IN STORAGE', value: '03', subtext: 'Scheduled for tomorrow', icon: './assets/IMG_10.svg', color: 'bg-[#748DAE]/20', iconColor: 'text-[#748DAE]' },
    { label: 'IN SHIPMENT', value: '03', subtext: 'Scheduled for tomorrow', icon: './assets/IMG_10.svg', color: 'bg-[#748DAE]/20', iconColor: 'text-[#748DAE]' },
  ];

  const tableData = [
    { id: 'SW-90234', recipient: 'Sarah Jenkins', destination: 'London, UK', status: 'In Transit', date: 'Oct 24, 2024', statusColor: 'bg-[#9ECAD6]/15 text-[#9ECAD6]' },
    { id: 'SW-90112', recipient: 'TechnoCorp Ltd', destination: 'Tokyo, JP', status: 'Delivered', date: 'Oct 22, 2024', statusColor: 'text-[#16181D]' },
    { id: 'SW-89982', recipient: 'Michael Chen', destination: 'San Francisco, US', status: 'Pending', date: 'Oct 25, 2024', statusColor: 'text-[#16181D]' },
    { id: 'SW-89551', recipient: 'Global Logistics', destination: 'Berlin, DE', status: 'On Hold', date: 'Oct 21, 2024', statusColor: 'bg-[#F5CBCB]/15 text-[#F5CBCB]' },
    { id: 'SW-89400', recipient: 'Anna Schmidt', destination: 'Munich, DE', status: 'Delivered', date: 'Oct 20, 2024', statusColor: 'text-[#16181D]' },
  ];


  useEffect(() => {
    staffService.getDomesticWarehouseData().then(setData);
  }, []);

  return (
     <div className="flex min-h-screen bg-white font-['Open_Sans'] text-[#575E6B]">
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <section>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-[#16181D] normal-case">
                Welcome back, <span className="font-sans text-[#748DAE]">Alex</span>
              </h1>
              <p className="text-lg font-medium mt-2">
                You have <span className="text-[#9ECAD6] font-bold">12 Package</span> incoming today.
              </p>
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[10px] shadow-sm border border-gray-50 flex justify-between items-start">
                  <div>
                    <p className="text-[14px] font-medium tracking-wider uppercase text-[#575E6B]">{stat.label}</p>
                    <p className="font-['Oswald'] text-3xl font-bold text-[#16181D] mt-2">{stat.value}</p>
                    <p className="text-[12px] font-medium text-[#575E6B] mt-2">{stat.subtext}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-full ${stat.color} flex items-center justify-center`}>
                    <img src={stat.icon} className={`w-6 h-6 ${stat.iconColor}`} alt={stat.label} />
                  </div>
                </div>
              ))}
            </section>

            {/* Action Cards */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#9ECAD6] rounded-xl p-6 flex items-center gap-6 text-white cursor-pointer hover:opacity-95 transition-opacity">
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <img src="./assets/IMG_12.svg" className="w-8 h-8" alt="Search" />
                </div>
                <div className="flex-1">
                  <h3 className="font-['Oswald'] text-xl font-bold text-white normal-case tracking-normal">Finding package</h3>
                  <p className="text-sm font-medium text-white/80">Enter package ID to get package information</p>
                </div>
                <img src="./assets/IMG_13.svg" className="w-6 h-6 opacity-50" alt="Arrow" />
              </div>
              <div className="bg-[#748DAE] rounded-xl p-6 flex items-center gap-6 text-white cursor-pointer hover:opacity-95 transition-opacity">
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <img src="./assets/IMG_12.svg" className="w-8 h-8" alt="Track" />
                </div>
                <div className="flex-1">
                  <h3 className="font-['Oswald'] text-xl font-bold text-white normal-case tracking-normal">Track Shipment</h3>
                  <p className="text-sm font-medium text-white/80">Enter a tracking ID to get real-time updates.</p>
                </div>
                <img src="./assets/IMG_13.svg" className="w-6 h-6 opacity-50" alt="Arrow" />
              </div>
            </section>

            {/* Table Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-[#16181D] normal-case tracking-normal">Incoming Package</h2>
                <button className="px-6 py-2 border border-[#748DAE]/30 rounded-lg text-[#748DAE] font-bold text-sm hover:bg-gray-50 transition-colors">
                  View All
                </button>
              </div>
              <div className="bg-white rounded-[10px] shadow-sm border border-gray-50 overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#16181D]">Tracking ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#16181D]">Recipient</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#16181D]">Destination</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-[#16181D]">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-[#16181D]">Est. Delivery</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-[#565d6d] font-['Oswald']">87 ₫</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tableData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-[#748DAE]">{row.id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-[#16181D]">{row.recipient}</td>
                        <td className="px-6 py-4 text-sm text-[#575E6B]">{row.destination}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center px-3 py-0.5 rounded-full text-[12px] font-bold ${row.statusColor}`}>
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
            <section>
              <h2 className="text-2xl font-extrabold text-[#16181D] normal-case tracking-normal mb-6">Report</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1 */}
                <div className="bg-[#F4F9FA] p-6 rounded-[10px] shadow-sm border border-gray-50">
                  <div className="relative h-44 mb-6">
                    <img src="./assets/IMG_14.svg" className="w-full h-full object-contain" alt="Chart" />
                    {/* Simplified Chart Labels Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-between text-[11px] text-[#171a1f] pointer-events-none">
                      <div className="flex flex-col gap-6">
                        <span>16</span><span>12</span><span>8</span><span>4</span><span>0</span>
                      </div>
                    </div>
                    <div className="absolute bottom-[-20px] left-0 right-0 flex justify-around text-[11px] text-[#16181D]">
                      <span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-8">
                    <img src="./assets/IMG_15.svg" className="w-5 h-5 text-[#2C5B68]" alt="Trend" />
                    <span className="text-lg font-bold text-[#2C5B68] tracking-tight">Monthly Incoming Shipment</span>
                  </div>
                </div>

                {/* Chart 2 */}
                <div className="bg-[#F4F9FA] p-6 rounded-[10px] shadow-sm border border-gray-50">
                  <div className="relative h-44 mb-6">
                    <img src="./assets/IMG_14.svg" className="w-full h-full object-contain" alt="Chart" />
                    <div className="absolute inset-0 flex flex-col justify-between text-[11px] text-[#171a1f] pointer-events-none">
                      <div className="flex flex-col gap-6">
                        <span>16</span><span>12</span><span>8</span><span>4</span><span>0</span>
                      </div>
                    </div>
                    <div className="absolute bottom-[-20px] left-0 right-0 flex justify-around text-[11px] text-[#16181D]">
                      <span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-8">
                    <img src="./assets/IMG_15.svg" className="w-5 h-5 text-[#2C5B68]" alt="Trend" />
                    <span className="text-lg font-bold text-[#2C5B68] tracking-tight">Monthly Purchase request</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>

  );
}
