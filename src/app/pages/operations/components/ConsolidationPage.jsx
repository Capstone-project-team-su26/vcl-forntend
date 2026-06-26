"use client";

import OperationsShell from "@/app/pages/operations/components/OperationsShell";

const mockSummary = [
  {
    label: "Tổng lô cần gom",
    value: "24",
    sub: "5 tuyến nội thành, 3 tuyến ngoại tỉnh",
  },
  {
    label: "Đã sắp xếp",
    value: "18",
    sub: "75% số lô đã được phân nhóm",
  },
  {
    label: "Chờ xác nhận",
    value: "6",
    sub: "2 lô cần phản hồi từ kho",
  },
];

const mockRoutes = [
  {
    title: "Tuyến Bắc - Trung",
    count: "8 lô",
    eta: "08:30",
    status: "Đang chạy đúng tiến độ",
  },
  {
    title: "Tuyến Nam - Đông",
    count: "6 lô",
    eta: "10:45",
    status: "Có 1 lô chờ ghép",
  },
  {
    title: "Tuyến nội thành",
    count: "10 lô",
    eta: "13:15",
    status: "Sẵn sàng xuất bến",
  },
];

const mockTasks = [
  "Xác nhận 2 lô từ kho A trước 09:00",
  "Kiểm tra tình trạng xe cho chuyến 14:00",
  "Cập nhật số lượng kiện cho tuyến Bắc",
];

const mockSchedule = [
  { time: "07:00", route: "Tuyến nội thành", note: "Gom 4 lô đầu tiên" },
  { time: "09:30", route: "Tuyến Bắc - Trung", note: "Ghép lô từ kho B" },
  { time: "12:00", route: "Tuyến Nam - Đông", note: "Xác nhận số seal" },
];

export default function ConsolidationPage() {
  return (
    <OperationsShell activeNav="consolidation">
      <div className="space-y-8">
        <section>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight">
            Tổng hợp gom hàng
          </h1>
          <p className="text-muted text-sm font-medium mt-2">
            Bảng tổng hợp nhanh các lô hàng đang chờ gom và các tuyến vận chuyển trong ngày.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockSummary.map((item) => (
            <div
              key={item.label}
              className="bg-white p-6 rounded-xl border border-surface-muted shadow-sm"
            >
              <p className="text-xs font-medium text-muted uppercase tracking-wide">{item.label}</p>
              <p className="text-3xl font-bold font-['Oswald'] mt-2">{item.value}</p>
              <p className="text-xs text-muted mt-2">{item.sub}</p>
            </div>
          ))}
        </section>

        <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="bg-white rounded-xl border border-surface-muted overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-muted">
              <h2 className="text-lg font-bold font-['Oswald']">Tổng hợp theo tuyến</h2>
            </div>
            <div className="p-6 space-y-4">
              {mockRoutes.map((route) => (
                <div key={route.title} className="rounded-lg border border-gray-100 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-ink">{route.title}</p>
                      <p className="text-sm text-muted mt-1">{route.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-secondary">{route.count}</p>
                      <p className="text-xs text-muted">ETA {route.eta}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-surface-muted overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-muted">
              <h2 className="text-lg font-bold font-['Oswald']">Công việc cần xử lý</h2>
            </div>
            <ul className="p-6 space-y-3">
              {mockTasks.map((task) => (
                <li key={task} className="flex gap-2 text-sm text-ink">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-secondary shrink-0" />
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-surface-muted overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-muted">
            <h2 className="text-lg font-bold font-['Oswald']">Lịch trình gom hàng</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[560px]">
              <thead>
                <tr className="border-b border-gray-50 text-sm font-bold">
                  <th className="px-6 py-3">Thời gian</th>
                  <th className="px-6 py-3">Tuyến</th>
                  <th className="px-6 py-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {mockSchedule.map((row) => (
                  <tr key={row.time} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-bold text-secondary">{row.time}</td>
                    <td className="px-6 py-3">{row.route}</td>
                    <td className="px-6 py-3 text-muted">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </OperationsShell>
  );
}
