export interface RetailSupplier {
  _id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  leadTimeDays: number;
  productsSupplied: number;
  isActive: boolean;
}

export interface RetailPOLine {
  productId: string;
  variantId?: string;
  stockItemId?: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number; // in dollars for UI display
  receivedQty: number;
  totalMinor: number;
}

export interface RetailPurchaseOrder {
  _id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  locationId?: string;
  locationName: string;
  status: "DRAFT" | "SENT" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED";
  lines: RetailPOLine[];
  subtotalMinor: number;
  notes?: string;
  expectedAt?: string;
  sentAt?: string;
  receivedAt?: string;
  createdAt: string;
}

export interface ProductOption {
  _id: string;
  name: string;
  sku: string;
  costPriceMinor: number;
}

export interface RawSupplier {
  _id: string;
  name: string;
  contactName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  leadTimeDays?: number;
  productsSupplied?: number;
  isActive?: boolean;
}

export interface RawPOLine {
  productId?: string | { _id: string; name?: string; sku?: string };
  variantId?: string | { _id: string; name?: string; sku?: string };
  stockItemId?: string | { _id: string };
  name?: string;
  productName?: string;
  sku?: string;
  quantity?: number;
  unitCost?: number;
  receivedQty?: number;
  totalMinor?: number;
}

export interface RawPO {
  _id: string;
  poNumber: string;
  supplierId?: string | { _id: string; name: string };
  supplierName?: string;
  locationId?: string | { _id: string; name: string };
  locationName?: string;
  status: "DRAFT" | "SENT" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED";
  lines?: RawPOLine[];
  subtotalMinor?: number;
  notes?: string;
  expectedAt?: string;
  sentAt?: string;
  receivedAt?: string;
  createdAt: string;
}

export interface RawProduct {
  _id: string;
  name: string;
  sku?: string;
  costPriceMinor?: number;
}

export interface SupplierFormData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  leadTimeDays: number;
  isActive: boolean;
}

export interface CreatePoLine {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePoPayload {
  supplierId: string;
  locationId: string;
  expectedAt?: string;
  notes?: string;
  lines: Array<{
    productId: string;
    quantity: number;
    unitCost: number; // in cents / minor units
  }>;
}

export function normalizeSupplier(s: RawSupplier): RetailSupplier {
  return {
    _id: s._id,
    name: s.name,
    contactPerson: s.contactPerson || s.contactName || "",
    email: s.email || "",
    phone: s.phone || "",
    address: s.address || "",
    leadTimeDays: typeof s.leadTimeDays === "number" ? s.leadTimeDays : 3,
    productsSupplied: s.productsSupplied ?? 0,
    isActive: s.isActive ?? true,
  };
}

export function normalizePO(raw: RawPO): RetailPurchaseOrder {
  const supplierName =
    typeof raw.supplierId === "object" && raw.supplierId?.name
      ? raw.supplierId.name
      : raw.supplierName || "Supplier";

  const supplierId =
    typeof raw.supplierId === "object" && raw.supplierId?._id
      ? raw.supplierId._id
      : (raw.supplierId as string) || "";

  const locationName =
    typeof raw.locationId === "object" && raw.locationId?.name
      ? raw.locationId.name
      : raw.locationName || "Store";

  const locationId =
    typeof raw.locationId === "object" && raw.locationId?._id
      ? raw.locationId._id
      : (raw.locationId as string) || undefined;

  const lines: RetailPOLine[] = (raw.lines || []).map((l) => {
    const pId = typeof l.productId === "object" && l.productId?._id ? l.productId._id : (l.productId as string) || "";
    const pName = typeof l.productId === "object" && l.productId?.name ? l.productId.name : l.productName || l.name || "Item";
    const pSku = typeof l.productId === "object" && l.productId?.sku ? l.productId.sku : l.sku || "";
    const sId = typeof l.stockItemId === "object" && l.stockItemId?._id ? l.stockItemId._id : (l.stockItemId as string) || "";
    const qty = l.quantity || 0;
    const unitCostMinor = l.unitCost || 0;
    const unitCost = unitCostMinor > 100 ? unitCostMinor / 100 : unitCostMinor;
    const receivedQty = l.receivedQty || 0;
    const totalMinor = l.totalMinor || Math.round(qty * unitCost * 100);

    return {
      productId: pId,
      variantId: typeof l.variantId === "object" ? l.variantId?._id : l.variantId,
      stockItemId: sId,
      productName: pName,
      sku: pSku,
      quantity: qty,
      unitCost,
      receivedQty,
      totalMinor,
    };
  });

  return {
    _id: raw._id,
    poNumber: raw.poNumber,
    supplierId,
    supplierName,
    locationId,
    locationName,
    status: raw.status,
    lines,
    subtotalMinor: raw.subtotalMinor || lines.reduce((acc, l) => acc + l.totalMinor, 0),
    notes: raw.notes,
    expectedAt: raw.expectedAt ? new Date(raw.expectedAt).toISOString().split("T")[0] : undefined,
    sentAt: raw.sentAt,
    receivedAt: raw.receivedAt,
    createdAt: raw.createdAt,
  };
}

