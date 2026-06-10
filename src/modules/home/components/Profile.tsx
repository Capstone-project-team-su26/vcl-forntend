"use client"
import { Icon } from '@iconify/react';
import { useState } from 'react';

export function ProfilePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white font-['Open_Sans'] text-[#575E6B]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#F9FAFB] border-r border-[#f3f4f6] transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-16 flex items-center px-6 border-b border-[#f3f4f6]">
            <div className="w-8 h-8 bg-[#9ECAD6] rounded-md flex items-center justify-center mr-3">
              <img src="./assets/IMG_1.svg" alt="Logo" className="w-5.5 h-5.5 text-white" />
            </div>
            <span className="font-['Oswald'] text-xl font-black text-[#9ECAD6] tracking-tight">SwiftShip</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#9ECAD6]/10 rounded-lg text-[#9ECAD6] font-semibold text-sm">
              <img src="./assets/IMG_2.svg" className="w-5 h-5" alt="Dashboard" />
              Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg text-[#575E6B] font-semibold text-sm transition-colors">
              <img src="./assets/IMG_3.svg" className="w-5 h-5" alt="Transfer" />
              Transfer Package
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg text-[#575E6B] font-semibold text-sm transition-colors">
              <img src="./assets/IMG_4.svg" className="w-5 h-5" alt="Track" />
              Track & Receive
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-lg text-[#575E6B] font-semibold text-sm transition-colors">
              <img src="./assets/IMG_5.svg" className="w-5 h-5" alt="Pricing" />
              Pricing & Services
            </button>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-[#f3f4f6] space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg text-[#575E6B] font-medium text-sm transition-colors">
              <img src="./assets/IMG_6.svg" className="w-5 h-5" alt="Settings" />
              Settings
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 rounded-lg text-[#D92644] font-medium text-sm transition-colors">
              <img src="./assets/IMG_7.svg" className="w-5 h-5" alt="Sign Out" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#f3f4f6] flex items-center justify-between px-4 lg:px-8 shrink-0">
          <button 
            className="lg:hidden p-2 text-gray-600"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Icon icon="lucide:menu" className="w-6 h-6" />
          </button>

          <div className="flex items-center ml-auto gap-4 lg:gap-6">
            <div className="relative">
              <img src="./assets/IMG_9.svg" className="w-5 h-5 text-[#16181D]" alt="Notifications" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#D92644] border-2 border-white rounded-full" />
            </div>
            
            <div className="hidden sm:block h-8 w-px bg-[#f3f4f6]" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#16181D] leading-none">Alex Henderson</p>
                <p className="text-[10px] lg:text-xs text-[#575E6B] mt-1">Premium Member</p>
              </div>
              <div className="relative w-9 h-9">
                <img src="./assets/IMG_8.webp" className="w-full h-full rounded-full object-cover" alt="User" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C358] border-2 border-white rounded-full" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#FFEAEA]/20 custom-scrollbar">
          <div className="max-w-7xl mx-auto p-4 lg:p-12">
            {/* Page Title Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5CBCB] rounded-full shadow-sm">
                  <div className="w-2 h-2 bg-[#748DAE] rounded-full" />
                  <span className="text-[10px] font-bold text-[#748DAE] tracking-wider uppercase">Account Setup In Progress</span>
                </div>
                <h1 className="text-4xl lg:text-[36px] font-black text-[#748DAE] tracking-tight leading-tight">Complete Your Profile</h1>
                <p className="text-lg text-[#575E6B] max-w-xl leading-relaxed">
                  Tailor your SwiftShip experience. These details help us provide accurate pricing and regional logistics support.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-white px-4 py-2.5 rounded-xl border border-[#f3f4f6] self-start lg:self-auto">
                <span className="text-sm font-semibold text-[#9ECAD6]">Step 1 of 2</span>
                <div className="w-24 h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-[#9ECAD6]" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              {/* Form Section */}
              <div className="xl:col-span-7 bg-white rounded-xl shadow-sm border border-[#f3f4f6] overflow-hidden">
                <div className="p-6 lg:p-8 border-b border-[#f3f4f6]">
                  <div className="flex items-center gap-3 mb-2">
                    <img src="./assets/IMG_10.svg" className="w-6 h-6 text-[#9ECAD6]" alt="Business" />
                    <h2 className="text-xl font-bold text-[#16181D]">Business Information</h2>
                  </div>
                  <p className="text-sm text-[#575E6B]">Provide the primary details for your logistics dashboard.</p>
                </div>

                <div className="p-6 lg:p-8 space-y-8">
                  {/* Account Strategy */}
                  <div>
                    <h3 className="text-xs font-bold text-[#575E6B] tracking-[1.4px] uppercase mb-4">Account Strategy</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button className="flex flex-col items-center justify-center p-6 border-2 border-[#f3f4f6] rounded-xl hover:bg-gray-50 transition-colors">
                        <img src="./assets/IMG_10.svg" className="w-8 h-8 text-[#748DAE] mb-3" alt="Personal" />
                        <span className="text-[10px] font-bold text-[#575E6B] tracking-wider uppercase">Personal</span>
                      </button>
                      <button className="flex flex-col items-center justify-center p-6 border-2 border-[#9ECAD6] bg-[#9ECAD6]/5 rounded-xl shadow-sm">
                        <img src="./assets/IMG_11.svg" className="w-8 h-8 text-[#9ECAD6] mb-3" alt="Business" />
                        <span className="text-[10px] font-bold text-[#9ECAD6] tracking-wider uppercase">Business</span>
                      </button>
                      <button className="flex flex-col items-center justify-center p-6 border-2 border-[#f3f4f6] rounded-xl hover:bg-gray-50 transition-colors">
                        <img src="./assets/IMG_12.svg" className="w-8 h-8 text-[#748DAE] mb-3" alt="Enterprise" />
                        <span className="text-[10px] font-bold text-[#575E6B] tracking-wider uppercase">Enterprise</span>
                      </button>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#16181D]">Legal Entity Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Acme Logistics Ltd" 
                        className="w-full px-4 py-2.5 bg-white border border-[#748DAE]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#9ECAD6]/20 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#16181D]">Tax Identification Number</label>
                      <input 
                        type="text" 
                        placeholder="XX-XXXXXXX" 
                        className="w-full px-4 py-2.5 bg-white border border-[#748DAE]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#9ECAD6]/20 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#16181D]">Primary Operating Region</label>
                      <input 
                        type="text" 
                        placeholder="United States" 
                        className="w-full px-4 py-2.5 bg-white border border-[#748DAE]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#9ECAD6]/20 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#16181D]">Logistics Contact Number</label>
                      <input 
                        type="text" 
                        placeholder="+1 (555) 000-0000" 
                        className="w-full px-4 py-2.5 bg-white border border-[#748DAE]/20 rounded-lg text-sm focus:ring-2 focus:ring-[#9ECAD6]/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Preferences Box */}
                  <div className="bg-[#FFEAEA]/30 border border-[#F5CBCB]/50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <img src="./assets/IMG_1.svg" className="w-5 h-5 text-[#748DAE]" alt="Package" />
                      <h3 className="font-['Oswald'] font-bold text-[#748DAE]">Default Shipping Preferences</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-4 h-4 border border-[#565d6d] rounded-sm bg-white group-hover:border-[#9ECAD6] transition-colors" />
                        <span className="text-sm font-medium text-[#16181D]">Auto-apply Fragile Tag</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-4 h-4 bg-[#9ECAD6] rounded-sm flex items-center justify-center">
                          <img src="./assets/IMG_13.svg" className="w-2.5 h-2.5" alt="Checked" />
                        </div>
                        <span className="text-sm font-medium text-[#16181D]">Default Insurance (Up to $500)</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-4 h-4 border border-[#565d6d] rounded-sm bg-white group-hover:border-[#9ECAD6] transition-colors" />
                        <span className="text-sm font-medium text-[#16181D]">Always Priority Sort</span>
                      </label>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-6 border-t border-[#748DAE]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] text-[#575E6B] italic max-w-[280px] text-center sm:text-left">
                      By proceeding, you agree to SwiftShip’s Logistics Master Agreement.
                    </p>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <button className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-[#748DAE] hover:bg-gray-50 rounded-lg transition-colors">
                        Save as Draft
                      </button>
                      <button className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-2.5 bg-[#9ECAD6] text-white rounded-lg font-bold text-sm shadow-md hover:bg-[#8dbbc8] transition-all">
                        Activate Account
                        <img src="./assets/IMG_14.svg" className="w-3.5 h-3.5" alt="Next" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Info Section */}
              <div className="xl:col-span-5 space-y-8">
                {/* Scale Card */}
                <div className="bg-white rounded-xl p-8 border border-[#748DAE]/10 shadow-sm relative overflow-hidden text-center">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFEAEA] rounded-full -mr-12 -mt-12" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#F5CBCB]/20 rounded-full -ml-8 -mb-8" />
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-[#9ECAD6]/20 blur-xl rounded-full" />
                      <img src="./assets/IMG_15.svg" className="w-20 h-20 text-[#748DAE] relative" alt="Truck" />
                      <div className="absolute bottom-0 right-0 w-11 h-11 bg-[#F5CBCB] rounded-xl border-2 border-white shadow-sm flex items-center justify-center">
                        <img src="./assets/IMG_16.svg" className="w-6 h-6 text-white" alt="Shield" />
                      </div>
                    </div>
                    <h3 className="font-['Oswald'] text-xl font-black text-[#748DAE] mb-3">Built for Scale</h3>
                    <p className="text-sm text-[#575E6B] leading-relaxed max-w-[260px]">
                      Our infrastructure manages over 2.4M shipments monthly with 99.8% on-time delivery.
                    </p>
                  </div>
                </div>

                {/* Feature List */}
                <div className="space-y-6 px-2">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 bg-[#748DAE]/10 rounded-xl flex items-center justify-center">
                      <img src="./assets/IMG_17.svg" className="w-6 h-6 text-[#748DAE]" alt="Card" />
                    </div>
                    <div>
                      <h4 className="font-['Oswald'] font-bold text-[#16181D]">Flexible Invoicing</h4>
                      <p className="text-sm text-[#575E6B] leading-relaxed mt-1">Net-30 billing cycles for verified business accounts with consolidated monthly statements.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 bg-[#748DAE]/10 rounded-xl flex items-center justify-center">
                      <img src="./assets/IMG_16.svg" className="w-6 h-6 text-[#748DAE]" alt="Insurance" />
                    </div>
                    <div>
                      <h4 className="font-['Oswald'] font-bold text-[#16181D]">Transit Insurance</h4>
                      <p className="text-sm text-[#575E6B] leading-relaxed mt-1">Automated claims processing and full coverage options for high-value pallet freight.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 bg-[#748DAE]/10 rounded-xl flex items-center justify-center">
                      <img src="./assets/IMG_12.svg" className="w-6 h-6 text-[#748DAE]" alt="Global" />
                    </div>
                    <div>
                      <h4 className="font-['Oswald'] font-bold text-[#16181D]">Global Reach</h4>
                      <p className="text-sm text-[#575E6B] leading-relaxed mt-1">Integrated customs clearance and cross-border logistics across 140+ countries.</p>
                    </div>
                  </div>
                </div>

                {/* Pro Offer Card */}
                <div className="bg-[#748DAE] rounded-xl p-6 shadow-lg relative overflow-hidden text-white">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)]" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <img src="./assets/IMG_1.svg" className="w-6 h-6 text-white" alt="Offer" />
                      </div>
                      <span className="px-3 py-1 bg-white/30 rounded-full text-[10px] font-black tracking-widest uppercase">Pro Offer</span>
                    </div>
                    <h3 className="font-['Oswald'] text-lg font-bold mb-2">Get 20% off your first 10 shipments.</h3>
                    <p className="text-xs text-white/80 mb-6">Valid for all new business accounts activated this week.</p>
                    <button className="w-full py-2.5 bg-[#FFEAEA] text-[#748DAE] font-bold text-sm rounded-lg hover:bg-white transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="h-12 bg-white border-t border-[#f3f4f6] flex flex-col sm:flex-row items-center justify-between px-8 shrink-0">
          <p className="text-[10px] lg:text-xs text-[#575E6B]">© 2024 SwiftShip Logistics Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <button className="text-[10px] lg:text-xs text-[#575E6B] hover:text-[#9ECAD6] transition-colors">Support Center</button>
            <button className="text-[10px] lg:text-xs text-[#575E6B] hover:text-[#9ECAD6] transition-colors">Terms of Service</button>
            <button className="text-[10px] lg:text-xs text-[#575E6B] hover:text-[#9ECAD6] transition-colors">Privacy Policy</button>
          </div>
        </footer>
      </div>
    </div>
  );
}