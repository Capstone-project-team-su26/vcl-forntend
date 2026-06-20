import { Icon } from '@iconify/react';
import { useState } from 'react';

export default function Tracking() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white font-['Open_Sans'] text-[#16181D]">
      

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Hero Section */}
          <section className="bg-[#F4F9FA] px-4 py-12 lg:px-36 border-b border-[#f3f4f6]">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <h1 className="text-3xl font-black text-[#16181D]">Track Your Shipment</h1>
                <span className="px-3 py-0.5 border border-[#748DAE] bg-[#FFEAEA]/50 rounded-full text-[12px] font-semibold text-[#748DAE]">
                  Global Logistics
                </span>
              </div>
              <p className="text-[#575E6B] font-medium mb-8">
                Enter your tracking number below for real-time updates and delivery management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-lg search-focus border-2 border-[#9ECAD6] rounded-lg bg-white px-4 flex items-center">
                  <img src="./assets/IMG_10.svg" alt="Search" className="w-5 h-5 mr-3" />
                  <input 
                    type="text" 
                    defaultValue="SS-9421-BK88"
                    className="w-full py-3.5 text-sm font-bold outline-none"
                  />
                </div>
                <button className="bg-[#748DAE] text-white px-8 py-3.5 rounded-lg font-bold text-lg shadow-md hover:bg-[#637a96] transition-all shrink-0">
                  Track Package
                </button>
              </div>
            </div>
          </section>

          {/* Dashboard Content */}
          <div className="p-4 lg:p-8 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* Current Status Card */}
              <div className="bg-white rounded-xl shadow-sm border-2 border-[#9ECAD6]/30 overflow-hidden">
                <div className="bg-[#FFEAEA] p-4 flex items-center justify-between border-b border-[#f3f4f6]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                      <img src="./assets/IMG_11.svg" alt="Truck" className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-widest text-[#748DAE]">Current Status</p>
                      <h2 className="text-xl font-black text-[#16181D]">Out for Delivery</h2>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-bold uppercase tracking-widest text-[#575E6B]">Expected Arrival</p>
                    <p className="text-xl font-black text-[#748DAE]">Today, 4:45 PM</p>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <StatusDetail label="Shipper" value="TechVanguard Solutions" />
                  <StatusDetail label="Service Type" value="Priority Express" />
                  <StatusDetail label="Weight" value="2.4 kg / 5.2 lbs" />
                  <StatusDetail label="Destination" value="London, UK" />
                </div>
              </div>

              {/* Shipping History */}
              <div>
                <div className="flex items-baseline gap-2 mb-6">
                  <h2 className="text-2xl font-black">Shipping History</h2>
                  <span className="text-sm text-[#575E6B]">(GMT +0)</span>
                </div>

                <div className="space-y-0 relative">
                  <TimelineItem 
                    icon="./assets/IMG_15.svg" 
                    title="Out for Delivery" 
                    location="London - North Distribution Hub, UK" 
                    time="Nov 18, 2024 - 08:30 AM"
                    active
                  />
                  <TimelineItem 
                    icon="./assets/IMG_16.svg" 
                    title="Arrived at Facility" 
                    location="London Heathrow International (LHR), UK" 
                    time="Nov 17, 2024 - 11:15 PM"
                    completed
                  />
                  <TimelineItem 
                    icon="./assets/IMG_16.svg" 
                    title="Departed Origin Facility" 
                    location="New York Gateway (JFK), USA" 
                    time="Nov 16, 2024 - 02:45 PM"
                    completed
                  />
                  <TimelineItem 
                    icon="./assets/IMG_16.svg" 
                    title="Processed at Sorting Center" 
                    location="Brooklyn Logistics Center, NY" 
                    time="Nov 16, 2024 - 09:12 AM"
                    completed
                  />
                  <TimelineItem 
                    icon="./assets/IMG_16.svg" 
                    title="Shipment Information Received" 
                    location="Electronic Submission" 
                    time="Nov 15, 2024 - 04:30 PM"
                    completed
                    isLast
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="flex items-center justify-between p-5 border-2 border-[#9ECAD6] rounded-lg bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img src="./assets/IMG_17.svg" alt="Calendar" className="w-5 h-5" />
                    <span className="font-bold">Reschedule Delivery</span>
                  </div>
                  <img src="./assets/IMG_18.svg" alt="Arrow" className="w-4 h-4" />
                </button>
                <button className="flex items-center justify-between p-5 border-2 border-[#F5CBCB] rounded-lg bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img src="./assets/IMG_19.svg" alt="Pin" className="w-5 h-5" />
                    <span className="font-bold">Hold at Location</span>
                  </div>
                  <img src="./assets/IMG_18.svg" alt="Arrow" className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-8">
              {/* Delivery Management Card */}
              <div className="bg-[#748DAE] rounded-xl p-6 text-white shadow-lg">
                <h3 className="text-lg font-bold mb-1">Delivery Management</h3>
                <p className="text-white/70 text-sm mb-6">Secure your package before it arrives.</p>
                <div className="space-y-3">
                  <button className="w-full bg-[#9ECAD6] hover:bg-[#8dbbc8] py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                    <img src="./assets/IMG_12.svg" alt="Shield" className="w-4 h-4" />
                    Add Insurance +$4.99
                  </button>
                  <button className="w-full bg-transparent hover:bg-white/10 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                    <img src="./assets/IMG_13.svg" alt="Phone" className="w-4 h-4" />
                    Contact Courier
                  </button>
                </div>
              </div>

              {/* Incoming List */}
              <div className="bg-white rounded-xl border-2 border-[#f3f4f6] shadow-sm overflow-hidden">
                <div className="p-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Incoming (4)</h3>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <img src="./assets/IMG_14.svg" alt="More" className="w-4 h-4" />
                  </button>
                </div>
                <div className="px-6 pb-4 space-y-3">
                  <IncomingItem 
                    id="SS-9421-BK88" 
                    shipper="TechVanguard Solutions" 
                    status="Out for Delivery" 
                    active 
                  />
                  <IncomingItem 
                    id="SS-1290-LP12" 
                    shipper="Amazon Marketplace" 
                    status="In Transit - Bristol Hub" 
                  />
                  <IncomingItem 
                    id="SS-7734-XQ91" 
                    shipper="Nike Official Store" 
                    status="Pending Pickup" 
                  />
                  <IncomingItem 
                    id="SS-0023-HH45" 
                    shipper="John Doe (Personal)" 
                    status="Label Created" 
                  />
                  <button className="w-full py-3 text-[12px] font-bold text-[#748DAE] hover:underline">
                    View Archived Shipments
                  </button>
                </div>
              </div>

              {/* Help Card */}
              <div className="bg-[#F9FAFB] rounded-xl p-6 border-2 border-dashed border-[#f3f4f6] flex gap-4">
                <div className="w-12 h-12 bg-[#FFEAEA] rounded-full flex items-center justify-center shrink-0">
                  <img src="./assets/IMG_20.svg" alt="Alert" className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">Need Help?</h4>
                  <p className="text-[12px] text-[#575E6B] leading-relaxed mb-3">
                    Our 24/7 support is here for any shipping issues.
                  </p>
                  <button className="text-[12px] font-bold text-[#748DAE] hover:underline">
                    Start Live Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all relative ${
        active ? 'bg-[#9ECAD6]/10 text-[#9ECAD6]' : 'text-[#575E6B] hover:bg-gray-100'
      }`}
    >
      {active && <div className="nav-active-indicator" />}
      <img src={icon} alt={label} className={`w-5 h-5 ${active ? 'opacity-100' : 'opacity-70'}`} />
      {label}
    </button>
  );
}

function StatusDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] font-bold uppercase text-[#575E6B] mb-1">{label}</p>
      <p className="text-sm font-bold text-[#16181D] leading-tight">{value}</p>
    </div>
  );
}

function TimelineItem({ 
  icon, 
  title, 
  location, 
  time, 
  active = false, 
  completed = false,
  isLast = false 
}: { 
  icon: string; 
  title: string; 
  location: string; 
  time: string; 
  active?: boolean;
  completed?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="timeline-item flex gap-6 pb-8 relative">
      {!isLast && <div className={`timeline-line ${completed ? 'bg-[#9ECAD6]' : 'bg-[#f3f4f6]'}`} />}
      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        active ? 'bg-[#748DAE]' : completed ? 'bg-[#9ECAD6]' : 'bg-gray-200'
      }`}>
        <img src={icon} alt="Status" className="w-5 h-5" />
      </div>
      <div className="pt-1">
        <h4 className="font-[Oswald] text-base font-bold text-[#16181D] leading-none mb-1">{title}</h4>
        <p className="text-sm font-medium text-[#575E6B] mb-1">{location}</p>
        <p className="text-[12px] text-[#575E6B]/60">{time}</p>
      </div>
    </div>
  );
}

function IncomingItem({ 
  id, 
  shipper, 
  status, 
  active = false 
}: { 
  id: string; 
  shipper: string; 
  status: string; 
  active?: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg border transition-all ${
      active 
        ? 'bg-[#FFEAEA] border-[#748DAE] shadow-sm' 
        : 'bg-white border-[#f3f4f6] hover:border-gray-300'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <img src="./assets/IMG_1.svg" alt="Package" className={`w-4 h-4 ${active ? 'text-[#748DAE]' : 'text-[#575E6B]'}`} />
          <span className="text-[12px] font-bold tracking-wider">{id}</span>
        </div>
        {active && (
          <span className="bg-[#748DAE] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
      </div>
      <p className="text-sm font-bold text-[#16181D] mb-1">{shipper}</p>
      <p className="text-[12px] text-[#575E6B]">{status}</p>
    </div>
  );
}