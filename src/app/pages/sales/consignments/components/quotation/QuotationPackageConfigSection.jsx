"use client";

import { Icon } from "@iconify/react";
import {
  formatDimensions,
  formatMaxWeight,
  formatMoney,
} from "@/modules/package-configurations";
import {
  buildPackageConfigMismatchWarnings,
  resolveCustomerPackageSelections,
} from "@/modules/consignments/quotation";

function PackageConfigFacts({ config }) {
  if (!config) {
    return <p className="text-sm text-muted">Chưa có chi tiết cấu hình thùng từ API.</p>;
  }

  const fee =
    config.estimatedFee != null && Number(config.estimatedFee) > 0
      ? config.estimatedFee
      : config.packageFee;

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
      <div>
        <dt className="text-xs text-muted">Mã cấu hình</dt>
        <dd className="font-mono font-bold text-ink">{config.code || "—"}</dd>
      </div>
      <div>
        <dt className="text-xs text-muted">Tên cấu hình</dt>
        <dd className="font-semibold text-ink">{config.name || "—"}</dd>
      </div>
      <div>
        <dt className="text-xs text-muted">Kích thước chuẩn (D × R × C)</dt>
        <dd className="text-ink">{formatDimensions(config)}</dd>
      </div>
      <div>
        <dt className="text-xs text-muted">Khối lượng tối đa</dt>
        <dd className="text-ink">{formatMaxWeight(config.maxWeight)}</dd>
      </div>
      <div className="sm:col-span-2">
        <dt className="text-xs text-muted">Phí vỏ thùng (từ cấu hình)</dt>
        <dd className="font-semibold text-ink">{formatMoney(fee)}</dd>
      </div>
    </dl>
  );
}

/**
 * Read-only: cấu hình thùng Customer đã chọn + đối chiếu kiện kho (nếu có).
 * Sales không chọn/đổi package configuration tại đây.
 */
export default function QuotationPackageConfigSection({
  consignment,
  quotation,
  packingFeeTotalFromLines,
}) {
  const packageInfo = resolveCustomerPackageSelections(consignment, quotation);
  const parcels = quotation?.parcels ?? consignment?.quotation?.parcels ?? [];
  const warnings = buildPackageConfigMismatchWarnings({
    selections: packageInfo.selections,
    parcels,
  });

  const packingInQuote =
    packingFeeTotalFromLines != null && packingFeeTotalFromLines !== ""
      ? Number(packingFeeTotalFromLines) || 0
      : packageInfo.packingFeeTotal;

  if (!packageInfo.hasCustomerSelection && !packageInfo.packingFees.length && !parcels.length) {
    return (
      <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-2">
        <h2 className="text-lg font-bold text-ink">Cấu hình đóng gói</h2>
        <p className="text-sm text-muted">
          Đơn này chưa có cấu hình thùng Customer chọn và chưa có kiện từ kho.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border-muted bg-surface-elevated p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-ink">Cấu hình đóng gói (Customer đã chọn)</h2>
          <p className="text-sm text-muted mt-1">
            Chỉ xem — Sales không đổi loại thùng thay Customer. Phí vỏ thùng lấy từ API
            (`packageConfiguration` / dòng <span className="font-mono">PACKING_FEE</span>).
          </p>
        </div>
        {packingInQuote > 0 ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-right shrink-0">
            <p className="text-[10px] uppercase tracking-wide text-muted font-bold">
              Phí vỏ thùng trong báo giá
            </p>
            <p className="text-base font-black text-primary font-mono">{formatMoney(packingInQuote)}</p>
          </div>
        ) : null}
      </div>

      {packageInfo.selections.length ? (
        <div className="space-y-3">
          {packageInfo.selections.map((selection) => (
            <article
              key={selection.itemId || selection.itemIndex}
              className="rounded-lg border border-border-muted bg-surface/40 p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-ink">{selection.productName}</p>
                <span className="text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded">
                  Khách chọn · khóa
                </span>
              </div>
              <PackageConfigFacts config={selection.config} />

              {selection.actualConfig || selection.actualPackageConfigurationId ? (
                <div className="rounded-md border border-border-muted bg-surface p-3 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">
                    Loại thùng thực tế (kho)
                  </p>
                  {selection.actualConfig ? (
                    <PackageConfigFacts config={selection.actualConfig} />
                  ) : (
                    <p className="text-sm font-mono text-ink">
                      {selection.actualPackageConfigurationId}
                    </p>
                  )}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}

      {parcels.length ? (
        <div className="space-y-2">
          <p className="text-sm font-bold text-ink">Kiện thực tế từ kho</p>
          <div className="overflow-x-auto rounded-lg border border-border-muted">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted border-b border-border-muted bg-surface/50">
                  <th className="px-3 py-2">Mã kiện</th>
                  <th className="px-3 py-2">D × R × C</th>
                  <th className="px-3 py-2">Cân thực tế</th>
                  <th className="px-3 py-2">Cấu hình kho</th>
                </tr>
              </thead>
              <tbody>
                {parcels.map((parcel, index) => (
                  <tr key={parcel.parcelId || index} className="border-b border-border-muted/60">
                    <td className="px-3 py-2 font-mono text-xs">
                      {parcel.packageCode || parcel.parcelId || `Kiện ${index + 1}`}
                    </td>
                    <td className="px-3 py-2">{formatDimensions(parcel)}</td>
                    <td className="px-3 py-2">{formatMaxWeight(parcel.actualWeight)}</td>
                    <td className="px-3 py-2">
                      {parcel.packageConfiguration?.code ||
                        parcel.packageConfigurationId ||
                        "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted flex items-center gap-1.5">
          <Icon icon="lucide:info" className="w-3.5 h-3.5 shrink-0" />
          Chưa có dữ liệu kiện từ kho trên báo giá (`parcels` trống).
        </p>
      )}

      {warnings.length ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 space-y-1.5">
          <p className="text-sm font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
            <Icon icon="lucide:triangle-alert" className="w-4 h-4" />
            Cảnh báo lệch thùng / kích thước
          </p>
          <ul className="list-disc pl-5 text-sm text-amber-800 dark:text-amber-200 space-y-1">
            {warnings.map((warning, index) => (
              <li key={`${warning.level}-${warning.itemId}-${warning.parcelId}-${index}`}>
                {warning.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
