"use client"
import { Icon } from '@iconify/react';
import { useState } from 'react';
import AppLogo from "@/shared/components/AppLogo";
import colors from "@/shared/constants/colors";

export default function PricingPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white font-['Open_Sans'] text-muted">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface border-r border-surface-muted fixed h-full z-30">
        <div className="h-16 flex items-center px-6 border-b border-surface-muted">
          <AppLogo />
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          <NavItem icon="./assets/IMG_2.svg" label="Dashboard" />
          <NavItem icon="./assets/IMG_3.svg" label="Transfer Package" />
          <NavItem icon="./assets/IMG_4.svg" label="Track & Receive" />
          <NavItem icon="./assets/IMG_5.svg" label="Pricing & Services" active />
        </nav>

        <div className="p-4 border-t border-surface-muted space-y-1">
          <NavItem icon="./assets/IMG_6.svg" label="Settings" />
          <NavItem icon="./assets/IMG_7.svg" label="Sign Out" variant="danger" />
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
      <aside className={`fixed inset-y-0 left-0 w-64 bg-surface z-50 transform transition-transform duration-300 lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-surface-muted justify-between">
          <AppLogo />
          <button onClick={() => setIsSidebarOpen(false)}>
            <Icon icon="lucide:x" className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <NavItem icon="./assets/IMG_2.svg" label="Dashboard" />
          <NavItem icon="./assets/IMG_3.svg" label="Transfer Package" />
          <NavItem icon="./assets/IMG_4.svg" label="Track & Receive" />
          <NavItem icon="./assets/IMG_5.svg" label="Pricing & Services" active />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-surface-muted flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
          <button className="lg:hidden p-2" onClick={() => setIsSidebarOpen(true)}>
            <Icon icon="lucide:menu" className="w-6 h-6" />
          </button>

          <div className="flex items-center ml-auto space-x-4 lg:space-x-6">
            <div className="relative">
              <img src="./assets/IMG_9.svg" alt="Notifications" className="w-5 h-5 cursor-pointer" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-danger border-2 border-white rounded-full" />
            </div>
            <div className="h-8 w-[1px] bg-surface-muted hidden sm:block" />
            <div className="flex items-center text-right">
              <div className="mr-3 hidden sm:block">
                <p className="text-sm font-bold text-ink leading-none">Alex Henderson</p>
                <p className="text-[10px] lg:text-xs text-muted mt-1">Premium Member</p>
              </div>
              <div className="relative">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-success-bg/40">
                  <img src="./assets/IMG_8.webp" alt="Alex Henderson" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success border-[1.5px] border-white rounded-full" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-12 max-w-7xl mx-auto w-full">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-3xl lg:text-[48px] leading-tight font-extrabold text-ink mb-6">
              Transparent Pricing for <span className="text-secondary font-['Open_Sans']">Global Logistics</span>
            </h1>
            <p className="text-base lg:text-lg text-muted max-w-2xl mx-auto">
              Choose the service level that fits your timeline and budget. No hidden fees, just pure efficiency.
            </p>
          </section>

          {/* Pricing Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {/* Standard Plan */}
            <PricingCard 
              tier="Standard"
              price="12.50"
              description="Reliable shipping for non-urgent deliveries across all major cities."
              features={['5-7 Business Days', 'Basic Tracking', 'Drop-off at Point', 'Standard Packaging']}
              buttonText="Select Standard"
              accentColor={colors.primary}
            />

            {/* Express Plan */}
            <PricingCard 
              tier="Express"
              price="24.90"
              description="Priority logistics with doorstep pickup and guaranteed timelines."
              features={['2-3 Business Days', 'Real-time GPS Tracking', 'Doorstep Pickup', 'Premium Padding', 'Insurance Coverage']}
              buttonText="Select Express"
              accentColor={colors.secondary}
              isBestValue
              isHighlighted
            />

            {/* Freight Plan */}
            <PricingCard 
              tier="Freight"
              price="85.00"
              description="Heavy-duty transit for bulky items, pallets, and large cargo."
              features={['7-10 Business Days', 'Dedicated Support', 'Palletization Included', 'Custom Clearance Assist', 'Lift-gate Service']}
              buttonText="Select Freight"
              accentColor={colors.accent}
              buttonTextColor={colors.ink}
            />
          </section>

          {/* Customization Section */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex-1 h-[1px] bg-surface-muted" />
            <span className="px-6 text-[10px] lg:text-xs font-bold uppercase tracking-[1.2px] text-muted">Customize your shipment</span>
            <div className="flex-1 h-[1px] bg-surface-muted" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            {/* Additional Services */}
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-6">
                <img src="./assets/IMG_13.svg" alt="" className="w-6 h-6" />
                <h2 className="text-2xl font-bold text-ink">Additional Services</h2>
              </div>
              
              <div className="space-y-4">
                <ServiceItem 
                  icon="./assets/IMG_14.svg"
                  title="Shipping Insurance"
                  description="Protect against damage or loss up to $5,000 value."
                  price="+$5.00"
                />
                <ServiceItem 
                  icon="./assets/IMG_15.svg"
                  title="Eco-Friendly Delivery"
                  description="100% carbon offset for your package's transit route."
                  price="+$1.50"
                />
                <ServiceItem 
                  icon="./assets/IMG_16.svg"
                  title="Fragile Handling"
                  description="Specialized sorting and shock-absorbent mounting."
                  price="+$3.25"
                />
                <ServiceItem 
                  icon="./assets/IMG_17.svg"
                  title="Express Customs"
                  description="Priority documentation processing for international routes."
                  price="+$12.00"
                />
              </div>
            </div>

            {/* Checkout Summary & Promo */}
            <div className="lg:col-span-4 space-y-6">
              {/* Coupon & Summary Card */}
              <div className="bg-accent-subtle/40 border border-accent/50 rounded-xl p-6 lg:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <img src="./assets/IMG_12.svg" alt="" className="w-5 h-5" />
                  <h3 className="text-lg font-bold text-ink">Have a Coupon?</h3>
                </div>
                
                <div className="flex gap-2 mb-6">
                  <input 
                    type="text" 
                    placeholder="Enter code" 
                    className="flex-1 bg-white border border-accent/30 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-secondary"
                  />
                  <button className="bg-secondary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-secondary-hover transition-colors">
                    Apply
                  </button>
                </div>

                <div className="border-t border-accent/30 pt-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Selected Tier</span>
                    <span className="font-bold text-ink">Express ($24.90)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Add-ons Total</span>
                    <span className="font-bold text-ink">$0.00</span>
                  </div>
                  
                  <div className="border-t border-accent/30 pt-4">
                    <div className="flex justify-between items-end">
                      <span className="text-lg font-bold text-ink">Est. Total</span>
                      <div className="text-right">
                        <span className="text-2xl font-black font-['Oswald'] text-ink">$24.90</span>
                        <p className="text-[10px] font-bold uppercase text-muted tracking-tighter">Tax calculated at checkout</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-8 bg-primary text-white py-4 rounded-lg font-black text-sm shadow-[0_4px_8px_rgba(158,202,214,0.2)] hover:bg-primary-hover transition-all">
                  Confirm & Proceed
                </button>
                
                <p className="text-[11px] text-center mt-4 leading-relaxed">
                  By proceeding, you agree to our <span className="underline cursor-pointer">Service SLA</span> and <span className="underline cursor-pointer">Pricing Policy</span>.
                </p>
              </div>

              {/* Business Platinum Card */}
              <div className="bg-platinum-gradient rounded-xl p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-lg font-black font-['Oswald'] mb-2">Business Platinum</h3>
                  <p className="text-sm opacity-90 mb-6 max-w-[240px]">
                    Up to 40% off for monthly shipping volumes exceeding 500kg.
                  </p>
                  <button className="bg-white/10 border-2 border-white/20 px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/20 transition-all">
                    Contact Sales
                  </button>
                </div>
                <img src="./assets/IMG_17.svg" alt="" className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Emergency Shipping Banner */}
          <div className="bg-surface border border-surface-muted rounded-xl p-6 lg:p-8 flex flex-col md:flex-row items-center gap-6 mb-12">
            <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <img src="./assets/IMG_18.svg" alt="" className="w-8 h-8" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-ink mb-1">Need it faster than Express?</h3>
              <p className="text-sm text-muted">Our flight service is available for critical medical or tech equipment.</p>
            </div>
            <button className="bg-white border-2 border-border px-6 py-2.5 rounded-lg text-sm font-bold text-ink hover:bg-gray-50 transition-all whitespace-nowrap">
              Inquire Emergency Shipping
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-surface-muted/30 border-t border-surface-muted py-4 px-4 lg:px-8 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted">
            <p>© 2024 SwiftShip Logistics Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="cursor-pointer hover:text-ink">Support Center</span>
              <span className="cursor-pointer hover:text-ink">Terms of Service</span>
              <span className="cursor-pointer hover:text-ink">Privacy Policy</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, variant = 'default' }: { icon: string, label: string, active?: boolean, variant?: 'default' | 'danger' }) {
  const baseStyles = "flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold";
  const activeStyles = active ? "active-nav-item text-primary" : "text-muted hover:bg-gray-100";
  const dangerStyles = variant === 'danger' ? "text-danger hover:bg-red-50" : "";

  return (
    <button className={`${baseStyles} ${activeStyles} ${dangerStyles}`}>
      <img src={icon} alt="" className={`w-5 h-5 mr-3 ${active ? '' : 'opacity-70'}`} />
      {label}
    </button>
  );
}

function PricingCard({ tier, price, description, features, buttonText, accentColor, isBestValue = false, isHighlighted = false, buttonTextColor = 'white' }: any) {
  return (
    <div className={`relative bg-white rounded-xl p-8 flex flex-col border-2 transition-all duration-300 ${isHighlighted ? 'border-secondary shadow-lg scale-[1.02]' : 'border-surface-muted shadow-sm hover:shadow-md'}`}>
      {isBestValue && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider">
          Best Value
        </div>
      )}
      
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-[1.4px] text-muted font-['Oswald']">{tier}</span>
        <div className="flex items-start justify-center mt-2">
          <span className="text-2xl font-bold font-['Oswald'] text-ink mt-1">$</span>
          <span className="text-[48px] leading-none font-black font-['Oswald'] text-ink">{price}</span>
          <span className="text-base font-medium text-muted ml-1 self-end mb-2">/ kg</span>
        </div>
        <p className="text-sm text-muted mt-4 leading-relaxed px-4">
          {description}
        </p>
      </div>

      <div className="flex-1 border-y border-dashed border-surface-muted/50 py-6 space-y-4 mb-8">
        {features.map((feature: string, idx: number) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accentColor }}>
              <img src="./assets/IMG_10.svg" alt="" className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-medium text-ink/90">{feature}</span>
          </div>
        ))}
      </div>

      <button 
        className="w-full py-3.5 rounded-lg font-bold text-base flex items-center justify-center gap-3 shadow-sm transition-transform active:scale-95"
        style={{ backgroundColor: accentColor, color: buttonTextColor }}
      >
        {buttonText}
        <img src="./assets/IMG_11.svg" alt="" className="w-4 h-4" style={{ filter: buttonTextColor === 'white' ? 'none' : 'brightness(0.1)' }} />
      </button>
    </div>
  );
}

function ServiceItem({ icon, title, description, price }: { icon: string, title: string, description: string, price: string }) {
  return (
    <div className="flex items-center p-4 lg:p-6 bg-surface-muted/20 border-2 border-surface-muted rounded-xl hover:bg-surface-muted/30 transition-colors group cursor-pointer">
      <div className="w-12 h-12 bg-white border border-surface-muted rounded-lg flex items-center justify-center mr-4 flex-shrink-0 shadow-sm">
        <img src={icon} alt="" className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex-1">
        <h4 className="font-['Oswald'] text-base font-bold text-ink">{title}</h4>
        <p className="text-xs text-muted mt-0.5">{description}</p>
      </div>
      <div className="flex items-center gap-4 ml-4">
        <span className="text-sm font-black text-ink whitespace-nowrap">{price}</span>
        <div className="w-6 h-6 rounded-full border-2 border-muted/30 group-hover:border-primary transition-colors" />
      </div>
    </div>
  );
}