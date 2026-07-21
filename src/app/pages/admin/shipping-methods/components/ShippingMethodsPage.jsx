"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/app/pages/admin/components/AdminLayout";
import ShippingMethodFormModal from "@/app/pages/admin/shipping-methods/components/ShippingMethodFormModal";
import DataTable from "@/app/components/DataTable";
import * as shippingMethodService from "@/modules/shipping-methods";
import { getErrorMessage } from "@/utils/apiError";

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

export default function ShippingMethodsPage() {
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
        const data = await shippingMethodService.listShippingMethods({
          activeOnly: false,
        });
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
      const response = await shippingMethodService.updateShippingMethod(item.id, {
        isActive: !item.isActive,
      });
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? response.shippingMethod : entry))
      );
      setActionMessage(
        response.message ||
          (response.shippingMethod.isActive
            ? "Đã kích hoạt phương thức vận chuyển."
            : "Đã vô hiệu hóa phương thức vận chuyển.")
      );
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Xóa phương thức "${item.name}"? Hành động này không thể hoàn tác.`
    );
    if (!confirmed) return;

    setPendingId(item.id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await shippingMethodService.deleteShippingMethod(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setActionMessage(response.message || "Đã xóa phương thức vận chuyển.");
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
        title: "Mã",
        sortable: true,
        searchable: true,
        className: "font-mono text-xs",
        render: (item) => item.code || "—",
      },
      {
        key: "name",
        title: "Tên",
        sortable: true,
        searchable: true,
        searchAccessor: (item) => `${item.name || ""} ${item.internalNotes || ""}`,
        render: (item) => (
          <div>
            <p className="font-semibold text-ink">{item.name}</p>
            {item.internalNotes ? (
              <p
                className="text-xs text-muted mt-1 line-clamp-1"
                title={item.internalNotes}
              >
                Ghi chú: {item.internalNotes}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        key: "description",
        title: "Mô tả",
        searchable: true,
        headerClassName: "hidden md:table-cell",
        className: "text-muted hidden md:table-cell max-w-xs",
        render: (item) => <span className="line-clamp-2">{item.description || "—"}</span>,
      },
      {
        key: "estimatedDeliveryTime",
        title: "Thời gian dự kiến",
        headerClassName: "hidden lg:table-cell",
        className: "text-muted hidden lg:table-cell whitespace-nowrap",
        render: (item) => item.estimatedDeliveryTime || "—",
      },
      {
        key: "applicableConditions",
        title: "Điều kiện",
        headerClassName: "hidden xl:table-cell",
        className: "text-muted hidden xl:table-cell max-w-xs",
        render: (item) => (
          <span className="line-clamp-2">{item.applicableConditions || "—"}</span>
        ),
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
    <AdminLayout activeNav="shipping-methods">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight">
              Phương thức vận chuyển
            </h1>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Cấu hình lựa chọn vận chuyển cho ký gửi, báo giá và điều phối.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-insight hover:bg-secondary text-white text-sm font-bold shrink-0"
          >
            <Icon icon="lucide:plus" className="w-4 h-4" />
            Thêm phương thức
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
          title="Danh sách phương thức vận chuyển"
          countLabel="phương thức"
          searchPlaceholder="Tìm theo mã, tên hoặc mô tả..."
          emptyText="Chưa có phương thức vận chuyển nào."
          emptyFilteredText="Không có phương thức phù hợp với bộ lọc."
          minWidth={1040}
        />
      </div>

      <ShippingMethodFormModal
        open={modalMode !== null}
        mode={modalMode}
        shippingMethod={editingItem}
        onClose={closeModal}
        onSaved={handleSaved}
      />
    </AdminLayout>
  );
}
