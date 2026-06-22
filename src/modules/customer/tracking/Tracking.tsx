import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

export default function Tracking() {
  // State management for API data
  const [consignments, setConsignments] = useState([]);
  const [selectedConsignment, setSelectedConsignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for search parameter
  const [searchCode, setSearchCode] = useState('');
  const [triggerSearch, setTriggerSearch] = useState('');

  // Fetch data automatically on mount and whenever triggerSearch changes
  useEffect(() => {
    const fetchConsignments = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = 'https://api-vcl.purintech.id.vn/api/orders/consignments?pageNumber=1&pageSize=10';
        if (triggerSearch) {
          url += `&searchCode=${encodeURIComponent(triggerSearch)}`;
        }

        const token = localStorage.getItem('accessToken')

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Include the token here if it exists
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });

        if (!response.ok) {
          // Better debugging: this will tell you if it's a 401, 403, 500, etc.
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result && result.data && result.data.items) {
          const items = result.data.items;
          setConsignments(items);
          // Default to displaying the first item in the detailed panel
          if (items.length > 0) {
            setSelectedConsignment(items[0]);
          } else {
            setSelectedConsignment(null);
          }
        }
      } catch (err) {
        setError('Could not retrieve tracking details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConsignments();
  }, [triggerSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setTriggerSearch(searchCode);
  };

  const handleQuickSearch = (code) => {
    setSearchCode(code);
    setTriggerSearch(code);
  };

  // Helper helper to clean up status display strings
  const formatStatus = (status) => {
    if (!status) return 'N/A';
    return status.replace(/_/g, ' ');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Open_Sans']">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#F4F9FA] py-12 px-4 md:px-20 border-b border-[#f3f4f6]">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-[30px] font-black text-[#16181D] tracking-tight mb-2">Track Your Shipments</h1>
            <p className="text-[#575E6B] text-base mb-8">Enter your tracking number below to see real-time status updates.</p>
            
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 max-w-5xl">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <img src="./assets/IMG_4.svg" className="w-5 h-5 text-[#575E6B]" alt="Search" />
                </div>
                <input 
                  type="text" 
                  placeholder="Enter order ID or consignment code..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 bg-white border border-[#748DAE]/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#9ECAD6]/50 font-semibold text-[#16181D]"
                />
              </div>
              <button type="submit" className="h-12 px-8 bg-[#9ECAD6] text-white font-bold rounded-lg shadow-md hover:bg-[#8dbbc8] transition-colors whitespace-nowrap">
                Track Package
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-[12px] font-bold text-[#575E6B] uppercase tracking-widest">Quick Search Examples:</span>
              {['aa64cab0', '7573365d', '12b3a05e'].map((id) => (
                <span 
                  key={id} 
                  onClick={() => handleQuickSearch(id)}
                  className="px-3 py-1 bg-[#f3f4f6] rounded-full text-[12px] font-medium text-[#1F2228] cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  {id}...
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="max-w-6xl mx-auto px-4 md:px-20 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Tracking Panel */}
          <div className="lg:col-span-8 space-y-6">
            {loading ? (
              <div className="p-12 text-center border rounded-xl font-bold text-[#748DAE]">Loading live consignment status...</div>
            ) : error ? (
              <div className="p-12 text-center border border-red-200 rounded-xl font-bold text-red-500 bg-red-50">{error}</div>
            ) : selectedConsignment ? (
              <div className="bg-white rounded-xl border-2 border-[#9ECAD6]/20 shadow-sm overflow-hidden">
                {/* Card Header */}
                <div className="bg-[#F9FAFB] p-6 border-b border-[#f3f4f6] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#9ECAD6]/10 rounded-lg flex items-center justify-center">
                      <img src="./assets/IMG_5.svg" className="w-6 h-6 text-[#9ECAD6]" alt="Truck" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-[#16181D] tracking-tight break-all">
                        {selectedConsignment.consignmentCode || selectedConsignment.orderId}
                      </h2>
                      <p className="text-[10px] font-bold text-[#575E6B] uppercase tracking-wider">
                        Customer: {selectedConsignment.customerName}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 py-1.5 bg-[#9ECAD6]/20 border border-[#9ECAD6]/30 rounded-full text-[#9ECAD6] font-bold text-sm capitalize">
                    {formatStatus(selectedConsignment.status)}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#f3f4f6]/40 rounded-xl p-4 border border-[#f3f4f6]">
                    <div>
                      <div className="text-[10px] font-bold text-[#575E6B] uppercase mb-2">Service Type</div>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-[#16181D]">
                        {selectedConsignment.consignmentType || 'Standard'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#575E6B] uppercase mb-2">Date Created</div>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-[#16181D]">
                        <img src="./assets/IMG_7.svg" className="w-4 h-4 text-[#748DAE]" alt="Calendar" />
                        {new Date(selectedConsignment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#575E6B] uppercase mb-2">Weight</div>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-[#16181D]">
                        <img src="./assets/IMG_2.svg" className="w-4 h-4 text-[#748DAE]" alt="Package" />
                        {selectedConsignment.totalWeight} kg
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#575E6B] uppercase mb-2">Volume</div>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-[#16181D]">
                        <img src="./assets/IMG_8.svg" className="w-4 h-4 text-[#748DAE]" alt="Shield" />
                        {selectedConsignment.totalVolume} m³
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mt-10">
                    <h3 className="text-lg font-black text-[#16181D] mb-6">Delivery Progress</h3>
                    <div className="space-y-0">
                      {/* Milestone 1: Current State */}
                      <div className="relative pl-12 pb-10">
                        <div className="absolute left-0 top-0 w-8 h-8 bg-[#9ECAD6] border-2 border-[#9ECAD6] rounded-full flex items-center justify-center z-10">
                          <img src="./assets/IMG_8.svg" className="w-4 h-4 text-white" alt="Check" />
                        </div>
                        <div className="absolute left-4 top-8 bottom-0 w-[2px] bg-[#9ECAD6]" />
                        <div>
                          <div className="text-sm font-bold text-[#16181D] capitalize">{formatStatus(selectedConsignment.status)}</div>
                          <div className="text-[12px] font-medium text-[#575E6B]">Current Status Update</div>
                        </div>
                      </div>

                      {/* Milestone 2: Order Placed */}
                      <div className="relative pl-12">
                        <div className="absolute left-0 top-0 w-8 h-8 bg-white border-2 border-[#9ECAD6] rounded-full flex items-center justify-center z-10">
                          <img src="./assets/IMG_9.svg" className="w-4 h-4 text-[#9ECAD6]" alt="Clock" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#16181D]">Order Created Successfully</div>
                          <div className="text-[12px] font-medium text-[#575E6B]">
                            {new Date(selectedConsignment.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center border rounded-xl font-bold text-[#575E6B]">No consignments found matching that criteria.</div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-white rounded-lg border-2 border-[#9ECAD6]/20 flex flex-col items-start gap-1 cursor-pointer hover:bg-gray-50 transition-colors">
                <img src="./assets/IMG_7.svg" className="w-5 h-5 text-[#9ECAD6] mb-1" alt="Calendar" />
                <div className="text-sm font-bold text-[#16181D]">Reschedule Delivery</div>
                <div className="text-[12px] font-medium text-[#575E6B]">Choose a different date or time</div>
              </div>
              <div className="p-5 bg-white rounded-lg border-2 border-[#F5CBCB]/20 flex flex-col items-start gap-1 cursor-pointer hover:bg-gray-50 transition-colors">
                <img src="./assets/IMG_6.svg" className="w-5 h-5 text-[#F5CBCB] mb-1" alt="Location" />
                <div className="text-sm font-bold text-[#16181D]">Hold at Location</div>
                <div className="text-[12px] font-medium text-[#575E6B]">Pick up from a nearby partner shop</div>
              </div>
            </div>
          </div>

          {/* Sidebar Panels */}
          <div className="lg:col-span-4 space-y-6">
            {/* Incoming Soon */}
            <div className="bg-white rounded-xl shadow-sm border border-[#f3f4f6] p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-black text-[#16181D]">Consignment List</h3>
                <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                  <img src="./assets/IMG_10.svg" className="w-4 h-4" alt="Download" />
                </button>
              </div>
              <p className="text-[12px] text-[#575E6B] mb-6">{consignments.length} packages total</p>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {consignments.map((item) => (
                  <div 
                    key={item.orderId}
                    onClick={() => setSelectedConsignment(item)}
                    className={`p-4 border rounded-lg relative cursor-pointer transition-all ${
                      selectedConsignment?.orderId === item.orderId 
                        ? 'border-[#9ECAD6] bg-[#F4F9FA]' 
                        : 'border-[#f3f4f6] hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-[#f3f4f6]/40 rounded-full flex items-center justify-center flex-shrink-0">
                        <img src="./assets/IMG_2.svg" className="w-5 h-5 text-[#748DAE]" alt="Package" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold font-[Oswald] text-[#16181D] truncate">
                            {item.consignmentCode || `${item.orderId.substring(0, 8)}...`}
                          </span>
                          <span className="px-2 py-0.5 bg-[#9ECAD6]/20 border border-[#9ECAD6]/30 rounded-full text-[9px] font-bold text-[#9ECAD6] whitespace-nowrap capitalize">
                            {formatStatus(item.status)}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#575E6B] mt-0.5">Type: {item.consignmentType}</div>
                        <div className="text-[10px] font-bold text-[#575E6B] text-right mt-1">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Panel */}
            <div className="bg-[#748DAE] rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
              <div className="absolute -top-4 -right-4 opacity-10">
                <img src="./assets/IMG_12.svg" className="w-24 h-24" alt="Phone Icon" />
              </div>
              
              <h3 className="text-lg font-black mb-2">Need Help?</h3>
              <p className="text-sm text-white/80 font-medium mb-6 leading-relaxed">Our logistics experts are available 24/7 to assist with your delivery.</p>
              
              <div className="bg-white/10 rounded-lg p-3 flex items-start gap-3 mb-6">
                <img src="./assets/IMG_13.svg" className="w-5 h-5 text-[#F5CBCB] mt-0.5" alt="Alert" />
                <div>
                  <div className="text-[12px] font-bold">Having issues?</div>
                  <div className="text-[10px] text-white/80">Check our resolution center</div>
                </div>
              </div>

              <button className="w-full h-10 bg-white rounded-lg flex items-center justify-center gap-3 text-[#748DAE] font-black text-sm shadow-sm hover:bg-gray-50 transition-colors">
                <img src="./assets/IMG_12.svg" className="w-4 h-4" alt="Phone" />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}