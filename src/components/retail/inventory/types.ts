export interface RetailStockItem {
  _id: string;
  productId?: string;
  productName: string;
  sku: string;
  barcode?: string;
  locationId?: string;
  locationName: string;
  onHand: number;
  reserved: number;
  available: number;
  parLevel: number;
  reorderPoint: number;
  reorderQty: number;
  unitCost: number;
  supplierName?: string;
  isActive: boolean;
}

export interface StockMovement {
  id: string;
  timestamp: string;
  productName: string;
  sku: string;
  locationName: string;
  type: "INCREASE" | "DECREASE";
  quantity: number;
  reason: string;
  performedBy: string;
  notes?: string;
}

export interface RawInventoryLocation {
  _id: string;
  name: string;
  code?: string;
  branchType?: string;
}

export interface RawInventorySupplier {
  _id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  leadTimeDays?: number;
}

export interface RawInventoryItem {
  _id: string;
  productId?: string;
  variantId?: string;
  name?: string;
  productName?: string;
  sku: string;
  barcode?: string;
  category?: string;
  retailCategory?: string;
  locationId?: string | RawInventoryLocation;
  locationName?: string;
  supplierId?: string | RawInventorySupplier;
  supplierName?: string;
  quantity?: number;
  onHand?: number;
  reserved?: number;
  parLevel?: number;
  reorderPoint?: number;
  reorderQty?: number;
  unitCost?: number;
  sellingPriceMinor?: number;
  unitOfMeasure?: string;
  stockStatus?: string;
  isActive?: boolean;
}

export interface RawStockMovementUser {
  _id: string;
  name?: string;
  email?: string;
}

export interface RawStockMovementItem {
  _id: string;
  name?: string;
  sku?: string;
  unitOfMeasure?: string;
}

export interface RawStockMovement {
  _id: string;
  stockItemId?: string | RawStockMovementItem;
  locationId?: string | RawInventoryLocation;
  type?: string;
  quantity: number;
  reason?: string;
  createdBy?: string | RawStockMovementUser;
  ref?: {
    model?: string;
    id?: string;
  };
  createdAt?: string;
}

export interface InventoryApiResponse {
  data: RawInventoryItem[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface MovementApiResponse {
  data: RawStockMovement[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export function normalizeStockItem(item: RawInventoryItem): RetailStockItem {
  const locName =
    typeof item.locationId === "object" && item.locationId !== null
      ? item.locationId.name
      : item.locationName || "Store";
  const locId =
    typeof item.locationId === "object" && item.locationId !== null
      ? item.locationId._id
      : item.locationId;
  const supName =
    typeof item.supplierId === "object" && item.supplierId !== null
      ? item.supplierId.name
      : item.supplierName || undefined;

  const onHand = item.quantity ?? item.onHand ?? 0;
  const reserved = item.reserved ?? 0;
  const available = Math.max(0, onHand - reserved);
  const unitCost = item.unitCost ? item.unitCost / 100 : 0;

  return {
    _id: item._id,
    productId: item.productId,
    productName: item.name || item.productName || "Product",
    sku: item.sku || "",
    barcode: item.barcode || undefined,
    locationId: locId,
    locationName: locName,
    onHand,
    reserved,
    available,
    parLevel: item.parLevel ?? 0,
    reorderPoint: item.reorderPoint ?? 0,
    reorderQty: item.reorderQty ?? 10,
    unitCost,
    supplierName: supName,
    isActive: item.isActive ?? true,
  };
}

export function normalizeStockMovement(m: RawStockMovement): StockMovement {
  const prodName =
    typeof m.stockItemId === "object" && m.stockItemId !== null
      ? m.stockItemId.name || "Retail Stock"
      : "Retail Stock";
  const sku =
    typeof m.stockItemId === "object" && m.stockItemId !== null
      ? m.stockItemId.sku || ""
      : "";
  const locName =
    typeof m.locationId === "object" && m.locationId !== null
      ? m.locationId.name || "Store"
      : "Store";
  const performedBy =
    typeof m.createdBy === "object" && m.createdBy !== null
      ? m.createdBy.name || "System"
      : typeof m.createdBy === "string"
      ? m.createdBy
      : "System";

  return {
    id: m._id,
    timestamp: m.createdAt || new Date().toISOString(),
    productName: prodName,
    sku,
    locationName: locName,
    type: m.quantity >= 0 ? "INCREASE" : "DECREASE",
    quantity: Math.abs(m.quantity),
    reason: m.reason || m.type || "Adjustment",
    performedBy,
    notes: m.ref?.id ? `Ref: ${m.ref.id}` : undefined,
  };
}

