"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useLocation } from "@/lib/location-context";
import { toast } from "sonner";
import {
  SalesOverview,
  TopProductRow,
  CategoryBreakdownRow,
  ZReportData,
  ReportSummaryResponse,
  TenderBreakdownData,
  RawSale,
  ReportsHeader,
  FinancialKpis,
  TenderBreakdownCard,
  CategoryDistribution,
  TopProductsTable,
  ZReportModal,
} from "@/components/retail/reports";

export type {
  SalesOverview,
  TopProductRow,
  CategoryBreakdownRow,
  ZReportData,
} from "@/components/retail/reports";

export default function RetailReportsPage() {
  const { currentLocation } = useLocation();

  const [dateRange, setDateRange] = useState("TODAY");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Aggregated data
  const [overview, setOverview] = useState<SalesOverview>({
    totalRevenueMinor: 0,
    netRevenueMinor: 0,
    transactionCount: 0,
    averageOrderValueMinor: 0,
    discountMinor: 0,
    taxMinor: 0,
    refundedMinor: 0,
  });

  const [topProducts, setTopProducts] = useState<TopProductRow[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdownRow[]>([]);

  // Tender breakdowns
  const [tenderBreakdown, setTenderBreakdown] = useState<TenderBreakdownData>({
    cardMinor: 0,
    cashMinor: 0,
    roomChargeMinor: 0,
  });

  // End-of-Day Z-Report Modal
  const [isZReportOpen, setIsZReportOpen] = useState(false);
  const [isLoadingZReport, setIsLoadingZReport] = useState(false);
  const [zReportData, setZReportData] = useState<ZReportData | null>(null);

  // Calculate Date bounds based on selector
  const getDateBounds = useCallback(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (dateRange === "TODAY") {
      return { from: startOfToday.toISOString(), to: endOfToday.toISOString() };
    }
    if (dateRange === "YESTERDAY") {
      const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
      const endOfYesterday = new Date(endOfToday.getTime() - 24 * 60 * 60 * 1000);
      return { from: startOfYesterday.toISOString(), to: endOfYesterday.toISOString() };
    }
    if (dateRange === "LAST_7_DAYS") {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { from: past7.toISOString(), to: now.toISOString() };
    }
    if (dateRange === "THIS_MONTH") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: startOfMonth.toISOString(), to: now.toISOString() };
    }
    return { from: startOfToday.toISOString(), to: endOfToday.toISOString() };
  }, [dateRange]);

  // Load report data
  useEffect(() => {
    let ignore = false;

    const { from, to } = getDateBounds();
    const params: Record<string, string> = { from, to };
    if (currentLocation?._id) {
      params.locationId = currentLocation._id;
    }

    Promise.all([
      apiClient
        .get<ReportSummaryResponse>("/retail/report/summary", { params })
        .catch(() => ({ data: null })),
      apiClient
        .get<TopProductRow[]>("/retail/report/top-products", { params })
        .catch(() => ({ data: [] as TopProductRow[] })),
      apiClient
        .get<CategoryBreakdownRow[]>("/retail/report/category-breakdown", { params })
        .catch(() => ({ data: [] as CategoryBreakdownRow[] })),
      apiClient
        .get<RawSale[]>("/retail/sale", { params })
        .catch(() => ({ data: [] as RawSale[] })),
    ])
      .then(([summaryRes, topRes, catRes, salesRes]) => {
        if (!ignore) {
          setError(null);
          if (summaryRes.data?.overview) {
            setOverview(summaryRes.data.overview);
          }

          const rawTop = Array.isArray(topRes.data) ? topRes.data : [];
          setTopProducts(rawTop);

          const rawCat = Array.isArray(catRes.data) ? catRes.data : [];
          setCategoryBreakdown(rawCat);

          // Calculate tender totals from sales
          const rawSales = Array.isArray(salesRes.data) ? salesRes.data : [];
          let card = 0;
          let cash = 0;
          let room = 0;

          rawSales.forEach((s: RawSale) => {
            if (s.status === "VOIDED") return;
            const pm = s.paymentMethod || (s.payments && s.payments[0]?.method);
            const amt = s.grandTotalMinor || s.totalMinor || 0;
            if (pm === "CASH") cash += amt;
            else if (pm === "CHARGE_TO_ROOM" || pm === "ROOM_CHARGE") room += amt;
            else card += amt;
          });

          setTenderBreakdown({ cardMinor: card, cashMinor: cash, roomChargeMinor: room });
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Failed to load report analytics";
          setError(msg);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentLocation, dateRange, getDateBounds]);

  // Open Z-Report
  const handleOpenZReport = async () => {
    setIsZReportOpen(true);
    setIsLoadingZReport(true);
    try {
      const params: Record<string, string> = {};
      if (currentLocation?._id) {
        params.locationId = currentLocation._id;
      }
      const res = await apiClient.get<ZReportData>("/retail/report/z-report", { params });
      setZReportData(res.data);
    } catch {
      toast.error("Could not fetch register audit for Z-Report");
    } finally {
      setIsLoadingZReport(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Gross Sales ($)", (overview.totalRevenueMinor / 100).toFixed(2)],
      ["Net Sales ($)", (overview.netRevenueMinor / 100).toFixed(2)],
      ["Transaction Count", overview.transactionCount.toString()],
      ["Average Order Value ($)", (overview.averageOrderValueMinor / 100).toFixed(2)],
      ["Total Discounts ($)", (overview.discountMinor / 100).toFixed(2)],
      ["Total Tax Collected ($)", (overview.taxMinor / 100).toFixed(2)],
      ["Total Refunded ($)", (overview.refundedMinor / 100).toFixed(2)],
      [],
      ["Top Selling Products"],
      ["Product Name", "SKU", "Units Sold", "Gross Revenue ($)"],
      ...topProducts.map((p) => [
        p.name,
        p.sku,
        p.totalQuantity.toString(),
        (p.totalRevenueMinor / 100).toFixed(2),
      ]),
      [],
      ["Category Breakdown"],
      ["Category", "Units Sold", "Revenue ($)", "Percentage (%)"],
      ...categoryBreakdown.map((c) => [
        c.categoryName,
        c.totalQuantity.toString(),
        (c.totalRevenueMinor / 100).toFixed(2),
        c.percentage.toString(),
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `retail-report-${dateRange.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report exported successfully!");
  };

  const grossSalesMinor = overview.totalRevenueMinor;
  const totalRefundMinor = overview.refundedMinor;

  return (
    <div className="space-y-6">
      {/* Header */}
      <ReportsHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onExportCSV={handleExportCSV}
        onOpenZReport={handleOpenZReport}
      />

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Financial Overview Cards */}
      <FinancialKpis overview={overview} />

      {/* Tender Breakdown Grid */}
      <TenderBreakdownCard
        tenderBreakdown={tenderBreakdown}
        grossSalesMinor={grossSalesMinor}
      />

      {/* Two Column Layout: Category Share & Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDistribution
          categories={categoryBreakdown}
          isLoading={isLoading}
        />
        <TopProductsTable
          products={topProducts}
          isLoading={isLoading}
        />
      </div>

      {/* End-of-Day Z-Report Modal */}
      <ZReportModal
        isOpen={isZReportOpen}
        onClose={() => setIsZReportOpen(false)}
        isLoading={isLoadingZReport}
        data={zReportData}
        locationName={currentLocation?.name}
        tenderBreakdown={tenderBreakdown}
        totalRefundMinor={totalRefundMinor}
        grossSalesMinor={grossSalesMinor}
      />
    </div>
  );
}
