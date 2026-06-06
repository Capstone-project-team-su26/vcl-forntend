"use client";
import { Icon } from '@iconify/react';


export function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row font-sans">
      {/* Left Side: Authentication Form */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-20 xl:px-32">
        <div className="w-full max-w-[480px]">
          <header className="mb-10">
            <h1 className="text-[30px] leading-[36px] font-bold text-[#16181D] tracking-[-0.75px] mb-2">
              Sign in
            </h1>
            <p className="text-[16px] leading-[24px] text-[#575E6B]">
              Enter your credentials to access your logistics dashboard.
            </p>
          </header>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-[14px] font-medium text-[#16181D]">
                Work Email
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-[#575E6B]">
                  <img src="./assets/IMG_4.svg" alt="mail" className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full h-12 pl-10 pr-4 bg-white border border-[#E0E2E6] rounded-[10px] text-[14px] focus:border-[#748DAE] focus:ring-1 focus:ring-[#748DAE] transition-all outline-none placeholder:text-[#575E6B]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[14px] font-medium text-[#16181D]">
                  Password
                </label>
                <button type="button" className="text-[12px] font-medium text-[#748DAE] hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-[#575E6B]">
                  <img src="./assets/IMG_5.svg" alt="lock" className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full h-12 pl-10 pr-10 bg-white border border-[#E0E2E6] rounded-[10px] text-[14px] focus:border-[#748DAE] focus:ring-1 focus:ring-[#748DAE] transition-all outline-none placeholder:text-[#575E6B]"
                />
                <button type="button" className="absolute right-3 text-[#575E6B] hover:text-[#16181D]">
                  <img src="./assets/IMG_6.svg" alt="toggle visibility" className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Remember Device */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded-[2px] border-[#565d6d] text-[#748DAE] focus:ring-[#748DAE]"
              />
              <label htmlFor="remember" className="text-[14px] font-medium text-[#575E6B] cursor-pointer">
                Remember this device for 30 days
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full h-12 bg-[#748DAE] hover:bg-[#637a99] text-white font-bold rounded-[10px] shadow-[0px_2px_4px_0px_#00000012] flex items-center justify-center gap-2 transition-colors"
            >
              Sign in
              <img src="./assets/IMG_7.svg" alt="arrow" className="w-4 h-4" />
            </button>
          </form>

          {/* Create Account Link */}
          <div className="mt-8 pt-6 border-t border-[#E0E2E6]/50 text-center">
            <p className="text-[14px] text-[#575E6B]">
              Don't have an account?{' '}
              <button className="font-bold text-[#748DAE] hover:underline">
                Create one
              </button>
            </p>
          </div>

          {/* Trusted Partners */}
          <div className="mt-12 opacity-50">
            <p className="text-[10px] font-bold text-[#575E6B] uppercase tracking-[1px] text-center mb-6">
              Trusted by global partners
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-2">
                <img src="./assets/IMG_1.svg" alt="FastLogistics" className="w-4 h-4 text-[#16181D]" />
                <span className="text-[12px] font-semibold text-[#16181D]">FastLogistics</span>
              </div>
              <div className="flex items-center gap-2">
                <img src="./assets/IMG_2.svg" alt="SafeGuard" className="w-4 h-4 text-[#16181D]" />
                <span className="text-[12px] font-semibold text-[#16181D]">SafeGuard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#16181D] rounded-full" />
                <span className="text-[12px] font-semibold text-[#16181D]">GlobalPort</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Right Side: Branding & Info */}
      <aside className="hidden lg:flex flex-1 bg-[#F4F9FA] flex-col justify-between items-center py-24 px-12 relative overflow-hidden">
        <div className="flex flex-col items-center text-center max-w-[420px] z-10">
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#748DAE] rounded-full flex items-center justify-center">
              <img src="./assets/IMG_1.svg" alt="Logo Icon" className="w-8 h-8 text-white" />
            </div>
            <span className="text-[31px] font-bold text-[#748DAE]">LogiAccess</span>
          </div>
          <p className="text-[20px] leading-[28px] font-medium text-[#575E6B] mb-16">
            Enterprise-grade authentication for global logistics leaders.
          </p>

          {/* Security Card */}
          <div className="w-full bg-white/50 backdrop-blur-[12px] rounded-[14px] border border-[#E0E2E6]/50 shadow-[0px_2px_4px_0px_#00000012] p-6 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#748DAE]/10 rounded-[12px] flex items-center justify-center">
                <img src="./assets/IMG_2.svg" alt="Shield" className="w-6 h-6 text-[#748DAE]" />
              </div>
              <h3 className="text-[16px] font-bold text-[#16181D]">Security Protocol</h3>
            </div>
            <p className="text-[14px] leading-[23px] text-[#575E6B] mb-6">
              Your data is protected by industry-leading 256-bit AES encryption and TLS 1.3 protocols. LogiAccess ensures your logistics operations remain private and secure.
            </p>
            <div className="inline-flex items-center px-3 py-0.5 border border-[#E0E2E6] rounded-full">
              <span className="text-[12px] font-semibold text-[#16181D]">
                System Status: Operational
              </span>
            </div>
          </div>
        </div>

        {/* Support Footer */}
        <div className="flex items-center gap-2 z-10">
          <div className="w-[30px] h-[30px] bg-white border border-[#E0E2E6] rounded-full shadow-[0px_1px_2px_0px_#0000000d] flex items-center justify-center">
            <img src="./assets/IMG_3.svg" alt="Support" className="w-4 h-4 text-[#575E6B]" />
          </div>
          <p className="text-[14px] font-medium text-[#575E6B]">
            Need technical help? <button className="hover:underline">Contact Support</button>
          </p>
        </div>
      </aside>

      {/* Mobile Support Footer (Visible only on small screens) */}
      <div className="lg:hidden py-8 px-6 bg-[#F4F9FA] flex justify-center items-center gap-2">
        <div className="w-[30px] h-[30px] bg-white border border-[#E0E2E6] rounded-full flex items-center justify-center">
          <img src="./assets/IMG_3.svg" alt="Support" className="w-4 h-4 text-[#575E6B]" />
        </div>
        <p className="text-[14px] font-medium text-[#575E6B]">
          Need technical help? <button className="hover:underline">Contact Support</button>
        </p>
      </div>
    </div>
  );
}