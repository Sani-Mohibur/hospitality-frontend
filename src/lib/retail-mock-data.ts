// Shared retail mock data for static UI (no backend integration yet)

export interface RetailCategory {
  _id: string;
  name: string;
  code: string;
  description: string;
  productCount: number;
  sortOrder: number;
  isActive: boolean;
}

export interface RetailProductVariant {
  _id: string;
  name: string;
  sku: string;
  barcode?: string;
  priceMinor: number;
  costPriceMinor: number;
  attributes: { name: string; value: string }[];
  isActive: boolean;
}

export interface RetailProduct {
  _id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  sku: string;
  barcode?: string;
  priceMinor: number;
  costPriceMinor: number;
  taxCategory: string;
  unitOfMeasure: string;
  imageUrl?: string;
  tags: string[];
  hasVariants: boolean;
  variants: RetailProductVariant[];
  isActive: boolean;
  createdAt: string;
}

export interface RetailStockItem {
  _id: string;
  productId: string;
  productName: string;
  sku: string;
  barcode?: string;
  locationId: string;
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

export interface RetailPurchaseOrder {
  _id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  locationName: string;
  status: "DRAFT" | "SENT" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED";
  lines: {
    productName: string;
    sku: string;
    quantity: number;
    unitCost: number;
    receivedQty: number;
    totalMinor: number;
  }[];
  subtotalMinor: number;
  notes?: string;
  expectedAt?: string;
  sentAt?: string;
  receivedAt?: string;
  createdAt: string;
}

export interface RetailTransfer {
  _id: string;
  transferNumber: string;
  fromLocation: string;
  toLocation: string;
  status: "DRAFT" | "DISPATCHED" | "RECEIVED" | "CANCELLED";
  lines: { productName: string; sku: string; quantity: number; unitCost: number }[];
  notes?: string;
  createdAt: string;
}

export interface RetailStocktake {
  _id: string;
  stocktakeNumber: string;
  locationName: string;
  status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  itemsCounted: number;
  varianceItems: number;
  createdAt: string;
  completedAt?: string;
}

export interface RetailSale {
  _id: string;
  receiptNumber: string;
  invoiceNumber: string;
  businessDate: string;
  status: "COMPLETED" | "PARTIALLY_REFUNDED" | "REFUNDED" | "VOIDED";
  paymentStatus: "PAID" | "PARTIALLY_REFUNDED" | "REFUNDED";
  customerName?: string;
  lines: {
    name: string;
    sku: string;
    quantity: number;
    unitPriceMinor: number;
    totalMinor: number;
    returnedQuantity: number;
  }[];
  subtotalMinor: number;
  discountTotalMinor: number;
  taxTotalMinor: number;
  totalMinor: number;
  paymentMethod: string;
  cashierName: string;
  locationName: string;
  createdAt: string;
}

export interface RetailReturn {
  _id: string;
  returnNumber: string;
  saleReceiptNumber: string;
  reason: string;
  lines: { name: string; sku: string; quantity: number; refundAmountMinor: number; condition: string }[];
  refundAmountMinor: number;
  refundMethod: string;
  processedBy: string;
  createdAt: string;
}

// ─── Mock Data ──────────────────────────────────────────────

export const mockCategories: RetailCategory[] = [
  { _id: "cat-1", name: "Electronics", code: "ELEC", description: "Consumer electronics & accessories", productCount: 24, sortOrder: 1, isActive: true },
  { _id: "cat-2", name: "Apparel", code: "APRL", description: "Clothing, shoes, and fashion accessories", productCount: 38, sortOrder: 2, isActive: true },
  { _id: "cat-3", name: "Home & Living", code: "HOME", description: "Furniture, décor, and household essentials", productCount: 15, sortOrder: 3, isActive: true },
  { _id: "cat-4", name: "Health & Beauty", code: "HLTH", description: "Personal care, cosmetics, and wellness", productCount: 21, sortOrder: 4, isActive: true },
  { _id: "cat-5", name: "Food & Beverage", code: "FOOD", description: "Packaged food, snacks, and drinks", productCount: 32, sortOrder: 5, isActive: true },
  { _id: "cat-6", name: "Sports & Outdoors", code: "SPRT", description: "Fitness gear and outdoor equipment", productCount: 12, sortOrder: 6, isActive: true },
  { _id: "cat-7", name: "Gift Shop", code: "GIFT", description: "Souvenirs, gift cards, and novelty items", productCount: 18, sortOrder: 7, isActive: true },
  { _id: "cat-8", name: "Stationery", code: "STAT", description: "Office supplies, notebooks, and writing instruments", productCount: 9, sortOrder: 8, isActive: false },
];

export const mockProducts: RetailProduct[] = [
  { _id: "p-1", name: "Wireless Bluetooth Earbuds", description: "Premium noise-cancelling wireless earbuds with 24hr battery life", categoryId: "cat-1", categoryName: "Electronics", sku: "ELEC-WBE-001", barcode: "8901234567890", priceMinor: 7999, costPriceMinor: 4200, taxCategory: "STANDARD", unitOfMeasure: "PIECE", tags: ["wireless", "audio", "bestseller"], hasVariants: true, variants: [{ _id: "v-1a", name: "Black", sku: "ELEC-WBE-001-BLK", priceMinor: 7999, costPriceMinor: 4200, attributes: [{ name: "Color", value: "Black" }], isActive: true }, { _id: "v-1b", name: "White", sku: "ELEC-WBE-001-WHT", priceMinor: 7999, costPriceMinor: 4200, attributes: [{ name: "Color", value: "White" }], isActive: true }], isActive: true, createdAt: "2025-09-15T10:30:00Z" },
  { _id: "p-2", name: "Organic Cotton T-Shirt", description: "100% organic cotton crew-neck tee", categoryId: "cat-2", categoryName: "Apparel", sku: "APRL-OCT-002", barcode: "8901234567891", priceMinor: 2499, costPriceMinor: 1100, taxCategory: "STANDARD", unitOfMeasure: "PIECE", tags: ["organic", "cotton"], hasVariants: true, variants: [{ _id: "v-2a", name: "S / Navy", sku: "APRL-OCT-002-S-NV", priceMinor: 2499, costPriceMinor: 1100, attributes: [{ name: "Size", value: "S" }, { name: "Color", value: "Navy" }], isActive: true }, { _id: "v-2b", name: "M / Navy", sku: "APRL-OCT-002-M-NV", priceMinor: 2499, costPriceMinor: 1100, attributes: [{ name: "Size", value: "M" }, { name: "Color", value: "Navy" }], isActive: true }], isActive: true, createdAt: "2025-10-02T08:00:00Z" },
  { _id: "p-3", name: "Ceramic Table Lamp", description: "Hand-crafted ceramic lamp with linen shade", categoryId: "cat-3", categoryName: "Home & Living", sku: "HOME-CTL-003", priceMinor: 12900, costPriceMinor: 6500, taxCategory: "STANDARD", unitOfMeasure: "PIECE", tags: ["lighting", "handmade"], hasVariants: false, variants: [], isActive: true, createdAt: "2025-08-20T14:15:00Z" },
  { _id: "p-4", name: "Vitamin C Serum 30ml", description: "Brightening face serum with 20% Vitamin C", categoryId: "cat-4", categoryName: "Health & Beauty", sku: "HLTH-VCS-004", barcode: "8901234567893", priceMinor: 3499, costPriceMinor: 1400, taxCategory: "STANDARD", unitOfMeasure: "PIECE", tags: ["skincare", "bestseller"], hasVariants: false, variants: [], isActive: true, createdAt: "2025-11-01T09:00:00Z" },
  { _id: "p-5", name: "Artisan Granola 500g", description: "Hand-baked granola with honey, almonds, and dried berries", categoryId: "cat-5", categoryName: "Food & Beverage", sku: "FOOD-AGR-005", barcode: "8901234567894", priceMinor: 1299, costPriceMinor: 550, taxCategory: "FOOD", unitOfMeasure: "PIECE", tags: ["organic", "breakfast"], hasVariants: false, variants: [], isActive: true, createdAt: "2025-10-10T07:30:00Z" },
  { _id: "p-6", name: "Yoga Mat Premium", description: "Non-slip 6mm eco-friendly yoga mat", categoryId: "cat-6", categoryName: "Sports & Outdoors", sku: "SPRT-YMP-006", priceMinor: 4599, costPriceMinor: 2000, taxCategory: "STANDARD", unitOfMeasure: "PIECE", tags: ["fitness", "yoga"], hasVariants: false, variants: [], isActive: true, createdAt: "2025-09-28T11:45:00Z" },
  { _id: "p-7", name: "USB-C Charging Cable 2m", description: "Braided nylon fast-charging cable", categoryId: "cat-1", categoryName: "Electronics", sku: "ELEC-UCC-007", barcode: "8901234567896", priceMinor: 1299, costPriceMinor: 350, taxCategory: "STANDARD", unitOfMeasure: "PIECE", tags: ["cable", "accessory"], hasVariants: false, variants: [], isActive: true, createdAt: "2025-10-15T16:20:00Z" },
  { _id: "p-8", name: "Scented Soy Candle", description: "Lavender & vanilla hand-poured soy wax candle", categoryId: "cat-7", categoryName: "Gift Shop", sku: "GIFT-SSC-008", priceMinor: 1899, costPriceMinor: 700, taxCategory: "STANDARD", unitOfMeasure: "PIECE", tags: ["candle", "gift"], hasVariants: false, variants: [], isActive: true, createdAt: "2025-11-05T13:00:00Z" },
  { _id: "p-9", name: "Running Shoes Pro", description: "Lightweight performance running shoe", categoryId: "cat-6", categoryName: "Sports & Outdoors", sku: "SPRT-RSP-009", priceMinor: 14999, costPriceMinor: 7500, taxCategory: "STANDARD", unitOfMeasure: "PAIR", tags: ["shoes", "running"], hasVariants: true, variants: [{ _id: "v-9a", name: "US 9 / Black", sku: "SPRT-RSP-009-9-BLK", priceMinor: 14999, costPriceMinor: 7500, attributes: [{ name: "Size", value: "US 9" }, { name: "Color", value: "Black" }], isActive: true }, { _id: "v-9b", name: "US 10 / Black", sku: "SPRT-RSP-009-10-BLK", priceMinor: 14999, costPriceMinor: 7500, attributes: [{ name: "Size", value: "US 10" }, { name: "Color", value: "Black" }], isActive: true }], isActive: true, createdAt: "2025-10-25T10:00:00Z" },
  { _id: "p-10", name: "Mineral Water 1L (6-Pack)", description: "Natural mineral spring water", categoryId: "cat-5", categoryName: "Food & Beverage", sku: "FOOD-MW6-010", barcode: "8901234567899", priceMinor: 599, costPriceMinor: 250, taxCategory: "FOOD", unitOfMeasure: "PACK", tags: ["water", "beverage"], hasVariants: false, variants: [], isActive: true, createdAt: "2025-11-10T08:00:00Z" },
  { _id: "p-11", name: "Leather Wallet Bi-fold", description: "Genuine leather slim bifold wallet", categoryId: "cat-2", categoryName: "Apparel", sku: "APRL-LWB-011", priceMinor: 5999, costPriceMinor: 2800, taxCategory: "STANDARD", unitOfMeasure: "PIECE", tags: ["leather", "accessories"], hasVariants: false, variants: [], isActive: true, createdAt: "2025-09-05T12:00:00Z" },
  { _id: "p-12", name: "Espresso Blend Coffee 250g", description: "Dark roast single-origin espresso beans", categoryId: "cat-5", categoryName: "Food & Beverage", sku: "FOOD-EBC-012", priceMinor: 1899, costPriceMinor: 800, taxCategory: "FOOD", unitOfMeasure: "PIECE", tags: ["coffee", "premium"], hasVariants: false, variants: [], isActive: true, createdAt: "2025-10-20T09:30:00Z" },
];

export const mockStockItems: RetailStockItem[] = [
  { _id: "si-1", productId: "p-1", productName: "Wireless Bluetooth Earbuds", sku: "ELEC-WBE-001-BLK", barcode: "8901234567890", locationId: "loc-1", locationName: "Main Store", onHand: 45, reserved: 3, available: 42, parLevel: 50, reorderPoint: 15, reorderQty: 30, unitCost: 42.00, supplierName: "TechWave Supplies", isActive: true },
  { _id: "si-2", productId: "p-2", productName: "Organic Cotton T-Shirt", sku: "APRL-OCT-002-S-NV", locationId: "loc-1", locationName: "Main Store", onHand: 22, reserved: 0, available: 22, parLevel: 30, reorderPoint: 10, reorderQty: 20, unitCost: 11.00, supplierName: "Green Threads Co.", isActive: true },
  { _id: "si-3", productId: "p-3", productName: "Ceramic Table Lamp", sku: "HOME-CTL-003", locationId: "loc-1", locationName: "Main Store", onHand: 8, reserved: 1, available: 7, parLevel: 12, reorderPoint: 4, reorderQty: 8, unitCost: 65.00, supplierName: "ArtisanCraft Ltd.", isActive: true },
  { _id: "si-4", productId: "p-4", productName: "Vitamin C Serum 30ml", sku: "HLTH-VCS-004", barcode: "8901234567893", locationId: "loc-1", locationName: "Main Store", onHand: 3, reserved: 0, available: 3, parLevel: 25, reorderPoint: 8, reorderQty: 20, unitCost: 14.00, supplierName: "Derma Essentials", isActive: true },
  { _id: "si-5", productId: "p-5", productName: "Artisan Granola 500g", sku: "FOOD-AGR-005", barcode: "8901234567894", locationId: "loc-1", locationName: "Main Store", onHand: 60, reserved: 5, available: 55, parLevel: 50, reorderPoint: 20, reorderQty: 40, unitCost: 5.50, supplierName: "Wholesome Foods", isActive: true },
  { _id: "si-6", productId: "p-6", productName: "Yoga Mat Premium", sku: "SPRT-YMP-006", locationId: "loc-2", locationName: "Warehouse", onHand: 18, reserved: 2, available: 16, parLevel: 20, reorderPoint: 6, reorderQty: 15, unitCost: 20.00, supplierName: "FitGear Distribution", isActive: true },
  { _id: "si-7", productId: "p-7", productName: "USB-C Charging Cable 2m", sku: "ELEC-UCC-007", barcode: "8901234567896", locationId: "loc-1", locationName: "Main Store", onHand: 120, reserved: 0, available: 120, parLevel: 100, reorderPoint: 30, reorderQty: 50, unitCost: 3.50, supplierName: "TechWave Supplies", isActive: true },
  { _id: "si-8", productId: "p-8", productName: "Scented Soy Candle", sku: "GIFT-SSC-008", locationId: "loc-1", locationName: "Main Store", onHand: 5, reserved: 0, available: 5, parLevel: 20, reorderPoint: 8, reorderQty: 15, unitCost: 7.00, supplierName: "ArtisanCraft Ltd.", isActive: true },
  { _id: "si-9", productId: "p-9", productName: "Running Shoes Pro", sku: "SPRT-RSP-009-9-BLK", locationId: "loc-1", locationName: "Main Store", onHand: 12, reserved: 1, available: 11, parLevel: 15, reorderPoint: 5, reorderQty: 10, unitCost: 75.00, supplierName: "FitGear Distribution", isActive: true },
  { _id: "si-10", productId: "p-10", productName: "Mineral Water 1L (6-Pack)", sku: "FOOD-MW6-010", barcode: "8901234567899", locationId: "loc-1", locationName: "Main Store", onHand: 200, reserved: 10, available: 190, parLevel: 150, reorderPoint: 50, reorderQty: 100, unitCost: 2.50, supplierName: "Wholesome Foods", isActive: true },
  { _id: "si-11", productId: "p-11", productName: "Leather Wallet Bi-fold", sku: "APRL-LWB-011", locationId: "loc-2", locationName: "Warehouse", onHand: 2, reserved: 0, available: 2, parLevel: 10, reorderPoint: 4, reorderQty: 8, unitCost: 28.00, supplierName: "Green Threads Co.", isActive: true },
  { _id: "si-12", productId: "p-12", productName: "Espresso Blend Coffee 250g", sku: "FOOD-EBC-012", locationId: "loc-1", locationName: "Main Store", onHand: 35, reserved: 0, available: 35, parLevel: 40, reorderPoint: 12, reorderQty: 25, unitCost: 8.00, supplierName: "Wholesome Foods", isActive: true },
];

export const mockSuppliers: RetailSupplier[] = [
  { _id: "sup-1", name: "TechWave Supplies", contactPerson: "James Chen", email: "james@techwave.com", phone: "+1-555-0101", address: "45 Innovation Drive, San Jose, CA", leadTimeDays: 5, productsSupplied: 8, isActive: true },
  { _id: "sup-2", name: "Green Threads Co.", contactPerson: "Sarah Mitchell", email: "sarah@greenthreads.co", phone: "+1-555-0102", address: "120 Textile Blvd, Portland, OR", leadTimeDays: 7, productsSupplied: 12, isActive: true },
  { _id: "sup-3", name: "ArtisanCraft Ltd.", contactPerson: "Maria Lopez", email: "maria@artisancraft.com", phone: "+1-555-0103", address: "88 Pottery Lane, Santa Fe, NM", leadTimeDays: 10, productsSupplied: 6, isActive: true },
  { _id: "sup-4", name: "Derma Essentials", contactPerson: "Priya Sharma", email: "priya@dermaess.com", phone: "+1-555-0104", address: "300 Skincare Ave, Miami, FL", leadTimeDays: 4, productsSupplied: 9, isActive: true },
  { _id: "sup-5", name: "Wholesome Foods", contactPerson: "David Park", email: "david@wholesomefoods.com", phone: "+1-555-0105", address: "77 Organic Way, Austin, TX", leadTimeDays: 3, productsSupplied: 15, isActive: true },
  { _id: "sup-6", name: "FitGear Distribution", contactPerson: "Alex Turner", email: "alex@fitgear.co", phone: "+1-555-0106", address: "210 Active St, Denver, CO", leadTimeDays: 6, productsSupplied: 10, isActive: true },
];

export const mockPurchaseOrders: RetailPurchaseOrder[] = [
  { _id: "po-1", poNumber: "PO-2025-001", supplierId: "sup-1", supplierName: "TechWave Supplies", locationName: "Main Store", status: "RECEIVED", lines: [{ productName: "Wireless Bluetooth Earbuds", sku: "ELEC-WBE-001-BLK", quantity: 30, unitCost: 42.00, receivedQty: 30, totalMinor: 126000 }, { productName: "USB-C Charging Cable 2m", sku: "ELEC-UCC-007", quantity: 50, unitCost: 3.50, receivedQty: 50, totalMinor: 17500 }], subtotalMinor: 143500, expectedAt: "2025-10-20", sentAt: "2025-10-12", receivedAt: "2025-10-19", createdAt: "2025-10-10T09:00:00Z" },
  { _id: "po-2", poNumber: "PO-2025-002", supplierId: "sup-5", supplierName: "Wholesome Foods", locationName: "Main Store", status: "SENT", lines: [{ productName: "Artisan Granola 500g", sku: "FOOD-AGR-005", quantity: 40, unitCost: 5.50, receivedQty: 0, totalMinor: 22000 }, { productName: "Espresso Blend Coffee 250g", sku: "FOOD-EBC-012", quantity: 25, unitCost: 8.00, receivedQty: 0, totalMinor: 20000 }], subtotalMinor: 42000, expectedAt: "2025-11-05", sentAt: "2025-10-30", createdAt: "2025-10-28T14:30:00Z" },
  { _id: "po-3", poNumber: "PO-2025-003", supplierId: "sup-4", supplierName: "Derma Essentials", locationName: "Main Store", status: "PARTIALLY_RECEIVED", lines: [{ productName: "Vitamin C Serum 30ml", sku: "HLTH-VCS-004", quantity: 20, unitCost: 14.00, receivedQty: 12, totalMinor: 28000 }], subtotalMinor: 28000, expectedAt: "2025-11-01", sentAt: "2025-10-25", createdAt: "2025-10-22T11:00:00Z" },
  { _id: "po-4", poNumber: "PO-2025-004", supplierId: "sup-2", supplierName: "Green Threads Co.", locationName: "Warehouse", status: "DRAFT", lines: [{ productName: "Organic Cotton T-Shirt", sku: "APRL-OCT-002-S-NV", quantity: 20, unitCost: 11.00, receivedQty: 0, totalMinor: 22000 }, { productName: "Leather Wallet Bi-fold", sku: "APRL-LWB-011", quantity: 8, unitCost: 28.00, receivedQty: 0, totalMinor: 22400 }], subtotalMinor: 44400, createdAt: "2025-11-08T16:00:00Z" },
];

export const mockTransfers: RetailTransfer[] = [
  { _id: "tr-1", transferNumber: "TRF-2025-001", fromLocation: "Warehouse", toLocation: "Main Store", status: "RECEIVED", lines: [{ productName: "Yoga Mat Premium", sku: "SPRT-YMP-006", quantity: 10, unitCost: 20.00 }], notes: "Routine restock for store", createdAt: "2025-10-18T10:00:00Z" },
  { _id: "tr-2", transferNumber: "TRF-2025-002", fromLocation: "Main Store", toLocation: "Warehouse", status: "DISPATCHED", lines: [{ productName: "Leather Wallet Bi-fold", sku: "APRL-LWB-011", quantity: 5, unitCost: 28.00 }], notes: "Excess stock return to warehouse", createdAt: "2025-11-02T15:30:00Z" },
  { _id: "tr-3", transferNumber: "TRF-2025-003", fromLocation: "Warehouse", toLocation: "Main Store", status: "DRAFT", lines: [{ productName: "Scented Soy Candle", sku: "GIFT-SSC-008", quantity: 15, unitCost: 7.00 }, { productName: "Ceramic Table Lamp", sku: "HOME-CTL-003", quantity: 4, unitCost: 65.00 }], createdAt: "2025-11-10T09:00:00Z" },
];

export const mockStocktakes: RetailStocktake[] = [
  { _id: "st-1", stocktakeNumber: "STK-2025-001", locationName: "Main Store", status: "COMPLETED", itemsCounted: 85, varianceItems: 4, createdAt: "2025-10-01T08:00:00Z", completedAt: "2025-10-01T14:30:00Z" },
  { _id: "st-2", stocktakeNumber: "STK-2025-002", locationName: "Warehouse", status: "COMPLETED", itemsCounted: 32, varianceItems: 1, createdAt: "2025-10-15T09:00:00Z", completedAt: "2025-10-15T12:00:00Z" },
  { _id: "st-3", stocktakeNumber: "STK-2025-003", locationName: "Main Store", status: "IN_PROGRESS", itemsCounted: 47, varianceItems: 2, createdAt: "2025-11-10T08:00:00Z" },
];

export const mockSales: RetailSale[] = [
  { _id: "sale-1", receiptNumber: "RCP-2025-0001", invoiceNumber: "INV-2025-0001", businessDate: "2025-11-10", status: "COMPLETED", paymentStatus: "PAID", customerName: "Emma Wilson", lines: [{ name: "Wireless Bluetooth Earbuds", sku: "ELEC-WBE-001-BLK", quantity: 1, unitPriceMinor: 7999, totalMinor: 7999, returnedQuantity: 0 }, { name: "USB-C Charging Cable 2m", sku: "ELEC-UCC-007", quantity: 2, unitPriceMinor: 1299, totalMinor: 2598, returnedQuantity: 0 }], subtotalMinor: 10597, discountTotalMinor: 0, taxTotalMinor: 1060, totalMinor: 11657, paymentMethod: "CARD", cashierName: "Alex R.", locationName: "Main Store", createdAt: "2025-11-10T14:23:00Z" },
  { _id: "sale-2", receiptNumber: "RCP-2025-0002", invoiceNumber: "INV-2025-0002", businessDate: "2025-11-10", status: "COMPLETED", paymentStatus: "PAID", lines: [{ name: "Artisan Granola 500g", sku: "FOOD-AGR-005", quantity: 3, unitPriceMinor: 1299, totalMinor: 3897, returnedQuantity: 0 }, { name: "Espresso Blend Coffee 250g", sku: "FOOD-EBC-012", quantity: 1, unitPriceMinor: 1899, totalMinor: 1899, returnedQuantity: 0 }], subtotalMinor: 5796, discountTotalMinor: 500, taxTotalMinor: 530, totalMinor: 5826, paymentMethod: "CASH", cashierName: "Maria T.", locationName: "Main Store", createdAt: "2025-11-10T15:05:00Z" },
  { _id: "sale-3", receiptNumber: "RCP-2025-0003", invoiceNumber: "INV-2025-0003", businessDate: "2025-11-09", status: "PARTIALLY_REFUNDED", paymentStatus: "PARTIALLY_REFUNDED", customerName: "John Baker", lines: [{ name: "Running Shoes Pro", sku: "SPRT-RSP-009-9-BLK", quantity: 1, unitPriceMinor: 14999, totalMinor: 14999, returnedQuantity: 0 }, { name: "Yoga Mat Premium", sku: "SPRT-YMP-006", quantity: 1, unitPriceMinor: 4599, totalMinor: 4599, returnedQuantity: 1 }], subtotalMinor: 19598, discountTotalMinor: 0, taxTotalMinor: 1960, totalMinor: 21558, paymentMethod: "CARD", cashierName: "Alex R.", locationName: "Main Store", createdAt: "2025-11-09T11:45:00Z" },
  { _id: "sale-4", receiptNumber: "RCP-2025-0004", invoiceNumber: "INV-2025-0004", businessDate: "2025-11-09", status: "COMPLETED", paymentStatus: "PAID", customerName: "Sophia Lee", lines: [{ name: "Vitamin C Serum 30ml", sku: "HLTH-VCS-004", quantity: 2, unitPriceMinor: 3499, totalMinor: 6998, returnedQuantity: 0 }, { name: "Scented Soy Candle", sku: "GIFT-SSC-008", quantity: 1, unitPriceMinor: 1899, totalMinor: 1899, returnedQuantity: 0 }], subtotalMinor: 8897, discountTotalMinor: 890, taxTotalMinor: 801, totalMinor: 8808, paymentMethod: "CARD", cashierName: "Maria T.", locationName: "Main Store", createdAt: "2025-11-09T16:30:00Z" },
  { _id: "sale-5", receiptNumber: "RCP-2025-0005", invoiceNumber: "INV-2025-0005", businessDate: "2025-11-08", status: "COMPLETED", paymentStatus: "PAID", lines: [{ name: "Organic Cotton T-Shirt", sku: "APRL-OCT-002-S-NV", quantity: 2, unitPriceMinor: 2499, totalMinor: 4998, returnedQuantity: 0 }, { name: "Leather Wallet Bi-fold", sku: "APRL-LWB-011", quantity: 1, unitPriceMinor: 5999, totalMinor: 5999, returnedQuantity: 0 }], subtotalMinor: 10997, discountTotalMinor: 0, taxTotalMinor: 1100, totalMinor: 12097, paymentMethod: "CASH", cashierName: "Alex R.", locationName: "Main Store", createdAt: "2025-11-08T10:15:00Z" },
  { _id: "sale-6", receiptNumber: "RCP-2025-0006", invoiceNumber: "INV-2025-0006", businessDate: "2025-11-08", status: "VOIDED", paymentStatus: "REFUNDED", lines: [{ name: "Ceramic Table Lamp", sku: "HOME-CTL-003", quantity: 1, unitPriceMinor: 12900, totalMinor: 12900, returnedQuantity: 0 }], subtotalMinor: 12900, discountTotalMinor: 0, taxTotalMinor: 1290, totalMinor: 14190, paymentMethod: "CARD", cashierName: "Maria T.", locationName: "Main Store", createdAt: "2025-11-08T12:00:00Z" },
  { _id: "sale-7", receiptNumber: "RCP-2025-0007", invoiceNumber: "INV-2025-0007", businessDate: "2025-11-07", status: "COMPLETED", paymentStatus: "PAID", customerName: "Ryan M.", lines: [{ name: "Mineral Water 1L (6-Pack)", sku: "FOOD-MW6-010", quantity: 5, unitPriceMinor: 599, totalMinor: 2995, returnedQuantity: 0 }], subtotalMinor: 2995, discountTotalMinor: 0, taxTotalMinor: 0, totalMinor: 2995, paymentMethod: "CASH", cashierName: "Alex R.", locationName: "Main Store", createdAt: "2025-11-07T09:00:00Z" },
];

export const mockReturns: RetailReturn[] = [
  { _id: "ret-1", returnNumber: "RTN-2025-001", saleReceiptNumber: "RCP-2025-0003", reason: "Item did not meet expectations", lines: [{ name: "Yoga Mat Premium", sku: "SPRT-YMP-006", quantity: 1, refundAmountMinor: 4599, condition: "RESELLABLE" }], refundAmountMinor: 4599, refundMethod: "CARD", processedBy: "Alex R.", createdAt: "2025-11-09T17:00:00Z" },
  { _id: "ret-2", returnNumber: "RTN-2025-002", saleReceiptNumber: "RCP-2025-0006", reason: "Voided sale — customer changed mind", lines: [{ name: "Ceramic Table Lamp", sku: "HOME-CTL-003", quantity: 1, refundAmountMinor: 14190, condition: "RESELLABLE" }], refundAmountMinor: 14190, refundMethod: "CARD", processedBy: "Maria T.", createdAt: "2025-11-08T12:30:00Z" },
];

// Helper
export function formatMinor(minor: number): string {
  return `$${(minor / 100).toFixed(2)}`;
}
