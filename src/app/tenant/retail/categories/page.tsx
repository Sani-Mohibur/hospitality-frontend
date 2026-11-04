"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { useLocation } from "@/lib/location-context";
import { toast } from "sonner";
import {
  RetailCategory,
  CategoryFormData,
  normalizeCategory,
  CategoriesHeader,
  CategoriesStats,
  CategoriesTable,
  CategoryModal,
} from "@/components/retail/categories";

export type {
  RetailCategory,
  CategoryFormData,
} from "@/components/retail/categories";

export default function RetailCategoriesPage() {
  const { currentLocation } = useLocation();
  const [categories, setCategories] = useState<RetailCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [editCategory, setEditCategory] = useState<RetailCategory | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchCategories = useCallback(() => {
    setIsLoading(true);
    setError(null);
    apiClient
      .get<RetailCategory[]>("/retail/category")
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : [];
        setCategories(raw.map(normalizeCategory));
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load categories";
        setError(msg);
        toast.error(msg);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    let ignore = false;
    apiClient
      .get<RetailCategory[]>("/retail/category")
      .then((res) => {
        if (!ignore) {
          const raw = Array.isArray(res.data) ? res.data : [];
          setCategories(raw.map(normalizeCategory));
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Failed to load categories";
          setError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentLocation]);

  const filteredCategories = useMemo(() => {
    return categories
      .filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, searchQuery]);

  const handleSaveCategory = async (formData: CategoryFormData, isEditing: boolean) => {
    setIsSaving(true);

    try {
      if (isEditing && editCategory) {
        const payload = {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          description: formData.description.trim() || undefined,
          sortOrder: Number(formData.sortOrder),
          isActive: formData.isActive,
        };
        await apiClient.patch<RetailCategory>(
          `/retail/category/${editCategory._id}`,
          payload
        );
        toast.success("Category updated successfully");
        setCategories((prev) =>
          prev.map((c) =>
            c._id === editCategory._id
              ? {
                  ...c,
                  ...payload,
                  productCount: c.productCount,
                }
              : c
          )
        );
        setEditCategory(null);
      } else {
        const payload = {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          description: formData.description.trim() || undefined,
          sortOrder: Number(formData.sortOrder),
          isActive: formData.isActive,
          locationId:
            currentLocation && currentLocation._id !== "ALL" ? currentLocation._id : undefined,
        };
        const res = await apiClient.post<RetailCategory>("/retail/category", payload);
        toast.success("Category created successfully");
        const created = res.data;
        setCategories((prev) => [
          ...prev,
          {
            _id: created._id,
            name: created.name,
            code: created.code || payload.code,
            description: created.description || payload.description,
            sortOrder: created.sortOrder ?? payload.sortOrder,
            productCount: 0,
            isActive: created.isActive ?? true,
            locationId: created.locationId,
          },
        ]);
        setIsCreateOpen(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save category";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (category: RetailCategory) => {
    const nextStatus = !category.isActive;
    try {
      await apiClient.patch(`/retail/category/${category._id}`, { isActive: nextStatus });
      setCategories((prev) =>
        prev.map((c) => (c._id === category._id ? { ...c, isActive: nextStatus } : c))
      );
      toast.success(`Category marked as ${nextStatus ? "active" : "inactive"}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update category status");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove category "${name}"?`)) return;
    try {
      await apiClient.delete(`/retail/category/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      toast.success("Category removed successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);
  const activeCategoriesCount = categories.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <CategoriesHeader
        isLoading={isLoading}
        onRefresh={fetchCategories}
        onOpenCreate={() => setIsCreateOpen(true)}
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
            onClick={fetchCategories}
            className="text-red-800 border-red-300"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <CategoriesStats
        totalCategories={categories.length}
        activeCategories={activeCategoriesCount}
        totalProducts={totalProducts}
      />

      {/* Categories Table */}
      <CategoriesTable
        categories={filteredCategories}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleStatus={toggleStatus}
        onOpenEdit={setEditCategory}
        onDelete={handleDelete}
      />

      {/* Create / Edit Category Modal */}
      <CategoryModal
        isOpen={isCreateOpen || !!editCategory}
        onClose={() => {
          setIsCreateOpen(false);
          setEditCategory(null);
        }}
        editCategory={editCategory}
        defaultSortOrder={categories.length + 1}
        onSave={handleSaveCategory}
        isSaving={isSaving}
      />
    </div>
  );
}
