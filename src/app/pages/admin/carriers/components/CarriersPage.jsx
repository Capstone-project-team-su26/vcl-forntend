"use client";
import styles from "./CarriersPage.module.scss";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/app/pages/admin/components/AdminLayout";
import CarrierFormModal from "@/app/pages/admin/carriers/components/CarrierFormModal";
import DataTable from "@/app/components/DataTable";
import * as carrierService from "@/utils/carrierService";
import { getErrorMessage } from "@/utils/apiError";

const { CARRIER_TYPE_LABELS } = carrierService;

const STATUS_FILTER_OPTIONS = [
  { value: "true", label: "Hoạt động" },
  { value: "false", label: "Vô hiệu" },
];

const TYPE_FILTER_OPTIONS = Object.entries(CARRIER_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function ActiveBadge({ isActive }) {
  return (
    <span className={isActive ? styles.badgeActive : styles.badgeInactive}>
      {isActive ? "Hoạt động" : "Vô hiệu"}
    </span>
  );
}

function formatShippingMethods(methods) {
  if (!methods?.length) return "—";
  return methods.join(", ");
}

export default function CarriersPage() {
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
        const data = await carrierService.listCarriers({ activeOnly: false });
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
      const response = await carrierService.updateCarrier(item.id, {
        isActive: !item.isActive,
      });
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? response.carrier : entry))
      );
      setActionMessage(
        response.message ||
          (response.carrier.isActive
            ? "Đã kích hoạt đơn vị vận chuyển."
            : "Đã vô hiệu hóa đơn vị vận chuyển.")
      );
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Xóa đơn vị "${item.name}"? Hành động này không thể hoàn tác.`
    );
    if (!confirmed) return;

    setPendingId(item.id);
    setActionError("");
    setActionMessage("");

    try {
      const response = await carrierService.deleteCarrier(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setActionMessage(response.message || "Đã xóa đơn vị vận chuyển.");
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
        className: styles.colMono,
        render: (item) => item.code || "—",
      },
      {
        key: "name",
        title: "Tên đơn vị",
        sortable: true,
        searchable: true,
        searchAccessor: (item) => `${item.name || ""} ${item.internalNotes || ""}`,
        render: (item) => (
          <div>
            <p className={styles.cellNameSemibold}>{item.name}</p>
            {item.internalNotes ? (
              <p className={styles.cellNote} title={item.internalNotes}>
                Ghi chú: {item.internalNotes}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        key: "type",
        title: "Loại",
        sortable: true,
        filter: { options: TYPE_FILTER_OPTIONS },
        filterAccessor: (item) => item.type,
        render: (item) => CARRIER_TYPE_LABELS[item.type] ?? item.type ?? "—",
      },
      {
        key: "supportedShippingMethods",
        title: "Phương thức hỗ trợ",
        headerClassName: "hidden md:table-cell",
        className: styles.colMutedMd,
        render: (item) => (
          <span className={styles.lineClamp2}>{formatShippingMethods(item.supportedShippingMethods)}</span>
        ),
      },
      {
        key: "supportedRegions",
        title: "Khu vực",
        headerClassName: "hidden lg:table-cell",
        className: styles.colMutedLg,
        render: (item) => (
          <span className={styles.lineClamp2}>{item.supportedRegions || "—"}</span>
        ),
      },
      {
        key: "contactInfo",
        title: "Liên hệ",
        headerClassName: "hidden xl:table-cell",
        className: styles.colMutedXl,
        render: (item) => <span className={styles.lineClamp2}>{item.contactInfo || "—"}</span>,
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
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => openEdit(item)}
              className={styles.editBtnNeutral}
              title="Sửa"
            >
              <Icon icon="lucide:pencil" className={styles.actionIcon} />
            </button>
            <button
              type="button"
              disabled={pendingId === item.id}
              onClick={() => handleToggleActive(item)}
              className={styles.toggleBtnNeutral}
              title={item.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
            >
              <Icon
                icon={item.isActive ? "lucide:ban" : "lucide:check-circle"}
                className={styles.actionIcon}
              />
            </button>
            <button
              type="button"
              disabled={pendingId === item.id}
              onClick={() => handleDelete(item)}
              className={`${styles.disabledOpacity} btn-delete-icon`}
              title="Xóa"
            >
              <Icon icon="lucide:trash-2" className={styles.actionIcon} />
            </button>
          </div>
        ),
      },
    ],
    [pendingId]
  );

  return (
    <AdminLayout activeNav="carriers">
      <div className={styles.page}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>
              Đơn vị vận chuyển
            </h1>
            <p className={styles.subtitle}>
              Cấu hình hãng vận chuyển và forwarder khi tạo lô vận chuyển quốc tế.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className={styles.addBtn}
          >
            <Icon icon="lucide:plus" className={styles.actionIcon} />
            Thêm đơn vị
          </button>
        </div>

        {actionError ? (
          <div className={styles.alertError}>
            {actionError}
          </div>
        ) : null}

        {actionMessage ? (
          <div className={styles.alertSuccess}>
            {actionMessage}
          </div>
        ) : null}

        <DataTable
          columns={columns}
          rows={items}
          loading={isLoading}
          title="Danh sách đơn vị vận chuyển"
          countLabel="đơn vị"
          searchPlaceholder="Tìm theo mã hoặc tên đơn vị..."
          emptyText="Chưa có đơn vị vận chuyển nào."
          emptyFilteredText="Không có đơn vị phù hợp với bộ lọc."
          minWidth={1120}
        />
      </div>

      <CarrierFormModal
        open={modalMode !== null}
        mode={modalMode}
        carrier={editingItem}
        onClose={closeModal}
        onSaved={handleSaved}
      />
    </AdminLayout>
  );
}
