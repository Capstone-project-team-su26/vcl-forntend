"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/app/pages/admin/components/AdminLayout";
import AdditionalServiceFeeFormModal from "@/app/pages/admin/additional-service-fees/components/AdditionalServiceFeeFormModal";
import DataTable from "@/app/components/DataTable";
import * as feeService from "@/modules/additional-service-fees";
import { getErrorMessage } from "@/utils/apiError";
import {
  DEFAULT_QUOTATION_VAT_RATE,
  formatVatRatePercent,
  isVatRule,
  isVolumetricDivisorRule,
  resolveVatRate,
  VAT_RULE,
} from "@/modules/service-pricing";

const {
  formatFeeAmount,
  formatFeeCalculationType,
} = feeService;

const VAT_RULE_TEMPLATE = {
  id: null,
  code: VAT_RULE,
  name: "VAT báo giá ký gửi",
  feeCalculationType: "PERCENTAGE",
  fixedAmount: null,
  percentageRate: DEFAULT_QUOTATION_VAT_RATE * 100,
  unit: "% (cước + phí dịch vụ)",
  description: "VAT = (FreightCharge + ServiceFee) × tỷ lệ này.",
  isActive: true,
  ruleCode: VAT_RULE,
  ruleType: VAT_RULE,
};

const STATUS_FILTER_OPTIONS = [
  { value: "true", label: "Hoạt động" },
  { value: "false", label: "Vô hiệu" },
];

function ActiveBadge({ isActive }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
        isActive ? "bg-success-bg text-success-text" : "bg-surface text-muted"
      }`}
    >
      {isActive ? "Hoạt động" : "Vô hiệu"}
    </span>
  );
}

export default function AdditionalServiceFeesPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setActionError("");

      try {
        const data = await feeService.listAdditionalServiceFees();
        if (active) setItems(data);
      } catch (err) {
        if (active) setActionError(getErrorMessage(err));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  function openCreate() {
    setEditingItem(null);
    setModalMode("create");
  }

  function openEdit(item) {
    setEditingItem(item);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingItem(null);
  }

  function handleSaved(item, message) {
    setItems((current) => {
      const exists = current.some((entry) => entry.id === item.id);
      if (exists) {
        return current.map((entry) => (entry.id === item.id ? item : entry));
      }
      return [item, ...current];
    });
    setActionMessage(message);
    setActionError("");
  }

  async function handleToggleActive(item) {
    setPendingId(item.id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await feeService.updateAdditionalServiceFee(item.id, {
        isActive: !item.isActive,
      });
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? response.fee : entry))
      );
      setActionMessage(
        response.message ||
          (response.fee.isActive ? "Đã kích hoạt loại phí." : "Đã vô hiệu hóa loại phí.")
      );
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleToggleRequired(item) {
    if (isVolumetricDivisorRule(item) || isVatRule(item)) return;

    setPendingId(item.id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await feeService.updateAdditionalServiceFee(item.id, {
        isRequired: !item.isRequired,
      });
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? response.fee : entry))
      );
      setActionMessage(
        response.fee.isRequired
          ? "Đã đặt phí bắt buộc (Sales không tắt được)."
          : "Đã bỏ bắt buộc — Sales có thể bật/tắt."
      );
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Xóa loại phí "${item.name}"? Hành động này không thể hoàn tác.`
    );
    if (!confirmed) return;

    setPendingId(item.id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await feeService.deleteAdditionalServiceFee(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setActionMessage(response.message || "Đã xóa loại phí.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  const volumetricDivisorRule = useMemo(
    () => items.find(isVolumetricDivisorRule) ?? null,
    [items]
  );

  const vatRule = useMemo(() => items.find(isVatRule) ?? null, [items]);
  const vatRateLabel = useMemo(
    () => formatVatRatePercent(resolveVatRate(items)),
    [items]
  );

  function openVatEditor() {
    if (vatRule) {
      openEdit(vatRule);
      return;
    }
    setEditingItem({ ...VAT_RULE_TEMPLATE });
    setModalMode("create");
  }

  const columns = useMemo(
    () => [
      {
        key: "code",
        title: "Mã",
        sortable: true,
        searchable: true,
        className: "font-mono text-xs",
        render: (item) => item.code || "—",
      },
      {
        key: "name",
        title: "Tên loại phí",
        sortable: true,
        searchable: true,
        className: "font-semibold text-ink",
        render: (item) => item.name,
      },
      {
        key: "feeCalculationType",
        title: "Cách tính",
        className: "text-muted",
        render: (item) => formatFeeCalculationType(item.feeCalculationType, item),
      },
      {
        key: "amount",
        title: "Mức phí",
        className: "font-semibold text-ink",
        render: (item) => formatFeeAmount(item),
      },
      {
        key: "unit",
        title: "Đơn vị",
        headerClassName: "hidden md:table-cell",
        className: "text-muted hidden md:table-cell",
        render: (item) => item.unit || "—",
      },
      {
        key: "isRequired",
        title: "Bắt buộc",
        headerClassName: "hidden sm:table-cell",
        className: "hidden sm:table-cell",
        sortAccessor: (item) => (item.isRequired ? 1 : 0),
        render: (item) => {
          const locked = isVolumetricDivisorRule(item) || isVatRule(item);
          if (locked) {
            return <span className="text-muted text-xs">—</span>;
          }
          return (
            <button
              type="button"
              disabled={pendingId === item.id}
              onClick={() => handleToggleRequired(item)}
              title={
                item.isRequired
                  ? "Bỏ bắt buộc (Sales có thể tắt)"
                  : "Đặt bắt buộc (Sales không tắt được)"
              }
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors disabled:opacity-50 ${
                item.isRequired
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "bg-surface text-muted hover:bg-border-muted hover:text-ink"
              }`}
            >
              {item.isRequired ? "Bắt buộc" : "Tùy chọn"}
            </button>
          );
        },
      },
      {
        key: "description",
        title: "Mô tả",
        searchable: true,
        headerClassName: "hidden lg:table-cell",
        className: "text-muted hidden lg:table-cell max-w-xs",
        render: (item) => <span className="line-clamp-2">{item.description || "—"}</span>,
      },
      {
        key: "status",
        title: "Trạng thái",
        sortable: true,
        sortAccessor: (item) => (item.isActive ? 1 : 0),
        filter: { options: STATUS_FILTER_OPTIONS },
        filterAccessor: (item) => String(Boolean(item.isActive)),
        render: (item) => <ActiveBadge isActive={item.isActive} />,
      },
      {
        key: "actions",
        title: "Thao tác",
        align: "right",
        render: (item) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => openEdit(item)}
              className="p-2 text-muted hover:text-ink rounded-lg hover:bg-surface"
              title="Sửa"
            >
              <Icon icon="lucide:pencil" className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={pendingId === item.id}
              onClick={() => handleToggleActive(item)}
              className="p-2 text-muted hover:text-ink rounded-lg hover:bg-surface disabled:opacity-50"
              title={item.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
            >
              <Icon
                icon={item.isActive ? "lucide:ban" : "lucide:check-circle"}
                className="w-4 h-4"
              />
            </button>
            <button
              type="button"
              disabled={pendingId === item.id}
              onClick={() => handleDelete(item)}
              className="btn-delete-icon disabled:opacity-50"
              title="Xóa"
            >
              <Icon icon="lucide:trash-2" className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [pendingId]
  );

  return (
    <AdminLayout activeNav="additional-service-fees">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight">
              Phí dịch vụ bổ sung
            </h1>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Cấu hình bảo hiểm, đóng thùng, gia cố, kiểm hàng, lưu kho… khi báo giá.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-insight hover:bg-secondary text-white text-sm font-bold shrink-0"
          >
            <Icon icon="lucide:plus" className="w-4 h-4" />
            Thêm loại phí
          </button>
        </div>

        {actionError ? (
          <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
            {actionError}
          </div>
        ) : null}

        {actionMessage ? (
          <div className="rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text">
            {actionMessage}
          </div>
        ) : null}

        <DataTable
          columns={columns}
          rows={items}
          loading={isLoading}
          title="Danh sách phí dịch vụ bổ sung"
          countLabel="loại phí"
          searchPlaceholder="Tìm theo mã, tên hoặc mô tả..."
          emptyText="Chưa có loại phí nào."
          emptyFilteredText="Không có loại phí phù hợp với bộ lọc."
          minWidth={980}
        />

        <div className="rounded-xl border border-border-muted bg-surface-elevated px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-ink">Hệ số quy đổi thể tích</p>
            <p className="text-xs text-muted mt-0.5">
              Dùng khi tính DIM: thể tích (cm³) ÷ hệ số. Quy tắc hệ thống mã{" "}
              <span className="font-mono">VOLUMETRIC_DIVISOR</span>.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <p className="text-sm text-muted">
              Đang áp dụng:{" "}
              <span className="font-mono font-bold text-ink">
                {Number(volumetricDivisorRule?.fixedAmount) > 0
                  ? Number(volumetricDivisorRule.fixedAmount).toLocaleString("vi-VN")
                  : "5.000 (mặc định IATA)"}
              </span>
            </p>
            {volumetricDivisorRule ? (
              <button
                type="button"
                onClick={() => openEdit(volumetricDivisorRule)}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border-muted text-sm font-semibold text-ink hover:bg-surface"
              >
                <Icon icon="lucide:pencil" className="w-4 h-4" />
                Chỉnh sửa
              </button>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-border-muted bg-surface-elevated px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-ink">VAT báo giá ký gửi</p>
            <p className="text-xs text-muted mt-0.5">
              VAT = (cước + phí dịch vụ) × tỷ lệ. Quy tắc hệ thống mã{" "}
              <span className="font-mono">VAT</span> / <span className="font-mono">IMPORT_TAX</span>{" "}
              (không hiện như phụ phí bật/tắt trên Sales).
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <p className="text-sm text-muted">
              Đang áp dụng:{" "}
              <span className="font-mono font-bold text-ink">
                {vatRule ? vatRateLabel : `${vatRateLabel} (mặc định)`}
              </span>
            </p>
            <button
              type="button"
              onClick={openVatEditor}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border-muted text-sm font-semibold text-ink hover:bg-surface"
            >
              <Icon icon={vatRule ? "lucide:pencil" : "lucide:plus"} className="w-4 h-4" />
              {vatRule ? "Chỉnh sửa" : "Tạo quy tắc"}
            </button>
          </div>
        </div>
      </div>

      <AdditionalServiceFeeFormModal
        open={modalMode !== null}
        mode={modalMode}
        fee={editingItem}
        onClose={closeModal}
        onSaved={handleSaved}
      />
    </AdminLayout>
  );
}
