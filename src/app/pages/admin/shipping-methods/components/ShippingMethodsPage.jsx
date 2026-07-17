"use client";
import styles from "./ShippingMethodsPage.module.scss";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/app/pages/admin/components/AdminLayout";
import ShippingMethodFormModal from "@/app/pages/admin/shipping-methods/components/ShippingMethodFormModal";
import DataTable from "@/app/components/DataTable";
import * as shippingMethodService from "@/utils/shippingMethodService";
import { getErrorMessage } from "@/utils/apiError";

const STATUS_FILTER_OPTIONS = [
  { value: "true", label: "Hoạt động" },
  { value: "false", label: "Vô hiệu" },
];

function ActiveBadge({ isActive }) {
  return (
    <span className={isActive ? styles.badgeActive : styles.badgeInactive}>
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
        className: styles.tf05d22,
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
            <p className={styles.cellNameSemibold}>{item.name}</p>
            {item.internalNotes ? (
              <p
                className={styles.cellNote}
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
        className: styles.t5f0723,
        render: (item) => <span className={styles.lineClamp2}>{item.description || "—"}</span>,
      },
      {
        key: "estimatedDeliveryTime",
        title: "Thời gian dự kiến",
        headerClassName: "hidden lg:table-cell",
        className: styles.t884de6,
        render: (item) => item.estimatedDeliveryTime || "—",
      },
      {
        key: "applicableConditions",
        title: "Điều kiện",
        headerClassName: "hidden xl:table-cell",
        className: styles.t71f62c,
        render: (item) => (
          <span className={styles.lineClamp2}>{item.applicableConditions || "—"}</span>
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
              className={`${styles.t52c30e} btn-delete-icon`}
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
    <AdminLayout activeNav="shipping-methods">
      <div className={styles.page}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>
              Phương thức vận chuyển
            </h1>
            <p className={styles.subtitle}>
              Cấu hình lựa chọn vận chuyển cho ký gửi, báo giá và điều phối.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className={styles.addBtn}
          >
            <Icon icon="lucide:plus" className={styles.actionIcon} />
            Thêm phương thức
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
