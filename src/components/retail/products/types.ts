export interface RetailCategory {
  _id: string;
  name: string;
  code: string;
}

export interface RetailProductVariant {
  _id?: string;
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
  description?: string;
  categoryId: string | { _id: string; name: string; code?: string };
  categoryName?: string;
  sku: string;
  barcode?: string;
  priceMinor: number;
  costPriceMinor: number;
  taxCategory: string;
  unitOfMeasure: string;
  imageUrl?: string;
  tags?: string[];
  hasVariants: boolean;
  variants: RetailProductVariant[];
  isActive: boolean;
  createdAt?: string;
  locationId?: string | null;
}

export interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  sku: string;
  barcode: string;
  price: string;
  costPrice: string;
  taxCategory: string;
  unitOfMeasure: string;
  tags: string;
  hasVariants: boolean;
  isActive: boolean;
}

export function calculateMargin(priceMinor: number, costPriceMinor: number): string {
  if (priceMinor <= 0) return "0.0";
  return (((priceMinor - costPriceMinor) / priceMinor) * 100).toFixed(1);
}

export function normalizeProduct(
  p: RetailProduct,
  catList: RetailCategory[]
): RetailProduct {
  const catObj =
    typeof p.categoryId === "object" && p.categoryId !== null
      ? p.categoryId
      : null;
  const categoryName =
    catObj?.name ||
    catList.find((c) => c._id === p.categoryId)?.name ||
    "General";
  const categoryIdStr =
    catObj?._id || (typeof p.categoryId === "string" ? p.categoryId : "");

  return {
    ...p,
    categoryId: categoryIdStr,
    categoryName,
    tags: Array.isArray(p.tags) ? p.tags : [],
    variants: Array.isArray(p.variants) ? p.variants : [],
  };
}

