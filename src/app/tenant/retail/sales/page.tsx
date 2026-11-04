"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Receipt, RotateCcw, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useLocation } from "@/lib/location-context";
import { toast } from "sonner";
import {
  RetailSale,
  RetailReturn,
  RawSale,
  RawReturn,
  normalizeSale,
  normalizeReturn,
  ProcessRefundParams,
  SalesKpis,
  SalesTab,
  ReturnsTab,
  SaleDetailsModal,
  RefundModal,
} from "@/components/retail/sales";

export type {
  RetailSaleLine,
  RetailSale,
  RetailReturnLine,
  RetailReturn,
} from "@/components/retail/sales";

export default function RetailSalesPage() {
  const { currentLocation } = useLocation();

  const [sales, setSales] = useState<RetailSale[]>([]);
  const [returns, setReturns] = useState<RetailReturn[]>([]);
  const [activeTab, setActiveTab] = useState<"SALES" | "RETURNS">("SALES");

  const [isLoadingSales, setIsLoadingSales] = useState(true);
  const [isLoadingReturns, setIsLoadingReturns] = useState(true);
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  // Transaction Details Modal
  const [selectedSale, setSelectedSale] = useState<RetailSale | null>(null);

  // Refund / Return Modal
  const [refundSale, setRefundSale] = useState<RetailSale | null>(null);

  // 1. Fetch Sales
  const fetchSales = useCallback(() => {
    setIsLoadingSales(true);
    const params: Record<string, string> = {};
    if (currentLocation?._id) {
      params.locationId = currentLocation._id;
    }
    apiClient
      .get<RawSale[]>("/retail/sale", { params })
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : [];
        setSales(raw.map(normalizeSale));
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load sales";
        setError(msg);
      })
      .finally(() => {
        setIsLoadingSales(false);
      });
  }, [currentLocation]);

  // 2. Fetch Returns
  const fetchReturns = useCallback(() => {
    setIsLoadingReturns(true);
    const params: Record<string, string> = {};
    if (currentLocation?._id) {
      params.locationId = currentLocation._id;
    }
    apiClient
      .get<RawReturn[]>("/retail/sale/returns", { params })
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : [];
        setReturns(raw.map(normalizeReturn));
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load returns";
        setError(msg);
      })
      .finally(() => {
        setIsLoadingReturns(false);
      });
  }, [currentLocation]);

  // Initial load
  useEffect(() => {
    let ignore = false;

    const params: Record<string, string> = {};
    if (currentLocation?._id) {
      params.locationId = currentLocation._id;
    }

    Promise.all([
      apiClient.get<RawSale[]>("/retail/sale", { params }),
      apiClient
        .get<RawReturn[]>("/retail/sale/returns", { params })
        .catch(() => ({ data: [] as RawReturn[] })),
    ])
      .then(([salesRes, returnsRes]) => {
        if (!ignore) {
          setError(null);
          const rawSales = Array.isArray(salesRes.data) ? salesRes.data : [];
          setSales(rawSales.map(normalizeSale));

          const rawReturns = Array.isArray(returnsRes.data) ? returnsRes.data : [];
          setReturns(rawReturns.map(normalizeReturn));
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Failed to load transactions";
          setError(msg);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoadingSales(false);
          setIsLoadingReturns(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentLocation]);

  // Filtered Sales
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchesSearch =
        s.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.customerName && s.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.cashierName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
      const matchesPayment =
        paymentFilter === "ALL" || s.paymentMethod.toUpperCase() === paymentFilter.toUpperCase();

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [sales, searchQuery, statusFilter, paymentFilter]);

  // Total summary metrics
  const totalRevenue = sales
    .filter((s) => s.status !== "VOIDED")
    .reduce((sum, s) => sum + s.totalMinor, 0);
  const totalRefunded = returns.reduce((sum, r) => sum + r.refundAmountMinor, 0);
  const totalTransactions = sales.filter((s) => s.status !== "VOIDED").length;

  const handleProcessRefund = async (params: ProcessRefundParams) => {
    if (!refundSale) return;

    setIsSubmittingRefund(true);
    try {
      await apiClient.post(`/retail/sale/${refundSale._id}/returns`, {
        lines: params.lines,
        refundMethod: params.refundMethod,
        notes: params.notes,
      });

      toast.success(`Refund processed successfully for ${refundSale.receiptNumber}!`);
      setRefundSale(null);
      fetchSales();
      fetchReturns();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process refund";
      toast.error(msg);
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sales & Transactions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit store receipts, track payment tenders, and manage customer returns.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <SalesKpis
        totalRevenue={totalRevenue}
        totalTransactions={totalTransactions}
        totalRefunded={totalRefunded}
      />

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("SALES")}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "SALES"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Receipt className="h-4 w-4" />
          Sales Receipts ({sales.length})
        </button>
        <button
          onClick={() => setActiveTab("RETURNS")}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "RETURNS"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <RotateCcw className="h-4 w-4" />
          Returns & Refunds ({returns.length})
        </button>
      </div>

      {/* ─── TAB 1: SALES TRANSACTIONS ────────────────────────── */}
      {activeTab === "SALES" && (
        <SalesTab
          sales={filteredSales}
          isLoading={isLoadingSales}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          paymentFilter={paymentFilter}
          onPaymentFilterChange={setPaymentFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onSelectSale={setSelectedSale}
          onOpenRefund={setRefundSale}
        />
      )}

      {/* ─── TAB 2: RETURNS & REFUNDS ─────────────────────────── */}
      {activeTab === "RETURNS" && (
        <ReturnsTab returns={returns} isLoading={isLoadingReturns} />
      )}

      {/* Transaction Details Modal */}
      <SaleDetailsModal
        sale={selectedSale}
        isOpen={!!selectedSale}
        onClose={() => setSelectedSale(null)}
      />

      {/* Return & Refund Modal */}
      <RefundModal
        sale={refundSale}
        isOpen={!!refundSale}
        onClose={() => setRefundSale(null)}
        onSubmitRefund={handleProcessRefund}
        isSubmitting={isSubmittingRefund}
      />
    </div>
  );
}
