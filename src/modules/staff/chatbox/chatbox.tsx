import { Icon } from '@iconify/react';
import { useState } from 'react';

export default function ChatBox() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 border-b border-[#DEE0E3] flex items-center justify-between px-4 lg:px-8 shrink-0 z-50 bg-white">
        <div className="flex items-center gap-3">
          <button 
            className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Icon icon="lucide:menu" className="w-6 h-6 text-[#68ADC0]" />
          </button>
          <div className="w-8 h-8 bg-[#68ADC0] rounded-md flex items-center justify-center">
            <img src="./assets/IMG_4.svg" alt="Logo" className="w-5.5 h-5.5 text-white" />
          </div>
          <span className="text-[20px] font-bold text-[#68ADC0] hidden sm:block">SwiftShip</span>
        </div>

        <div className="flex-1 max-w-md mx-4 lg:mx-12">
          <div className="relative flex items-center w-full h-10 px-3 bg-[#F4F5F6]/50 rounded-md">
            <img src="./assets/IMG_1.svg" alt="Search" className="w-4 h-4 text-[#91969C]" />
            <input 
              type="text" 
              placeholder="Search messages, users, or requests..." 
              className="w-full ml-2 text-sm text-[#1E2124] placeholder:text-[#91969C] outline-none bg-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          <div className="hidden md:flex items-center gap-4 pr-4 border-r border-[#DEE0E3]">
            <button className="relative p-1 hover:bg-gray-100 rounded-full">
              <img src="./assets/IMG_3.svg" alt="Notifications" className="w-5 h-5 text-[#91969C]" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-[#1E2124] leading-tight">Alex Johnson</p>
              <p className="text-[12px] text-[#91969C]">Premium Account</p>
            </div>
            <div className="relative">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-100">
                <img src="./assets/IMG_2.jpeg" alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C358] border-2 border-white rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Messages List */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-80 bg-[#F4F5F6]/20 border-r border-[#DEE0E3] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#DEE0E3]">
            <h2 className="text-lg font-bold text-[#1E2124]">Messages</h2>
            <button className="p-1 hover:bg-gray-200 rounded">
              <img src="./assets/IMG_5.svg" alt="Filter" className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-auto h-[calc(100%-64px)] custom-scrollbar">
            {/* Active Chat */}
            <div className="relative flex items-center p-4 bg-[#68ADC0]/10 border-l-4 border-[#68ADC0] cursor-pointer">
              <div className="relative shrink-0">
                <img src="./assets/IMG_6.webp" alt="Sarah" className="w-10 h-10 rounded-full object-cover" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C358] border-2 border-white rounded-full"></div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-semibold text-[#1E2124] truncate">Sarah Jenkins</h3>
                  <span className="text-[12px] text-[#68ADC0] font-medium">10:42 AM</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-[#1E2124] font-medium truncate">I've attached the latest inspection...</p>
                  <span className="bg-[#EA1E1A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-2">2</span>
                </div>
              </div>
            </div>

            {/* Other Chats */}
            {[
              { name: 'Michael Chen', time: 'Yesterday', msg: 'Can you confirm the dimensions?', img: './assets/IMG_7.webp', status: 'none' },
              { name: 'Emma Davis', time: 'Oct 24', msg: 'The customs clearance is delayed.', img: './assets/IMG_8.webp', status: 'away' }
            ].map((chat, i) => (
              <div key={i} className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-transparent">
                <div className="relative shrink-0">
                  <img src={chat.img} alt={chat.name} className="w-10 h-10 rounded-full object-cover" />
                  {chat.status === 'away' && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#F59E0B] border-2 border-white rounded-full"></div>}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-semibold text-[#1E2124] truncate">{chat.name}</h3>
                    <span className="text-[12px] text-[#91969C]">{chat.time}</span>
                  </div>
                  <p className="text-sm text-[#91969C] truncate">{chat.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col bg-white min-w-0">
          {/* Chat Header */}
          <div className="h-[101px] px-6 flex items-center justify-between border-b border-[#DEE0E3] shrink-0">
            <div>
              <h2 className="text-xl font-bold text-[#1E2124]">Sarah Jenkins</h2>
              <p className="text-sm text-[#91969C]">Logistics Coordinator • REQ-8821</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-md">
                <img src="./assets/IMG_9.svg" alt="Call" className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-md">
                <img src="./assets/IMG_10.svg" alt="Video" className="w-5 h-5" />
              </button>
              <button 
                className="p-2 hover:bg-gray-100 rounded-md lg:hidden"
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              >
                <Icon icon="lucide:info" className="w-5 h-5 text-[#91969C]" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-md hidden lg:block">
                <img src="./assets/IMG_11.svg" alt="More" className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#F4F5F6]/10 custom-scrollbar">
            <div className="flex justify-center mb-8">
              <span className="px-3 py-1 bg-[#F4F5F6] text-[#91969C] text-[12px] font-medium rounded-full">Today, Oct 26</span>
            </div>

            {/* Received Message */}
            <div className="flex gap-3 mb-6 max-w-[85%]">
              <img src="./assets/IMG_12.webp" alt="Sarah" className="w-8 h-8 rounded-full shrink-0" />
              <div>
                <div className="bg-[#F4F5F6] p-3.5 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl">
                  <p className="text-sm text-[#1E2124] leading-relaxed">
                    Hi Alex, just wanted to update you on REQ-8821. The industrial turbines have arrived at the Berlin Main Logistics Center.
                  </p>
                </div>
                <span className="text-[12px] text-[#91969C] mt-1 block">10:30 AM</span>
              </div>
            </div>

            {/* Sent Message */}
            <div className="flex flex-col items-end mb-6">
              <div className="max-w-[85%] bg-[#68ADC0] p-3.5 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl shadow-sm">
                <p className="text-sm text-white leading-relaxed">
                  That's great news! Are they on track for the final delivery tomorrow?
                </p>
              </div>
              <span className="text-[12px] text-[#91969C] mt-1">10:35 AM</span>
            </div>

            {/* Received Message with Attachments */}
            <div className="flex gap-3 mb-6 max-w-[85%]">
              <img src="./assets/IMG_13.webp" alt="Sarah" className="w-8 h-8 rounded-full shrink-0" />
              <div>
                <div className="bg-[#F4F5F6] p-3.5 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl mb-2">
                  <p className="text-sm text-[#1E2124] leading-relaxed">
                    Yes, they are currently being processed. The local courier will pick them up early morning. I've attached the latest inspection photos.
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="w-32 h-24 rounded-lg overflow-hidden border border-[#DEE0E3]">
                    <img src="./assets/IMG_14.webp" alt="Inspection 1" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-32 h-24 rounded-lg overflow-hidden border border-[#DEE0E3]">
                    <img src="./assets/IMG_15.webp" alt="Inspection 2" className="w-full h-full object-cover" />
                  </div>
                </div>
                <span className="text-[12px] text-[#91969C] mt-1 block">10:42 AM</span>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-[#DEE0E3] bg-white">
            <div className="flex items-center gap-2 bg-[#F4F5F6]/50 border border-[#DEE0E3] rounded-2xl p-2">
              <button className="p-2 hover:bg-gray-200 rounded-xl">
                <img src="./assets/IMG_16.svg" alt="Attach" className="w-5 h-5" />
              </button>
              <input 
                type="text" 
                placeholder="Type your message..." 
                className="flex-1 bg-transparent outline-none text-sm px-2 py-2"
              />
              <button className="p-2 hover:bg-gray-200 rounded-xl">
                <img src="./assets/IMG_17.svg" alt="Emoji" className="w-5 h-5" />
              </button>
              <button className="bg-[#68ADC0] p-2.5 rounded-xl shadow-sm hover:bg-[#5a99aa]">
                <img src="./assets/IMG_18.svg" alt="Send" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Product Details */}
        <aside className={`
          fixed inset-y-0 right-0 z-40 w-90 bg-[#F4F5F6]/20 border-l border-[#DEE0E3] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isDetailsOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="p-6 h-full overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#1E2124]">Product Details</h2>
              <span className="px-3 py-1 bg-[#DBEAFE] text-[#1D4ED8] text-[12px] font-semibold rounded-full border border-[#BFDBFE]">
                In Transit
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-[#DEE0E3] shadow-sm mb-6">
              <img src="./assets/IMG_19.webp" alt="Product" className="w-full h-44 object-cover" />
            </div>

            <div className="mb-6">
              <h3 className="text-base font-semibold text-[#1E2124]">Industrial Turbines (Model X)</h3>
              <p className="text-sm text-[#91969C]">REQ-8821</p>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-[#91969C]">Quantity</span>
                <span className="text-[#1E2124] font-medium">2 Units</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#91969C]">Destination</span>
                <span className="text-[#1E2124] font-medium">Berlin, Germany</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#91969C]">Estimated Arrival</span>
                <span className="text-[#1E2124] font-medium">Oct 28, 2023</span>
              </div>
            </div>

            <div className="border-t border-[#DEE0E3] pt-6">
              <h4 className="text-[12px] font-bold text-[#91969C] tracking-wider uppercase mb-4">Attachments</h4>
              <div className="space-y-3">
                {[
                  { name: 'Invoice_REQ-8821.pdf', size: '1.2 MB', icon: './assets/IMG_20.svg' },
                  { name: 'Inspection_Photos.zip', size: '8.5 MB', icon: './assets/IMG_22.svg' },
                  { name: 'Spec_Sheet.pdf', size: '845 KB', icon: './assets/IMG_20.svg' }
                ].map((file, i) => (
                  <div key={i} className="flex items-center p-3 bg-white rounded-xl border border-[#DEE0E3] shadow-sm hover:border-[#68ADC0] cursor-pointer group">
                    <div className="w-10 h-10 bg-[#F4F5F6] rounded-md flex items-center justify-center shrink-0">
                      <img src={file.icon} alt="File" className="w-5 h-5 text-[#68ADC0]" />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1E2124] truncate">{file.name}</p>
                      <p className="text-[12px] text-[#91969C]">{file.size}</p>
                    </div>
                    <button className="p-1 text-[#91969C] hover:text-[#68ADC0]">
                      <img src="./assets/IMG_21.svg" alt="Download" className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Overlays */}
        {(isSidebarOpen || isDetailsOpen) && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => { setIsSidebarOpen(false); setIsDetailsOpen(false); }}
          />
        )}
      </div>
    </div>
  );
}