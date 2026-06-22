import { Icon } from '@iconify/react';
import { useState } from 'react';

export default function TransferService() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // --- API State Management ---
  const [shippingOption, setShippingOption] = useState<string>("Express"); // Default matching your initial UI
  const [note, setNote] = useState<string>("");
  const [itemDetails, setItemDetails] = useState({
    productName: "",
    productType: "",
    quantity: 1,
    weight: 0,
    width: 0,
    height: 0,
    length: 0,
    declaredValue: 0,
    referenceUrl: "",
    domesticTrackingCode: ""
  });

  // Request & UX Status States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Helper pricing logic to keep the Summary Card aligned with your selection
  const tierPrices: Record<string, number> = {
    Standard: 12.50,
    Express: 24.90,
    Consolidation: 85.00
  };

  // Handle nested item state changes safely
  const handleItemChange = (field: string, value: string | number) => {
    setItemDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Submit Handler targeting your API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    const token = localStorage.getItem('accessToken')

    // Formulate payload according to your API JSON Schema
    const payload = {
      shippingOption,
      note,
      items: [
        {
          productName: itemDetails.productName,
          productType: itemDetails.productType,
          quantity: Number(itemDetails.quantity) || 0,
          weight: Number(itemDetails.weight) || 0,
          width: Number(itemDetails.width) || 0,
          height: Number(itemDetails.height) || 0,
          length: Number(itemDetails.length) || 0,
          declaredValue: Number(itemDetails.declaredValue) || 0,
          referenceUrl: itemDetails.referenceUrl,
          domesticTrackingCode: itemDetails.domesticTrackingCode,
        }
      ]
    };

    console.log("🚀 Payload being sent to API:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch('https://api-vcl.purintech.id.vn/api/orders/consignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setStatus({ type: 'success', message: 'Consignment order successfully created!' });
      
      // Optional: Clear form data here if desired
    } catch (error: any) {
      setStatus({ 
        type: 'error', 
        message: error.message || 'Failed to submit order. Please check your connection and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-['Open_Sans'] text-[#575E6B]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto bg-white">
          <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 py-12 lg:px-8">
            
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-4xl lg:text-5xl font-extrabold text-[#16181D] mb-6 tracking-tight">
                Transparent Pricing for <span className="text-[#748DAE] font-sans">Global Logistics</span>
              </h1>
              <p className="text-lg text-[#575E6B] max-w-2xl mx-auto">
                Shipping options
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              
              <div onClick={() => setShippingOption("Express")} className="cursor-pointer">
                <PricingCard 
                  tier="Express"
                  price="24.90"
                  description="Priority logistics with doorstep pickup and guaranteed timelines."
                  features={["2-3 Business Days", "Real-time GPS Tracking", "Doorstep Pickup", "Premium Padding", "Insurance Coverage"]}
                  accentColor="bg-[#748DAE]"
                  isBestValue
                  highlighted={shippingOption === "Express"}
                />
              </div>
              <div onClick={() => setShippingOption("Consolidation")} className="cursor-pointer">
                <PricingCard 
                  tier="Consolidation"
                  price="85.00"
                  description="Heavy-duty transit for bulky items, pallets, and large cargo."
                  features={["7-10 Business Days", "Dedicated Support", "Palletization Included", "Custom Clearance Assist", "Lift-gate Service"]}
                  accentColor="bg-[#F5CBCB]"
                  highlighted={shippingOption === "Consolidation"}
                />
              </div>
            </div>

            {/* Configuration Section */}
            <div className="space-y-12">
              
              {/* Divider with Text */}
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-[#f3f4f6]"></div>
                <span className="flex-shrink mx-4 text-[12px] font-bold uppercase tracking-[1.2px] text-[#575E6B]">Customize your shipment</span>
                <div className="flex-grow border-t border-[#f3f4f6]"></div>
              </div>

              {/* NEW SECTION: Item Details & Note (Matches API Schema) */}
              <div className="bg-white border border-[#E5E7EB] p-6 lg:p-8 space-y-8 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 border-b border-[#F3F4F6] pb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#748DAE]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                  <h2 className="font-['Oswald'] text-2xl font-bold text-[#16181D]">Item Details</h2>
                </div>

                {/* Item Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Product Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#575E6B]">Product Name *</label>
                    <input 
                      type="text" 
                      required
                      value={itemDetails.productName}
                      onChange={(e) => handleItemChange("productName", e.target.value)}
                      placeholder="e.g., Electronics, Apparel" 
                      className="w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] outline-none text-[#16181D] focus:border-[#748DAE] transition-colors"
                    />
                  </div>

                  {/* Product Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#575E6B]">Product Type / Category</label>
                    <input 
                      type="text" 
                      value={itemDetails.productType}
                      onChange={(e) => handleItemChange("productType", e.target.value)}
                      placeholder="e.g., Fragile, Liquid, Standard" 
                      className="w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] outline-none text-[#16181D] focus:border-[#748DAE] transition-colors"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#575E6B]">Quantity</label>
                    <input 
                      type="number" 
                      min="1"
                      value={itemDetails.quantity}
                      onChange={(e) => handleItemChange("quantity", parseInt(e.target.value) || 0)}
                      placeholder="1" 
                      className="w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] outline-none text-[#16181D] focus:border-[#748DAE] transition-colors"
                    />
                  </div>

                  {/* Weight */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#575E6B]">Weight (kg)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={itemDetails.weight || ''}
                      onChange={(e) => handleItemChange("weight", parseFloat(e.target.value) || 0)}
                      placeholder="0.00" 
                      className="w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] outline-none text-[#16181D] focus:border-[#748DAE] transition-colors"
                    />
                  </div>

                  {/* Declared Value */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#575E6B]">Declared Value ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={itemDetails.declaredValue || ''}
                      onChange={(e) => handleItemChange("declaredValue", parseFloat(e.target.value) || 0)}
                      placeholder="0.00" 
                      className="w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] outline-none text-[#16181D] focus:border-[#748DAE] transition-colors"
                    />
                  </div>

                  {/* Domestic Tracking Code */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#575E6B]">Domestic Tracking Code</label>
                    <input 
                      type="text" 
                      value={itemDetails.domesticTrackingCode}
                      onChange={(e) => handleItemChange("domesticTrackingCode", e.target.value)}
                      placeholder="Optional tracking code" 
                      className="w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] outline-none text-[#16181D] focus:border-[#748DAE] transition-colors"
                    />
                  </div>

                  {/* Dimensions */}
                  <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#575E6B]">Dimensions (L x W x H cm)</label>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="number" placeholder="L" value={itemDetails.length || ''} onChange={(e) => handleItemChange("length", parseFloat(e.target.value) || 0)} className="h-12 px-2 bg-[#F9FAFB] border border-[#E5E7EB] text-center outline-none text-[#16181D] focus:border-[#748DAE]" />
                      <input type="number" placeholder="W" value={itemDetails.width || ''} onChange={(e) => handleItemChange("width", parseFloat(e.target.value) || 0)} className="h-12 px-2 bg-[#F9FAFB] border border-[#E5E7EB] text-center outline-none text-[#16181D] focus:border-[#748DAE]" />
                      <input type="number" placeholder="H" value={itemDetails.height || ''} onChange={(e) => handleItemChange("height", parseFloat(e.target.value) || 0)} className="h-12 px-2 bg-[#F9FAFB] border border-[#E5E7EB] text-center outline-none text-[#16181D] focus:border-[#748DAE]" />
                    </div>
                  </div>

                  {/* Reference URL */}
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#575E6B]">Product Reference URL(optional)</label>
                    <input 
                      type="url" 
                      value={itemDetails.referenceUrl}
                      onChange={(e) => handleItemChange("referenceUrl", e.target.value)}
                      placeholder="https://example.com/product-link" 
                      className="w-full h-12 px-4 bg-[#F9FAFB] border border-[#E5E7EB] outline-none text-[#16181D] focus:border-[#748DAE] transition-colors"
                    />
                  </div>
                </div>

                {/* Shipment Note */}
                <div className="space-y-2 pt-4 border-t border-[#F3F4F6]">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#575E6B]">Shipment Note / Special Instructions</label>
                  <textarea 
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add any specific handling instructions or details regarding your shipment here..." 
                    className="w-full p-4 bg-[#F9FAFB] border border-[#E5E7EB] outline-none text-[#16181D] focus:border-[#748DAE] transition-colors resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Status Notifications UI */}
              {status && (
                <div className={`p-4 rounded-lg border font-medium ${status.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  {status.message}
                </div>
              )}

              {/* Services and Summary Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Additional Services */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <img src="./assets/IMG_14.svg" alt="Package" className="w-6 h-6 text-[#9ECAD6]" />
                    <h2 className="font-['Oswald'] text-2xl font-bold text-[#16181D]">Additional Services</h2>
                  </div>
                  
                  <ServiceItem icon="./assets/IMG_15.svg" title="Shipping Insurance" desc="Protect against damage or loss up to $5,000 value." price="+ $5.00" />
                  <ServiceItem icon="./assets/IMG_16.svg" title="Eco-Friendly Delivery" desc="100% carbon offset for your package's transit route." price="+ $1.50" />
                  <ServiceItem icon="./assets/IMG_17.svg" title="Fragile Handling" desc="Specialized sorting and shock-absorbent mounting." price="+ $3.25" />
                  <ServiceItem icon="./assets/IMG_18.svg" title="Express Customs" desc="Priority documentation processing for international routes." price="+ $12.00" />
                </div>

                {/* Right: Summary and Submit Call to Action */}
                <div className="lg:col-span-4 space-y-8">
                  <div className="bg-[#FFEAEA]/40 border border-[#F5CBCB]/50 rounded-xl p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <img src="./assets/IMG_13.svg" alt="Coupon" className="w-5 h-5 text-[#F5CBCB]" />
                      <h3 className="font-['Oswald'] text-lg font-bold text-[#16181D]">Have a Coupon?</h3>
                    </div>
                    <div className="flex gap-2 mb-8">
                      <input 
                        type="text" 
                        placeholder="Enter code" 
                        className="flex-1 h-10 px-3 bg-white border border-[#F5CBCB]/30 rounded-lg text-sm outline-none"
                        disabled
                      />
                      <button type="button" className="px-4 h-10 bg-[#748DAE] text-white font-bold text-sm rounded-lg hover:bg-[#5d7391] transition-colors opacity-50 cursor-not-allowed">
                        Apply
                      </button>
                    </div>

                    <div className="space-y-4 border-t border-[#F5CBCB]/30 pt-6 mb-6">
                      <div className="flex justify-between text-sm">
                        <span>Selected Tier</span>
                        <span className="font-bold text-[#16181D]">{shippingOption} (${tierPrices[shippingOption]?.toFixed(2)})</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Add-ons Total</span>
                        <span className="font-bold text-[#16181D]">$0.00</span>
                      </div>
                    </div>

                    <div className="border-t border-[#F5CBCB]/30 pt-6 text-center mb-6">
                      <p className="text-sm font-bold text-[#16181D] mb-4 text-left">Est. Base Price / kg</p>
                      <p className="font-['Oswald'] text-6xl font-black text-[#16181D] leading-none mb-2">${tierPrices[shippingOption]?.toFixed(2)}</p>
                      <p className="text-[20px] font-bold text-[#575E6B] tracking-tighter uppercase">Tax Included</p>
                    </div>

                    {/* NEW SUBMIT BUTTON */}
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-14 bg-[#16181D] hover:bg-[#2c303a] text-white font-['Oswald'] text-lg font-bold tracking-wider uppercase rounded-xl transition-all shadow-md active:scale-[0.99] disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </>
                      ) : 'Book Shipment'}
                    </button>
                  </div>      
                  
                </div>
              </div>

              {/* Business Shipping Banner */}
              <div className="bg-[#F9FAFB] border border-[#f3f4f6] rounded-xl p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="w-14 h-14 bg-[#9ECAD6]/20 rounded-full flex items-center justify-center shrink-0">
                  <img src="./assets/IMG_19.svg" alt="Clock" className="w-8 h-8 text-[#9ECAD6]" />
                </div>
                <div className="flex-1 text-center md:text-left">
                   <h3 className="font-['Oswald'] text-lg font-black mb-2">Business Shipment</h3>
                      <p className="text-sm opacity-90 mb-6 leading-relaxed">
                        Up to 40% off for monthly shipping volumes exceeding 500kg.
                      </p>
                </div>
                <button type="button" className="px-4 py-2 bg-white/10 border-2 border-white/20 rounded-lg font-bold text-sm hover:bg-white/20 transition-colors">
                        Contact Sales
                      </button>
              </div>
            </div>
          </form>
        </main>
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

// Sub-components retain their formatting layout...
function NavItem({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
  return (
    <button type="button" className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-colors ${active ? 'bg-[#9ECAD6]/10 text-[#9ECAD6]' : 'text-[#575E6B] hover:bg-gray-100'}`}>
      <img src={icon} alt={label} className={`w-5 h-5 mr-3 ${active ? 'text-[#9ECAD6]' : 'text-[#575E6B]'}`} />
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

function PricingCard({ tier, price, description, features, accentColor, isBestValue = false, highlighted = false }: any) {
  return (
    <div className={`relative flex flex-col bg-white rounded-xl p-8 transition-all duration-300 ${highlighted ? 'border-2 border-[#748DAE] shadow-lg scale-105 z-10' : 'border-2 border-[#f3f4f6] shadow-sm opacity-75'}`}>
      {isBestValue && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#748DAE] text-white text-[12px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
          BEST VALUE
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="font-['Oswald'] text-sm font-bold text-[#575E6B] tracking-[1.4px] uppercase mb-4">{tier}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-['Oswald'] text-2xl font-bold text-[#16181D]">$</span>
          <span className="font-['Oswald'] text-5xl font-extrabold text-[#16181D]">{price}</span>
          <span className="text-base font-medium text-[#575E6B]">/ kg</span>
        </div>
      </div>

      <p className="text-sm text-[#575E6B] text-center mb-8 leading-relaxed">
        {description}
      </p>

      <div className="border-t border-dashed border-[#f3f4f6] pt-6 space-y-4 flex-1">
        {features.map((feature: string, idx: number) => (
          <div key={idx} className="flex items-center gap-3">
            <div className={`w-[18px] h-[18px] ${accentColor} rounded-full flex items-center justify-center shrink-0`}>
              <img src="./assets/IMG_10.svg" alt="Check" className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-medium text-[#16181D]/90">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceItem({ icon, title, desc, price }: any) {
  return (
    <div className="flex items-center p-5 bg-[#f3f4f6]/20 border-2 border-[#f3f4f6] rounded-lg group hover:border-[#9ECAD6]/30 transition-colors">
      <div className="w-[50px] h-[50px] bg-white border border-[#f3f4f6] rounded-lg flex items-center justify-center shrink-0 mr-4">
        <img src={icon} alt={title} className="w-6 h-6 text-[#575E6B]" />
      </div>
      <div className="flex-1">
        <h4 className="font-['Oswald'] text-base font-bold text-[#16181D]">{title}</h4>
        <p className="text-[12px] text-[#575E6B]">{desc}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-black text-[#16181D]">{price}</span>
        <div className="w-6 h-6 border-2 border-[#575E6B]/30 rounded-full cursor-pointer hover:border-[#9ECAD6] transition-colors" />
      </div>
    </div>
  );
}