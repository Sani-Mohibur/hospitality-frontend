"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  Package,
  Layers,
  CheckCircle2,
  ListOrdered,
} from "lucide-react";
import { mockCategories, RetailCategory } from "@/lib/retail-mock-data";

export default function RetailCategoriesPage() {
  const [categories, setCategories] = useState<RetailCategory[]>(mockCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [editCategory, setEditCategory] = useState<RetailCategory | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    sortOrder: 1,
    isActive: true,
  });

  const filteredCategories = useMemo(() => {
    return categories
      .filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, searchQuery]);

  const openCreateDialog = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      sortOrder: categories.length + 1,
      isActive: true,
    });
    setIsCreateOpen(true);
  };

  const openEditDialog = (category: RetailCategory) => {
    setEditCategory(category);
    setFormData({
      name: category.name,
      code: category.code,
      description: category.description,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c._id === editCategory._id
            ? {
                ...c,
                name: formData.name,
                code: formData.code.toUpperCase(),
                description: formData.description,
                sortOrder: Number(formData.sortOrder),
                isActive: formData.isActive,
              }
            : c
        )
      );
      setEditCategory(null);
    } else {
      const newCat: RetailCategory = {
        _id: `cat-${Date.now()}`,
        name: formData.name,
        code: formData.code.toUpperCase(),
        description: formData.description,
        sortOrder: Number(formData.sortOrder),
        productCount: 0,
        isActive: formData.isActive,
      };
      setCategories((prev) => [...prev, newCat]);
      setIsCreateOpen(false);
    }
  };

  const toggleStatus = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c._id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this category?")) {
      setCategories((prev) => prev.filter((c) => c._id !== id));
    }
  };

  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Organize retail items into categories for streamlined inventory and POS navigation.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="bg-primary hover:bg-primary/90 text-white gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Categories</p>
              <h3 className="text-2xl font-bold text-slate-900">{categories.length}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Active Categories</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {categories.filter((c) => c.isActive).length}
              </h3>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Categorized Products</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalProducts}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search categories by name, code, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-16 text-center">Order</TableHead>
                <TableHead className="w-[200px]">Category Name</TableHead>
                <TableHead className="w-24">Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center w-32">Products</TableHead>
                <TableHead className="text-center w-28">Status</TableHead>
                <TableHead className="text-right w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Tag className="h-8 w-8 text-slate-300" />
                      <p className="text-sm font-medium">No categories found matching your query</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow key={category._id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="text-center font-mono text-xs text-slate-500">
                      {category.sortOrder}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{category.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs bg-slate-50 text-slate-700">
                        {category.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 max-w-md truncate">
                      {category.description || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                        {category.productCount} items
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => toggleStatus(category._id)}
                        className="inline-flex items-center"
                        title="Click to toggle status"
                      >
                        {category.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer">
                            Inactive
                          </Badge>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-600 hover:text-slate-900"
                          onClick={() => openEditDialog(category)}
                          title="Edit Category"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => handleDelete(category._id)}
                          title="Delete Category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Create / Edit Category Modal */}
      <Dialog
        open={isCreateOpen || !!editCategory}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditCategory(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editCategory ? "Edit Category" : "New Category"}
            </DialogTitle>
            <DialogDescription>
              {editCategory
                ? "Update category code, display order, and status."
                : "Create a new category to group related retail products."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="catName" className="text-xs font-medium text-slate-700">
                Category Name *
              </Label>
              <Input
                id="catName"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Health & Beauty"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="catCode" className="text-xs font-medium text-slate-700">
                  Code / Short Tag *
                </Label>
                <Input
                  id="catCode"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. HLTH"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sortOrder" className="text-xs font-medium text-slate-700">
                  Sort Order
                </Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min="1"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="catDesc" className="text-xs font-medium text-slate-700">
                Description
              </Label>
              <textarea
                id="catDesc"
                rows={3}
                className="w-full rounded-md border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Category details..."
              />
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                />
                Category is Active
              </label>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditCategory(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                {editCategory ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
