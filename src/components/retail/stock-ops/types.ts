export interface RetailTransferLine {
  productId: string;
  variantId?: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost?: number;
}

export interface RetailTransfer {
  _id: string;
  transferNumber: string;
  fromLocationId?: string;
  fromLocation: string;
  toLocationId?: string;
  toLocation: string;
  status: "DRAFT" | "DISPATCHED" | "RECEIVED" | "CANCELLED";
  lines: RetailTransferLine[];
  notes?: string;
  createdAt: string;
}

export interface RetailStocktakeLine {
  productId: string;
  variantId?: string;
  stockItemId: string;
  productName: string;
  sku: string;
  systemQty: number;
  countedQty?: number;
  unitCost?: number;
}

export interface RetailStocktake {
  _id: string;
  stocktakeNumber: string;
  locationId?: string;
  locationName: string;
  status: "DRAFT" | "COUNTING" | "COMPLETED" | "CANCELLED";
  itemsCounted: number;
  varianceItems: number;
  lines?: RetailStocktakeLine[];
  createdAt: string;
  completedAt?: string;
}

export interface RestockSuggestion {
  _id: string;
  productId: string;
  productName: string;
  sku: string;
  supplierName?: string;
  onHand: number;
  reorderPoint: number;
  parLevel: number;
  suggestedQty: number;
  estimatedCostMinor: number;
  unitCost: number;
}

export interface ProductOption {
  _id: string;
  name: string;
  sku: string;
  costPriceMinor: number;
}

export interface RawTransferLine {
  productId?: string | { _id: string; name?: string; sku?: string };
  variantId?: string | { _id: string };
  productName?: string;
  name?: string;
  sku?: string;
  quantity?: number;
  unitCost?: number;
}

export interface RawTransfer {
  _id: string;
  transferNumber?: string;
  fromLocationId?: string | { _id: string; name: string };
  fromLocationName?: string;
  toLocationId?: string | { _id: string; name: string };
  toLocationName?: string;
  status: "DRAFT" | "DISPATCHED" | "RECEIVED" | "CANCELLED";
  lines?: RawTransferLine[];
  notes?: string;
  createdAt: string;
}

export interface RawStocktakeLine {
  productId?: string | { _id: string; name?: string; sku?: string };
  variantId?: string | { _id: string };
  stockItemId?: string | { _id: string };
  productName?: string;
  name?: string;
  sku?: string;
  systemQty?: number;
  countedQty?: number;
  unitCost?: number;
}

export interface RawStocktake {
  _id: string;
  stocktakeNumber?: string;
  locationId?: string | { _id: string; name: string };
  locationName?: string;
  status: "DRAFT" | "COUNTING" | "COMPLETED" | "CANCELLED";
  itemsCounted?: number;
  varianceItems?: number;
  lines?: RawStocktakeLine[];
  createdAt: string;
  completedAt?: string;
}

export interface RawRestockSuggestion {
  _id: string;
  productId?: string | { _id: string; name?: string };
  name?: string;
  productName?: string;
  sku?: string;
  supplierId?: string | { _id: string; name: string };
  supplierName?: string;
  quantity?: number;
  onHand?: number;
  reorderPoint?: number;
  parLevel?: number;
  reorderQty?: number;
  unitCost?: number;
  costPriceMinor?: number;
}

export interface RawProductOption {
  _id: string;
  name: string;
  sku?: string;
  costPriceMinor?: number;
}

export interface ActiveStocktakeAudit {
  _id: string;
  stocktakeNumber: string;
  location: string;
  items: {
    productId: string;
    stockItemId: string;
    name: string;
    sku: string;
    systemQty: number;
    countedQty: number;
  }[];
}

