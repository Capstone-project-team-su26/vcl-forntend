"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import RestrictedItemFormModal from "./RestrictedItemFormModal";
import DataTable from "@/app/components/DataTable";
import * as restrictedItemService from "@/utils/restrictedItemService";
import { getErrorMessage } from "@/utils/apiError";
import styles from "./RestrictedItemsPage.module.scss";

const { RESTRICTION_TYPE_LABELS, formatRestrictedCountry } = restrictedItemService;

const TYPE_FILTER_OPTIONS = Object.entries(RESTRICTION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const STATUS_FILTER_OPTIONS = [
  { value: "true", label: "Hoạt động" },
  { value: "false", label: "Vô hiệu" },
];

const BADGE_CLASS = {
  PROHIBITED: styles.badgeProhibited,
  RESTRICTED: styles.badgeRestricted,
  CONDITIONAL: styles.badgeConditional,
};

function RestrictionTypeBadge({ type }) {
  return (
    <span className={BADGE_CLASS[type] || styles.badgeDefault}>
      {RESTRICTION_TYPE_LABELS[type] || type}
    </span>
  );
}

function ActiveBadge({ isActive }) {
  return (
    <span className={isActive ? styles.badgeActive : styles.badgeInactive}>
      {isActive ? "Hoạt động" : "Vô hiệu"}
    </span>
  );
}

export default function RestrictedItemsPage() {
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
        const data = await restrictedItemService.listRestrictedItems();
        const list = Array.isArray(data) ? data : data?.items ?? [];
        if (active) setItems(list);
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
      const response = await restrictedItemService.updateRestrictedItem(item.id, {
        isActive: !item.isActive,
      });
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? response.item : entry))
      );
      setActionMessage(
        response.message ||
          (response.item.isActive ? "Đã kích hoạt mặt hàng." : "Đã vô hiệu hóa mặt hàng.")
      );
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Xóa "${item.name}" khỏi danh mục? Hành động này không thể hoàn tác.`
    );
    if (!confirmed) return;
    setPendingId(item.id);
    setActionError("");
    setActionMessage("");
    try {
      const response = await restrictedItemService.deleteRestrictedItem(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setActionMessage(response.message || "Đã xóa mặt hàng.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  const columns = useMemo(
    () => [
      {
        key: "name",
        title: "Tên mặt hàng",
        sortable: true,
        searchable: true,
        searchAccessor: (item) => `${item.name || ""} ${item.id || ""}`,
        render: (item) => (
          <div>
            <p className={styles.cellName}>{item.name}</p>
            <p className={styles.cellId}>{item.id}</p>
          </div>
        ),
      },
      {
        key: "country",
        title: "Quốc gia",
        sortable: true,
        searchable: true,
        searchAccessor: (item) => formatRestrictedCountry(item.country),
        sortAccessor: (item) => formatRestrictedCountry(item.country),
        className: styles.t9a12f0,
        render: (item) => formatRestrictedCountry(item.country),
      },
      {
        key: "restrictionType",
        title: "Loại hạn chế",
        filter: { options: TYPE_FILTER_OPTIONS },
        render: (item) => <RestrictionTypeBadge type={item.restrictionType} />,
      },
      {
        key: "notes",
        title: "Ghi chú",
        searchable: true,
        className: styles.t813519,
        render: (item) => (
          <span title={item.notes}>{item.notes || "—"}</span>
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
        title: "Hành động",
        align: "right",
        render: (item) => (
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => openEdit(item)}
              disabled={pendingId === item.id}
              className={styles.editBtn}
              title="Sửa"
            >
              <Icon icon="lucide:pencil" className={styles.actionIcon} />
            </button>
            <button
              type="button"
              onClick={() => handleToggleActive(item)}
              disabled={pendingId === item.id}
              className={styles.toggleBtn}
              title={item.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
            >
              <Icon
                icon={item.isActive ? "lucide:ban" : "lucide:circle-check"}
                className={styles.actionIcon}
              />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item)}
              disabled={pendingId === item.id}
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
    <AdminLayout activeNav="restricted-items">
      <div className={styles.page}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>
              Hàng cấm / hạn chế
            </h1>
            <p className={styles.subtitle}>
              Quản lý danh mục kiểm tra hàng hóa khi khách tạo yêu cầu ký gửi.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className={styles.addBtn}
          >
            <Icon icon="lucide:plus" className={styles.addBtnIcon} />
            Thêm mặt hàng
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
          title="Danh mục hàng cấm / hạn chế"
          countLabel="mặt hàng"
          searchPlaceholder="Tìm theo tên, quốc gia hoặc ghi chú..."
          emptyText='Chưa có mặt hàng nào. Nhấn "Thêm mặt hàng" để bắt đầu.'
          emptyFilteredText="Không tìm thấy mặt hàng phù hợp."
          minWidth={960}
        />
      </div>

      <RestrictedItemFormModal
        open={modalMode !== null}
        mode={modalMode === "edit" ? "edit" : "create"}
        item={editingItem}
        onClose={closeModal}
        onSaved={handleSaved}
      />
    </AdminLayout>
  );
}
