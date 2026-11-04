import { RawSale } from "@/components/retail/sales";

export interface SalesOverview {
  totalRevenueMinor: number;
  netRevenueMinor: number;
  transactionCount: number;
  averageOrderValueMinor: number;
  discountMinor: number;
  taxMinor: number;
  refundedMinor: number;
}

export interface TopProductRow {
  productId: string;
  variantId?: string;
  sku: string;
  name: string;
  categoryName?: string;
  totalQuantity: number;
  totalRevenueMinor: number;
  totalNetMinor: number;
  totalDiscountMinor?: number;
  orderCount?: number;
}

export interface CategoryBreakdownRow {
  categoryName: string;
  totalQuantity: number;
  totalRevenueMinor: number;
  totalNetMinor?: number;
  orderCount?: number;
  percentage: number;
}

export interface ZReportPayment {
  method: string;
  count: number;
  amountMinor: number;
  tenderedMinor: number;
  changeMinor: number;
}

export interface ZReportReturnMethod {
  method: string;
  count: number;
  amountMinor: number;
}

export interface ZReportCashReconciliation {
  openingFloatMinor: number;
  cashSalesMinor: number;
  cashRefundsMinor: number;
  paidInsMinor: number;
  dropsMinor: number;
  payoutsMinor: number;
  expectedCashMinor: number;
  actualClosingFloatMinor?: number;
  varianceMinor?: number;
}

export interface ZReportData {
  location?: {
    _id: string;
    name: string;
    code?: string;
    businessDate?: string;
  };
  store?: {
    name: string;
    businessDate?: string;
  };
  sales: {
    transactionCount: number;
    grossSalesMinor: number;
    subtotalMinor: number;
    discountMinor: number;
    netSalesMinor: number;
    taxMinor: number;
    refundedMinor: number;
    netRevenueMinor: number;
  };
  payments: ZReportPayment[];
  returns: {
    count: number;
    totalRefundMinor: number;
    byMethod: ZReportReturnMethod[];
  };
  cashReconciliation?: ZReportCashReconciliation | null;
}

export interface ReportSummaryResponse {
  period?: { from: string; to: string };
  overview: SalesOverview;
  timeline?: Array<{
    date: string;
    revenueMinor: number;
    netRevenueMinor: number;
    refundedMinor: number;
    taxMinor: number;
    discountMinor: number;
    transactions: number;
    averageOrderValueMinor: number;
  }>;
}

export interface TenderBreakdownData {
  cardMinor: number;
  cashMinor: number;
  roomChargeMinor: number;
}

export type DateRangeOption = "TODAY" | "YESTERDAY" | "LAST_7_DAYS" | "THIS_MONTH";

export type { RawSale };
