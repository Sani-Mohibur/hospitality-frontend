export interface RetailCategory {
  _id: string;
  name: string;
  code: string;
  description?: string;
  productCount: number;
  sortOrder: number;
  isActive: boolean;
  locationId?: string | null;
}

export interface CategoryFormData {
  name: string;
  code: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export function normalizeCategory(c: Partial<RetailCategory> & { _id: string; name: string }): RetailCategory {
  return {
    _id: c._id,
    name: c.name,
    code: c.code || "",
    description: c.description || "",
    sortOrder: c.sortOrder ?? 0,
    productCount: c.productCount ?? 0,
    isActive: c.isActive ?? true,
    locationId: c.locationId,
  };
}

