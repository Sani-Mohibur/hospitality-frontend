export interface RetailProduct {
  _id: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  categoryName?: string;
  priceMinor: number;
  costPriceMinor: number;
  hasVariants?: boolean;
  isActive: boolean;
}

export interface RetailCategory {
  _id: string;
  name: string;
}

export interface CartItem {
  product: RetailProduct;
  quantity: number;
  unitPriceMinor: number;
  discountMinor: number;
}

export interface HeldCart {
  id: string;
  name: string;
  items: CartItem[];
}

export interface RoomGuest {
  customerId?: string;
  roomNumber: string;
  guestName: string;
  checkInDate?: string;
  checkOutDate?: string;
  balanceMinor?: number;
}

export interface CompletedSale {
  receiptNumber: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  tendered?: number;
  changeDue?: number;
  guestName?: string;
  roomNumber?: string;
  date: string;
}

export interface RawCategory {
  _id: string;
  name: string;
  code?: string;
}

export interface RawProductVariant {
  _id: string;
  name: string;
  sku: string;
  barcode?: string;
  priceMinor: number;
  costPriceMinor?: number;
  isActive?: boolean;
}

export interface RawProduct {
  _id: string;
  name: string;
  sku?: string;
  barcode?: string;
  categoryId?: string | { _id: string; name?: string };
  categoryName?: string;
  priceMinor?: number;
  costPriceMinor?: number;
  hasVariants?: boolean;
  variants?: RawProductVariant[];
  isActive?: boolean;
}

export interface RawCustomerActiveStay {
  roomNumber?: string;
  checkIn?: string;
  checkOut?: string;
}

export interface RawCustomer {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  roomNumber?: string;
  activeStay?: RawCustomerActiveStay;
  balanceMinor?: number;
}

export interface PriceCheckResponse {
  productId?: string;
  name: string;
  sku: string;
  barcode?: string;
  priceMinor: number;
}

export interface CheckoutSaleResponse {
  receiptNumber?: string;
  subtotalMinor?: number;
  discountTotalMinor?: number;
  taxTotalMinor?: number;
  grandTotalMinor?: number;
  totalMinor?: number;
}

export interface CheckoutResponse {
  sale?: CheckoutSaleResponse;
  receiptNumber?: string;
  subtotalMinor?: number;
  discountTotalMinor?: number;
  taxTotalMinor?: number;
  grandTotalMinor?: number;
  totalMinor?: number;
}

export function normalizeRetailProduct(p: RawProduct): RetailProduct {
  const catId = typeof p.categoryId === "object" ? p.categoryId?._id || "" : p.categoryId || "";
  const catName = typeof p.categoryId === "object" ? p.categoryId?.name || "Retail" : p.categoryName || "Retail";
  return {
    _id: p._id,
    name: p.name,
    sku: p.sku || "",
    barcode: p.barcode,
    categoryId: catId,
    categoryName: catName,
    priceMinor: p.priceMinor || 0,
    costPriceMinor: p.costPriceMinor || 0,
    hasVariants: p.hasVariants || (p.variants && p.variants.length > 0),
    isActive: p.isActive ?? true,
  };
}

export function normalizeRetailCategory(c: RawCategory): RetailCategory {
  return {
    _id: c._id,
    name: c.name,
  };
}

export function normalizeRoomGuest(g: RawCustomer): RoomGuest {
  return {
    customerId: g._id,
    roomNumber: g.activeStay?.roomNumber || g.roomNumber || "101",
    guestName: `${g.firstName || ""} ${g.lastName || ""}`.trim() || g.name || "Hotel Guest",
    checkInDate: g.activeStay?.checkIn,
    checkOutDate: g.activeStay?.checkOut,
    balanceMinor: g.balanceMinor || 0,
  };
}
