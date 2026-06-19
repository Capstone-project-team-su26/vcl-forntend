import { Icon } from '@iconify/react';

export default function Tracking() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-['Open_Sans']">
      

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#F4F9FA] py-12 px-4 md:px-20 border-b border-[#f3f4f6]">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-[30px] font-black text-[#16181D] tracking-tight mb-2">Track Your Shipments</h1>
            <p className="text-[#575E6B] text-base mb-8">Enter your tracking number below to see real-time status updates.</p>
            
            <div className="flex flex-col md:flex-row gap-3 max-w-5xl">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <img src="./assets/IMG_4.svg" className="w-5 h-5 text-[#575E6B]" alt="Search" />
                </div>
                <input 
                  type="text" 
                  defaultValue="SS-9482-X90"
                  className="w-full h-12 pl-10 pr-4 bg-white border border-[#748DAE]/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#9ECAD6]/50 font-semibold text-[#16181D]"
                />
              </div>
              <button className="h-12 px-8 bg-[#9ECAD6] text-white font-bold rounded-lg shadow-md hover:bg-[#8dbbc8] transition-colors whitespace-nowrap">
                Track Package
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-[12px] font-bold text-[#575E6B] uppercase tracking-widest">Quick Search:</span>
              {['SS-9482-X90', 'UPS-7721-L12', 'DHL-3390-P09'].map((id) => (
                <span key={id} className="px-3 py-1 bg-[#f3f4f6] rounded-full text-[12px] font-medium text-[#1F2228] cursor-pointer hover:bg-gray-200 transition-colors">
                  {id}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="max-w-6xl mx-auto px-4 md:px-20 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Tracking Panel */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-xl border-2 border-[#9ECAD6]/20 shadow-sm overflow-hidden">
              {/* Card Header */}
              <div className="bg-[#F9FAFB] p-6 border-b border-[#f3f4f6] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#9ECAD6]/10 rounded-lg flex items-center justify-center">
                    <img src="./assets/IMG_5.svg" className="w-6 h-6 text-[#9ECAD6]" alt="Truck" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[#16181D] tracking-tight">SS-9482-X90</h2>
                    <p className="text-[10px] font-bold text-[#575E6B] uppercase tracking-wider">Premium Express Delivery</p>
                  </div>
                </div>
                <div className="px-6 py-1.5 bg-[#9ECAD6]/20 border border-[#9ECAD6]/30 rounded-full text-[#9ECAD6] font-bold text-sm">
                  In Transit
                </div>
              </div>

              {/* Stats Grid */}
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#f3f4f6]/40 rounded-xl p-4 border border-[#f3f4f6]">
                  <div>
                    <div className="text-[10px] font-bold text-[#575E6B] uppercase mb-2">Current Location</div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#16181D]">
                      <img src="./assets/IMG_6.svg" className="w-4 h-4 text-[#748DAE]" alt="Location" />
                      Mumbai, IN
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#575E6B] uppercase mb-2">Estimated Arrival</div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#16181D]">
                      <img src="./assets/IMG_7.svg" className="w-4 h-4 text-[#748DAE]" alt="Calendar" />
                      Oct 24, 2024
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#575E6B] uppercase mb-2">Weight / Dims</div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#16181D]">
                      <img src="./assets/IMG_2.svg" className="w-4 h-4 text-[#748DAE]" alt="Package" />
                      2.4 kg • Medium
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#575E6B] uppercase mb-2">Service Tier</div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#16181D]">
                      <img src="./assets/IMG_8.svg" className="w-4 h-4 text-[#748DAE]" alt="Shield" />
                      Next Day Air
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mt-10">
                  <h3 className="text-lg font-black text-[#16181D] mb-6">Delivery Progress</h3>
                  <div className="space-y-0">
                    {/* Timeline Item 1 */}
                    <div className="relative pl-12 pb-10">
                      <div className="absolute left-0 top-0 w-8 h-8 bg-white border-2 border-[#9ECAD6] rounded-full flex items-center justify-center z-10">
                        <img src="./assets/IMG_9.svg" className="w-4 h-4 text-[#9ECAD6]" alt="Clock" />
                      </div>
                      <div className="absolute left-4 top-8 bottom-0 w-[2px] bg-[#f3f4f6]" />
                      <div>
                        <div className="text-sm font-bold text-[#9ECAD6]">Out for Delivery</div>
                        <div className="text-[12px] font-medium text-[#575E6B]">Today, 08:45 AM • Mumbai Regional Hub</div>
                      </div>
                    </div>

                    {/* Timeline Item 2 */}
                    <div className="relative pl-12 pb-10">
                      <div className="absolute left-0 top-0 w-8 h-8 bg-[#9ECAD6] border-2 border-[#9ECAD6] rounded-full flex items-center justify-center z-10">
                        <img src="./assets/IMG_8.svg" className="w-4 h-4 text-white" alt="Check" />
                      </div>
                      <div className="absolute left-4 top-8 bottom-0 w-[2px] bg-[#9ECAD6]" />
                      <div>
                        <div className="text-sm font-bold text-[#16181D]">In Transit</div>
                        <div className="text-[12px] font-medium text-[#575E6B]">Oct 23, 11:20 PM • Customs Clearance Center, Mumbai</div>
                      </div>
                    </div>

                    {/* Timeline Item 3 */}
                    <div className="relative pl-12 pb-10">
                      <div className="absolute left-0 top-0 w-8 h-8 bg-[#9ECAD6] border-2 border-[#9ECAD6] rounded-full flex items-center justify-center z-10">
                        <img src="./assets/IMG_8.svg" className="w-4 h-4 text-white" alt="Check" />
                      </div>
                      <div className="absolute left-4 top-8 bottom-0 w-[2px] bg-[#9ECAD6]" />
                      <div>
                        <div className="text-sm font-bold text-[#16181D]">Arrived at Facility</div>
                        <div className="text-[12px] font-medium text-[#575E6B]">Oct 23, 09:15 AM • International Distribution Center</div>
                      </div>
                    </div>

                    {/* Timeline Item 4 */}
                    <div className="relative pl-12">
                      <div className="absolute left-0 top-0 w-8 h-8 bg-[#9ECAD6] border-2 border-[#9ECAD6] rounded-full flex items-center justify-center z-10">
                        <img src="./assets/IMG_8.svg" className="w-4 h-4 text-white" alt="Check" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#16181D]">Order Processed</div>
                        <div className="text-[12px] font-medium text-[#575E6B]">Oct 22, 02:30 PM • London, UK</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-white rounded-lg border-2 border-[#9ECAD6]/20 flex flex-col items-start gap-1 cursor-pointer hover:bg-gray-50 transition-colors">
                <img src="./assets/IMG_7.svg" className="w-5 h-5 text-[#9ECAD6] mb-1" alt="Calendar" />
                <div className="text-sm font-bold text-[#16181D]">Reschedule Delivery</div>
                <div className="text-[12px] font-medium text-[#575E6B]">Choose a different date or time</div>
              </div>
              <div className="p-5 bg-white rounded-lg border-2 border-[#F5CBCB]/20 flex flex-col items-start gap-1 cursor-pointer hover:bg-gray-50 transition-colors">
                <img src="./assets/IMG_6.svg" className="w-5 h-5 text-[#F5CBCB] mb-1" alt="Location" />
                <div className="text-sm font-bold text-[#16181D]">Hold at Location</div>
                <div className="text-[12px] font-medium text-[#575E6B]">Pick up from a nearby partner shop</div>
              </div>
            </div>
          </div>

          {/* Sidebar Panels */}
          <div className="lg:col-span-4 space-y-6">
            {/* Incoming Soon */}
            <div className="bg-white rounded-xl shadow-sm border border-[#f3f4f6] p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-black text-[#16181D]">Incoming Soon</h3>
                <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                  <img src="./assets/IMG_10.svg" className="w-4 h-4" alt="Download" />
                </button>
              </div>
              <p className="text-[12px] text-[#575E6B] mb-6">3 packages in transit</p>
              
              <div className="space-y-4">
                {/* Package 1 */}
                <div className="p-4 border border-[#f3f4f6] rounded-lg relative">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-[#f3f4f6]/40 rounded-full flex items-center justify-center flex-shrink-0">
                      <img src="./assets/IMG_2.svg" className="w-5 h-5 text-[#748DAE]" alt="Package" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold font-[Oswald] text-[#16181D]">AMZ-552-RT</span>
                        <span className="px-3 py-0.5 bg-[#9ECAD6]/20 border border-[#9ECAD6]/30 rounded-full text-[10px] font-bold text-[#9ECAD6]">In Transit</span>
                      </div>
                      <div className="text-[12px] text-[#575E6B] mt-0.5">From: TechHub Warehouse</div>
                      <div className="text-[10px] font-bold text-[#575E6B] text-right mt-1">ETA: Tomorrow</div>
                    </div>
                  </div>
                </div>

                {/* Package 2 */}
                <div className="p-4 border border-[#f3f4f6] rounded-lg relative">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-[#f3f4f6]/40 rounded-full flex items-center justify-center flex-shrink-0">
                      <img src="./assets/IMG_2.svg" className="w-5 h-5 text-[#748DAE]" alt="Package" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold font-[Oswald] text-[#16181D]">FDX-881-PL</span>
                        <span className="px-3 py-0.5 bg-[#f3f4f6]/40 border border-[#f3f4f6]/60 rounded-full text-[10px] font-bold text-[#748DAE]">Pending</span>
                      </div>
                      <div className="text-[12px] text-[#575E6B] mt-0.5">From: Seoul, South Korea</div>
                      <div className="text-[10px] font-bold text-[#575E6B] text-right mt-1">ETA: Oct 27</div>
                    </div>
                  </div>
                </div>

                {/* Package 3 */}
                <div className="p-4 border border-[#f3f4f6] rounded-lg relative">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-[#f3f4f6]/40 rounded-full flex items-center justify-center flex-shrink-0">
                      <img src="./assets/IMG_2.svg" className="w-5 h-5 text-[#748DAE]" alt="Package" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold font-[Oswald] text-[#16181D]">GRL-102-KK</span>
                        <span className="px-3 py-0.5 bg-[#D92644]/20 border border-[#D92644]/30 rounded-full text-[10px] font-bold text-[#D92644]">Delayed</span>
                      </div>
                      <div className="text-[12px] text-[#575E6B] mt-0.5">From: Local Vendor</div>
                      <div className="text-[10px] font-bold text-[#575E6B] text-right mt-1">ETA: Oct 28</div>
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 flex items-center justify-center gap-2 text-[12px] font-bold text-[#9ECAD6] hover:underline">
                View Shipment History
                <img src="./assets/IMG_11.svg" className="w-3 h-3" alt="Arrow" />
              </button>
            </div>

            {/* Help Panel */}
            <div className="bg-[#748DAE] rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
              <div className="absolute -top-4 -right-4 opacity-10">
                <img src="./assets/IMG_12.svg" className="w-24 h-24" alt="Phone Icon" />
              </div>
              
              <h3 className="text-lg font-black mb-2">Need Help?</h3>
              <p className="text-sm text-white/80 font-medium mb-6 leading-relaxed">Our logistics experts are available 24/7 to assist with your delivery.</p>
              
              <div className="bg-white/10 rounded-lg p-3 flex items-start gap-3 mb-6">
                <img src="./assets/IMG_13.svg" className="w-5 h-5 text-[#F5CBCB] mt-0.5" alt="Alert" />
                <div>
                  <div className="text-[12px] font-bold">Having issues?</div>
                  <div className="text-[10px] text-white/80">Check our resolution center</div>
                </div>
              </div>

              <button className="w-full h-10 bg-white rounded-lg flex items-center justify-center gap-3 text-[#748DAE] font-black text-sm shadow-sm hover:bg-gray-50 transition-colors">
                <img src="./assets/IMG_12.svg" className="w-4 h-4" alt="Phone" />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}