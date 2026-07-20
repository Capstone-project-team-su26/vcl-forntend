"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import PackageConfigurationFormModal from "./PackageConfigurationFormModal";
import DataTable from "@/app/components/DataTable";
import * as packageConfigurationService from "@/modules/package-configurations";
import { getErrorMessage } from "@/utils/apiError";

const {
  PACKAGE_STATUS,
  PACKAGE_STATUS_LABELS,
  formatMoney,
  formatDimensions,
  formatMaxWeight,
  getPackageStatus,
} = packageConfigurationService;

const STATUS_FILTER_OPTIONS = [
  { value: PACKAGE_STATUS.ACTIVE, label: PACKAGE_STATUS_LABELS.ACTIVE },
  { value: PACKAGE_STATUS.INACTIVE, label: PACKAGE_STATUS_LABELS.INACTIVE },
];

function StatusBadge({ status }) {
  const isActive = status === PACKAGE_STATUS.ACTIVE;
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
        isActive ? "bg-success-bg text-success-text" : "bg-surface text-muted"
      }`}
    >
      {PACKAGE_STATUS_LABELS[status] || status}
    </span>
  );
}

export default function PackageConfigurationsPage() {
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
        const data = await packageConfigurationService.listPackageConfigurations();
        if (active) setItems(Array.isArray(data) ? data : []);
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

  async function handleToggleStatus(item) {
    const status = getPackageStatus(item);
    const nextActive = status !== PACKAGE_STATUS.ACTIVE;

    setPendingId(item.id);
    setActionError("");
    setActionMessage("");

    try {
      let response;
      if (nextActive) {
        response = await packageConfigurationService.updatePackageConfiguration(item.id, {
          status: PACKAGE_STATUS.ACTIVE,
          isActive: true,
        });
      } else {
        response = await packageConfigurationService.deactivatePackageConfiguration(item.id);
      }

      setItems((current) =>
        current.map((entry) => {
          if (entry.id !== item.id) return entry;
          if (response.item) return response.item;
          return {
            ...entry,
            status: nextActive ? PACKAGE_STATUS.ACTIVE : PACKAGE_STATUS.INACTIVE,
            isActive: nextActive,
          };
        })
      );
      setActionMessage(
        response.message ||
          (nextActive ? "Đã kích hoạt cấu hình đóng gói." : "Đã vô hiệu hóa cấu hình đóng gói.")
      );
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  const columns = useMemo(
    () => [
      {
        key: "code",
        title: "Mã cấu hình",
        sortable: true,
        searchable: true,
        searchAccessor: (item) => `${item.code || ""} ${item.name || ""}`,
        render: (item) => (
          <div>
            <p className="text-sm font-bold text-ink font-mono">{item.code || "—"}</p>
            <p className="text-[10px] text-faint mt-0.5">{item.id}</p>
          </div>
        ),
      },
      {
        key: "name",
        title: "Tên cấu hình",
        sortable: true,
        searchable: true,
        className: "text-muted",
        render: (item) => item.name || "—",
      },
      {
        key: "dimensions",
        title: "Kích thước (D × R × C)",
        sortable: true,
        sortAccessor: (item) => (item.length ?? 0) * (item.width ?? 0) * (item.height ?? 0),
        className: "text-muted whitespace-nowrap",
        render: (item) => formatDimensions(item),
      },
      {
        key: "maxWeight",
        title: "Khối lượng tối đa",
        sortable: true,
        sortAccessor: (item) => Number(item.maxWeight) || 0,
        className: "text-muted whitespace-nowrap",
        render: (item) => formatMaxWeight(item.maxWeight),
      },
      {
        key: "packageFee",
        title: "Phí vỏ thùng",
        sortable: true,
        sortAccessor: (item) => Number(item.packageFee) || 0,
        className: "text-ink font-semibold whitespace-nowrap",
        render: (item) => formatMoney(item.packageFee),
      },
      {
        key: "status",
        title: "Trạng thái",
        sortable: true,
        sortAccessor: (item) => getPackageStatus(item),
        filter: { options: STATUS_FILTER_OPTIONS },
        filterAccessor: (item) => getPackageStatus(item),
        render: (item) => <StatusBadge status={getPackageStatus(item)} />,
      },
      {
        key: "actions",
        title: "Hành động",
        align: "right",
        render: (item) => {
          const isActive = getPackageStatus(item) === PACKAGE_STATUS.ACTIVE;
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => openEdit(item)}
                disabled={pendingId === item.id}
                className="p-2 text-muted hover:text-insight hover:bg-surface rounded-lg disabled:opacity-50"
                title="Chỉnh sửa"
              >
                <Icon icon="lucide:pencil" className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleToggleStatus(item)}
                disabled={pendingId === item.id}
                className="p-2 text-muted hover:text-warning-text hover:bg-surface rounded-lg disabled:opacity-50"
                title={isActive ? "Vô hiệu hóa" : "Kích hoạt"}
              >
                <Icon
                  icon={isActive ? "lucide:ban" : "lucide:circle-check"}
                  className="w-4 h-4"
                />
              </button>
            </div>
          );
        },
      },
    ],
    [pendingId]
  );

  return (
    <AdminLayout activeNav="package-configurations">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight">
              Cấu hình đóng gói
            </h1>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Quản lý kích thước thùng carton chuẩn, khối lượng tối đa và phí vỏ thùng cho báo
              giá, đóng gói và xử lý kho.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-insight hover:bg-secondary text-white text-sm font-bold rounded-lg transition-colors shrink-0"
          >
            <Icon icon="lucide:plus" className="w-4 h-4" />
            Thêm cấu hình
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
          title="Danh sách cấu hình đóng gói"
          countLabel="cấu hình"
          searchPlaceholder="Tìm theo mã hoặc tên cấu hình..."
          emptyText='Chưa có cấu hình nào. Nhấn "Thêm cấu hình" để bắt đầu.'
          emptyFilteredText="Không tìm thấy cấu hình phù hợp."
          minWidth={1080}
        />
      </div>

      <PackageConfigurationFormModal
        open={modalMode !== null}
        mode={modalMode === "edit" ? "edit" : "create"}
        item={editingItem}
        onClose={closeModal}
        onSaved={handleSaved}
      />
    </AdminLayout>
  );
}
