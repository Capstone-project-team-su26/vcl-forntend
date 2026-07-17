"use client";
import styles from "./AdditionalServiceFeesPage.module.scss";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/app/pages/admin/components/AdminLayout";
import AdditionalServiceFeeFormModal from "@/app/pages/admin/additional-service-fees/components/AdditionalServiceFeeFormModal";
import DataTable from "@/app/components/DataTable";
import * as feeService from "@/utils/additionalServiceFeeService";
import { getErrorMessage } from "@/utils/apiError";
import {
  DEFAULT_QUOTATION_VAT_RATE,
  formatVatRatePercent,
  isVatRule,
  isVolumetricDivisorRule,
  resolveVatRate,
  VAT_RULE,
} from "@/utils/servicePricingService";

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
    <span className={isActive ? styles.badgeActive : styles.badgeInactive}>
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
        className: styles.tf05d22,
        render: (item) => item.code || "—",
      },
      {
        key: "name",
        title: "Tên loại phí",
        sortable: true,
        searchable: true,
        className: styles.t1d3e56,
        render: (item) => item.name,
      },
      {
        key: "feeCalculationType",
        title: "Cách tính",
        className: styles.t9a12f0,
        render: (item) => formatFeeCalculationType(item.feeCalculationType, item),
      },
      {
        key: "amount",
        title: "Mức phí",
        className: styles.t1d3e56,
        render: (item) => formatFeeAmount(item),
      },
      {
        key: "unit",
        title: "Đơn vị",
        headerClassName: "hidden md:table-cell",
        className: styles.tf203be,
        render: (item) => item.unit || "—",
      },
      {
        key: "description",
        title: "Mô tả",
        searchable: true,
        headerClassName: "hidden lg:table-cell",
        className: styles.t49ae10,
        render: (item) => <span className={styles.lineClamp2}>{item.description || "—"}</span>,
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
    <AdminLayout activeNav="additional-service-fees">
      <div className={styles.page}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>
              Phí dịch vụ bổ sung
            </h1>
            <p className={styles.subtitle}>
              Cấu hình bảo hiểm, đóng thùng, gia cố, kiểm hàng, lưu kho… khi báo giá.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className={styles.addBtn}
          >
            <Icon icon="lucide:plus" className={styles.actionIcon} />
            Thêm loại phí
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
          title="Danh sách phí dịch vụ bổ sung"
          countLabel="loại phí"
          searchPlaceholder="Tìm theo mã, tên hoặc mô tả..."
          emptyText="Chưa có loại phí nào."
          emptyFilteredText="Không có loại phí phù hợp với bộ lọc."
          minWidth={980}
        />

        <div className={styles.t1da0fc}>
          <div>
            <p className={styles.cellName}>Hệ số quy đổi thể tích</p>
            <p className={styles.t5e4cbe}>
              Dùng khi tính DIM: thể tích (cm³) ÷ hệ số. Quy tắc hệ thống mã{" "}
              <span className={styles.t0e6570}>VOLUMETRIC_DIVISOR</span>.
            </p>
          </div>
          <div className={styles.te80bfc}>
            <p className={styles.ta7b499}>
              Đang áp dụng:{" "}
              <span className={styles.t6d6721}>
                {Number(volumetricDivisorRule?.fixedAmount) > 0
                  ? Number(volumetricDivisorRule.fixedAmount).toLocaleString("vi-VN")
                  : "5.000 (mặc định IATA)"}
              </span>
            </p>
            {volumetricDivisorRule ? (
              <button
                type="button"
                onClick={() => openEdit(volumetricDivisorRule)}
                className={styles.t145f5c}
              >
                <Icon icon="lucide:pencil" className={styles.actionIcon} />
                Chỉnh sửa
              </button>
            ) : null}
          </div>
        </div>

        <div className={styles.t1da0fc}>
          <div>
            <p className={styles.cellName}>VAT báo giá ký gửi</p>
            <p className={styles.t5e4cbe}>
              VAT = (cước + phí dịch vụ) × tỷ lệ. Quy tắc hệ thống mã{" "}
              <span className={styles.t0e6570}>VAT</span> / <span className={styles.t0e6570}>IMPORT_TAX</span>{" "}
              (không hiện như phụ phí bật/tắt trên Sales).
            </p>
          </div>
          <div className={styles.te80bfc}>
            <p className={styles.ta7b499}>
              Đang áp dụng:{" "}
              <span className={styles.t6d6721}>
                {vatRule ? vatRateLabel : `${vatRateLabel} (mặc định)`}
              </span>
            </p>
            <button
              type="button"
              onClick={openVatEditor}
              className={styles.t145f5c}
            >
              <Icon icon={vatRule ? "lucide:pencil" : "lucide:plus"} className={styles.actionIcon} />
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
