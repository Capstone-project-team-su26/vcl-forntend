"use client"
import { Icon } from '@iconify/react';
import { useState } from 'react';

export default function OperationalDashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const recentActivity = [
    { id: 'SW-90234', recipient: 'Sarah Jenkins', destination: 'London, UK', status: 'In Transit', date: 'Oct 24, 2024', statusColor: 'text-[#9ECAD6] bg-[#9ECAD6]/15' },
    { id: 'SW-90112', recipient: 'TechnoCorp Ltd', destination: 'Tokyo, JP', status: 'Delivered', date: 'Oct 22, 2024', statusColor: 'text-[#16181D]' },
    { id: 'SW-89982', recipient: 'Michael Chen', destination: 'San Francisco, US', status: 'Pending', date: 'Oct 25, 2024', statusColor: 'text-[#16181D]' },
    { id: 'SW-89551', recipient: 'Global Logistics', destination: 'Berlin, DE', status: 'On Hold', date: 'Oct 21, 2024', statusColor: 'text-[#F5CBCB] bg-[#F5CBCB]/15' },
    { id: 'SW-89400', recipient: 'Anna Schmidt', destination: 'Munich, DE', status: 'Delivered', date: 'Oct 20, 2024', statusColor: 'text-[#16181D]' },
  ];

  return (
    <div className="flex min-h-screen bg-white font-['Open_Sans'] text-[#16181D]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#F9FAFB] border-r border-[#F3F4F6] transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-[#F3F4F6]">
            <div className="w-8 h-8 bg-[#9ECAD6] rounded-md flex items-center justify-center mr-3">
              <img src="./assets/IMG_1.svg" alt="Logo" className="w-[22px] h-[22px]" />
            </div>
            <span className="font-['Oswald'] text-xl font-black text-[#9ECAD6] tracking-tight">SwiftShip</span>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#9ECAD6]/10 rounded-lg text-[#9ECAD6] font-semibold text-sm">
              <img src="./assets/IMG_2.svg" className="w-5 h-5" alt="Dashboard" />
              Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[#575E6B] hover:bg-gray-100 rounded-lg font-semibold text-sm transition-colors">
              <img src="./assets/IMG_3.svg" className="w-5 h-5" alt="Transfer" />
              Transfer Package
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[#575E6B] hover:bg-gray-100 rounded-lg font-semibold text-sm transition-colors">
              <img src="./assets/IMG_4.svg" className="w-5 h-5" alt="Track" />
              Track & Receive
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[#575E6B] hover:bg-gray-100 rounded-lg font-semibold text-sm transition-colors">
              <img src="./assets/IMG_5.svg" className="w-5 h-5" alt="Pricing" />
              Pricing & Services
            </button>
          </nav>

          {/* Bottom Nav */}
          <div className="p-4 border-t border-[#F3F4F6] space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-2 text-[#575E6B] hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors">
              <img src="./assets/IMG_6.svg" className="w-5 h-5" alt="Settings" />
              Settings
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-[#D92644] hover:bg-red-50 rounded-lg font-medium text-sm transition-colors">
              <img src="./assets/IMG_7.svg" className="w-5 h-5" alt="Sign Out" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#F3F4F6] flex items-center justify-between px-4 lg:px-8 shrink-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-gray-600">
            <Icon icon="lucide:menu" className="w-6 h-6" />
          </button>

          <div className="flex items-center ml-auto gap-4 lg:gap-6">
            <div className="relative">
              <img src="./assets/IMG_9.svg" className="w-5 h-5 text-[#16181D]" alt="Notifications" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-[#D92644] border-2 border-white rounded-full"></div>
            </div>
            <div className="h-8 w-px bg-[#F3F4F6] hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">Alex Henderson</p>
                <p className="text-[12px] text-[#575E6B] mt-1">Premium Member</p>
              </div>
              <div className="relative w-9 h-9">
                <img src="./assets/IMG_8.webp" className="w-full h-full rounded-full object-cover" alt="User" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C358] border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 space-y-8">
          {/* Welcome Section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight">
                Welcome back, <span className="text-[#748DAE] font-sans uppercase-none">Alex</span>
              </h1>
              <p className="text-[#575E6B] text-lg font-medium mt-2">
                You have <span className="text-[#9ECAD6] font-bold">12 active shipments</span> in transit today.
              </p>
            </div>
            <button className="flex items-center justify-center gap-3 bg-[#9ECAD6] text-white px-6 py-2.5 rounded-lg shadow-[0px_2px_4px_0px_#9ECAD633] font-bold text-sm hover:bg-[#8dbbc7] transition-colors w-full lg:w-auto">
              <img src="./assets/IMG_10.svg" className="w-4 h-4 brightness-0 invert" alt="Map" />
              View Map Tracking
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Active Shipments', value: '12', sub: '4 arriving today', icon: './assets/IMG_11.svg', bg: 'bg-[#9ECAD6]/20', iconColor: 'text-[#9ECAD6]' },
              { label: 'Pending Pickups', value: '03', sub: 'Scheduled for tomorrow', icon: './assets/IMG_12.svg', bg: 'bg-[#748DAE]/20', iconColor: 'text-[#748DAE]' },
              { label: 'Loyalty Points', value: '4,850', sub: '250 points to Gold status', icon: './assets/IMG_13.svg', bg: 'bg-[#F5CBCB]/20', iconColor: 'text-[#F5CBCB]' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-[0px_2px_4px_0px_#00000012] flex justify-between items-start">
                <div>
                  <p className="text-[14px] font-medium text-[#575E6B] tracking-wider uppercase">{stat.label}</p>
                  <p className="text-3xl font-bold font-['Oswald'] mt-2">{stat.value}</p>
                  <p className="text-[12px] text-[#575E6B] mt-2 font-medium">{stat.sub}</p>
                </div>
                <div className={`w-14 h-14 rounded-full ${stat.bg} flex items-center justify-center`}>
                  <img src={stat.icon} className="w-6 h-6" alt={stat.label} />
                </div>
              </div>
            ))}
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#9ECAD6] p-6 rounded-xl flex items-center gap-6 relative group cursor-pointer">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <img src="./assets/IMG_14.svg" className="w-8 h-8 brightness-0 invert" alt="Add" />
              </div>
              <div className="flex-1">
                <h3 className="text-white text-xl font-bold font-['Oswald']">Start New Transfer</h3>
                <p className="text-white/80 text-sm font-medium mt-1">Calculate rates and ship your package instantly.</p>
              </div>
              <img src="./assets/IMG_15.svg" className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity" alt="Arrow" />
            </div>

            <div className="bg-[#748DAE] p-6 rounded-xl flex items-center gap-6 relative group cursor-pointer">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <img src="./assets/IMG_10.svg" className="w-8 h-8 brightness-0 invert" alt="Search" />
              </div>
              <div className="flex-1">
                <h3 className="text-white text-xl font-bold font-['Oswald']">Track Shipment</h3>
                <p className="text-white/80 text-sm font-medium mt-1">Enter a tracking ID to get real-time updates.</p>
              </div>
              <img src="./assets/IMG_15.svg" className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity" alt="Arrow" />
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Recent Activity Table */}
            <div className="xl:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold font-['Oswald']">Recent Activity</h2>
                <button className="px-4 py-2 border border-[#748DAE]/30 rounded-lg text-[#748DAE] font-bold text-sm hover:bg-gray-50 transition-colors">
                  View All Activity
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-[0px_2px_4px_0px_#00000012] overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-50">
                        <th className="px-6 py-4 text-sm font-bold">Tracking ID</th>
                        <th className="px-6 py-4 text-sm font-bold">Recipient</th>
                        <th className="px-6 py-4 text-sm font-bold">Destination</th>
                        <th className="px-6 py-4 text-sm font-bold">Status</th>
                        <th className="px-6 py-4 text-sm font-bold text-right">Est. Delivery</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentActivity.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-[#748DAE]">{row.id}</td>
                          <td className="px-6 py-4 text-sm font-medium">{row.recipient}</td>
                          <td className="px-6 py-4 text-sm text-[#575E6B]">{row.destination}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${row.statusColor || 'bg-transparent'}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-right">{row.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Insights Sidebar */}
            <div className="xl:col-span-4 space-y-6">
              <h2 className="text-2xl font-extrabold font-['Oswald']">Insights</h2>
              
              {/* Surcharge Trends Card */}
              <div className="bg-[#F4F9FA] p-6 rounded-xl shadow-[0px_2px_4px_0px_#00000012]">
                <div className="flex items-center gap-2 mb-1">
                  <img src="./assets/IMG_16.svg" className="w-5 h-5 text-[#2C5B68]" alt="Trends" />
                  <h3 className="text-[#2C5B68] text-lg font-bold tracking-tight">Surcharge Trends</h3>
                </div>
                <p className="text-[#2C5B68]/70 text-sm mb-6">Global fuel adjustment rates</p>
                
                {/* Chart Placeholder */}
                <div className="relative h-44 mb-6">
                  <img src="./assets/IMG_17.svg" className="w-full h-full object-contain" alt="Chart" />
                </div>

                <div className="pt-4 border-t border-[#9ECAD6]/10 flex items-center justify-between">
                  <span className="text-[#2C5B68] text-sm font-semibold">Current Rate</span>
                  <span className="bg-[#9ECAD6]/20 text-[#9ECAD6] px-3 py-1 rounded-full text-[12px] font-bold">13.8%</span>
                </div>
              </div>

              {/* Promo Card */}
              <div className="bg-[#F5CBCB]/10 p-6 rounded-xl shadow-[0px_2px_4px_0px_#00000012] flex gap-4">
                <div className="w-12 h-12 bg-[#F5CBCB] rounded-xl flex items-center justify-center shrink-0">
                  <img src="./assets/IMG_18.svg" className="w-6 h-6 brightness-0 invert" alt="Promo" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-['Oswald']">Holiday Promo</h3>
                  <p className="text-[#575E6B] text-sm mt-1 leading-relaxed">
                    Save 15% on all Express shipments to Asia using code <span className="text-[#748DAE] font-bold">FESTIVE15</span>.
                  </p>
                  <button className="mt-4 flex items-center gap-2 text-[#748DAE] font-bold text-sm hover:underline">
                    Redeem Offer
                    <img src="./assets/IMG_19.svg" className="w-4 h-4" alt="Arrow" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="h-12 bg-[#F3F4F6]/30 border-t border-[#F3F4F6] flex items-center justify-between px-4 lg:px-8 shrink-0">
          <p className="text-[12px] text-[#575E6B]">© 2024 SwiftShip Logistics Inc. All rights reserved.</p>
          <div className="hidden md:flex items-center gap-6">
            <button className="text-[12px] text-[#575E6B] hover:text-[#16181D]">Support Center</button>
            <button className="text-[12px] text-[#575E6B] hover:text-[#16181D]">Terms of Service</button>
            <button className="text-[12px] text-[#575E6B] hover:text-[#16181D]">Privacy Policy</button>
          </div>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}