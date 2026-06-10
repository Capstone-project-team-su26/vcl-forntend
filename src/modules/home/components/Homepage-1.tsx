"use client"

import { Icon } from '@iconify/react';
import { useRouter } from "next/navigation";

export function Homepage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#f3f4f6] font-['Open_Sans'] text-[#171a1f]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E0E2E6] h-[72px] flex items-center">
        <div className="container mx-auto px-4 lg:px-[152px] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#9ECAD6] rounded-[4px] flex items-center justify-center">
              <img src="./assets/IMG_1.svg" alt="Logo" className="w-6 h-6" />
            </div>
            <span className="text-[20px] font-[900] tracking-[-1px] uppercase">SWIFTSHIP</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button className="flex items-center gap-2 text-[14px] font-semibold text-[#343842] hover:text-[#748DAE] transition-colors">
              <img src="./assets/IMG_2.svg" alt="Track" className="w-4 h-4" />
              Track & Receive
            </button>
            <button
              onClick={() => router.push("/pricing")}
              className="flex items-center gap-2 text-[14px] font-semibold text-[#343842] hover:text-[#748DAE] transition-colors">
              <img src="./assets/IMG_3.svg" alt="Pricing" className="w-4 h-4" />
              Pricing & Services
            </button>
            <button className="flex items-center gap-2 text-[14px] font-semibold text-[#343842] hover:text-[#748DAE] transition-colors">
              <img src="./assets/IMG_2.svg" alt="Contact" className="w-4 h-4" />
              Contact
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2">
            <Icon icon="lucide:menu" className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#9ECAD6] py-16 lg:py-0 lg:h-[565px] relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-[152px] h-full flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Hero Content */}
          <div className="max-w-[540px] z-10">
            <h1 className="text-[40px] md:text-[60px] leading-[1.1] font-[900] uppercase mb-6">
              Vietnam<br />Cross-Border<br />Logistics
            </h1>
            <p className="text-[18px] leading-[28px] font-medium text-[#000000]/80 mb-8 max-w-[454px]">
              Reliable international and regional shipping from 14 to 30 days. Fast, secure, and fully tracked for your peace of mind.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => router.push("/purchaserequest")}
                className="px-8 py-3 bg-black text-white text-[18px] font-bold hover:bg-gray-800 transition-colors">
                Request Purchase
              </button>
              <button
                onClick={() => router.push("/track-package")} 
                className="px-8 py-3 bg-white border border-black text-black text-[18px] font-bold hover:bg-gray-50 transition-colors">
                Track Package
              </button>
            </div>
          </div>

          {/* Quick Transfer Card */}
          <div className="w-full max-w-[544px] bg-white shadow-[0px_25px_50px_0px_#00000040] p-8 z-20">
            <div className="mb-8">
              <h2 className="text-[20px] font-bold uppercase inline-block border-b-4 border-[#748DAE] pb-1">
                Price Estimate
              </h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[12px] font-bold text-[#6B7280] uppercase mb-2">Destination</label>
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-3">
                  <input 
                    type="text" 
                    placeholder="Enter City or Country" 
                    className="w-full bg-transparent outline-none text-[16px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#6B7280] uppercase mb-2">Package Type</label>
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] h-[50px]"></div>
              </div>

              <div className="pt-4 border-t border-[#f3f4f6] flex justify-between items-center">
                <span className="text-[14px] font-semibold">Estimated Price:</span>
                <span className="text-[24px] font-bold">$45.00</span>
              </div>

              <button className="w-full py-3 bg-[#748DAE] text-white text-[14px] font-[900] uppercase hover:bg-[#5f7a9e] transition-colors">
                Confirm Shipment
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Package Types */}
      <section className="py-20 container mx-auto px-4 lg:px-[152px]">
        <h2 className="text-[30px] font-[900] text-center uppercase mb-12">Choose Your Package Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "./assets/IMG_4.svg", title: "Envelope", desc: "Documents & Small Flat items", weight: "Up to 0.5kg" },
            { icon: "./assets/IMG_5.svg", title: "Small Box", desc: "Books, Electronics, Gifts", weight: "Up to 5kg" },
            { icon: "./assets/IMG_1.svg", title: "Large Box", desc: "Household items, Clothes", weight: "Up to 30kg" },
            { icon: "./assets/IMG_6.svg", title: "Pallet", desc: "Bulk commercial shipments", weight: "No Limit" },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 shadow-[0px_1px_2.5px_0px_#171a1f12,_0px_0px_2px_0px_#171a1f14] hover:shadow-lg transition-shadow">
              <img src={item.icon} alt={item.title} className="w-12 h-12 mb-6 opacity-60" />
              <h3 className="text-[20px] font-bold mb-2">{item.title}</h3>
              <p className="text-[14px] text-[#6B7280] mb-6">{item.desc}</p>
              <div className="inline-block bg-[#F5CBCB] px-2 py-1">
                <span className="text-[12px] font-bold text-[#748DAE]">{item.weight}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-[#FFEAEA] border-y border-[#E5E7EB] py-10">
        <div className="container mx-auto px-4 lg:px-[152px] grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <img src="./assets/IMG_7.svg" alt="Express" className="w-6 h-6 mt-1" />
            <div>
              <h4 className="text-[16px] font-bold">Express Delivery</h4>
              <p className="text-[12px] text-[#6B7280]">Next day shipping available</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <img src="./assets/IMG_8.svg" alt="Insurance" className="w-6 h-6 mt-1" />
            <div>
              <h4 className="text-[16px] font-bold">Full Insurance</h4>
              <p className="text-[12px] text-[#6B7280]">Up to $5,000 coverage</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <img src="./assets/IMG_9.svg" alt="Fragile" className="w-6 h-6 mt-1" />
            <div>
              <h4 className="text-[16px] font-bold">Fragile Handling</h4>
              <p className="text-[12px] text-[#6B7280]">Specialized care for delicate items</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Transfers */}
      <section className="py-20 container mx-auto px-4 lg:px-[152px]">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-[30px] font-[900] uppercase">Recent Transfers</h2>
          <button className="flex items-center gap-2 text-[14px] font-bold hover:underline">
            View All <img src="./assets/IMG_10.svg" alt="Arrow" className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white border border-[#E5E7EB] shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="px-6 py-4 text-[12px] font-[900] uppercase">Tracking ID</th>
                <th className="px-6 py-4 text-[12px] font-[900] uppercase">Destination</th>
                <th className="px-6 py-4 text-[12px] font-[900] uppercase">Type</th>
                <th className="px-6 py-4 text-[12px] font-[900] uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              <tr className="table-row-hover">
                <td className="px-6 py-5 font-bold">#SW-29384</td>
                <td className="px-6 py-5">Singapore</td>
                <td className="px-6 py-5">Small Box</td>
                <td className="px-6 py-5">
                  <span className="status-badge bg-[#FFEAEA] text-[#748DAE]">In Transit</span>
                </td>
              </tr>
              <tr className="table-row-hover">
                <td className="px-6 py-5 font-bold">#SW-29385</td>
                <td className="px-6 py-5">Thailand</td>
                <td className="px-6 py-5">Envelope</td>
                <td className="px-6 py-5">
                  <span className="status-badge bg-[#9ECAD6] text-white">Delivered</span>
                </td>
              </tr>
              <tr className="table-row-hover">
                <td className="px-6 py-5 font-bold">#SW-29386</td>
                <td className="px-6 py-5">Malaysia</td>
                <td className="px-6 py-5">Pallet</td>
                <td className="px-6 py-5">
                  <span className="status-badge bg-[#F5CBCB] text-[#748DAE]">Processing</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#171a1f] text-white pt-16 pb-8">
        <div className="container mx-auto px-4 lg:px-[152px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-[#9ECAD6] rounded-[4px] flex items-center justify-center">
                  <img src="./assets/IMG_1.svg" alt="Logo" className="w-6 h-6" />
                </div>
                <span className="text-[20px] font-[900] tracking-[-1px]">SWIFTSHIP</span>
              </div>
              <p className="text-[#9CA3AF] text-[16px] leading-[24px] max-w-[353px]">
                Leading the way in cross-border logistics with innovative solutions and unbeatable reliability across Vietnam and Southeast Asia.
              </p>
            </div>

            <div>
              <h5 className="text-[14px] font-bold uppercase mb-6">Support</h5>
              <ul className="space-y-3 text-[#9CA3AF] text-[14px]">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tracking Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Prohibited Items</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-[14px] font-bold uppercase mb-6">Legal</h5>
              <ul className="space-y-3 text-[#9CA3AF] text-[14px]">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[12px] text-[#6B7280]">© 2024 SwiftShip Logistics Inc. All rights reserved.</p>
            <div className="flex gap-6 text-[12px] text-[#6B7280]">
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