"use client"
import { Icon } from '@iconify/react';

export function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans">
      {/* Left Section: Branding & Features (Hidden on mobile, shown on lg+) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F5F7F9] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative Blur Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[274px] h-[202px] bg-[#748DAE]/20 rounded-full blur-[40px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-md text-center">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#748DAE] rounded-full flex items-center justify-center">
              <img 
                src="./assets/IMG_1.svg" 
                alt="LogiAccess Logo" 
                className="w-8 h-8 text-white"
              />
            </div>
            <span className="text-[#748DAE] text-[31px] font-bold tracking-tight">LogiAccess</span>
          </div>

          {/* Tagline */}
          <p className="text-[#575E6B] text-xl font-medium leading-relaxed mb-12">
            Streamlining global logistics with secure access for every partner.
          </p>

          {/* Glassmorphism Card Illustration */}
          <div className="w-[242px] h-[170px] glass-card rounded-[14px] p-6 mb-12 flex flex-col gap-4">
            <div className="flex justify-between">
              <div className="w-16 h-2 bg-white/20 rounded-full" />
              <div className="w-12 h-2 bg-white/20 rounded-full" />
            </div>
            <div className="flex-1 bg-white/5 rounded-[14px] border border-white/10 flex items-center justify-center">
              <img 
                src="./assets/IMG_1.svg" 
                alt="Truck Icon" 
                className="w-12 h-12 opacity-40"
              />
            </div>
          </div>

          {/* Feature List */}
          <div className="space-y-4 w-full max-w-[320px]">
            <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-[4px] rounded-xl border border-white/20">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <img src="./assets/IMG_2.svg" alt="Security" className="w-5 h-5" />
              </div>
              <span className="text-white/90 text-sm font-medium text-left">Enterprise-grade security standards</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-[4px] rounded-xl border border-white/20">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <img src="./assets/IMG_3.svg" alt="Global" className="w-5 h-5" />
              </div>
              <span className="text-white/90 text-sm font-medium text-left">Connect with 10k+ global carriers</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-[4px] rounded-xl border border-white/20">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <img src="./assets/IMG_4.svg" alt="Tracking" className="w-5 h-5" />
              </div>
              <span className="text-white/90 text-sm font-medium text-left">Real-time visibility & tracking</span>
            </div>
          </div>

          {/* Footer Text */}
          <div className="mt-16">
            <span className="text-white/60 text-[12px] font-medium tracking-[0.3px] uppercase">
              Part of LogiNet Ecosystem
            </span>
          </div>
        </div>
      </div>

      {/* Right Section: Registration Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-[480px]">
          {/* Mobile Logo (Only visible on small screens) */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#748DAE] rounded-full flex items-center justify-center">
              <img src="./assets/IMG_1.svg" alt="Logo" className="w-5 h-5" />
            </div>
            <span className="text-[#748DAE] text-xl font-bold">LogiAccess</span>
          </div>

          <h1 className="text-[30px] leading-tight font-bold text-[#16181D] tracking-[-0.75px] mb-3">
            Create an account
          </h1>
          <p className="text-[#575E6B] text-base mb-10">
            Enter your details below to get started with your logistics portal.
          </p>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Row 1: Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="fullName">Full Name</label>
                <div className="relative">
                  <img 
                    src="./assets/IMG_5.svg" 
                    alt="User" 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] opacity-60"
                  />
                  <input 
                    id="fullName"
                    type="text" 
                    placeholder="John Doe" 
                    className="w-full h-11 pl-10 pr-4 bg-white border border-[#E0E2E6] rounded-[10px] text-sm text-[#575E6B] input-focus-ring"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email">Email Address</label>
                <div className="relative">
                  <img 
                    src="./assets/IMG_6.svg" 
                    alt="Mail" 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] opacity-60"
                  />
                  <input 
                    id="email"
                    type="email" 
                    placeholder="john@example.com" 
                    className="w-full h-11 pl-10 pr-4 bg-white border border-[#E0E2E6] rounded-[10px] text-sm text-[#575E6B] input-focus-ring"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="password">Password</label>
                <div className="relative">
                  <img 
                    src="./assets/IMG_7.svg" 
                    alt="Lock" 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] opacity-60"
                  />
                  <input 
                    id="password"
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full h-11 pl-10 pr-4 bg-white border border-[#E0E2E6] rounded-[10px] text-sm text-[#575E6B] input-focus-ring"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <img 
                    src="./assets/IMG_7.svg" 
                    alt="Lock" 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] opacity-60"
                  />
                  <input 
                    id="confirmPassword"
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full h-11 pl-10 pr-4 bg-white border border-[#E0E2E6] rounded-[10px] text-sm text-[#575E6B] input-focus-ring"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Company & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="company">Company</label>
                  <span className="text-[12px] text-[#575E6B]">Optional</span>
                </div>
                <div className="relative">
                  <img 
                    src="./assets/IMG_8.svg" 
                    alt="Building" 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] opacity-60"
                  />
                  <input 
                    id="company"
                    type="text" 
                    placeholder="LogiCorp Inc." 
                    className="w-full h-11 pl-10 pr-4 bg-white border border-[#E0E2E6] rounded-[10px] text-sm text-[#575E6B] input-focus-ring"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="phone">Phone Number</label>
                  <span className="text-[12px] text-[#575E6B]">Optional</span>
                </div>
                <div className="relative">
                  <img 
                    src="./assets/IMG_9.svg" 
                    alt="Phone" 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] opacity-60"
                  />
                  <input 
                    id="phone"
                    type="tel" 
                    placeholder="+1 (555) 000-0000" 
                    className="w-full h-11 pl-10 pr-4 bg-white border border-[#E0E2E6] rounded-[10px] text-sm text-[#575E6B] input-focus-ring"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-4">
              <button 
                type="submit"
                className="w-full h-12 bg-[#748DAE] text-white font-bold text-lg rounded-[10px] shadow-sm hover:bg-[#637a99] transition-colors cursor-pointer"
              >
                Create account
              </button>
              
              <button 
                type="button"
                className="w-full h-10 text-[#748DAE] font-semibold text-sm hover:underline cursor-pointer"
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>

          {/* Terms & Privacy */}
          <div className="mt-12 pt-6 border-t border-[#E0E2E6]">
            <p className="text-[12px] text-[#575E6B] leading-relaxed text-center md:text-left">
              By clicking "Create account", you agree to our{' '}
              <a href="#" className="underline hover:text-[#16181D]">Terms of Service</a> and{' '}
              <a href="#" className="underline hover:text-[#16181D]">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}