import { Icon } from '@iconify/react';
import { useState } from 'react';

export default function WarehouseMap() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const rackData = [
    { id: 'A-1', fill: '3/8', rows: [['3301', '', '', ''], ['8871', '9021', '', '']] },
    { id: 'A-2', fill: '2/8', rows: [['', '3301', '', ''], ['', '', '3301', '']] },
    { id: 'A-3', fill: '3/8', rows: [['', '4432', '', ''], ['1129', '', '1129', '']] },
    { id: 'A-4', fill: '4/8', rows: [['8871', '', '1129', ''], ['3301', '', '8871', '']] },
    { id: 'B-1', fill: '3/8', rows: [['', '3301', '', ''], ['', '1129', '', '9021']] },
    { id: 'B-2', fill: '4/8', rows: [['4432', '', '4432', ''], ['1129', '', '9021', '']] },
    { id: 'B-3', fill: '5/8', rows: [['9021', '', '9021', ''], ['', '3301', '4432', '3301']] },
    { id: 'B-4', fill: '2/8', rows: [['', '1129', '', ''], ['', '', '4432', '']] },
    { id: 'C-1', fill: '3/8', rows: [['4432', '', '', ''], ['', '4432', '4432', '']] },
    { id: 'C-2', fill: '3/8', rows: [['', '', '', '9021'], ['9021', '', '4432', '']] },
    { id: 'C-3', fill: '2/8', rows: [['', '', '', ''], ['', '1129', '3301', '']] },
    { id: 'C-4', fill: '3/8', rows: [['', '', '', ''], ['1129', '1129', '8871', '']] },
    { id: 'D-1', fill: '5/8', rows: [['3301', '', '9021', ''], ['1129', '', '1129', '8871']] },
    { id: 'D-2', fill: '2/8', rows: [['', '', '1129', '9021'], ['', '', '', '']] },
    { id: 'D-3', fill: '4/8', rows: [['4432', '4432', '', ''], ['9021', '', '', '1129']] },
    { id: 'D-4', fill: '4/8', rows: [['8871', '', '8871', ''], ['', '4432', '', '3301']] },
  ];

  const getCellColor = (val: string) => {
    if (val === '9021') return 'bg-[#FFAA00]/20 border-[#dee1e6]';
    if (val === '8871') return 'bg-white border-[#dee1e6] relative after:content-[""] after:absolute after:bottom-1 after:left-1 after:right-1 after:h-1 after:bg-[#D92644]';
    if (val === '4432') return 'bg-white border-[#dee1e6] relative after:content-[""] after:absolute after:bottom-1 after:left-1 after:right-1 after:h-1 after:bg-[#FFAA00]';
    if (val !== '') return 'bg-white border-[#dee1e6]';
    return 'bg-[#f3f4f6]/10 border-[#dee1e6]';
  };

  return (
    <div className="flex min-h-screen bg-white font-['Open_Sans'] text-[#171a1f]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#fafafb] border-r border-[#dee1e6] transition-transform lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center h-20 px-6 border-b border-[#dee1e6]">
          <div className="w-8 h-8 bg-[#9ecad6] rounded-md flex items-center justify-center mr-3">
            <img src="./assets/IMG_1.svg" alt="NexusLogistics" className="w-5.5 h-5.5" />
          </div>
          <span className="font-['Oswald'] text-xl font-bold text-[#9ecad6]">NexusLogistics</span>
        </div>

        <nav className="p-4 space-y-8 overflow-y-auto h-[calc(100vh-160px)]">
          <div>
            <p className="px-4 mb-4 text-[10px] font-bold text-[#565d6d] uppercase tracking-wider">Main</p>
            <div className="space-y-1">
              <a href="#" className="flex items-center px-4 py-2.5 bg-[#b3d6e0] text-[#19191F] font-semibold rounded-md">
                <Icon icon="lucide:layout-grid" className="w-5 h-5 mr-3" />
                <span className="text-sm">Floor Overview</span>
              </a>
              <a href="#" className="flex items-center px-4 py-2.5 text-[#565d6d] hover:bg-gray-100 rounded-md">
                <Icon icon="lucide:package" className="w-5 h-5 mr-3" />
                <span className="text-sm">Package Search</span>
              </a>
              <a href="#" className="flex items-center px-4 py-2.5 text-[#565d6d] hover:bg-gray-100 rounded-md">
                <Icon icon="lucide:truck" className="w-5 h-5 mr-3" />
                <span className="text-sm">Inbound Shipments</span>
              </a>
              <a href="#" className="flex items-center px-4 py-2.5 text-[#565d6d] hover:bg-gray-100 rounded-md">
                <Icon icon="lucide:arrow-up-right" className="w-5 h-5 mr-3" />
                <span className="text-sm">Outbound Manifest</span>
              </a>
            </div>
          </div>

          <div>
            <p className="px-4 mb-4 text-[10px] font-bold text-[#565d6d] uppercase tracking-wider">Analytics</p>
            <div className="space-y-1">
              <a href="#" className="flex items-center px-4 py-2.5 text-[#565d6d] hover:bg-gray-100 rounded-md">
                <Icon icon="lucide:layers" className="w-5 h-5 mr-3" />
                <span className="text-sm">Zone Capacity</span>
              </a>
              <a href="#" className="flex items-center px-4 py-2.5 text-[#565d6d] hover:bg-gray-100 rounded-md">
                <Icon icon="lucide:ellipsis-vertical" className="w-5 h-5 mr-3" />
                <span className="text-sm">Performance</span>
              </a>
            </div>
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-[#dee1e6]/50 bg-[#fafafb]">
          <a href="#" className="flex items-center px-4 py-2.5 text-[#565d6d] hover:bg-gray-100 rounded-md">
            <Icon icon="lucide:settings" className="w-5 h-5 mr-3" />
            <span className="text-sm">System Settings</span>
          </a>
          <a href="#" className="flex items-center px-4 py-2.5 text-[#565d6d] hover:bg-gray-100 rounded-md">
            <Icon icon="lucide:circle-help" className="w-5 h-5 mr-3" />
            <span className="text-sm">Documentation</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[#dee1e6] bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center flex-1 gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-[#565d6d]">
              <Icon icon="lucide:menu" className="w-6 h-6" />
            </button>
            <div className="relative max-w-md w-full">
              <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#565d6d]" />
              <input 
                type="text" 
                placeholder="Search by Package ID, SKU, or Client..." 
                className="w-full pl-10 pr-4 py-2 bg-[#f3f4f6]/20 border border-[#f3f4f6] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9ecad6]"
              />
            </div>
            <div className="h-6 w-px bg-[#dee1e6] mx-2 hidden md:block" />
            <button className="hidden md:flex items-center px-3 py-1.5 border border-[#dee1e6] rounded-md text-sm font-medium hover:bg-gray-50">
              <img src="./assets/IMG_11.svg" alt="filter" className="w-4 h-4 mr-2" />
              Advanced Filters
            </button>
          </div>

          <div className="flex items-center gap-6">
            <span className="hidden lg:block text-xs font-medium">Warehouse Alpha: Active</span>
            <div className="relative">
              <Icon icon="lucide:bell" className="w-5 h-5 text-[#171a1f]" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#D92644] border-2 border-white rounded-full" />
            </div>
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#dee1e6]">
              <img src="./assets/IMG_12.webp" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Grid View Area */}
          <div className="flex-1 overflow-y-auto bg-[#fafafb]/30 p-6 lg:p-10 custom-scrollbar">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Zone 4 Storage Grid</h1>
                <p className="text-[#565d6d]">Real-time shelf allocation for Rack Groups A through D.</p>
              </div>
              <div className="flex bg-white p-1 rounded-md border border-[#dee1e6] shadow-sm self-start md:self-auto">
                <button className="flex items-center px-4 py-1.5 bg-[#f3f4f6] rounded-md text-sm font-medium">
                  <Icon icon="lucide:layout-grid" className="w-4 h-4 mr-2" />
                  Grid View
                </button>
                <button className="flex items-center px-4 py-1.5 text-[#565d6d] text-sm font-medium hover:bg-gray-50">
                  <Icon icon="lucide:menu" className="w-4 h-4 mr-2" />
                  List View
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {rackData.map((rack) => (
                <div key={rack.id} className="bg-white rounded-xl border border-[#dee1e6] shadow-sm overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between px-3 py-2.5 bg-[#fafafb] border-b border-[#dee1e6]">
                    <div className="flex items-center">
                      <Icon icon="lucide:map-pin" className="w-3 h-3 text-[#FFAA00] mr-2" />
                      <span className="text-xs font-bold">Rack {rack.id}</span>
                    </div>
                    <span className="px-2 py-0.5 border border-[#f3f4f6] rounded-full text-[10px] font-semibold">{rack.fill} Fill</span>
                  </div>
                  <div className="p-3 flex-1">
                    <div className="border border-[#dee1e6] rounded overflow-hidden">
                      <div className="grid grid-cols-[32px_1fr]">
                        {/* Row Labels */}
                        <div className="flex flex-col">
                          <div className="h-12 flex items-center justify-center bg-[#f3f4f6]/30 border-b border-r border-[#dee1e6] text-[10px] font-bold">A</div>
                          <div className="h-12 flex items-center justify-center bg-[#f3f4f6]/30 border-r border-[#dee1e6] text-[10px] font-bold">B</div>
                        </div>
                        {/* Grid Cells */}
                        <div className="grid grid-rows-2">
                          <div className="grid grid-cols-4 h-12">
                            {rack.rows[0].map((cell, i) => (
                              <div key={i} className={`border-b border-r last:border-r-0 flex items-center justify-center text-[10px] font-bold ${getCellColor(cell)}`}>
                                {cell || <span className="text-[#565d6d]/30">—</span>}
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-4 h-12">
                            {rack.rows[1].map((cell, i) => (
                              <div key={i} className={`border-r last:border-r-0 flex items-center justify-center text-[10px] font-bold ${getCellColor(cell)}`}>
                                {cell || <span className="text-[#565d6d]/30">—</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* Column Labels */}
                      <div className="grid grid-cols-[32px_1fr] bg-[#f3f4f6]/30 border-t border-[#dee1e6]">
                        <div />
                        <div className="grid grid-cols-4 py-1">
                          {[1, 2, 3, 4].map(n => (
                            <span key={n} className="text-center text-[8px] font-bold text-[#565d6d]">{n}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-12 pt-4 border-t border-[#dee1e6] flex flex-wrap items-center gap-x-8 gap-y-4">
              <span className="text-[12px] font-bold text-[#565d6d] uppercase">Live Legend:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white border border-[#dee1e6] rounded-sm" />
                <span className="text-xs font-medium">In Stock</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#FFAA00] rounded-sm" />
                <span className="text-xs font-medium">Allocated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#f3f4f6]/10 border border-[#dee1e6] rounded-sm" />
                <span className="text-xs font-medium">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#D92644] rounded-sm" />
                <span className="text-xs font-medium">Flagged/Audit</span>
              </div>
              <span className="ml-auto text-xs italic text-[#565d6d]">Last Sync: 12:44:01 PM GMT</span>
            </div>
          </div>

          {/* Details Panel */}
          <aside className="w-full lg:w-96 bg-[#fafafb] border-l border-[#dee1e6] flex flex-col">
            <div className="p-6 bg-white border-b border-[#dee1e6]">
              <div className="flex justify-between items-start mb-1">
                <h2 className="text-xl font-bold">PKG-9021</h2>
                <span className="px-3 py-1 bg-[#f3f4f6] rounded-full text-[10px] font-bold">In Stock</span>
              </div>
              <p className="text-xs text-[#565d6d] mb-6">SKU-772-B</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#f3f4f6]/40 rounded">
                  <p className="text-[10px] font-bold text-[#565d6d] uppercase mb-1">Weight</p>
                  <p className="text-sm font-semibold">2.4kg</p>
                </div>
                <div className="p-3 bg-[#f3f4f6]/40 rounded">
                  <p className="text-[10px] font-bold text-[#565d6d] uppercase mb-1">Dimensions</p>
                  <p className="text-sm font-semibold">12x12x8</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Icon icon="lucide:package" className="w-3 h-3 text-[#565d6d]" />
                  <h3 className="text-[12px] font-bold text-[#565d6d] uppercase">Product Description</h3>
                </div>
                <p className="text-sm">Precision Calibrator</p>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Icon icon="lucide:layers" className="w-3 h-3 text-[#565d6d]" />
                  <h3 className="text-[12px] font-bold text-[#565d6d] uppercase">Movement History</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#dee1e6]/50">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:calendar" className="w-3.5 h-3.5 text-[#565d6d]" />
                      <span className="text-sm text-[#565d6d]">Arrival</span>
                    </div>
                    <span className="text-sm font-medium">2023-11-20</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#dee1e6]/50">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:barcode" className="w-3.5 h-3.5 text-[#565d6d]" />
                      <span className="text-sm text-[#565d6d]">Last Scan</span>
                    </div>
                    <span className="text-sm font-medium">2 hrs ago</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#dee1e6]/50">
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:truck" className="w-3.5 h-3.5 text-[#565d6d]" />
                      <span className="text-sm text-[#565d6d]">Courier</span>
                    </div>
                    <span className="text-sm font-medium">Express Logistics</span>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Icon icon="lucide:user" className="w-3 h-3 text-[#565d6d]" />
                  <h3 className="text-[12px] font-bold text-[#565d6d] uppercase">Assigned Handler</h3>
                </div>
                <div className="flex items-center p-3 bg-white border border-[#dee1e6] rounded-md">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img src="./assets/IMG_19.webp" alt="Alex Rivera" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Alex Rivera</p>
                    <p className="text-[10px] text-[#565d6d]">Floor Supervisor • Zone B</p>
                  </div>
                </div>
              </section>
            </div>

            <div className="p-6 bg-white border-t border-[#dee1e6] space-y-3">
              <button className="w-full h-11 flex items-center justify-between px-6 bg-[#748dae] text-[#19191F] font-medium rounded-md hover:bg-[#637a99] transition-colors">
                Add to shipment
                <Icon icon="lucide:arrow-up-right" className="w-4 h-4" />
              </button>
              <button className="w-full h-10 border border-[#dee1e6] text-[#171a1f] font-medium rounded-md hover:bg-gray-50 transition-colors">
                Edit Metadata
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}