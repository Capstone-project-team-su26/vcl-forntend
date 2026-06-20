"use client"

import { Icon } from '@iconify/react';
import { useRouter } from "next/navigation";
import AppLogo from "@/shared/components/AppLogo";
import UserNavMenu from "@/shared/components/UserNavMenu";
import { useAuth } from "@/shared/hooks/useAuth";

import { useState } from "react";
import * as operationsService from "@/shared/services/operationsService";

export default function Homepage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [destination, setDestination] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState(45);
  const [isEstimating, setIsEstimating] = useState(false);

  async function handleEstimate() {
    setIsEstimating(true);
    try {
      const result = await operationsService.estimatePrice({
        destination: destination || "Vietnam",
        packageType: "small-box",
      });
      setEstimatedPrice(result.estimatedPrice);
    } finally {
      setIsEstimating(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-muted font-['Open_Sans'] text-ink-deep">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-border h-[72px] flex items-center">
        <div className="container mx-auto px-4 lg:px-[152px] flex justify-between items-center">
          <AppLogo variant="header" />

          <div className="flex items-center gap-4 md:gap-8">
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <button className="flex items-center gap-2 text-[14px] font-semibold text-nav hover:text-secondary transition-colors">
                <img src="./assets/IMG_2.svg" alt="Track" className="w-4 h-4" />
                Track & Receive
              </button>
              <button
                onClick={() => router.push("/pricing")}
                className="flex items-center gap-2 text-[14px] font-semibold text-nav hover:text-secondary transition-colors">
                <img src="./assets/IMG_3.svg" alt="Pricing" className="w-4 h-4" />
                Pricing & Services
              </button>
              <button className="flex items-center gap-2 text-[14px] font-semibold text-nav hover:text-secondary transition-colors">
                <img src="./assets/IMG_2.svg" alt="Contact" className="w-4 h-4" />
                Contact
              </button>
            </nav>

            {isLoggedIn ? (
              <UserNavMenu displayName="SwiftShip User" roleLabel="MEMBER" />
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="h-10 px-5 bg-primary text-white text-[14px] font-bold rounded-lg hover:bg-primary-hover transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2">
              <Icon icon="lucide:menu" className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-primary py-16 lg:py-0 lg:h-[565px] relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-[152px] h-full flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Hero Content */}
          <div className="max-w-[540px] z-10">
            <h1 className="text-[40px] md:text-[60px] leading-[1.1] font-[900] uppercase mb-6">
              Vietnam<br />Cross-Border<br />Logistics
            </h1>
            <p className="text-[18px] leading-[28px] font-medium text-black/80 mb-8 max-w-[454px]">
              Reliable international and regional shipping from 14 to 30 days. Fast, secure, and fully tracked for your peace of mind.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => router.push("/purchaserequest")}
                className="px-8 py-3 bg-black text-white text-[18px] font-bold hover:bg-gray-800 transition-colors">
                Request Purchase
              </button>
              <button
                onClick={() => router.push("/purchaserequest")}
                className="px-8 py-3 bg-black text-white text-[18px] font-bold hover:bg-gray-800 transition-colors">
                Track Package
              </button>
            </div>
          </div>

          {/* Quick Transfer Card */}
          <div className="w-full max-w-[544px] bg-white shadow-[0px_25px_50px_0px_#00000040] p-8 z-20">
            <div className="mb-8">
              <h2 className="text-[20px] font-bold uppercase inline-block border-b-4 border-secondary pb-1">
                Price Estimate
              </h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[12px] font-bold text-subtle uppercase mb-2">Destination</label>
                <div className="bg-surface border border-border-muted p-3">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onBlur={handleEstimate}
                    placeholder="Enter City or Country"
                    className="w-full bg-transparent outline-none text-[16px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-subtle uppercase mb-2">Package Type</label>
                <div className="bg-surface border border-border-muted h-[50px]"></div>
              </div>

              <div className="pt-4 border-t border-surface-muted flex justify-between items-center">
                <span className="text-[14px] font-semibold">Estimated Price:</span>
                <span className="text-[24px] font-bold">${estimatedPrice.toFixed(2)}</span>
              </div>

              <button
                type="button"
                onClick={() => router.push("/transfer")}
                className="w-full py-3 bg-secondary text-white text-[14px] font-[900] uppercase hover:bg-secondary-hover transition-colors"
              >
                {isEstimating ? "Calculating..." : "Confirm Shipment"}
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
              <p className="text-[14px] text-subtle mb-6">{item.desc}</p>
              <div className="inline-block bg-accent px-2 py-1">
                <span className="text-[12px] font-bold text-secondary">{item.weight}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-accent-subtle border-y border-border-muted py-10">
        <div className="container mx-auto px-4 lg:px-[152px] grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <img src="./assets/IMG_7.svg" alt="Express" className="w-6 h-6 mt-1" />
            <div>
              <h4 className="text-[16px] font-bold">Express Delivery</h4>
              <p className="text-[12px] text-subtle">Next day shipping available</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <img src="./assets/IMG_8.svg" alt="Insurance" className="w-6 h-6 mt-1" />
            <div>
              <h4 className="text-[16px] font-bold">Full Insurance</h4>
              <p className="text-[12px] text-subtle">Up to $5,000 coverage</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <img src="./assets/IMG_9.svg" alt="Fragile" className="w-6 h-6 mt-1" />
            <div>
              <h4 className="text-[16px] font-bold">Fragile Handling</h4>
              <p className="text-[12px] text-subtle">Specialized care for delicate items</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink-deep text-white pt-16 pb-8">
        <div className="container mx-auto px-4 lg:px-[152px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-2">
              <AppLogo variant="header" className="mb-6" />
              <p className="text-faint text-[16px] leading-[24px] max-w-[353px]">
                Leading the way in cross-border logistics with innovative solutions and unbeatable reliability across Vietnam and Southeast Asia.
              </p>
            </div>

            <div>
              <h5 className="text-[14px] font-bold uppercase mb-6">Support</h5>
              <ul className="space-y-3 text-faint text-[14px]">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tracking Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Prohibited Items</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-[14px] font-bold uppercase mb-6">Legal</h5>
              <ul className="space-y-3 text-faint text-[14px]">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[12px] text-subtle">© 2024 SwiftShip Logistics Inc. All rights reserved.</p>
            <div className="flex gap-6 text-[12px] text-subtle">
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