"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { useLocation } from "@/lib/location-context";
import { toast } from "sonner";
import {
  RetailCategory,
  RetailProductVariant,
  RetailProduct,
  ProductFormData,
  normalizeProduct,
  ProductsHeader,
  ProductsStats,
  ProductsFilterBar,
  ProductsTable,
  ProductViewModal,
  ProductFormModal,
} from "@/components/retail/products";

export type {
  RetailCategory,
  RetailProductVariant,
  RetailProduct,
  ProductFormData,
} from "@/components/retail/products";

export default function RetailProductsPage() {
  const { currentLocation } = useLocation();

  const [products, setProducts] = useState<RetailProduct[]>([]);
  const [categories, setCategories] = useState<RetailCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Modals state
  const [viewProduct, setViewProduct] = useState<RetailProduct | null>(null);
  const [editProduct, setEditProduct] = useState<RetailProduct | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchCatalogData = useCallback(() => {
    setIsLoading(true);
    setError(null);

    Promise.all([
      apiClient.get<RetailCategory[]>("/retail/category"),
      apiClient.get<RetailProduct[]>("/retail/product", { params: { limit: 100 } }),
    ])
      .then(([catsRes, prodsRes]) => {
        const catList = Array.isArray(catsRes.data) ? catsRes.data : [];
        setCategories(catList);

        const prodList = Array.isArray(prodsRes.data)
          ? prodsRes.data
          : (prodsRes as unknown as { data: { data: RetailProduct[] } }).data?.data || [];

        setProducts(prodList.map((p) => normalizeProduct(p, catList)));
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load retail products";
        setError(msg);
        toast.error(msg);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      apiClient.get<RetailCategory[]>("/retail/category"),
      apiClient.get<RetailProduct[]>("/retail/product", { params: { limit: 100 } }),
    ])
      .then(([catsRes, prodsRes]) => {
        if (!ignore) {
          const catList = Array.isArray(catsRes.data) ? catsRes.data : [];
          setCategories(catList);

          const prodList = Array.isArray(prodsRes.data)
            ? prodsRes.data
            : (prodsRes as unknown as { data: { data: RetailProduct[] } }).data?.data || [];

          setProducts(prodList.map((p) => normalizeProduct(p, catList)));
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Failed to load products";
          setError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentLocation]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q));

      const pCatId =
        typeof p.categoryId === "string"
          ? p.categoryId
          : (p.categoryId as { _id?: string })?._id;
      const matchesCategory =
        selectedCategory === "ALL" || pCatId === selectedCategory;

      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "ACTIVE" ? p.isActive : !p.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  const handleSaveProduct = async (formData: ProductFormData, isEditing: boolean) => {
    setIsSaving(true);

    const priceMinor = Math.round(parseFloat(formData.price || "0") * 100);
    const costPriceMinor = Math.round(parseFloat(formData.costPrice || "0") * 100);
    const tagsArray = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Map UI taxCategory to backend enum
    let resolvedTax = formData.taxCategory;
    if (resolvedTax === "STANDARD") resolvedTax = "RETAIL";
    if (resolvedTax === "EXEMPT") resolvedTax = "NONE";

    try {
      if (isEditing && editProduct) {
        const payload = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          categoryId: formData.categoryId,
          sku: formData.sku.trim().toUpperCase(),
          barcode: formData.barcode.trim() || null,
          priceMinor,
          costPriceMinor,
          taxCategory: resolvedTax,
          unitOfMeasure: formData.unitOfMeasure,
          tags: tagsArray,
          hasVariants: formData.hasVariants,
          isActive: formData.isActive,
        };

        const res = await apiClient.patch<RetailProduct>(
          `/retail/product/${editProduct._id}`,
          payload
        );
        toast.success("Product updated successfully");
        const updated = res.data;
        const catName = categories.find((c) => c._id === formData.categoryId)?.name || "General";

        setProducts((prev) =>
          prev.map((p) =>
            p._id === editProduct._id
              ? {
                  ...p,
                  ...payload,
                  barcode: payload.barcode || undefined,
                  categoryName: catName,
                  variants: updated.variants || p.variants,
                }
              : p
          )
        );
        setEditProduct(null);
      } else {
        const payload = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          categoryId: formData.categoryId,
          sku: formData.sku.trim().toUpperCase(),
          barcode: formData.barcode.trim() || undefined,
          priceMinor,
          costPriceMinor,
          taxCategory: resolvedTax,
          unitOfMeasure: formData.unitOfMeasure,
          tags: tagsArray,
          hasVariants: formData.hasVariants,
          isActive: formData.isActive,
          locationId:
            currentLocation && currentLocation._id !== "ALL"
              ? currentLocation._id
              : undefined,
        };

        const res = await apiClient.post<RetailProduct>("/retail/product", payload);
        toast.success("Product created successfully");
        const created = res.data;
        const catName = categories.find((c) => c._id === formData.categoryId)?.name || "General";

        setProducts((prev) => [
          {
            ...created,
            categoryName: catName,
            tags: tagsArray,
            variants: created.variants || [],
          },
          ...prev,
        ]);
        setIsCreateOpen(false);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleProductStatus = async (product: RetailProduct) => {
    const nextStatus = !product.isActive;
    try {
      await apiClient.patch(`/retail/product/${product._id}`, { isActive: nextStatus });
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, isActive: nextStatus } : p))
      );
      toast.success(`Product marked as ${nextStatus ? "active" : "inactive"}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update product status");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove product "${name}"?`)) return;
    try {
      await apiClient.delete(`/retail/product/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedStatus("ALL");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProductsHeader
        isLoading={isLoading}
        onRefresh={fetchCatalogData}
        onOpenCreate={() => {
          setEditProduct(null);
          setIsCreateOpen(true);
        }}
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-red-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCatalogData}
            className="text-red-800 border-red-300"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Summary KPI Pills */}
      <ProductsStats
        totalProducts={products.length}
        activeProducts={products.filter((p) => p.isActive).length}
        withVariantsCount={products.filter((p) => p.hasVariants).length}
        categoriesCount={categories.length}
      />

      {/* Filter and Search Bar */}
      <ProductsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onClearFilters={clearFilters}
      />

      {/* Products Table */}
      <ProductsTable
        products={filteredProducts}
        isLoading={isLoading}
        onClearFilters={clearFilters}
        onToggleStatus={toggleProductStatus}
        onViewProduct={setViewProduct}
        onEditProduct={setEditProduct}
        onDeleteProduct={handleDeleteProduct}
      />

      {/* View Product Details Modal */}
      <ProductViewModal
        product={viewProduct}
        isOpen={!!viewProduct}
        onClose={() => setViewProduct(null)}
        onEdit={(p) => setEditProduct(p)}
      />

      {/* Create / Edit Product Modal */}
      <ProductFormModal
        isOpen={isCreateOpen || !!editProduct}
        onClose={() => {
          setIsCreateOpen(false);
          setEditProduct(null);
        }}
        editProduct={editProduct}
        categories={categories}
        onSave={handleSaveProduct}
        isSaving={isSaving}
      />
    </div>
  );
}
