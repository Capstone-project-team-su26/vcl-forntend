"use client";

export default function SalesSection() {
  return (
    <div className="space-y-8">
      <section className="relative bg-surface-alt rounded-xl border border-primary/20 p-6 lg:p-10 overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/50 border border-primary/30 mb-6">
            <span className="text-[10px] lg:text-[12px] font-bold text-primary tracking-wider uppercase">Sales Workspace</span>
          </div>
          <h1 className="font-oswald text-3xl lg:text-[36px] font-black leading-tight tracking-tight mb-4">
            Customer orders &amp; declarations
          </h1>
          <p className="text-muted text-base lg:text-lg font-medium mb-8">
            Create customer profiles, open consignment orders, verify unidentified parcels, and notify customers about order status.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex items-center gap-4 bg-primary text-white p-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all group">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <img src="./assets/IMG_11.svg" alt="Plus" className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-bold text-lg leading-none mb-1">Create Consignment Order</p>
                <p className="text-xs text-white/80">Open a new order for a customer</p>
              </div>
            </button>

            <button className="flex items-center gap-4 bg-white border border-surface-muted p-4 rounded-xl hover:border-primary/30 transition-all group">
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
            <h2 className="font-oswald text-lg font-bold uppercase tracking-tight">Pricing Insights</h2>
          </div>
          <p className="text-sm text-muted mb-6">Live fuel surcharges &amp; promo rates for customer quotes</p>

          <div className="bg-white/60 rounded-xl p-4 border border-primary/10 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-muted tracking-wider">FUEL SURCHARGE</span>
              <span className="text-[12px] font-black text-danger">+4.2%</span>
            </div>
            <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden">
              <div className="h-full bg-danger" style={{ width: "42%" }} />
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between pb-4 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                  <img src="./assets/IMG_11.svg" alt="Express" className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-bold">Express Air</span>
              </div>
              <span className="text-sm font-black">$8.50/kg</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary/20 rounded flex items-center justify-center">
                  <img src="./assets/IMG_11.svg" alt="Consolidation" className="w-4 h-4 text-secondary" />
                </div>
                <span className="text-sm font-bold">Consolidation</span>
              </div>
              <span className="text-sm font-black">$2.20/kg</span>
            </div>
          </div>

          <button className="w-full py-2.5 bg-white border border-primary/30 rounded-lg text-primary font-bold text-sm hover:bg-gray-50 transition-colors">
            Compare All Services
          </button>
        </section>

        <section className="relative bg-surface-panel rounded-xl p-6 shadow-sm overflow-hidden">
          <div className="absolute -top-5 -right-5 w-24 h-24 bg-secondary/10 rounded-full" />
          <h2 className="font-oswald text-lg font-bold mb-4 text-ink">Customer Notifications</h2>
          <p className="text-sm font-medium text-muted leading-relaxed mb-6">
            Notify <span className="text-ink font-black">3 customers</span> about pending payment confirmations and customs declaration updates.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-3 bg-secondary/20 rounded-full overflow-hidden">
              <div className="h-full bg-secondary" style={{ width: "60%" }} />
            </div>
            <span className="text-xs font-black text-ink">3/5</span>
          </div>
        </section>
      </div>
    </div>
  );
}
