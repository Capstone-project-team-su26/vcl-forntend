"use client"
import { Icon } from '@iconify/react';
import { useState } from 'react';

export function Transfer() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white font-['Open_Sans'] text-[#575E6B]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#F9FAFB] border-r border-[#f3f4f6] fixed h-full z-30">
        <div className="h-16 flex items-center px-6 border-b border-[#f3f4f6]">
          <div className="w-8 h-8 bg-[#9ECAD6] rounded-md flex items-center justify-center mr-3">
            <img src="./assets/IMG_1.svg" alt="Logo" className="w-5.5 h-5.5 text-white" />
          </div>
          <span className="font-[Oswald] text-xl font-black text-[#9ECAD6] tracking-tight">SwiftShip</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarItem icon="./assets/IMG_2.svg" label="Dashboard" />
          <SidebarItem icon="./assets/IMG_3.svg" label="Transfer Package" active />
          <SidebarItem icon="./assets/IMG_4.svg" label="Track & Receive" />
          <SidebarItem icon="./assets/IMG_5.svg" label="Pricing & Services" />
        </nav>

        <div className="p-4 border-t border-[#f3f4f6] space-y-1">
          <SidebarItem icon="./assets/IMG_6.svg" label="Settings" />
          <SidebarItem icon="./assets/IMG_7.svg" label="Sign Out" variant="danger" />
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#F9FAFB] z-50 transform transition-transform duration-300 lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-[#f3f4f6] justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#9ECAD6] rounded-md flex items-center justify-center mr-3">
              <img src="./assets/IMG_1.svg" alt="Logo" className="w-5.5 h-5.5 text-white" />
            </div>
            <span className="font-[Oswald] text-xl font-black text-[#9ECAD6]">SwiftShip</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)}>
            <Icon icon="lucide:x" className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <SidebarItem icon="./assets/IMG_2.svg" label="Dashboard" />
          <SidebarItem icon="./assets/IMG_3.svg" label="Transfer Package" active />
          <SidebarItem icon="./assets/IMG_4.svg" label="Track & Receive" />
          <SidebarItem icon="./assets/IMG_5.svg" label="Pricing & Services" />
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#f3f4f6] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
          <button className="lg:hidden p-2" onClick={() => setIsSidebarOpen(true)}>
            <Icon icon="lucide:menu" className="w-6 h-6" />
          </button>

          <div className="flex items-center ml-auto space-x-4 lg:space-x-6">
            <div className="relative">
              <img src="./assets/IMG_9.svg" alt="Notifications" className="w-5 h-5 text-[#16181D]" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#D92644] border-2 border-white rounded-full" />
            </div>
            <div className="hidden sm:block h-8 w-px bg-[#f3f4f6]" />
            <div className="flex items-center text-right">
              <div className="mr-3 hidden sm:block">
                <p className="text-sm font-bold text-[#16181D] leading-none">Alex Henderson</p>
                <p className="text-[12px] text-[#575E6B] mt-1">Premium Member</p>
              </div>
              <div className="relative">
                <img src="./assets/IMG_8.webp" alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-[#f3f4f6]" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C358] border-2 border-white rounded-full" />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-[1200px] mx-auto w-full">
          <button className="flex items-center text-sm font-medium text-[#575E6B] mb-6 hover:text-[#9ECAD6] transition-colors">
            <img src="./assets/IMG_10.svg" alt="Back" className="w-4 h-4 mr-4" />
            Back to Dashboard
          </button>

          <h1 className="text-4xl font-black tracking-tight mb-2">
            <span className="text-[#16181D]">Transfer </span>
            <span className="text-[#9ECAD6] font-sans normal-case">Package</span>
          </h1>
          <p className="text-lg text-[#575E6B] mb-10">
            Fill in the details below to generate your shipping label and schedule a pickup.
          </p>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Form Section */}
            <div className="xl:col-span-8 space-y-12">
              {/* Step 1: Package Type */}
              <section>
                <div className="flex items-center mb-6">
                  <div className="step-number">1</div>
                  <h2 className="text-xl font-bold text-[#16181D] normal-case tracking-normal">What are you sending?</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <PackageCard icon="./assets/IMG_15.svg" label="Envelope" sub="Up to 0.5kg" />
                  <PackageCard icon="./assets/IMG_16.svg" label="Small Box" sub="Up to 5kg" active />
                  <PackageCard icon="./assets/IMG_17.svg" label="Large Box" sub="Up to 20kg" />
                  <PackageCard icon="./assets/IMG_18.svg" label="Pallet" sub="Over 50kg" />
                </div>
              </section>

              <hr className="border-[#f3f4f6]" />

              {/* Step 2: Destination */}
              <section>
                <div className="flex items-center mb-6">
                  <div className="step-number">2</div>
                  <h2 className="text-xl font-bold text-[#16181D] normal-case tracking-normal">Where is it going?</h2>
                </div>
                <div className="bg-white border border-[#f3f4f6] rounded-xl p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Sender Full Name" placeholder="Alex Henderson" />
                    <InputField label="Contact Number" placeholder="+1 (555) 000-0000" />
                  </div>
                  <InputField 
                    label="Delivery Street Address" 
                    placeholder="123 Logistics Way, Unit 4B" 
                    icon="./assets/IMG_19.svg" 
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="City" placeholder="San Francisco" />
                    <InputField label="State / Province" placeholder="California" />
                    <InputField label="Zip Code" placeholder="94103" />
                  </div>
                </div>
              </section>

              <hr className="border-[#f3f4f6]" />

              {/* Step 3: Service Level */}
              <section>
                <div className="flex items-center mb-6">
                  <div className="step-number">3</div>
                  <h2 className="text-xl font-bold text-[#16181D] normal-case tracking-normal">Choose your service level</h2>
                </div>
                <div className="space-y-4">
                  <ServiceOption 
                    title="Economy Ground" 
                    desc="Affordable shipping for non-urgent deliveries." 
                    price="$12.50" 
                    est="Est. 5-7 Business Days" 
                  />
                  <ServiceOption 
                    title="Standard Air" 
                    desc="Reliable transit with full tracking capabilities." 
                    price="$24.80" 
                    est="Est. 2-3 Business Days" 
                    active 
                  />
                  <ServiceOption 
                    title="Priority Express" 
                    desc="Next-day delivery with premium handling." 
                    price="$48.20" 
                    est="Est. Next Day by 10 AM" 
                    badge="FASTEST" 
                  />
                </div>
              </section>

              {/* Insurance Section */}
              <section className="bg-[#9ECAD6]/5 border border-[#9ECAD6]/20 rounded-xl p-6 flex flex-col md:flex-row gap-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                  <img src="./assets/IMG_21.svg" alt="Shield" className="w-6 h-6 text-[#9ECAD6]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-[#16181D] normal-case tracking-normal mb-1">Add Shipment Insurance</h3>
                  <p className="text-sm text-[#575E6B] mb-4">
                    Protect your package up to $500 for just $4.99. Recommended for fragile or high-value items.
                  </p>
                  <button className="px-4 py-2 border border-[#9ECAD6] text-[#9ECAD6] rounded-lg text-sm font-semibold hover:bg-[#9ECAD6] hover:text-white transition-colors">
                    Add Protection
                  </button>
                </div>
              </section>
            </div>

            {/* Summary Sidebar */}
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-[#FFEAEA]/40 rounded-xl shadow-lg shadow-black/5 overflow-hidden border border-white/60">
                <div className="bg-white/60 p-6 border-b border-[#f3f4f6]">
                  <div className="flex items-center mb-1">
                    <img src="./assets/IMG_11.svg" alt="Card" className="w-5 h-5 mr-2 text-[#748DAE]" />
                    <h3 className="text-lg font-bold text-[#16181D] normal-case tracking-tight">Shipment Summary</h3>
                  </div>
                  <p className="text-sm text-[#575E6B]">Estimated totals based on selection</p>
                </div>

                <div className="p-6 space-y-4">
                  <SummaryRow label="Package Type:" value="small box" />
                  <SummaryRow label="Service Level:" value="standard" valueClass="text-[#748DAE]" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#575E6B]">Est. Delivery:</span>
                    <div className="flex items-center font-semibold text-[#16181D]">
                      <img src="./assets/IMG_12.svg" alt="Calendar" className="w-3 h-3 mr-1.5" />
                      Oct 24, 2024
                    </div>
                  </div>
                  
                  <hr className="border-[#f3f4f6] my-2" />

                  <SummaryRow label="Base Rate" value="$24.80" />
                  <SummaryRow label="Fuel Surcharge" value="$2.40" />
                  <SummaryRow label="Handling Fee" value="$0.00" />

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-bold text-[#748DAE]">Total Due</span>
                    <span className="text-xl font-bold font-[Oswald] text-[#748DAE]">$27.20</span>
                  </div>

                  <div className="bg-[#F5CBCB]/30 border border-[#F5CBCB]/50 rounded-lg p-3 flex gap-3">
                    <img src="./assets/IMG_13.svg" alt="Info" className="w-4 h-4 mt-0.5 shrink-0 text-[#748DAE]" />
                    <p className="text-[11px] leading-relaxed text-[#748DAE]/80">
                      Prices include basic tracking and up to $50 coverage. Terms and conditions apply.
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-white/40">
                  <button className="w-full bg-[#9ECAD6] text-white py-3.5 rounded-lg font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-[#9ECAD6]/30 hover:bg-[#8bb7c2] transition-all active:scale-[0.98]">
                    Confirm & Pay
                    <img src="./assets/IMG_14.svg" alt="Arrow" className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Pickup Card */}
              <div className="border border-dashed border-[#748DAE]/40 rounded-xl p-4 flex items-center gap-4 bg-transparent">
                <div className="w-10 h-10 bg-[#748DAE]/10 rounded-full flex items-center justify-center shrink-0">
                  <img src="./assets/IMG_20.svg" alt="Truck" className="w-5 h-5 text-[#748DAE]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#16181D]">Need a pickup?</p>
                  <p className="text-[12px] text-[#575E6B]">Schedule a courier for $2.99 extra.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#f3f4f6]/30 border-t border-[#f3f4f6] py-4 px-4 lg:px-8 mt-auto">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] text-[#575E6B]">
            <p>© 2024 SwiftShip Logistics Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#9ECAD6]">Support Center</a>
              <a href="#" className="hover:text-[#9ECAD6]">Terms of Service</a>
              <a href="#" className="hover:text-[#9ECAD6]">Privacy Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active = false, variant = 'default' }: { icon: string, label: string, active?: boolean, variant?: 'default' | 'danger' }) {
  const baseClasses = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all";
  const activeClasses = active ? "bg-[#9ECAD6]/10 text-[#9ECAD6]" : "text-[#575E6B] hover:bg-gray-100";
  const dangerClasses = variant === 'danger' ? "text-[#D92644] hover:bg-red-50" : "";

  return (
    <button className={`${baseClasses} ${activeClasses} ${dangerClasses}`}>
      <img src={icon} alt={label} className={`w-5 h-5 ${variant === 'danger' ? 'text-[#D92644]' : active ? 'text-[#9ECAD6]' : 'text-[#575E6B]'}`} />
      {label}
    </button>
  );
}

function PackageCard({ icon, label, sub, active = false }: { icon: string, label: string, sub: string, active?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all cursor-pointer ${active ? 'bg-[#9ECAD6]/5 border-[#9ECAD6] shadow-sm' : 'bg-white border-[#f3f4f6] hover:border-gray-300'}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${active ? 'bg-[#9ECAD6]' : 'bg-[#f3f4f6]'}`}>
        <img src={icon} alt={label} className={`w-6 h-6 ${active ? 'text-white' : 'text-[#575E6B]'}`} />
      </div>
      <span className={`text-sm font-bold mb-1 ${active ? 'text-[#9ECAD6]' : 'text-[#16181D]'}`}>{label}</span>
      <span className="text-[12px] text-[#575E6B]">{sub}</span>
    </div>
  );
}

function InputField({ label, placeholder, icon }: { label: string, placeholder: string, icon?: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-sm font-semibold text-[#16181D]">{label}</label>
      <div className="relative flex items-center bg-white border border-[#E0E2E6] rounded-lg px-3 py-2.5 focus-within:border-[#9ECAD6] transition-colors">
        {icon && <img src={icon} alt="icon" className="w-4 h-4 mr-2 text-[#748DAE]" />}
        <input 
          type="text" 
          placeholder={placeholder} 
          className="w-full text-sm text-[#575E6B] placeholder:text-[#575E6B]/60 outline-none bg-transparent"
        />
      </div>
    </div>
  );
}

function ServiceOption({ title, desc, price, est, active = false, badge }: { title: string, desc: string, price: string, est: string, active?: boolean, badge?: string }) {
  return (
    <div className={`flex items-center p-5 rounded-lg border-2 transition-all cursor-pointer ${active ? 'bg-[#9ECAD6]/5 border-[#9ECAD6]' : 'bg-white border-[#f3f4f6] hover:border-gray-300'}`}>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${active ? 'border-[#9ECAD6]' : 'border-[#575E6B]/30'}`}>
        {active && <div className="w-2.5 h-2.5 bg-[#9ECAD6] rounded-full" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-base font-bold text-[#16181D]">{title}</span>
          {badge && (
            <span className="bg-[#F5CBCB] text-[#748DAE] text-[10px] font-bold px-2 py-0.5 rounded-lg">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-[#575E6B]">{desc}</p>
      </div>
      <div className="text-right">
        <p className="text-base font-bold text-[#748DAE] mb-1">{price}</p>
        <p className="text-[12px] text-[#575E6B]">{est}</p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, valueClass = "text-[#16181D]" }: { label: string, value: string, valueClass?: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-[#575E6B]">{label}</span>
      <span className={`font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}