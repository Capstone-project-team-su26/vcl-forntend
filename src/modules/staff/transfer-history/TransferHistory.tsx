import { Icon } from '@iconify/react';
import { useState } from 'react';

export default function TransferHistory() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const transfers = [
    { id: 'SS-9402', status: 'In Transit', route: 'Mumbai → Dubai', type: 'Express', eta: '24 Oct', typeIcon: './assets/IMG_12.svg' },
    { id: 'SS-8122', status: 'Processing', route: 'Chennai → Singapore', type: 'Standard', eta: '26 Oct', typeIcon: './assets/IMG_13.svg' },
    { id: 'SS-7731', status: 'Delivered', route: 'London → Bengaluru', type: 'Freight', eta: '21 Oct', typeIcon: './assets/IMG_14.svg' },
    { id: 'SS-6549', status: 'Pending', route: 'New York → New Delhi', type: 'Express', eta: '28 Oct', typeIcon: './assets/IMG_12.svg' },
    { id: 'SS-5510', status: 'Out for Delivery', route: 'Kolkata → Paris', type: 'Standard', eta: 'Today', typeIcon: './assets/IMG_13.svg' },
    { id: 'SS-4290', status: 'In Transit', route: 'Tokyo → Mumbai', type: 'Express', eta: '25 Oct', typeIcon: './assets/IMG_12.svg' },
    { id: 'SS-3108', status: 'Delivered', route: 'Sydney → Chennai', type: 'Standard', eta: '18 Oct', typeIcon: './assets/IMG_13.svg' },
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'In Transit': return 'bg-[#9ECAD6]/10 text-[#9ECAD6]';
      case 'Delivered': return 'bg-[#22C358]/10 text-[#22C358]';
      case 'Processing':
      case 'Pending':
      case 'Out for Delivery': return 'bg-[#F3F4F6] text-[#575E6B]';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]/50 font-['Open_Sans']">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#F3F4F6] flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-[#575E6B]" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Icon icon="lucide:menu" className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-[#16181D]">Transfer History</h1>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Filters Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#F3F4F6] p-4 flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <img src="./assets/IMG_10.svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" alt="Search" />
                <input 
                  type="text" 
                  placeholder="Search by Tracking ID, Route..." 
                  className="w-full pl-10 pr-4 py-2 bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#9ECAD6]"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 px-3 py-2 bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl text-[13px] font-medium text-[#575E6B] whitespace-nowrap">
                  <img src="./assets/IMG_11.svg" className="w-4 h-4" alt="Calendar" />
                  Oct 01 - Oct 31, 2024
                </div>
                <button className="flex-1 lg:flex-none px-6 py-2 bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl text-sm font-bold text-[#16181D]">
                  Type
                </button>
                <button className="flex-1 lg:flex-none px-6 py-2 bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl text-sm font-bold text-[#16181D]">
                  Status
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#F3F4F6] overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                      <th className="px-6 py-4 text-[13px] font-bold text-[#16181D] uppercase tracking-wider">Tracking ID</th>
                      <th className="px-6 py-4 text-[13px] font-bold text-[#16181D] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-[13px] font-bold text-[#16181D] uppercase tracking-wider">Route</th>
                      <th className="px-6 py-4 text-[13px] font-bold text-[#16181D] uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-[13px] font-bold text-[#16181D] uppercase tracking-wider text-right">ETA</th>
                      <th className="px-6 py-4 text-[13px] font-bold text-[#16181D] uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {transfers.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-[#9ECAD6]">{item.id}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap ${getStatusStyles(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-[#16181D]">{item.route}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <img src={item.typeIcon} className="w-4 h-4" alt={item.type} />
                            <span className="text-[12px] font-bold text-[#575E6B] uppercase tracking-wider">{item.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-[#16181D] text-right">{item.eta}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-sm font-bold text-[#9ECAD6] hover:underline">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-[#F3F4F6] flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[13px] text-[#575E6B]">Showing 1 to 7 of 42 results</p>
                <div className="flex items-center gap-2">
                  <button className="p-2 border border-[#575E6B]/50 rounded-md opacity-50 cursor-not-allowed">
                    <img src="./assets/IMG_15.svg" className="w-4 h-4" alt="Prev" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center bg-[#9ECAD6] text-white text-[13px] font-bold rounded-md">1</button>
                  <button className="w-8 h-8 flex items-center justify-center text-[#575E6B] text-[13px] font-medium rounded-md hover:bg-gray-100">2</button>
                  <button className="w-8 h-8 flex items-center justify-center text-[#575E6B] text-[13px] font-medium rounded-md hover:bg-gray-100">3</button>
                  <button className="p-2 border border-[#575E6B] rounded-md hover:bg-gray-100">
                    <img src="./assets/IMG_16.svg" className="w-4 h-4" alt="Next" />
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