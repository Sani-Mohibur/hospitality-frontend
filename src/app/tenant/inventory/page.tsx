"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PackagePlus, Search, AlertTriangle, Loader2, AlertCircle, RefreshCw, Trash2, SlidersHorizontal } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface InventoryItem {
  _id: string;
  name: string;
  sku: string;
  category?: string;
  quantity: number;
  unitOfMeasure: string;
  unitCost?: number;
  parLevel?: number;
  reorderPoint?: number;
  isActive?: boolean;
}

function getStatusBadge(item: InventoryItem) {
  const qty = item.quantity ?? 0;
  const reorder = item.reorderPoint ?? 5;

  if (qty <= 0) {
    return <Badge variant="outline" className="text-slate-600 bg-slate-100 border-slate-300 text-xs">Out of Stock</Badge>;
  }
  if (qty <= reorder * 0.5) {
    return (
      <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200 text-xs flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" /> Critical
      </Badge>
    );
  }
  if (qty <= reorder) {
    return <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200 text-xs">Low Stock</Badge>;
  }
  return <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200 text-xs">In Stock</Badge>;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Create Item Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    sku: "",
    category: "Beverages",
    unitOfMeasure: "units",
    openingQuantity: 10,
    reorderPoint: 5,
    unitCost: "0.00",
  });

  // Adjust Stock Modal
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<InventoryItem | null>(null);
  const [adjustForm, setAdjustForm] = useState({
    type: "ADD" as "ADD" | "SUBTRACT",
    quantityChange: 1,
    reason: "Restock receipt",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<InventoryItem[]>("/inventory");
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load inventory.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [items, search, selectedCategory]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.sku.trim()) return;

    setIsSubmitting(true);
    try {
      const costMinor = Math.round(parseFloat(createForm.unitCost) * 100);
      await apiClient.post("/inventory", {
        name: createForm.name.trim(),
        sku: createForm.sku.trim(),
        category: createForm.category.trim(),
        unitOfMeasure: createForm.unitOfMeasure.trim(),
        openingQuantity: Number(createForm.openingQuantity) || 0,
        reorderPoint: Number(createForm.reorderPoint) || 5,
        unitCost: isNaN(costMinor) || costMinor < 0 ? undefined : costMinor,
      });

      setIsCreateOpen(false);
      setCreateForm({
        name: "",
        sku: "",
        category: "Beverages",
        unitOfMeasure: "units",
        openingQuantity: 10,
        reorderPoint: 5,
        unitCost: "0.00",
      });
      fetchInventory();
    } catch (err: any) {
      alert(err?.message || "Failed to create inventory item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAdjust) return;

    setIsSubmitting(true);
    try {
      await apiClient.patch(`/inventory/${selectedItemForAdjust._id}/adjust`, {
        type: adjustForm.type,
        quantityChange: Number(adjustForm.quantityChange),
        reason: adjustForm.reason.trim(),
      });

      setIsAdjustOpen(false);
      setSelectedItemForAdjust(null);
      fetchInventory();
    } catch (err: any) {
      alert(err?.message || "Failed to adjust stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stock item?")) return;
    try {
      await apiClient.delete(`/inventory/${id}`);
      fetchInventory();
    } catch (err: any) {
      alert(err?.message || "Failed to delete item");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Centralized Inventory</h1>
          <p className="text-sm text-slate-500">Track and manage stock levels across hotel and dining outlets.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchInventory()} disabled={isLoading} className="gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <PackagePlus className="w-4 h-4" /> Add Stock Item
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 flex items-center gap-3 border border-red-200">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <Card className="border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search items by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 border-slate-200 text-xs"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Categories ({items.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm">Loading stock inventory...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm">
              No inventory items found. Click &apos;Add Stock Item&apos; above.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/75">
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item._id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-mono text-xs text-slate-500">{item.sku}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.category || "General"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      {item.quantity}{" "}
                      <span className="text-slate-400 font-normal text-xs">{item.unitOfMeasure}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(item)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedItemForAdjust(item);
                            setAdjustForm({
                              type: "ADD",
                              quantityChange: 10,
                              reason: "Restock delivery",
                            });
                            setIsAdjustOpen(true);
                          }}
                          className="h-8 text-xs gap-1 text-blue-600 hover:bg-blue-50"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" /> Adjust
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item._id)}
                          className="h-8 w-8 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Stock Item Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Stock Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateItem} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="sku">SKU Code *</Label>
                <Input
                  id="sku"
                  required
                  value={createForm.sku}
                  onChange={(e) => setCreateForm({ ...createForm, sku: e.target.value })}
                  placeholder="e.g. COF-001"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  placeholder="Beverages / Food / Linen"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="itemName">Item Name *</Label>
              <Input
                id="itemName"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="e.g. Arabica Espresso Beans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="unit">Unit of Measure *</Label>
                <Input
                  id="unit"
                  required
                  value={createForm.unitOfMeasure}
                  onChange={(e) => setCreateForm({ ...createForm, unitOfMeasure: e.target.value })}
                  placeholder="kg / bottles / packs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="openQty">Opening Quantity</Label>
                <Input
                  id="openQty"
                  type="number"
                  min="0"
                  value={createForm.openingQuantity}
                  onChange={(e) => setCreateForm({ ...createForm, openingQuantity: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="reorder">Reorder Threshold</Label>
                <Input
                  id="reorder"
                  type="number"
                  min="0"
                  value={createForm.reorderPoint}
                  onChange={(e) => setCreateForm({ ...createForm, reorderPoint: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cost">Unit Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={createForm.unitCost}
                  onChange={(e) => setCreateForm({ ...createForm, unitCost: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
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

      {/* Adjust Stock Modal */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Stock Level</DialogTitle>
          </DialogHeader>
          {selectedItemForAdjust && (
            <form onSubmit={handleAdjustStock} className="space-y-4 py-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                <p className="font-semibold text-slate-800 text-sm">{selectedItemForAdjust.name}</p>
                <p className="text-slate-500">
                  Current On-Hand: <span className="font-bold text-slate-700">{selectedItemForAdjust.quantity} {selectedItemForAdjust.unitOfMeasure}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="adjustType">Adjustment Type *</Label>
                  <select
                    id="adjustType"
                    value={adjustForm.type}
                    onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value as any })}
                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ADD">Add / Receive (+)</option>
                    <option value="SUBTRACT">Deduct / Spoilage (-)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="changeQty">Quantity Amount *</Label>
                  <Input
                    id="changeQty"
                    type="number"
                    min="1"
                    required
                    value={adjustForm.quantityChange}
                    onChange={(e) => setAdjustForm({ ...adjustForm, quantityChange: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="adjustReason">Reason for Adjustment *</Label>
                <Input
                  id="adjustReason"
                  required
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  placeholder="e.g. Vendor delivery, Spoilage, Count variance"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAdjustOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Confirm Adjustment
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
