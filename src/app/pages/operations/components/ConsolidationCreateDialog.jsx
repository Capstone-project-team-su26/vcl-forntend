"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import {
  createOperationalConsolidation,
  getOperationalDashboard,
} from "@/modules/operations";
import { getErrorMessage } from "@/utils/apiError";

function formatNumber(value, suffix = "") {
  if (value == null || value === "") return "—";
  const number = Number(value);
  return Number.isFinite(number) ? `${number.toLocaleString("vi-VN")}${suffix}` : "—";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

/** Chọn các lô đã duyệt (APPROVED) và tạo lô gom hàng ngay tại trang gom hàng. */
export default function ConsolidationCreateDialog({ open, onClose, onCreated }) {
  const [eligible, setEligible] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;

    getOperationalDashboard()
      .then((result) => {
        if (!active) return;
        const items = (result?.items ?? [])
          .filter((item) => item.status === "APPROVED")
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setEligible(items);
      })
      .catch((err) => {
        if (active) setLoadError(getErrorMessage(err, "Không thể tải danh sách lô đã duyệt."));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [onClose, open]);

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return eligible;
    return eligible.filter((item) =>
      [item.consignmentCode, item.customerName, item.route, item.destination]
        .some((text) => String(text ?? "").toLowerCase().includes(query))
    );
  }, [eligible, search]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allVisibleSelected =
    visibleRows.length > 0 && visibleRows.every((item) => selectedSet.has(item.id));
  const selectedWeight = useMemo(
    () =>
      eligible.reduce(
        (sum, item) => sum + (selectedSet.has(item.id) ? Number(item.totalWeight) || 0 : 0),
        0
      ),
    [eligible, selectedSet]
  );

  function toggleOne(id) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setSubmitError("");
  }

  function toggleAllVisible() {
    setSelectedIds((current) => {
      const visible = new Set(visibleRows.map((item) => item.id));
      if (allVisibleSelected) return current.filter((id) => !visible.has(id));
      return [...new Set([...current, ...visible])];
    });
    setSubmitError("");
  }

  async function handleSubmit() {
    if (!selectedIds.length || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await createOperationalConsolidation(selectedIds);
      onCreated?.(selectedIds.length);
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Không thể tạo lô gom hàng."));
      setIsSubmitting(false);
    }
  }

  if (!open) return null;

  const canSubmit = selectedIds.length > 0 && !isSubmitting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="consolidation-create-title"
        className="relative flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-border-muted bg-surface-elevated shadow-2xl sm:max-h-[88vh] sm:rounded-2xl"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl"
          aria-hidden
        />

        <header className="relative flex items-start justify-between gap-4 border-b border-border-muted px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-secondary">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_color-mix(in_srgb,var(--theme-primary)_20%,transparent)]" />
              Tạo lô gom hàng
            </div>
            <h2 id="consolidation-create-title" className="text-lg font-black text-ink sm:text-xl">
              Chọn các lô đã duyệt để gom
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-muted bg-surface-elevated text-muted hover:bg-surface-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-secondary"
            aria-label="Đóng"
          >
            <Icon icon="lucide:x" className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="relative border-b border-border-muted px-4 py-3 sm:px-6">
          <div className="relative">
            <Icon
              icon="lucide:search"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm mã lô, khách hàng hoặc tuyến..."
              className="form-select h-10 w-full pl-10 pr-3 placeholder:text-muted/70 input-focus-ring"
              aria-label="Tìm lô đã duyệt"
            />
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto bg-surface-elevated">
          {isLoading ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-muted">
              <Icon icon="lucide:loader-circle" className="h-7 w-7 animate-spin text-secondary" aria-hidden />
              <p className="text-sm font-medium">Đang tải các lô đã duyệt...</p>
            </div>
          ) : loadError ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger-bg text-danger">
                <Icon icon="lucide:triangle-alert" className="h-6 w-6" aria-hidden />
              </span>
              <p className="max-w-md text-sm text-muted">{loadError}</p>
            </div>
          ) : !eligible.length ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 px-6 text-center">
              <Icon icon="lucide:inbox" className="h-10 w-10 text-muted" aria-hidden />
              <p className="text-sm text-muted">
                Không có lô nào ở trạng thái &ldquo;Đã duyệt&rdquo; để gom.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-border-muted bg-surface-muted/95 text-[11px] font-bold uppercase tracking-wide text-muted backdrop-blur-sm">
                  <th className="w-12 px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      disabled={!visibleRows.length}
                      onChange={toggleAllVisible}
                      aria-label="Chọn tất cả lô đang hiển thị"
                      className="h-4 w-4 accent-secondary"
                    />
                  </th>
                  <th className="px-4 py-2.5">Mã lô</th>
                  <th className="px-4 py-2.5">Khách hàng</th>
                  <th className="px-4 py-2.5">Tuyến</th>
                  <th className="px-4 py-2.5 text-right">Trọng lượng</th>
                  <th className="px-4 py-2.5 text-right">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted">
                {visibleRows.length ? (
                  visibleRows.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => toggleOne(item.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedSet.has(item.id)
                          ? "bg-secondary/10"
                          : "hover:bg-surface-muted"
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={selectedSet.has(item.id)}
                          onChange={() => toggleOne(item.id)}
                          onClick={(event) => event.stopPropagation()}
                          aria-label={`Chọn lô ${item.consignmentCode || item.id}`}
                          className="h-4 w-4 accent-secondary"
                        />
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs font-bold text-secondary">
                        {item.consignmentCode || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-ink">{item.customerName || "—"}</td>
                      <td className="px-4 py-2.5 text-muted">
                        {item.route || item.destination || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-ink">
                        {formatNumber(item.totalWeight, " kg")}
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs text-muted">
                        {formatDate(item.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">
                      Không tìm thấy lô phù hợp với từ khóa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <footer className="relative border-t border-border-muted bg-surface-elevated px-4 py-3 sm:px-6">
          {submitError ? (
            <p role="alert" className="mb-2 flex items-center gap-2 text-sm text-danger">
              <Icon icon="lucide:circle-alert" className="h-4 w-4 shrink-0" aria-hidden />
              {submitError}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              Đã chọn{" "}
              <span className="font-bold tabular-nums text-ink">{selectedIds.length}</span> lô
              {selectedIds.length ? (
                <> — tổng {formatNumber(selectedWeight, " kg")}</>
              ) : null}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="h-10 rounded-xl border border-border-muted bg-surface-elevated px-4 text-sm font-bold text-ink hover:bg-surface-muted disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleSubmit}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-secondary px-4 text-sm font-bold text-white shadow-sm hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon
                  icon={isSubmitting ? "lucide:loader-circle" : "lucide:combine"}
                  className={`h-4 w-4 ${isSubmitting ? "animate-spin" : ""}`}
                  aria-hidden
                />
                {isSubmitting ? "Đang tạo..." : "Tạo lô gom"}
              </button>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
