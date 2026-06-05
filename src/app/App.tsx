import { Icon } from '@iconify/react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#f3f4f6] font-['Open_Sans'] text-[#171a1f]">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E0E2E6] h-[72px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#FFCC00] rounded-[10px] flex items-center justify-center">
              <img src="./assets/IMG_1.svg" alt="Logo" className="w-8 h-8" />
            </div>
            <span className="text-2xl font-[900] tracking-tighter uppercase">SWIFTSHIP</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button className="flex items-center gap-2 text-sm font-semibold text-[#343842] hover:text-black transition-colors">
              <img src="./assets/IMG_2.svg" alt="" className="w-4 h-4" />
              Track & Receive
            </button>
            <button className="flex items-center gap-2 text-sm font-semibold text-[#343842] hover:text-black transition-colors">
              <img src="./assets/IMG_3.svg" alt="" className="w-4 h-4" />
              Pricing & Services
            </button>
            <button className="flex items-center gap-2 text-sm font-semibold text-[#343842] hover:text-black transition-colors">
              <img src="./assets/IMG_2.svg" alt="" className="w-4 h-4" />
              Contact
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2">
            <Icon icon="lucide:menu" className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#FFCC00] py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-[60px] leading-[1.1] font-[900] uppercase tracking-tight">
              Vietnam<br />Cross-Border<br />Logistics
            </h1>
            <p className="text-lg font-medium text-black/80 max-w-md">
              Reliable international and regional shipping from 14 to 30 days. Fast, secure, and fully tracked for your peace of mind.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-3 bg-black text-white text-lg font-bold hover:bg-neutral-800 transition-colors">
                Ship Now
              </button>
              <button className="px-8 py-3 bg-white border border-black text-black text-lg font-bold hover:bg-neutral-50 transition-colors">
                Track Package
              </button>
            </div>
          </div>

          {/* Quick Transfer Card */}
          <div className="bg-white p-8 hero-card-shadow relative lg:max-w-[544px] w-full ml-auto">
            <div className="inline-block mb-8">
              <h2 className="text-xl font-bold uppercase tracking-wide">Quick Transfer</h2>
              <div className="h-1 bg-[#FFCC00] mt-1.5 w-full"></div>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-[12px] font-bold text-[#6B7280] uppercase mb-2">Destination</label>
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-3">
                  <input 
                    type="text" 
                    placeholder="Enter City or Country" 
                    className="w-full bg-transparent outline-none text-base placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#6B7280] uppercase mb-2">Package Type</label>
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] h-[50px] flex items-center px-3">
                  {/* Placeholder for select/dropdown */}
                </div>
              </div>

              <div className="pt-4 border-t border-[#f3f4f6] flex items-baseline justify-between">
                <span className="text-sm font-semibold">Estimated Price:</span>
                <span className="text-2xl font-bold">$45.00</span>
              </div>

              <button className="w-full py-3.5 bg-[#FFCC00] text-black font-[900] text-sm uppercase hover:bg-[#e6b800] transition-colors">
                Confirm Shipment
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Package Types Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-[900] text-center uppercase mb-12">Choose Your Package Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "./assets/IMG_4.svg", title: "Envelope", desc: "Documents & Small Flat items", weight: "Up to 0.5kg" },
            { icon: "./assets/IMG_5.svg", title: "Small Box", desc: "Books, Electronics, Gifts", weight: "Up to 5kg" },
            { icon: "./assets/IMG_1.svg", title: "Large Box", desc: "Household items, Clothes", weight: "Up to 30kg" },
            { icon: "./assets/IMG_6.svg", title: "Pallet", desc: "Bulk commercial shipments", weight: "No Limit" },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 shadow-sm border border-transparent hover:border-[#FFCC00] transition-all hover-lift">
              <img src={item.icon} alt={item.title} className="w-12 h-12 mb-6 opacity-60" />
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-[#6B7280] mb-6">{item.desc}</p>
              <span className="inline-block px-2 py-1 bg-[#FFCC00]/10 text-[#FFCC00] text-[12px] font-bold rounded-sm">
                {item.weight}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-y border-[#E5E7EB] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <img src="./assets/IMG_7.svg" alt="" className="w-6 h-6 mt-1" />
            <div>
              <h4 className="font-bold">Express Delivery</h4>
              <p className="text-xs text-[#6B7280]">Next day shipping available</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <img src="./assets/IMG_8.svg" alt="" className="w-6 h-6 mt-1" />
            <div>
              <h4 className="font-bold">Full Insurance</h4>
              <p className="text-xs text-[#6B7280]">Up to $5,000 coverage</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <img src="./assets/IMG_9.svg" alt="" className="w-6 h-6 mt-1" />
            <div>
              <h4 className="font-bold">Fragile Handling</h4>
              <p className="text-xs text-[#6B7280]">Specialized care for delicate items</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Transfers Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-[900] uppercase">Recent Transfers</h2>
          <button className="flex items-center gap-2 text-sm font-bold hover:underline">
            View All <img src="./assets/IMG_10.svg" alt="" className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white border border-[#E5E7EB] shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="px-6 py-4 text-[12px] font-[900] uppercase tracking-wider">Tracking ID</th>
                <th className="px-6 py-4 text-[12px] font-[900] uppercase tracking-wider">Destination</th>
                <th className="px-6 py-4 text-[12px] font-[900] uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-[12px] font-[900] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6] table-row-hover">
              <tr>
                <td className="px-6 py-5 font-bold">#SW-29384</td>
                <td className="px-6 py-5">Singapore</td>
                <td className="px-6 py-5">Small Box</td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1 bg-[#FEF9C3] text-[#A16207] text-[10px] font-bold uppercase rounded-full">In Transit</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-5 font-bold">#SW-29385</td>
                <td className="px-6 py-5">Thailand</td>
                <td className="px-6 py-5">Envelope</td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1 bg-[#DCFCE7] text-[#15803D] text-[10px] font-bold uppercase rounded-full">Delivered</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-5 font-bold">#SW-29386</td>
                <td className="px-6 py-5">Malaysia</td>
                <td className="px-6 py-5">Pallet</td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1 bg-[#FEF9C3] text-[#A16207] text-[10px] font-bold uppercase rounded-full">Processing</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FFCC00] rounded-[4px] flex items-center justify-center">
                  <img src="./assets/IMG_1.svg" alt="" className="w-6 h-6" />
                </div>
                <span className="text-xl font-[900] tracking-tighter">SWIFTSHIP</span>
              </div>
              <p className="text-[#9CA3AF] text-base leading-relaxed">
                Leading the way in cross-border logistics with innovative solutions and unbeatable reliability across Vietnam and Southeast Asia.
              </p>
            </div>

            <div className="lg:ml-auto">
              <h5 className="text-sm font-bold uppercase mb-6">Support</h5>
              <ul className="space-y-3 text-[#9CA3AF] text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tracking Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Prohibited Items</a></li>
              </ul>
            </div>

            <div className="lg:ml-auto">
              <h5 className="text-sm font-bold uppercase mb-6">Legal</h5>
              <ul className="space-y-3 text-[#9CA3AF] text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#6B7280] text-xs">© 2024 SwiftShip Logistics Inc. All rights reserved.</p>
            <div className="flex gap-6 text-[#6B7280] text-xs">
              <a href="#" className="hover:text-white transition-colors">Facebook</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}