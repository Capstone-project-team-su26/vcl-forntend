"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import ServicePricingFormModal from "./PricingRuleFormModal";
import DataTable from "@/app/components/DataTable";
import * as servicePricingService from "@/utils/servicePricingService";
import { getErrorMessage } from "@/utils/apiError";

const {
  SERVICE_TYPE_LABELS,
  UNIT_TYPE_LABELS,
  formatServicePricingRoute,
  formatMoney,
} = servicePricingService;

const STATUS_FILTER_OPTIONS = [
  { value: "true", label: "Hoạt động" },
  { value: "false", label: "Vô hiệu" },
];

const SERVICE_TYPE_FILTER_OPTIONS = Object.entries(SERVICE_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
);

const UNIT_TYPE_FILTER_OPTIONS = Object.entries(UNIT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

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

export default function PricingRulesPage() {
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
        const data = await servicePricingService.listServicePricings();
        if (active) setItems(Array.isArray(data) ? data : data?.items ?? []);
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
      if (exists) return current.map((entry) => (entry.id === item.id ? item : entry));
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
      const response = await servicePricingService.updateServicePricing(item.id, {
        isActive: !item.isActive,
      });
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? response.item : entry))
      );
      setActionMessage(response.message || "Cập nhật trạng thái thành công.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(item) {
    const label = SERVICE_TYPE_LABELS[item.serviceType] || item.serviceType;
    if (!window.confirm(`Xóa giá dịch vụ chính "${label}" (${formatServicePricingRoute(item)})?`)) {
      return;
    }

    setPendingId(item.id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await servicePricingService.deleteServicePricing(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setActionMessage(response.message || "Đã xóa giá dịch vụ chính.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  function formatUnitPrice(item) {
    if (item.unitType === "KG_OR_CBM") {
      return `${formatMoney(item.pricePerKg)} / kg · ${formatMoney(item.pricePerCbm)} / cm³`;
    }
    if (item.unitType === "CBM") return `${formatMoney(item.price)} / cm³`;
    return `${formatMoney(item.price)} / kg`;
  }

  const columns = useMemo(
    () => [
      {
        key: "serviceType",
        title: "Dịch vụ",
        sortable: true,
        searchable: true,
        searchAccessor: (item) =>
          `${SERVICE_TYPE_LABELS[item.serviceType] || item.serviceType} ${item.id}`,
        sortAccessor: (item) => SERVICE_TYPE_LABELS[item.serviceType] || item.serviceType,
        filter: { options: SERVICE_TYPE_FILTER_OPTIONS },
        render: (item) => (
          <div>
            <p className="text-sm font-bold text-ink">
              {SERVICE_TYPE_LABELS[item.serviceType] || item.serviceType}
            </p>
            <p className="text-[10px] text-faint mt-0.5">{item.id}</p>
          </div>
        ),
      },
      {
        key: "route",
        title: "Tuyến",
        searchable: true,
        searchAccessor: (item) => formatServicePricingRoute(item),
        className: "text-muted",
        render: (item) => formatServicePricingRoute(item),
      },
      {
        key: "unitType",
        title: "Đơn vị",
        filter: { options: UNIT_TYPE_FILTER_OPTIONS },
        className: "text-muted",
        render: (item) => UNIT_TYPE_LABELS[item.unitType] || item.unitType,
      },
      {
        key: "unitPrice",
        title: "Đơn giá",
        className: "font-medium",
        render: (item) => formatUnitPrice(item),
      },
      {
        key: "effectiveDate",
        title: "Hiệu lực",
        sortable: true,
        sortAccessor: (item) =>
          item.effectiveDate ? new Date(item.effectiveDate).getTime() : 0,
        className: "text-muted",
        render: (item) =>
          item.effectiveDate
            ? new Date(item.effectiveDate).toLocaleDateString("vi-VN")
            : "—",
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
        title: "Hành động",
        align: "right",
        render: (item) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => openEdit(item)}
              disabled={pendingId === item.id}
              className="p-2 text-muted hover:text-insight hover:bg-surface rounded-lg disabled:opacity-50"
              title="Sửa"
            >
              <Icon icon="lucide:pencil" className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleToggleActive(item)}
              disabled={pendingId === item.id}
              className="p-2 text-muted hover:text-warning-text hover:bg-surface rounded-lg disabled:opacity-50"
              title={item.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
            >
              <Icon
                icon={item.isActive ? "lucide:ban" : "lucide:circle-check"}
                className="w-4 h-4"
              />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item)}
              disabled={pendingId === item.id}
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
    <AdminLayout activeNav="pricing-rules">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight">
              Giá dịch vụ chính (ký gửi)
            </h1>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Cấu hình cước theo tuyến và đơn vị tính. Phụ phí quản lý riêng ở Phí dịch vụ bổ sung.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-insight hover:bg-secondary text-white text-sm font-bold rounded-lg transition-colors shrink-0"
          >
            <Icon icon="lucide:plus" className="w-4 h-4" />
            Thêm giá dịch vụ chính
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
          title="Bảng giá dịch vụ chính"
          countLabel="cấu hình"
          searchPlaceholder="Tìm theo dịch vụ, tuyến..."
          emptyText='Chưa có giá dịch vụ chính. Nhấn "Thêm giá dịch vụ chính" để bắt đầu.'
          emptyFilteredText="Không tìm thấy cấu hình phù hợp."
          minWidth={1100}
        />
      </div>

      <ServicePricingFormModal
        open={modalMode !== null}
        mode={modalMode === "edit" ? "edit" : "create"}
        item={editingItem}
        onClose={closeModal}
        onSaved={handleSaved}
      />
    </AdminLayout>
  );
}
