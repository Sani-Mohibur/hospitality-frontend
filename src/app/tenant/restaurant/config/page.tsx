"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleGuard } from "@/components/auth/role-guard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, AlertCircle, RefreshCw, Utensils } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useLocation } from "@/lib/location-context";

interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface MenuItem {
  _id: string;
  name: string;
  categoryId: string | { _id: string; name: string };
  priceMinor: number;
  description?: string;
  sku?: string;
  isActive?: boolean;
}

export default function RestaurantConfigPage() {
  const { currentLocation } = useLocation();
  const [activeTab, setActiveTab] = useState<"ITEMS" | "CATEGORIES">("ITEMS");
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isItemOpen, setIsItemOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [itemForm, setItemForm] = useState({
    name: "",
    categoryId: "",
    price: "10.00",
    description: "",
    sku: "",
  });

  const [catForm, setCatForm] = useState({
    name: "",
    description: "",
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [catRes, itemRes] = await Promise.all([
        apiClient.get<Category[]>("/restaurant/menu-category"),
        apiClient.get<MenuItem[]>("/restaurant/menu-item"),
      ]);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      setItems(Array.isArray(itemRes.data) ? itemRes.data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load restaurant menu configuration.");
    } finally {
      setIsLoading(false);
    }
  }, [currentLocation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAddItem = () => {
    setItemForm({
      name: "",
      categoryId: categories.length > 0 ? categories[0]._id : "",
      price: "12.00",
      description: "",
      sku: "",
    });
    setIsItemOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name.trim() || !itemForm.categoryId) return;
    const priceMinor = Math.round(parseFloat(itemForm.price) * 100);
    if (isNaN(priceMinor) || priceMinor <= 0) return;

    setIsSubmitting(true);
    try {
      await apiClient.post("/restaurant/menu-item", {
        name: itemForm.name.trim(),
        categoryId: itemForm.categoryId,
        priceMinor,
        description: itemForm.description.trim() || undefined,
        sku: itemForm.sku.trim() || undefined,
      });
      setIsItemOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err?.message || "Failed to create menu item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await apiClient.delete(`/restaurant/menu-item/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err?.message || "Failed to delete menu item");
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;

    setIsSubmitting(true);
    try {
      await apiClient.post("/restaurant/menu-category", {
        name: catForm.name.trim(),
        description: catForm.description.trim() || undefined,
      });
      setIsCatOpen(false);
      setCatForm({ name: "", description: "" });
      fetchData();
    } catch (err: any) {
      alert(err?.message || "Failed to create menu category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await apiClient.delete(`/restaurant/menu-category/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err?.message || "Failed to delete category (it may still have items)");
    }
  };

  return (
    <RoleGuard allowedRoles={["TENANT_OWNER", "TENANT_MANAGER"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Restaurant Configuration
            </h1>
            <p className="text-sm text-slate-500">
              Manage menu builder, dish pricing, and food categories.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchData()} disabled={isLoading} className="gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-600 flex items-center gap-3 border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          <Button
            variant={activeTab === "ITEMS" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("ITEMS")}
          >
            Menu Items ({items.length})
          </Button>
          <Button
            variant={activeTab === "CATEGORIES" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("CATEGORIES")}
          >
            Categories ({categories.length})
          </Button>
        </div>

        {activeTab === "ITEMS" && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-lg">Menu Items</CardTitle>
                <p className="text-xs text-slate-500 mt-1">Dishes, beverages, and sides displayed in POS.</p>
              </div>
              <Button
                size="sm"
                onClick={handleOpenAddItem}
                disabled={categories.length === 0}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="py-16 flex items-center justify-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading menu items...
                </div>
              ) : items.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  {categories.length === 0
                    ? "Create a category first before adding menu items."
                    : "No menu items created yet."}
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/75">
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const catName =
                        typeof item.categoryId === "object"
                          ? item.categoryId?.name
                          : categories.find((c) => c._id === item.categoryId)?.name || "—";
                      return (
                        <TableRow key={item._id}>
                          <TableCell className="font-semibold text-slate-900 flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-blue-500 shrink-0" />
                            {item.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {catName}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-slate-900">
                            ${(item.priceMinor / 100).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-slate-500 font-mono text-xs">
                            {item.sku || "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteItem(item._id)}
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "CATEGORIES" && (
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-lg">Menu Categories</CardTitle>
                <p className="text-xs text-slate-500 mt-1">Group dishes into Starters, Mains, Desserts, etc.</p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsCatOpen(true)}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4" /> Add Category
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="py-16 flex items-center justify-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading categories...
                </div>
              ) : categories.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  No menu categories found. Click &apos;Add Category&apos; above.
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/75">
                    <TableRow>
                      <TableHead>Category Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat) => (
                      <TableRow key={cat._id}>
                        <TableCell className="font-semibold text-slate-900">{cat.name}</TableCell>
                        <TableCell className="text-slate-600">{cat.description || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCategory(cat._id)}
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add Item Modal */}
        <Dialog open={isItemOpen} onOpenChange={setIsItemOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Menu Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveItem} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="itemName">Dish / Item Name *</Label>
                <Input
                  id="itemName"
                  required
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="e.g. Grilled Ribeye Steak"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="itemCategory">Category *</Label>
                  <select
                    id="itemCategory"
                    required
                    value={itemForm.categoryId}
                    onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="itemPrice">Price ($) *</Label>
                  <Input
                    id="itemPrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="itemSku">SKU / Code</Label>
                <Input
                  id="itemSku"
                  value={itemForm.sku}
                  onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
                  placeholder="e.g. STK-01"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="itemDesc">Description</Label>
                <Input
                  id="itemDesc"
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Ingredients, prep style"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsItemOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Item
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Category Modal */}
        <Dialog open={isCatOpen} onOpenChange={setIsCatOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Menu Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveCategory} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="catName">Category Name *</Label>
                <Input
                  id="catName"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. Appetizers or Craft Cocktails"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="catDesc">Description</Label>
                <Input
                  id="catDesc"
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCatOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Category
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
