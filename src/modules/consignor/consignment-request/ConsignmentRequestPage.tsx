"use client";

import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import AppLogo from "@/shared/components/AppLogo";
import * as consignmentService from "@/shared/services/consignmentService";
import { getErrorMessage } from "@/shared/utils/apiError";

const STATUS_CLASS = {
  Pending: "bg-warning-bg text-warning-text",
  Approved: "bg-success-bg text-success-text",
  Processing: "bg-info-bg text-info-text",
  Draft: "bg-surface text-muted",
};

export default function ConsignmentRequestPage() {
  const [requests, setRequests] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await consignmentService.listPurchaseRequests();
        if (active) {
          setRequests(data);
          setWarehouses(consignmentService.getWarehouses());
        }
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const form = e.currentTarget;
    const payload = {
      productLink: form.productLink?.value?.trim(),
      productName: form.productName?.value?.trim(),
      quantity: form.quantity?.value?.trim(),
      destination: form.destination?.value,
      requiredBy: form.requiredBy?.value,
    };

    if (!payload.productName || !payload.destination) {
      setError("Vui lòng nhập tên sản phẩm và kho đích.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await consignmentService.createPurchaseRequest(payload);
      setMessage(response.message);
      const data = await consignmentService.listPurchaseRequests();
      setRequests(data);
      form.reset();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveDraft(e) {
    const form = e.currentTarget.closest("form");
    if (!form) return;

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await consignmentService.savePurchaseRequestDraft({
        productLink: form.productLink?.value?.trim(),
        productName: form.productName?.value?.trim() || "Draft request",
        quantity: form.quantity?.value?.trim() || "0",
        destination: form.destination?.value || "HCM Hub",
        requiredBy: form.requiredBy?.value,
      });
      setMessage(response.message);
      const data = await consignmentService.listPurchaseRequests();
      setRequests(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white font-['Open_Sans'] text-ink-deep">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-[152px] h-[72px] flex items-center justify-between">
          <AppLogo variant="header" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button className="flex items-center gap-2 text-[14px] font-semibold text-nav hover:text-primary transition-colors">
              <img src="./assets/IMG_2.svg" alt="Track" className="w-4 h-4" />
              Track & Receive
            </button>
            <button className="flex items-center gap-2 text-[14px] font-semibold text-nav hover:text-primary transition-colors">
              <img src="./assets/IMG_3.svg" alt="Pricing" className="w-4 h-4" />
              Pricing & Services
            </button>
            <button className="flex items-center gap-2 text-[14px] font-semibold text-nav hover:text-primary transition-colors">
              <img src="./assets/IMG_2.svg" alt="Contact" className="w-4 h-4" />
              Contact
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2">
            <Icon icon="lucide:menu" className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main>
        {/* Hero / Form Section */}
        <section className="bg-surface-alt py-12 lg:py-[60px]">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-[208px]">
            <h1 className="text-[36px] leading-[44px] font-[900] tracking-[-0.75px] mb-2">
              Create Purchase Request
            </h1>
            <p className="text-muted text-[16px] mb-10">
              Fill out the details below to initiate a new procurement request.
            </p>

            {error ? (
              <div className="mb-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="mb-4 rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-text">
                {message}
              </div>
            ) : null}

            {/* Form Card */}
            <div className="bg-white rounded-[16px] shadow-[0px_4px_24px_0px_#0000000a] p-6 lg:p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Product Link */}
                <div className="space-y-2">
                  <label className="text-[14px] font-bold">Product Link</label>
                  <input
                    name="productLink"
                    type="text"
                    placeholder="Product link"
                    className="w-full h-12 px-4 rounded-lg border border-secondary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-bold">Product Name</label>
                    <input
                      name="productName"
                      type="text"
                      required
                      placeholder="Enter product name"
                      className="w-full h-12 px-4 rounded-lg border border-secondary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  {/* Quantity */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-bold">Quantity</label>
                    <input
                      name="quantity"
                      type="number"
                      min="1"
                      placeholder="0"
                      className="w-full h-12 px-4 rounded-lg border border-secondary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>

                  {/* Destination Warehouse */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-bold">Destination Warehouse</label>
                    <div className="relative">
                      <select
                        name="destination"
                        required
                        defaultValue=""
                        className="w-full h-12 px-4 rounded-lg border border-secondary/30 appearance-none bg-white focus:border-primary outline-none"
                      >
                        <option value="" disabled>
                          Select warehouse
                        </option>
                        {warehouses.map((warehouse) => (
                          <option key={warehouse} value={warehouse}>
                            {warehouse}
                          </option>
                        ))}
                      </select>
                      <Icon icon="lucide:chevron-down" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
                    </div>
                  </div>
                  {/* Required By */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-bold">Required By</label>
                    <input
                      name="requiredBy"
                      type="date"
                      className="w-full h-12 px-4 rounded-lg border border-secondary/30 focus:border-primary outline-none"
                    />
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-bold">Priority</label>
                    <div className="flex items-center gap-6 h-12">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="priority" className="w-[18px] h-[18px] accent-muted" />
                        <span className="text-[14px]">Normal</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="priority" className="w-[18px] h-[18px] accent-muted" />
                        <span className="text-[14px]">Urgent</span>
                      </label>
                    </div>
                  </div>
                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-[14px] font-bold">Notes</label>
                    <input
                      name="notes"
                      type="text"
                      className="w-full h-12 px-4 rounded-lg border border-secondary/30 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 px-8 bg-primary text-white font-bold rounded-lg shadow-[0px_4px_8px_0px_#00000014] hover:bg-primary-hover transition-colors disabled:opacity-60"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSaveDraft}
                    className="h-12 px-8 border border-ink text-ink font-bold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
                  >
                    Save Draft
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Recent Requests Section */}
        <section className="py-20">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-[208px]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[24px] leading-[32px] font-[900] tracking-[0px]">Recent Requests</h2>
              <button className="text-primary font-bold text-[14px] hover:underline">View All</button>
            </div>

            {/* Table Container */}
            <div className="border border-border rounded-[12px] overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface border-b border-border">
                      <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-[0.6px]">Request ID</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-[0.6px]">Product</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-[0.6px]">Qty</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-[0.6px]">Destination</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-[0.6px]">Status</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-[0.6px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted">
                          Đang tải yêu cầu...
                        </td>
                      </tr>
                    ) : requests.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted">
                          Chưa có yêu cầu nào.
                        </td>
                      </tr>
                    ) : (
                      requests.map((row) => (
                        <tr key={row.id} className="table-row-hover">
                          <td className="px-6 py-4 text-[14px] font-semibold">{row.id}</td>
                          <td className="px-6 py-4 text-[14px] text-muted">{row.productName}</td>
                          <td className="px-6 py-4 text-[14px] text-muted">{row.quantity}</td>
                          <td className="px-6 py-4 text-[14px] text-muted">{row.destination}</td>
                          <td className="px-6 py-4">
                            <span className={`status-badge ${row.statusClass || STATUS_CLASS[row.status] || ""}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <img src="./assets/IMG_4.svg" alt="Actions" className="w-[18px] h-[18px] cursor-pointer" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-ink-deep text-white pt-16 pb-8">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-[152px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
            {/* Brand Column */}
            <div className="lg:col-span-5 space-y-6">
              <AppLogo variant="header" />
              <p className="text-faint text-[16px] leading-[24px] max-w-[353px]">
                Leading the way in cross-border logistics with innovative solutions and unbeatable reliability across Vietnam and Southeast Asia.
              </p>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-3 lg:col-start-8">
              <h4 className="text-[14px] font-bold uppercase mb-6">Support</h4>
              <ul className="space-y-3 text-faint text-[14px]">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tracking Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Prohibited Items</a></li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-[14px] font-bold uppercase mb-6">Legal</h4>
              <ul className="space-y-3 text-faint text-[14px]">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-subtle text-[12px]">© 2024 SwiftShip Logistics Inc. All rights reserved.</span>
            <div className="flex items-center gap-6 text-subtle text-[12px]">
              <a href="#" className="hover:text-white transition-colors">Facebook</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}