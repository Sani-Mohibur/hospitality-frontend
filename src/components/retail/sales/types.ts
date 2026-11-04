export interface RetailSaleLine {
  productId: string;
  variantId?: string;
  name: string;
  sku: string;
  quantity: number;
  unitPriceMinor: number;
  totalMinor: number;
  returnedQuantity: number;
}

export interface RetailSale {
  _id: string;
  receiptNumber: string;
  invoiceNumber: string;
  businessDate?: string;
  locationId?: string;
  locationName: string;
  cashierName: string;
  customerId?: string;
  customerName?: string;
  lines: RetailSaleLine[];
  subtotalMinor: number;
  discountTotalMinor: number;
  taxTotalMinor: number;
  totalMinor: number;
  paymentMethod: string;
  status: "COMPLETED" | "PARTIALLY_REFUNDED" | "REFUNDED" | "VOIDED";
  createdAt: string;
}

export interface RetailReturnLine {
  name: string;
  sku: string;
  quantity: number;
  refundAmountMinor: number;
  condition: string;
}

export interface RetailReturn {
  _id: string;
  returnNumber: string;
  saleReceiptNumber: string;
  reason: string;
  lines: RetailReturnLine[];
  refundAmountMinor: number;
  refundMethod: string;
  processedBy: string;
  createdAt: string;
}

export interface RawSaleLine {
  productId?: string | { _id: string; name?: string; sku?: string };
  variantId?: string | { _id: string };
  name?: string;
  productName?: string;
  sku?: string;
  quantity?: number;
  unitPriceMinor?: number;
  grossMinor?: number;
  totalMinor?: number;
  returnedQuantity?: number;
}

export interface RawSalePayment {
  method?: string;
  amountMinor?: number;
}

export interface RawSale {
  _id: string;
  receiptNumber?: string;
  invoiceNumber?: string;
  businessDate?: string;
  locationId?: string | { _id: string; name: string };
  locationName?: string;
  cashierId?: string | { _id: string; name?: string; email?: string };
  cashierName?: string;
  customerId?: string | { _id: string; firstName?: string; lastName?: string };
  customerName?: string;
  lines?: RawSaleLine[];
  subtotalMinor?: number;
  discountTotalMinor?: number;
  taxTotalMinor?: number;
  totalMinor?: number;
  grandTotalMinor?: number;
  paymentMethod?: string;
  payments?: RawSalePayment[];
  status?: "COMPLETED" | "REFUNDED" | "PARTIALLY_REFUNDED" | "VOIDED";
  createdAt: string;
}

export interface RawReturnLine {
  productId?: string;
  name?: string;
  productName?: string;
  sku?: string;
  quantity?: number;
  unitPriceMinor?: number;
  refundAmountMinor?: number;
  condition?: "RESELLABLE" | "DAMAGED" | "DEFECTIVE";
}

export interface RawReturn {
  _id: string;
  returnNumber?: string;
  saleId?: string | { _id: string; receiptNumber?: string };
  saleReceiptNumber?: string;
  reason?: string;
  lines?: RawReturnLine[];
  refundAmountMinor?: number;
  refundMethod?: string;
  processedBy?: string | { _id: string; name?: string; email?: string };
  createdAt: string;
}

export function mapPaymentMethodName(method?: string): string {
  if (!method) return "Card";
  if (
    method === "CARD_EXTERNAL" ||
    method === "CARD_ONLINE" ||
    method === "CARD_TERMINAL" ||
    method === "CARD"
  )
    return "Card";
  if (method === "CASH") return "Cash";
  if (method === "CHARGE_TO_ROOM" || method === "ROOM_CHARGE") return "Room Charge";
  if (method === "CITY_LEDGER") return "City Ledger";
  return method;
}

export function normalizeSale(s: RawSale): RetailSale {
  const cashierName =
    typeof s.cashierId === "object" && s.cashierId?.name
      ? s.cashierId.name
      : typeof s.cashierId === "object" && s.cashierId?.email
      ? s.cashierId.email
      : s.cashierName || "Cashier";

  const customerName =
    typeof s.customerId === "object" && (s.customerId?.firstName || s.customerId?.lastName)
      ? `${s.customerId.firstName || ""} ${s.customerId.lastName || ""}`.trim()
      : s.customerName || undefined;

  const locName =
    typeof s.locationId === "object" && s.locationId?.name
      ? s.locationId.name
      : s.locationName || "Store";

  const paymentMethod =
    s.payments && s.payments.length > 0
      ? mapPaymentMethodName(s.payments[0].method)
      : mapPaymentMethodName(s.paymentMethod);

  const lines: RetailSaleLine[] = (s.lines || []).map((l: RawSaleLine) => ({
    productId: typeof l.productId === "object" ? l.productId?._id || "" : l.productId || "",
    variantId: typeof l.variantId === "object" ? l.variantId?._id : l.variantId,
    name: l.name || l.productName || "Product",
    sku: l.sku || "",
    quantity: l.quantity || 1,
    unitPriceMinor: l.unitPriceMinor || 0,
    totalMinor: l.grossMinor || l.totalMinor || (l.quantity || 1) * (l.unitPriceMinor || 0),
    returnedQuantity: l.returnedQuantity || 0,
  }));

  return {
    _id: s._id,
    receiptNumber: s.receiptNumber || `RCP-${s._id.slice(-6).toUpperCase()}`,
    invoiceNumber: s.invoiceNumber || `INV-${s._id.slice(-6).toUpperCase()}`,
    businessDate: s.businessDate || new Date(s.createdAt).toISOString().split("T")[0],
    locationId: typeof s.locationId === "object" ? s.locationId?._id : s.locationId,
    locationName: locName,
    cashierName,
    customerId: typeof s.customerId === "object" ? s.customerId?._id : s.customerId,
    customerName,
    lines,
    subtotalMinor: s.subtotalMinor || lines.reduce((acc, l) => acc + l.totalMinor, 0),
    discountTotalMinor: s.discountTotalMinor || 0,
    taxTotalMinor: s.taxTotalMinor || 0,
    totalMinor: s.grandTotalMinor || s.totalMinor || 0,
    paymentMethod,
    status: s.status || "COMPLETED",
    createdAt: s.createdAt,
  };
}

export function normalizeReturn(r: RawReturn): RetailReturn {
  const processedBy =
    typeof r.processedBy === "object" && r.processedBy?.name
      ? r.processedBy.name
      : typeof r.processedBy === "object" && r.processedBy?.email
      ? r.processedBy.email
      : typeof r.processedBy === "string"
      ? r.processedBy
      : "Staff";

  const lines: RetailReturnLine[] = (r.lines || []).map((l: RawReturnLine) => ({
    name: l.name || l.productName || "Item",
    sku: l.sku || "",
    quantity: l.quantity || 1,
    refundAmountMinor: l.refundAmountMinor || (l.quantity || 1) * (l.unitPriceMinor || 0),
    condition: l.condition || "RESELLABLE",
  }));

  return {
    _id: r._id,
    returnNumber: r.returnNumber || `RTN-${r._id.slice(-6).toUpperCase()}`,
    saleReceiptNumber:
      r.saleReceiptNumber ||
      (typeof r.saleId === "object" ? r.saleId?.receiptNumber : undefined) ||
      (typeof r.saleId === "string" ? r.saleId : undefined) ||
      "Receipt",
    reason: r.reason || "Customer return",
    lines,
    refundAmountMinor: r.refundAmountMinor || lines.reduce((acc, l) => acc + l.refundAmountMinor, 0),
    refundMethod: mapPaymentMethodName(r.refundMethod),
    processedBy,
    createdAt: r.createdAt,
  };
}

