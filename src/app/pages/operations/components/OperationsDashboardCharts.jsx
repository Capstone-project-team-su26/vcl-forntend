import { useId } from "react";
import { Icon } from "@iconify/react";
import { getConsignmentStatusLabel } from "@/modules/consignments";

const CHART_COLORS = [
  "var(--theme-secondary)",
  "var(--theme-primary)",
  "var(--theme-success)",
  "var(--theme-warning-text)",
  "var(--theme-insight)",
  "var(--theme-faint)",
];

function EmptyChart({ message }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-muted text-muted">
        <Icon icon="lucide:chart-no-axes-column" className="h-5 w-5" aria-hidden />
      </span>
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}

function ChartHeader({ title, description, icon }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-secondary">
        <Icon icon={icon} className="h-4 w-4" aria-hidden />
      </span>
      <div>
        <h2 className="text-base font-bold text-ink">{title}</h2>
        <p className="mt-0.5 text-xs text-muted">{description}</p>
      </div>
    </div>
  );
}

export function OperationsTrendChart({ data }) {
  const gradientId = useId().replaceAll(":", "");
  const width = 720;
  const height = 240;
  const padding = { top: 22, right: 18, bottom: 38, left: 34 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(1, ...data.map((item) => item.count));
  const xFor = (index) =>
    padding.left + (index * chartWidth) / Math.max(1, data.length - 1);
  const yFor = (value) => padding.top + chartHeight - (value / maxValue) * chartHeight;
  const points = data.map((item, index) => `${xFor(index)},${yFor(item.count)}`).join(" ");
  const areaPoints = `${padding.left},${padding.top + chartHeight} ${points} ${
    padding.left + chartWidth
  },${padding.top + chartHeight}`;
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));

  return (
    <section className="rounded-2xl border border-border-muted bg-surface-elevated p-4 shadow-sm sm:p-5 lg:col-span-2">
      <ChartHeader
        title="Xu hướng lô hàng"
        description="Số lô được tạo mới trong khoảng thời gian đã chọn"
        icon="lucide:chart-spline"
      />
      {data.some((item) => item.count > 0) ? (
        <div className="mt-5 overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto min-w-155 w-full"
            role="img"
            aria-label={`Biểu đồ xu hướng gồm ${data.reduce(
              (sum, item) => sum + item.count,
              0
            )} lô hàng`}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--theme-primary)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--theme-primary)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {[0, 0.5, 1].map((ratio) => {
              const y = padding.top + chartHeight * ratio;
              const value = Math.round(maxValue * (1 - ratio));
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    x2={padding.left + chartWidth}
                    y1={y}
                    y2={y}
                    stroke="var(--theme-border-muted)"
                    strokeDasharray="4 6"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="var(--theme-muted)"
                    fontSize="11"
                  >
                    {value}
                  </text>
                </g>
              );
            })}
            <polygon points={areaPoints} fill={`url(#${gradientId})`} />
            <polyline
              points={points}
              fill="none"
              stroke="var(--theme-secondary)"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {data.map((item, index) => (
              <g key={item.date}>
                <circle
                  cx={xFor(index)}
                  cy={yFor(item.count)}
                  r="8"
                  fill="transparent"
                  className="cursor-crosshair"
                >
                  <title>
                    {item.label}: {item.count} lô, {item.totalWeight.toLocaleString("vi-VN")} kg
                  </title>
                </circle>
                {index % labelEvery === 0 || index === data.length - 1 ? (
                  <text
                    x={xFor(index)}
                    y={height - 10}
                    textAnchor="middle"
                    fill="var(--theme-muted)"
                    fontSize="11"
                  >
                    {item.label}
                  </text>
                ) : null}
              </g>
            ))}
          </svg>
        </div>
      ) : (
        <EmptyChart message="Chưa có lô hàng trong khoảng thời gian này." />
      )}
    </section>
  );
}

export function OperationsStatusChart({ data, total }) {
  const visible = data.slice(0, 5);
  const hiddenCount = data.slice(5).reduce((sum, item) => sum + item.count, 0);
  const segments = hiddenCount
    ? [...visible, { status: "OTHER", count: hiddenCount, percent: Math.round((hiddenCount / total) * 100) }]
    : visible;
  const gradient = segments
    .map((item, index) => {
      const start = segments
        .slice(0, index)
        .reduce((sum, segment) => sum + segment.percent, 0);
      const end = Math.min(100, start + item.percent);
      return `${CHART_COLORS[index]} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <section className="rounded-2xl border border-border-muted bg-surface-elevated p-4 shadow-sm sm:p-5">
      <ChartHeader
        title="Cơ cấu trạng thái"
        description="Phân bổ lô hàng theo tiến độ"
        icon="lucide:chart-pie"
      />
      {total > 0 ? (
        <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start lg:flex-col xl:flex-row">
          <div
            className="relative h-36 w-36 shrink-0 rounded-full"
            style={{ background: `conic-gradient(${gradient})` }}
            role="img"
            aria-label={`Phân bổ trạng thái của ${total} lô hàng`}
          >
            <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-surface-elevated">
              <strong className="text-2xl font-black tabular-nums text-ink">{total}</strong>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Tổng lô
              </span>
            </div>
          </div>
          <ul className="w-full min-w-0 space-y-2.5">
            {segments.map((item, index) => (
              <li key={item.status} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: CHART_COLORS[index] }}
                />
                <span className="min-w-0 flex-1 truncate text-muted">
                  {item.status === "OTHER"
                    ? "Trạng thái khác"
                    : getConsignmentStatusLabel(item.status)}
                </span>
                <strong className="tabular-nums text-ink">{item.count}</strong>
                <span className="w-8 text-right tabular-nums text-muted">{item.percent}%</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyChart message="Chưa có dữ liệu trạng thái." />
      )}
    </section>
  );
}

export function OperationsRouteRanking({ data }) {
  const maxCount = Math.max(1, ...data.map((item) => item.count));

  return (
    <section className="rounded-2xl border border-border-muted bg-surface-elevated p-4 shadow-sm sm:p-5">
      <ChartHeader
        title="Tuyến hoạt động nhiều"
        description="Top 5 tuyến theo số lượng lô"
        icon="lucide:route"
      />
      {data.length ? (
        <ol className="mt-5 space-y-4">
          {data.map((item, index) => (
            <li key={item.route}>
              <div className="mb-1.5 flex items-center gap-3 text-xs">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-muted font-bold text-secondary">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-semibold text-ink" title={item.route}>
                  {item.route}
                </span>
                <span className="tabular-nums text-muted">
                  {item.count} lô · {item.totalWeight.toLocaleString("vi-VN")} kg
                </span>
              </div>
              <div className="ml-9 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(8, (item.count / maxCount) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyChart message="Chưa có dữ liệu tuyến." />
      )}
    </section>
  );
}
