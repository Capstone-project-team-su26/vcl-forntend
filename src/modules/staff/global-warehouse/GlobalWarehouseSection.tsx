"use client";

const inboundStats = [
  { icon: "./assets/IMG_1.svg", label: "Parcels Awaiting Receipt", value: "12", trend: "+2 this week", iconBg: "bg-[#9ECAD6]/20", iconColor: "text-[#9ECAD6]" },
  { icon: "./assets/IMG_10.svg", label: "Unidentified Parcels", value: "04", trend: "Needs matching", iconBg: "bg-transparent", iconColor: "text-[#16181D]" },
];

const inboundTransfers = [
  { id: "SS-9402", status: "In Transit", route: ["Mumbai", "Dubai"], type: "EXPRESS", typeIcon: "./assets/IMG_16.svg", eta: "24 Oct" },
  { id: "SS-8122", status: "Processing", route: ["Chennai", "Singapore"], type: "STANDARD", typeIcon: "./assets/IMG_18.svg", eta: "26 Oct" },
  { id: "SS-6549", status: "Pending", route: ["New York", "New Delhi"], type: "EXPRESS", typeIcon: "./assets/IMG_16.svg", eta: "28 Oct" },
];

export default function GlobalWarehouseSection() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-oswald text-3xl lg:text-[36px] font-black leading-tight tracking-tight mb-2">
          Global warehouse operations
        </h1>
        <p className="text-[#575E6B] text-base lg:text-lg font-medium mb-8">
          Receive parcels, scan and match codes, measure weight and dimensions, classify goods, and handle unidentified parcels.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {inboundStats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-50 flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className={`w-9 h-9 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                <img src={stat.icon} alt={stat.label} className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div className="flex items-center gap-1">
                <img src="./assets/IMG_14.svg" alt="Trend" className="w-3 h-3" />
                <span className="text-[12px] font-bold">{stat.trend}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-[#575E6B] mb-1">{stat.label}</p>
              <p className="font-oswald text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-oswald text-xl font-bold mb-1">Inbound Shipments</h2>
            <p className="text-sm text-[#575E6B]">Scan, match, and measure incoming international parcels</p>
          </div>
          <button className="flex items-center gap-1 text-[#9ECAD6] font-bold text-sm hover:underline">
            View All <img src="./assets/IMG_17.svg" alt="Arrow" className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-left border-b border-[#f3f4f6]">
                <th className="pb-3 text-sm font-bold">Parcel Code</th>
                <th className="pb-3 text-sm font-bold">Status</th>
                <th className="pb-3 text-sm font-bold">Route</th>
                <th className="pb-3 text-sm font-bold">Classification</th>
                <th className="pb-3 text-sm font-bold text-right">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {inboundTransfers.map((row, idx) => (
                <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 text-sm font-bold text-[#9ECAD6]">{row.id}</td>
                  <td className="py-4">
                    <span className={`inline-block px-3 py-1 rounded-lg text-[12px] font-semibold ${
                      row.status === "Pending" ? "bg-[#f3f4f6] text-[#575E6B]" : "border border-[#f3f4f6] text-[#16181D]"
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span>{row.route[0]}</span>
                      <img src="./assets/IMG_17.svg" alt="to" className="w-3 h-3 opacity-30" />
                      <span>{row.route[1]}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <img src={row.typeIcon} alt={row.type} className="w-3 h-3 text-[#9ECAD6]" />
                      <span className="text-[12px] font-bold text-[#575E6B] tracking-wider uppercase">{row.type}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm font-bold text-right">{row.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
