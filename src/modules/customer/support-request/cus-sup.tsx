"use client"
import { Icon } from '@iconify/react';
import { useState } from 'react';

export default function CusSup() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-[#1E2124]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#DEE0E3] z-50 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-4 flex-1">
          <button 
            className="lg:hidden p-2 text-[#91969C]"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Icon icon="lucide:menu" className="w-6 h-6" />
          </button>
          <div className="relative max-w-[448px] w-full hidden sm:block">
            <div className="flex items-center bg-[#F4F5F6]/50 rounded-[10px] px-3 py-2 gap-2">
              <img src="./assets/IMG_1.svg" alt="search" className="w-4 h-4 opacity-60" />
              <input 
                type="text" 
                placeholder="Search shipments, requests, or help..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#91969C]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          <div className="relative">
            <img src="./assets/IMG_3.svg" alt="notifications" className="w-5 h-5 opacity-60 cursor-pointer" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#EA1E1A] border-2 border-white rounded-full" />
          </div>
          
          <div className="h-8 w-[1px] bg-[#DEE0E3] hidden sm:block" />
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">Alex Johnson</p>
              <p className="text-[12px] text-[#91969C] mt-1">Premium Account</p>
            </div>
            <div className="relative">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-[#DEE0E3]">
                <img src="./assets/IMG_2.jpeg" alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C358] border-2 border-white rounded-full" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16 min-h-screen">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#DEE0E3] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            <div className="p-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#68ADC0] rounded-md flex items-center justify-center">
                <img src="./assets/IMG_4.svg" alt="logo" className="w-5.5 h-5.5" />
              </div>
              <span className="text-xl font-bold text-[#68ADC0]">SwiftShip</span>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#91969C] hover:bg-[#F4F5F6] transition-colors">
                <img src="./assets/IMG_5.svg" alt="history" className="w-5 h-5" />
                <span className="text-sm font-medium">Purchase History</span>
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#F4F5F6] text-[#68ADC0]">
                <div className="flex items-center gap-3">
                  <img src="./assets/IMG_6.svg" alt="support" className="w-5 h-5" />
                  <span className="text-sm font-semibold">Support</span>
                </div>
                <img src="./assets/IMG_7.svg" alt="arrow" className="w-4 h-4" />
              </button>
            </nav>

            <div className="p-4 border-t border-[#DEE0E3] space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[#91969C] hover:bg-[#F4F5F6] transition-colors">
                <img src="./assets/IMG_8.svg" alt="settings" className="w-5 h-5" />
                <span className="text-sm font-medium">Settings</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[#EA1E1A] hover:bg-red-50 transition-colors">
                <img src="./assets/IMG_9.svg" alt="logout" className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1184px] mx-auto p-6 lg:p-10">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Customer Support</h1>
              <p className="text-[#91969C]">Get the help you need, when you need it.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Left Column */}
              <div className="xl:col-span-8 space-y-12">
                {/* Hero Search Section */}
                <section className="bg-[#F4F9FA] rounded-2xl border border-[#68ADC0]/10 p-8 lg:p-12 text-center relative overflow-hidden">
                  <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-[#68ADC0]/5 border border-[#68ADC0]/30 text-[#68ADC0] text-[12px] font-semibold mb-6">
                    Support Center
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold mb-4 tracking-tight">How can we help you today?</h2>
                  <p className="text-[#91969C] text-lg max-w-xl mx-auto mb-8">
                    Search our knowledge base for instant answers or reach out to our logistics experts.
                  </p>
                  
                  <div className="max-w-2xl mx-auto relative mb-6">
                    <div className="flex items-center bg-white border border-[#DEE0E3] rounded-xl px-4 py-4 shadow-sm focus-within:ring-2 focus-within:ring-[#68ADC0]/20 transition-all">
                      <img src="./assets/IMG_1.svg" alt="search" className="w-5 h-5 opacity-40 mr-3" />
                      <input 
                        type="text" 
                        placeholder="Search for tracking, billing, prohibited items..." 
                        className="w-full outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-sm text-[#91969C]">
                    <span>Popular:</span>
                    <button className="hover:text-[#68ADC0] transition-colors">Tracking Guide</button>
                    <button className="hover:text-[#68ADC0] transition-colors">Insurance Claims</button>
                    <button className="hover:text-[#68ADC0] transition-colors">Pricing API</button>
                  </div>
                </section>

                {/* FAQ Section */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold">Frequently Asked Questions</h3>
                    <button className="text-[#68ADC0] text-sm font-medium flex items-center gap-1 hover:underline">
                      View All Knowledge Base <img src="./assets/IMG_7.svg" alt="arrow" className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-white border border-[#DEE0E3] rounded-xl overflow-hidden shadow-sm">
                    {/* FAQ Item 1 - Expanded */}
                    <div className="border-b border-[#DEE0E3]">
                      <button className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors">
                        <span className="font-medium text-lg">How do I track my international shipment?</span>
                        <img src="./assets/IMG_17.svg" alt="chevron" className="w-4 h-4" />
                      </button>
                      <div className="px-6 pb-6 text-[#91969C] text-sm leading-relaxed">
                        You can track any international shipment using your 12-digit Tracking ID on our global tracking page. Updates are provided in real-time as your package passes through customs checkpoints.
                      </div>
                    </div>
                    {/* FAQ Item 2 */}
                    <div className="border-b border-[#DEE0E3]">
                      <button className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors">
                        <span className="font-medium text-lg">What are the requirements for shipping hazardous materials?</span>
                        <img src="./assets/IMG_17.svg" alt="chevron" className="w-4 h-4" />
                      </button>
                    </div>
                    {/* FAQ Item 3 */}
                    <div className="border-b border-[#DEE0E3]">
                      <button className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors">
                        <span className="font-medium text-lg">How are shipping rates calculated?</span>
                        <img src="./assets/IMG_17.svg" alt="chevron" className="w-4 h-4" />
                      </button>
                    </div>
                    {/* FAQ Item 4 */}
                    <div>
                      <button className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors">
                        <span className="font-medium text-lg">What is the procedure for filing a damage claim?</span>
                        <img src="./assets/IMG_17.svg" alt="chevron" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </section>

                {/* Contact Form Section */}
                <section>
                  <h3 className="text-2xl font-semibold mb-6">Need more specific help?</h3>
                  <div className="bg-white border border-[#DEE0E3] rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 lg:p-8">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-9 h-9 bg-[#68ADC0]/10 rounded-lg flex items-center justify-center">
                          <img src="./assets/IMG_18.svg" alt="mail" className="w-5 h-5" />
                        </div>
                        <h4 className="text-xl font-semibold tracking-tight">Send us a Message</h4>
                      </div>
                      <p className="text-[#91969C] text-sm mb-8">Our team typically responds within 2-4 business hours.</p>

                      <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <div className="flex items-center border border-[#DEE0E3] rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#68ADC0]/20 transition-all">
                              <img src="./assets/IMG_19.svg" alt="user" className="w-4 h-4 opacity-40 mr-2" />
                              <input type="text" placeholder="Enter your name" className="w-full outline-none text-sm" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <div className="flex items-center border border-[#DEE0E3] rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#68ADC0]/20 transition-all">
                              <img src="./assets/IMG_18.svg" alt="mail" className="w-4 h-4 opacity-40 mr-2" />
                              <input type="email" placeholder="email@company.com" className="w-full outline-none text-sm" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Subject</label>
                          <div className="flex items-center border border-[#DEE0E3] rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#68ADC0]/20 transition-all">
                            <img src="./assets/IMG_16.svg" alt="info" className="w-4 h-4 opacity-40 mr-2" />
                            <input type="text" placeholder="e.g., Billing Inquiry" className="w-full outline-none text-sm" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Message</label>
                          <textarea 
                            placeholder="Describe your issue in detail..." 
                            rows={6}
                            className="w-full border border-[#DEE0E3] rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#68ADC0]/20 transition-all resize-none"
                          ></textarea>
                        </div>
                      </form>
                    </div>

                    <div className="bg-[#F4F5F6]/30 border-t border-[#DEE0E3] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-[#91969C] text-[12px]">
                        <img src="./assets/IMG_15.svg" alt="alert" className="w-3.5 h-3.5" />
                        <span>Please do not share sensitive passwords.</span>
                      </div>
                      <button className="bg-[#68ADC0] text-white px-8 py-2.5 rounded-lg font-medium text-sm shadow-sm hover:bg-[#5a99aa] transition-colors w-full sm:w-auto">
                        Send Message
                      </button>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column (Sidebar Widgets) */}
              <div className="xl:col-span-4 space-y-8">
                {/* Live Chat Widget */}
                <div className="bg-[#E9F3F6] rounded-xl shadow-sm overflow-hidden border border-[#68ADC0]/10">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <img src="./assets/IMG_10.svg" alt="chat" className="w-5 h-5" />
                      <h4 className="text-lg font-semibold tracking-tight">Need immediate help?</h4>
                    </div>
                    <p className="text-[#2C5B68]/80 text-sm mb-6 leading-relaxed">
                      Our agents are online and ready to assist you with active shipments.
                    </p>
                    <button className="w-full bg-[#68ADC0] text-white py-2.5 rounded-lg font-medium text-sm shadow-sm hover:bg-[#5a99aa] transition-colors mb-6">
                      Start Live Chat
                    </button>
                  </div>
                  <div className="bg-[#68ADC0]/5 border-t border-[#68ADC0]/10 p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <img src="./assets/IMG_11.svg" alt="phone" className="w-4 h-4 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">+1 (800) SWIFT-SHIP</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <img src="./assets/IMG_12.svg" alt="clock" className="w-4 h-4 mt-0.5 opacity-60" />
                      <div>
                        <p className="text-sm text-[#91969C]">Mon-Fri: 8AM - 8PM EST</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Knowledge Shortcuts */}
                <div>
                  <h5 className="text-[12px] font-bold text-[#91969C] tracking-widest uppercase mb-4">Knowledge Shortcuts</h5>
                  <div className="bg-white border border-[#DEE0E3] rounded-xl shadow-sm overflow-hidden">
                    <a href="#" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-[#DEE0E3]">
                      <div className="flex items-center gap-3">
                        <img src="./assets/IMG_13.svg" alt="file" className="w-4 h-4" />
                        <span className="text-sm">Tracking Guide</span>
                      </div>
                      <img src="./assets/IMG_14.svg" alt="external" className="w-3.5 h-3.5 opacity-40" />
                    </a>
                    <a href="#" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-[#DEE0E3]">
                      <div className="flex items-center gap-3">
                        <img src="./assets/IMG_15.svg" alt="alert" className="w-4 h-4" />
                        <span className="text-sm">Prohibited Items List</span>
                      </div>
                      <img src="./assets/IMG_14.svg" alt="external" className="w-3.5 h-3.5 opacity-40" />
                    </a>
                    <a href="#" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <img src="./assets/IMG_16.svg" alt="info" className="w-4 h-4" />
                        <span className="text-sm">Customs Regulations</span>
                      </div>
                      <img src="./assets/IMG_14.svg" alt="external" className="w-3.5 h-3.5 opacity-40" />
                    </a>
                  </div>
                </div>

                {/* API Documentation Widget */}
                <div className="bg-[#F9FAFA] border border-[#DEE0E3] rounded-xl p-5 shadow-sm flex gap-4">
                  <div className="w-10 h-10 bg-[#68ADC0]/10 rounded-full flex items-center justify-center shrink-0">
                    <img src="./assets/IMG_1.svg" alt="search" className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold mb-1">API Documentation</h5>
                    <p className="text-[12px] text-[#91969C] leading-relaxed">
                      Looking to integrate SwiftShip? Check our dev portal.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-20 pt-6 border-t border-[#DEE0E3] flex flex-col md:flex-row items-center justify-between gap-4 pb-10">
              <p className="text-[12px] text-[#91969C]">© 2024 SwiftShip Logistics Inc. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <button className="text-[12px] text-[#91969C] hover:text-[#68ADC0]">Privacy Policy</button>
                <button className="text-[12px] text-[#91969C] hover:text-[#68ADC0]">Terms of Service</button>
                <button className="text-[12px] text-[#91969C] hover:text-[#68ADC0]">Status</button>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}