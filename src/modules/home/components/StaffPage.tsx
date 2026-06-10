"use client"
import { Icon } from '@iconify/react';
import { useState } from 'react';

export function StaffPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { icon: './assets/IMG_2.svg', label: 'Dashboard', active: true },
    { icon: './assets/IMG_3.svg', label: 'Transfer Package', active: false },
    { icon: './assets/IMG_4.svg', label: 'Track & Receive', active: false },
    { icon: './assets/IMG_5.svg', label: 'Pricing & Services', active: false },
  ];

  const stats = [
    { icon: './assets/IMG_1.svg', label: 'Active Shipments', value: '12', trend: '+2 this week', iconBg: 'bg-[#9ECAD6]/20', iconColor: 'text-[#9ECAD6]' },
    { icon: './assets/IMG_10.svg', label: 'Pending Pickups', value: '04', trend: 'On schedule', iconBg: 'bg-transparent', iconColor: 'text-[#16181D]' },
    { icon: './assets/IMG_15.svg', label: 'Total Delivered', value: '1,284', trend: '+12% vs last month', iconBg: 'bg-transparent', iconColor: 'text-[#16181D]' },
    { icon: './assets/IMG_16.svg', label: 'Loyalty Points', value: '2,450', trend: 'Gold Tier', iconBg: 'bg-[#748DAE]/20', iconColor: 'text-[#748DAE]' },
  ];

  const transfers = [
    { id: 'SS-9402', status: 'In Transit', route: ['Mumbai', 'Dubai'], type: 'EXPRESS', typeIcon: './assets/IMG_16.svg', eta: '24 Oct' },
    { id: 'SS-8122', status: 'Processing', route: ['Chennai', 'Singapore'], type: 'STANDARD', typeIcon: './assets/IMG_18.svg', eta: '26 Oct' },
    { id: 'SS-7731', status: 'Delivered', route: ['London', 'Bengaluru'], type: 'FREIGHT', typeIcon: './assets/IMG_19.svg', eta: '21 Oct' },
    { id: 'SS-6549', status: 'Pending', route: ['New York', 'New Delhi'], type: 'EXPRESS', typeIcon: './assets/IMG_16.svg', eta: '28 Oct' },
    { id: 'SS-5510', status: 'Out for Delivery', route: ['Kolkata', 'Paris'], type: 'STANDARD', typeIcon: './assets/IMG_18.svg', eta: 'Today' },
  ];

  return (
    <div className="flex min-h-screen bg-white font-open-sans text-[#16181D]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#F9FAFB] border-r border-[#f3f4f6] transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-[#f3f4f6]">
            <div className="w-8 h-8 bg-[#9ECAD6] rounded-md flex items-center justify-center mr-3">
              <img src="./assets/IMG_1.svg" alt="Logo" className="w-5.5 h-5.5 text-white" />
            </div>
            <span className="font-oswald text-xl font-black text-[#9ECAD6] tracking-tight">SwiftShip</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item, idx) => (
              <button
                key={idx}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  item.active ? 'bg-[#9ECAD6]/10 text-[#9ECAD6]' : 'text-[#575E6B] hover:bg-gray-100'
                }`}
              >
                <img src={item.icon} alt={item.label} className={`w-5 h-5 ${item.active ? 'text-[#9ECAD6]' : 'text-[#575E6B]'}`} />
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-[#f3f4f6] space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-2 text-[#575E6B] hover:bg-gray-100 rounded-lg transition-colors">
              <img src="./assets/IMG_6.svg" alt="Settings" className="w-5 h-5" />
              <span className="text-sm font-medium">Settings</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-[#D92644] hover:bg-red-50 rounded-lg transition-colors">
              <img src="./assets/IMG_7.svg" alt="Sign Out" className="w-5 h-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#f3f4f6] flex items-center justify-between px-4 lg:px-8 shrink-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-gray-600">
            <Icon icon="lucide:menu" className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-6 ml-auto">
            <div className="relative">
              <img src="./assets/IMG_9.svg" alt="Notifications" className="w-5 h-5 text-[#16181D]" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#D92644] border-2 border-white rounded-full" />
            </div>
            <div className="hidden sm:block h-8 w-px bg-[#f3f4f6]" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">Alex Henderson</p>
                <p className="text-[12px] text-[#575E6B] mt-1">Premium Member</p>
              </div>
              <div className="relative">
                <img src="./assets/IMG_8.webp" alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C358] border-2 border-white rounded-full" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          <div className="p-4 lg:p-8 max-w-[1200px] mx-auto space-y-8">
            
            {/* Hero Section */}
            <section className="relative bg-[#F4F9FA] rounded-xl border border-[#9ECAD6]/20 p-6 lg:p-10 overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/50 border border-[#9ECAD6]/30 mb-6">
                  <span className="text-[10px] lg:text-[12px] font-bold text-[#9ECAD6] tracking-wider uppercase">Premium Account Activated</span>
                </div>
                <h1 className="font-oswald text-3xl lg:text-[36px] font-black leading-tight tracking-tight mb-4">
                  Welcome back, Alex.<br />
                  Your logistics, <span className="text-[#9ECAD6] font-open-sans normal-case tracking-normal">simplified.</span>
                </h1>
                <p className="text-[#575E6B] text-base lg:text-lg font-medium mb-8">
                  You have <span className="text-[#16181D] font-bold">3 shipments</span> arriving today. Track your packages or start a new transfer below.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex items-center gap-4 bg-[#9ECAD6] text-white p-4 rounded-xl shadow-lg shadow-[#9ECAD6]/20 hover:bg-[#8dbbc8] transition-all group">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                      <img src="./assets/IMG_11.svg" alt="Plus" className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg leading-none mb-1">Transfer Package</p>
                      <p className="text-xs text-white/80">Send items globally in minutes</p>
                    </div>
                  </button>
                  
                  <button className="flex items-center gap-4 bg-white border border-[#f3f4f6] p-4 rounded-xl hover:border-[#9ECAD6]/30 transition-all group">
                    <div className="w-12 h-12 bg-[#9ECAD6]/10 rounded-lg flex items-center justify-center shrink-0">
                      <img src="./assets/IMG_12.svg" alt="Map Pin" className="w-6 h-6 text-[#9ECAD6]" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg leading-none mb-1">Track Shipment</p>
                      <p className="text-xs text-[#575E6B]/80">Real-time parcel location</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-10 right-10 hidden lg:block">
                <div className="relative w-[340px] h-[260px] bg-[#9ECAD6]/10 rounded-xl border-4 border-dashed border-[#9ECAD6]/20 flex items-center justify-center">
                  <img src="./assets/IMG_1.svg" alt="Package" className="w-32 h-32 opacity-45 text-[#9ECAD6]" />
                  <div className="absolute -top-4 -left-4 bg-white shadow-xl rounded-lg px-4 py-2 border border-[#f3f4f6] flex items-center gap-2">
                    <img src="./assets/IMG_10.svg" alt="Clock" className="w-4 h-4" />
                    <span className="text-xs font-bold">Fast Delivery</span>
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-white shadow-xl rounded-lg px-4 py-2 border border-[#f3f4f6] flex items-center gap-2">
                    <img src="./assets/IMG_13.svg" alt="Shield" className="w-4 h-4" />
                    <span className="text-xs font-bold">Insured</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-50 flex flex-col justify-between h-40">
                  <div className="flex justify-between items-start">
                    <div className={`w-9 h-9 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                      <img src={stat.icon} alt={stat.label} className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                    <div className="flex items-center gap-1">
                      <img src="./assets/IMG_14.svg" alt="Trend" className="w-3 h-3" />
                      <span className="text-[12px] font-bold">{stat.trend}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#575E6B] mb-1">{stat.label}</p>
                    <p className="font-oswald text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              ))}
            </section>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Transfers */}
              <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-oswald text-xl font-bold mb-1">Recent Transfers</h2>
                    <p className="text-sm text-[#575E6B]">Status update for your last 5 shipments</p>
                  </div>
                  <button className="flex items-center gap-1 text-[#9ECAD6] font-bold text-sm hover:underline">
                    View All <img src="./assets/IMG_17.svg" alt="Arrow" className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="text-left border-b border-[#f3f4f6]">
                        <th className="pb-3 text-sm font-bold">Tracking ID</th>
                        <th className="pb-3 text-sm font-bold">Status</th>
                        <th className="pb-3 text-sm font-bold">Route</th>
                        <th className="pb-3 text-sm font-bold">Type</th>
                        <th className="pb-3 text-sm font-bold text-right">ETA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f3f4f6]">
                      {transfers.map((row, idx) => (
                        <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 text-sm font-bold text-[#9ECAD6]">{row.id}</td>
                          <td className="py-4">
                            <span className={`inline-block px-3 py-1 rounded-lg text-[12px] font-semibold ${
                              row.status === 'Out for Delivery' ? 'bg-[#9ECAD6] text-white' : 
                              row.status === 'Pending' ? 'bg-[#f3f4f6] text-[#575E6B]' : 
                              'border border-[#f3f4f6] text-[#16181D]'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <span>{row.route[0]}</span>
                              <img src="./assets/IMG_17.svg" alt="to" className="w-3 h-3 opacity-30" />
                              <span>{row.route[1]}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <img src={row.typeIcon} alt={row.type} className="w-3 h-3 text-[#9ECAD6]" />
                              <span className="text-[12px] font-bold text-[#575E6B] tracking-wider uppercase">{row.type}</span>
                            </div>
                          </td>
                          <td className="py-4 text-sm font-bold text-right">{row.eta}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Sidebar Widgets */}
              <div className="space-y-8">
                {/* Pricing Insights */}
                <section className="bg-[#E9F3F6] rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <img src="./assets/IMG_15.svg" alt="Trending" className="w-5 h-5 text-[#9ECAD6]" />
                    <h2 className="font-oswald text-lg font-bold uppercase tracking-tight">Pricing Insights</h2>
                  </div>
                  <p className="text-sm text-[#575E6B] mb-6">Live fuel surcharges & promo rates</p>
                  
                  <div className="bg-white/60 rounded-xl p-4 border border-[#9ECAD6]/10 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-[#575E6B] tracking-wider">FUEL SURCHARGE</span>
                      <span className="text-[12px] font-black text-[#D92644]">+4.2%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D92644]" style={{ width: '42%' }} />
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between pb-4 border-b border-[#9ECAD6]/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#9ECAD6]/20 rounded flex items-center justify-center">
                          <img src="./assets/IMG_11.svg" alt="Plus" className="w-4 h-4 text-[#9ECAD6]" />
                        </div>
                        <span className="text-sm font-bold">Standard Air</span>
                      </div>
                      <span className="text-sm font-black">$8.50/kg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#748DAE]/20 rounded flex items-center justify-center">
                          <img src="./assets/IMG_11.svg" alt="Plus" className="w-4 h-4 text-[#748DAE]" />
                        </div>
                        <span className="text-sm font-bold">Sea Freight</span>
                      </div>
                      <span className="text-sm font-black">$2.20/kg</span>
                    </div>
                  </div>

                  <button className="w-full py-2.5 bg-white border border-[#9ECAD6]/30 rounded-lg text-[#9ECAD6] font-bold text-sm hover:bg-gray-50 transition-colors">
                    Compare All Services
                  </button>
                </section>

                {/* SwiftRewards */}
                <section className="relative bg-[#F5F7F9] rounded-xl p-6 shadow-sm overflow-hidden">
                  {/* Decorative circle */}
                  <div className="absolute -top-5 -right-5 w-24 h-24 bg-[#748DAE]/10 rounded-full" />
                  
                  <h2 className="font-oswald text-lg font-bold mb-4 text-[#16181D]">SwiftRewards</h2>
                  <p className="text-sm font-medium text-[#575E6B] leading-relaxed mb-6">
                    Ship <span className="text-[#16181D] font-black">2 more items</span> this month to unlock Free Insurance on all Express transfers!
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 bg-[#748DAE]/20 rounded-full overflow-hidden">
                      <div className="h-full bg-[#748DAE]" style={{ width: '60%' }} />
                    </div>
                    <span className="text-xs font-black text-[#16181D]">3/5</span>
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-auto border-t border-[#f3f4f6] bg-[#f3f4f6]/30 px-4 lg:px-8 py-4">
            <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-[12px] text-[#575E6B]">© 2024 SwiftShip Logistics Inc. All rights reserved.</p>
              <div className="flex gap-6">
                <button className="text-[12px] text-[#575E6B] hover:text-[#16181D]">Support Center</button>
                <button className="text-[12px] text-[#575E6B] hover:text-[#16181D]">Terms of Service</button>
                <button className="text-[12px] text-[#575E6B] hover:text-[#16181D]">Privacy Policy</button>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}