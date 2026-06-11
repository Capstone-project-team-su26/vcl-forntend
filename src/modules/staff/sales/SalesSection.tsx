"use client";

export default function SalesSection() {
  return (
    <div className="space-y-8">
      <section className="relative bg-[#F4F9FA] rounded-xl border border-[#9ECAD6]/20 p-6 lg:p-10 overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/50 border border-[#9ECAD6]/30 mb-6">
            <span className="text-[10px] lg:text-[12px] font-bold text-[#9ECAD6] tracking-wider uppercase">Sales Workspace</span>
          </div>
          <h1 className="font-oswald text-3xl lg:text-[36px] font-black leading-tight tracking-tight mb-4">
            Customer orders &amp; declarations
          </h1>
          <p className="text-[#575E6B] text-base lg:text-lg font-medium mb-8">
            Create customer profiles, open consignment orders, verify unidentified parcels, and notify customers about order status.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex items-center gap-4 bg-[#9ECAD6] text-white p-4 rounded-xl shadow-lg shadow-[#9ECAD6]/20 hover:bg-[#8dbbc8] transition-all group">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <img src="./assets/IMG_11.svg" alt="Plus" className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg leading-none mb-1">Create Consignment Order</p>
                <p className="text-xs text-white/80">Open a new order for a customer</p>
              </div>
            </button>

            <button className="flex items-center gap-4 bg-white border border-[#f3f4f6] p-4 rounded-xl hover:border-[#9ECAD6]/30 transition-all group">
              <div className="w-12 h-12 bg-[#9ECAD6]/10 rounded-lg flex items-center justify-center shrink-0">
                <img src="./assets/IMG_12.svg" alt="Customer" className="w-6 h-6 text-[#9ECAD6]" />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg leading-none mb-1">Verify Unidentified Parcel</p>
                <p className="text-xs text-[#575E6B]/80">Match inbound parcels to customers</p>
              </div>
            </button>
          </div>
        </div>

        <div className="absolute top-10 right-10 hidden lg:block">
          <div className="relative w-[340px] h-[260px] bg-[#9ECAD6]/10 rounded-xl border-4 border-dashed border-[#9ECAD6]/20 flex items-center justify-center">
            <img src="./assets/IMG_1.svg" alt="Package" className="w-32 h-32 opacity-45 text-[#9ECAD6]" />
            <div className="absolute -top-4 -left-4 bg-white shadow-xl rounded-lg px-4 py-2 border border-[#f3f4f6] flex items-center gap-2">
              <img src="./assets/IMG_10.svg" alt="Clock" className="w-4 h-4" />
              <span className="text-xs font-bold">Customs Update</span>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white shadow-xl rounded-lg px-4 py-2 border border-[#f3f4f6] flex items-center gap-2">
              <img src="./assets/IMG_13.svg" alt="Shield" className="w-4 h-4" />
              <span className="text-xs font-bold">Payment Confirm</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-[#E9F3F6] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <img src="./assets/IMG_15.svg" alt="Trending" className="w-5 h-5 text-[#9ECAD6]" />
            <h2 className="font-oswald text-lg font-bold uppercase tracking-tight">Pricing Insights</h2>
          </div>
          <p className="text-sm text-[#575E6B] mb-6">Live fuel surcharges &amp; promo rates for customer quotes</p>

          <div className="bg-white/60 rounded-xl p-4 border border-[#9ECAD6]/10 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-[#575E6B] tracking-wider">FUEL SURCHARGE</span>
              <span className="text-[12px] font-black text-[#D92644]">+4.2%</span>
            </div>
            <div className="h-1.5 w-full bg-[#f3f4f6] rounded-full overflow-hidden">
              <div className="h-full bg-[#D92644]" style={{ width: "42%" }} />
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#9ECAD6]/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#9ECAD6]/20 rounded flex items-center justify-center">
                  <img src="./assets/IMG_11.svg" alt="Express" className="w-4 h-4 text-[#9ECAD6]" />
                </div>
                <span className="text-sm font-bold">Express Air</span>
              </div>
              <span className="text-sm font-black">$8.50/kg</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#748DAE]/20 rounded flex items-center justify-center">
                  <img src="./assets/IMG_11.svg" alt="Consolidation" className="w-4 h-4 text-[#748DAE]" />
                </div>
                <span className="text-sm font-bold">Consolidation</span>
              </div>
              <span className="text-sm font-black">$2.20/kg</span>
            </div>
          </div>

          <button className="w-full py-2.5 bg-white border border-[#9ECAD6]/30 rounded-lg text-[#9ECAD6] font-bold text-sm hover:bg-gray-50 transition-colors">
            Compare All Services
          </button>
        </section>

        <section className="relative bg-[#F5F7F9] rounded-xl p-6 shadow-sm overflow-hidden">
          <div className="absolute -top-5 -right-5 w-24 h-24 bg-[#748DAE]/10 rounded-full" />
          <h2 className="font-oswald text-lg font-bold mb-4 text-[#16181D]">Customer Notifications</h2>
          <p className="text-sm font-medium text-[#575E6B] leading-relaxed mb-6">
            Notify <span className="text-[#16181D] font-black">3 customers</span> about pending payment confirmations and customs declaration updates.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-3 bg-[#748DAE]/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#748DAE]" style={{ width: "60%" }} />
            </div>
            <span className="text-xs font-black text-[#16181D]">3/5</span>
          </div>
        </section>
      </div>
    </div>
  );
}
