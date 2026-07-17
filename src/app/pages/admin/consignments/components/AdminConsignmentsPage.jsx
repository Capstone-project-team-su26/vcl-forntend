"use client";
import styles from "./AdminConsignmentsPage.module.scss";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/app/pages/admin/components/AdminLayout";
import DataTable from "@/app/components/DataTable";
import * as orderConsignmentService from "@/utils/orderConsignmentService";
import ConsignmentStatusBadge from "@/app/pages/sales/consignments/components/ConsignmentStatusBadge";
import { getErrorMessage } from "@/utils/apiError";
import { ROUTES } from "@/utils/appRoutes";

const {
  CONSIGNMENT_TYPE_LABELS,
  CONSIGNMENT_STATUS_LABELS,
  formatConsignmentDate,
  formatConsignmentDisplayCode,
} = orderConsignmentService;

const STATUS_FILTER_OPTIONS = Object.entries(CONSIGNMENT_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
);

function StatusBadge({ status }) {
  return <ConsignmentStatusBadge status={status} />;
}

function getRoute(item) {
  return item.route || item.destination || "";
}

export default function AdminConsignmentsPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const response = await orderConsignmentService.listConsignments({
          page: 1,
          pageSize: 500,
        });
        if (active) setItems(response?.items ?? []);
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const typeFilterOptions = useMemo(() => {
    const types = Array.from(
      new Set(items.map((item) => item.consignmentType).filter(Boolean))
    );
    return types.map((type) => ({
      value: type,
      label: CONSIGNMENT_TYPE_LABELS[type] || type,
    }));
  }, [items]);

  const routeFilterOptions = useMemo(() => {
    const routes = Array.from(new Set(items.map(getRoute).filter(Boolean)));
    return routes.map((route) => ({ value: route, label: route }));
  }, [items]);

  const warehouseFilterOptions = useMemo(() => {
    const warehouses = Array.from(
      new Set(items.map((item) => item.warehouseName).filter(Boolean))
    );
    return warehouses.map((name) => ({ value: name, label: name }));
  }, [items]);

  const columns = useMemo(
    () => [
      {
        key: "code",
        title: "Mã yêu cầu",
        sortable: true,
        searchable: true,
        searchAccessor: (item) =>
          `${formatConsignmentDisplayCode(item) ?? ""} ${item.id ?? ""}`,
        sortAccessor: (item) => formatConsignmentDisplayCode(item) ?? item.id ?? "",
        className: styles.t336fe7,
        render: (item) => formatConsignmentDisplayCode(item) ?? "—",
      },
      {
        key: "receiverName",
        title: "Người nhận",
        sortable: true,
        searchable: true,
        className: styles.t2689f3,
        render: (item) => item.receiverName || "—",
      },
      {
        key: "consignmentType",
        title: "Loại ký gửi",
        sortable: true,
        filter: typeFilterOptions.length ? { options: typeFilterOptions } : undefined,
        className: styles.t9a12f0,
        render: (item) =>
          CONSIGNMENT_TYPE_LABELS[item.consignmentType] || item.consignmentType || "—",
      },
      {
        key: "route",
        title: "Tuyến",
        searchable: true,
        searchAccessor: getRoute,
        filter: routeFilterOptions.length ? { options: routeFilterOptions } : undefined,
        filterAccessor: getRoute,
        className: styles.t9a12f0,
        render: (item) => getRoute(item) || "—",
      },
      {
        key: "warehouseName",
        title: "Kho",
        searchable: true,
        searchAccessor: (item) => item.warehouseName || "",
        filter: warehouseFilterOptions.length
          ? { options: warehouseFilterOptions }
          : undefined,
        className: styles.t9a12f0,
        render: (item) => item.warehouseName || "—",
      },
      {
        key: "status",
        title: "Trạng thái",
        sortable: true,
        filter: { options: STATUS_FILTER_OPTIONS },
        render: (item) => <StatusBadge status={item.status} />,
      },
      {
        key: "createdAt",
        title: "Ngày tạo",
        sortable: true,
        sortAccessor: (item) => (item.createdAt ? new Date(item.createdAt).getTime() : 0),
        filter: { type: "dateRange" },
        filterAccessor: (item) => item.createdAt,
        className: styles.t39910d,
        render: (item) => formatConsignmentDate(item.createdAt),
      },
      {
        key: "actions",
        title: "Chi tiết",
        align: "right",
        render: (item) => (
          <Link
            href={ROUTES.admin.consignment(item.id)}
            className={styles.t96e45c}
            title="Xem chi tiết"
            aria-label="Xem chi tiết"
          >
            <Icon icon="lucide:eye" className={styles.t0bfbea} />
          </Link>
        ),
      },
    ],
    [typeFilterOptions, routeFilterOptions, warehouseFilterOptions]
  );

  return (
    <AdminLayout activeNav="consignments">
      <div className={styles.tb43b4c}>
        <div>
          <h1 className={styles.teed4df}>
            Yêu cầu ký gửi
          </h1>
          <p className={styles.ta0ff26}>
            Lọc theo trạng thái, khách hàng, tuyến, kho và ngày tạo.
          </p>
        </div>

        {error ? (
          <div className={styles.te12bff}>
            {error}
          </div>
        ) : null}

        <DataTable
          columns={columns}
          rows={items}
          loading={isLoading}
          title="Danh sách yêu cầu ký gửi"
          countLabel="yêu cầu"
          searchPlaceholder="Tìm theo mã, khách hàng, tuyến hoặc kho..."
          emptyText="Chưa có yêu cầu ký gửi nào."
          emptyFilteredText="Không tìm thấy yêu cầu phù hợp với bộ lọc."
          minWidth={1100}
        />
      </div>
    </AdminLayout>
  );
}
