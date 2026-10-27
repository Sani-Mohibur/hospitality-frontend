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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Warehouse,
  AlertTriangle,
  History,
  SlidersHorizontal,
  ArrowUpDown,
  Plus,
  Minus,
  CheckCircle2,
  DollarSign,
  Package,
} from "lucide-react";
import { mockStockItems, RetailStockItem, formatMinor } from "@/lib/retail-mock-data";

interface StockMovement {
  id: string;
  timestamp: string;
  productName: string;
  sku: string;
  locationName: string;
  type: "INCREASE" | "DECREASE";
  quantity: number;
  reason: string;
  performedBy: string;
  notes?: string;
}

const initialMovements: StockMovement[] = [
  {
    id: "mov-1",
    timestamp: "2025-11-10T14:30:00Z",
    productName: "Vitamin C Serum 30ml",
    sku: "HLTH-VCS-004",
    locationName: "Main Store",
    type: "DECREASE",
    quantity: 2,
    reason: "Damaged / Broken in transit",
    performedBy: "Alex R.",
    notes: "Dropped by customer near shelf",
  },
  {
    id: "mov-2",
    timestamp: "2025-11-10T11:15:00Z",
    productName: "USB-C Charging Cable 2m",
    sku: "ELEC-UCC-007",
    locationName: "Main Store",
    type: "INCREASE",
    quantity: 50,
    reason: "Purchase Order Inward",
    performedBy: "Manager Sarah",
    notes: "PO-2025-001 receipt",
  },
  {
    id: "mov-3",
    timestamp: "2025-11-09T09:40:00Z",
    productName: "Mineral Water 1L (6-Pack)",
    sku: "FOOD-MW6-010",
    locationName: "Main Store",
    type: "INCREASE",
    quantity: 100,
    reason: "Routine Restock",
    performedBy: "Maria T.",
  },
  {
    id: "mov-4",
    timestamp: "2025-11-08T16:00:00Z",
    productName: "Leather Wallet Bi-fold",
    sku: "APRL-LWB-011",
    locationName: "Warehouse",
    type: "DECREASE",
    quantity: 1,
    reason: "Defective item discarded",
    performedBy: "James C.",
  },
];

export default function RetailInventoryPage() {
  const [stockItems, setStockItems] = useState<RetailStockItem[]>(mockStockItems);
  const [movements, setMovements] = useState<StockMovement[]>(initialMovements);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [filterLowStockOnly, setFilterLowStockOnly] = useState<boolean>(false);

  // Adjustment Modal
  const [adjustItem, setAdjustItem] = useState<RetailStockItem | null>(null);
  const [adjustType, setAdjustType] = useState<"INCREASE" | "DECREASE">("INCREASE");
  const [adjustQty, setAdjustQty] = useState<string>("1");
  const [adjustReason, setAdjustReason] = useState<string>("Correction");
  const [adjustNotes, setAdjustNotes] = useState<string>("");

  // History Modal
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Available locations
  const locations = useMemo(() => {
    const locSet = new Set(stockItems.map((s) => s.locationName));
    return Array.from(locSet);
  }, [stockItems]);

  // Filtered Stock Items
  const filteredStock = useMemo(() => {
    return stockItems.filter((item) => {
      const matchesSearch =
        item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.barcode && item.barcode.includes(searchQuery));

      const matchesLocation =
        selectedLocation === "ALL" || item.locationName === selectedLocation;

      const isLowStock = item.onHand <= item.reorderPoint;
      const matchesLowStock = !filterLowStockOnly || isLowStock;

      return matchesSearch && matchesLocation && matchesLowStock;
    });
  }, [stockItems, searchQuery, selectedLocation, filterLowStockOnly]);

  const handleOpenAdjust = (item: RetailStockItem) => {
    setAdjustItem(item);
    setAdjustType("INCREASE");
    setAdjustQty("1");
    setAdjustReason("Correction");
    setAdjustNotes("");
  };

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;
    const qty = parseInt(adjustQty, 10);
    if (isNaN(qty) || qty <= 0) return;

    const diff = adjustType === "INCREASE" ? qty : -qty;

    // Check underflow
    if (adjustType === "DECREASE" && adjustItem.onHand - qty < 0) {
      alert("Cannot reduce stock below zero.");
      return;
    }

    setStockItems((prev) =>
      prev.map((item) => {
        if (item._id === adjustItem._id) {
          const newOnHand = Math.max(0, item.onHand + diff);
          const newAvailable = Math.max(0, newOnHand - item.reserved);
          return {
            ...item,
            onHand: newOnHand,
            available: newAvailable,
          };
        }
        return item;
      })
    );

    // Record movement
    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toISOString(),
      productName: adjustItem.productName,
      sku: adjustItem.sku,
      locationName: adjustItem.locationName,
      type: adjustType,
      quantity: qty,
      reason: adjustReason,
      performedBy: "Current User",
      notes: adjustNotes || undefined,
    };
    setMovements((prev) => [newMovement, ...prev]);

    setAdjustItem(null);
  };

  // KPI calculations
  const totalStockOnHand = stockItems.reduce((acc, curr) => acc + curr.onHand, 0);
  const totalStockValuation = stockItems.reduce(
    (acc, curr) => acc + curr.onHand * curr.unitCost * 100,
    0
  );
  const lowStockCount = stockItems.filter((item) => item.onHand <= item.reorderPoint).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Retail Inventory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor real-time on-hand levels, location distribution, and perform stock adjustments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsHistoryOpen(true)}
            className="gap-2 border-slate-200"
          >
            <History className="h-4 w-4 text-slate-600" />
            Movement History
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Units On Hand</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalStockOnHand.toLocaleString()}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Inventory Valuation</p>
              <h3 className="text-2xl font-bold text-slate-900">{formatMinor(totalStockValuation)}</h3>
            </div>
          </div>
        </Card>

        <Card
          className={`p-4 bg-white border-slate-200 shadow-sm cursor-pointer transition-all ${
            filterLowStockOnly ? "ring-2 ring-amber-500 bg-amber-50/20" : ""
          }`}
          onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Low Stock Alerts</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-amber-600">{lowStockCount}</h3>
                <span className="text-[11px] text-slate-400">
                  {filterLowStockOnly ? "(Filtered)" : "(Click to filter)"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search items by product name, SKU, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 w-full"
              />
            </div>
            <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
              <div className="w-full sm:w-48">
                <Select value={selectedLocation} onValueChange={(val) => val && setSelectedLocation(val)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Locations</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filterLowStockOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterLowStockOnly(false)}
                  className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                >
                  Clear Alert Filter
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[260px]">Product / SKU</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">On Hand</TableHead>
                <TableHead className="text-right">Reserved</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Reorder Point</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-center">Stock Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Warehouse className="h-8 w-8 text-slate-300" />
                      <p className="text-sm font-medium">No inventory items matched your criteria</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStock.map((item) => {
                  const isLow = item.onHand <= item.reorderPoint;
                  const isCritical = item.onHand === 0;

                  return (
                    <TableRow key={item._id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell>
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        <div className="text-xs font-mono text-slate-500 mt-0.5">{item.sku}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-50 font-normal text-slate-700">
                          {item.locationName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-slate-900">
                        {item.onHand}
                      </TableCell>
                      <TableCell className="text-right text-slate-500">
                        {item.reserved > 0 ? (
                          <span className="text-amber-600 font-medium">{item.reserved}</span>
                        ) : (
                          0
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-700">
                        {item.available}
                      </TableCell>
                      <TableCell className="text-right text-slate-500 font-mono text-xs">
                        {item.reorderPoint} (Par: {item.parLevel})
                      </TableCell>
                      <TableCell className="text-right text-slate-600 font-mono">
                        ${item.unitCost.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {isCritical ? (
                          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">
                            Out of Stock
                          </Badge>
                        ) : isLow ? (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 flex items-center gap-1 mx-auto w-fit">
                            <AlertTriangle className="h-3 w-3" />
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                            Optimal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1 text-xs"
                          onClick={() => handleOpenAdjust(item)}
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
                          Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Stock Adjustment Dialog */}
      <Dialog open={!!adjustItem} onOpenChange={(open) => !open && setAdjustItem(null)}>
        <DialogContent className="max-w-md">
          {adjustItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  Stock Adjustment
                </DialogTitle>
                <DialogDescription>
                  Adjust on-hand inventory for{" "}
                  <span className="font-semibold text-slate-800">{adjustItem.productName}</span> at{" "}
                  <span className="font-medium text-slate-800">{adjustItem.locationName}</span>.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleApplyAdjustment} className="space-y-4 py-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Current On Hand</p>
                    <p className="text-lg font-bold text-slate-900">{adjustItem.onHand} units</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Available</p>
                    <p className="text-lg font-semibold text-slate-700">{adjustItem.available} units</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">Adjustment Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={adjustType === "INCREASE" ? "default" : "outline"}
                      className={`gap-1.5 ${
                        adjustType === "INCREASE" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                      }`}
                      onClick={() => setAdjustType("INCREASE")}
                    >
                      <Plus className="h-4 w-4" />
                      Add Stock (+)
                    </Button>
                    <Button
                      type="button"
                      variant={adjustType === "DECREASE" ? "default" : "outline"}
                      className={`gap-1.5 ${
                        adjustType === "DECREASE" ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
                      }`}
                      onClick={() => setAdjustType("DECREASE")}
                    >
                      <Minus className="h-4 w-4" />
                      Reduce Stock (-)
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="qty" className="text-xs font-medium text-slate-700">
                    Quantity to Adjust *
                  </Label>
                  <Input
                    id="qty"
                    type="number"
                    min="1"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reason" className="text-xs font-medium text-slate-700">
                    Reason *
                  </Label>
                  <Select value={adjustReason} onValueChange={(val) => val && setAdjustReason(val)}>
                    <SelectTrigger id="reason">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Correction">Inventory Count Correction</SelectItem>
                      <SelectItem value="Damaged">Damaged / Broken</SelectItem>
                      <SelectItem value="Expired">Expired Goods</SelectItem>
                      <SelectItem value="Theft / Lost">Theft / Unaccounted Loss</SelectItem>
                      <SelectItem value="Restock">Ad-hoc Restock</SelectItem>
                      <SelectItem value="Promotion / Sample">Marketing / Sample Giveaway</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-medium text-slate-700">
                    Notes / Reference (Optional)
                  </Label>
                  <Input
                    id="notes"
                    value={adjustNotes}
                    onChange={(e) => setAdjustNotes(e.target.value)}
                    placeholder="e.g. Audit note or incident description"
                  />
                </div>

                <DialogFooter className="pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setAdjustItem(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                    Apply Adjustment
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Movement History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <History className="h-5 w-5 text-slate-600" />
              Stock Movement History
            </DialogTitle>
            <DialogDescription>
              Chronological log of manual stock adjustments, receipts, and write-offs.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-slate-200 overflow-hidden my-2">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-xs">Date / Time</TableHead>
                  <TableHead className="text-xs">Product & SKU</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs text-center">Change</TableHead>
                  <TableHead className="text-xs">Reason & Notes</TableHead>
                  <TableHead className="text-xs">Performed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.id} className="text-xs">
                    <TableCell className="font-mono text-slate-500 whitespace-nowrap">
                      {new Date(m.timestamp).toLocaleDateString()}{" "}
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-800">{m.productName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{m.sku}</div>
                    </TableCell>
                    <TableCell className="text-slate-600">{m.locationName}</TableCell>
                    <TableCell className="text-center font-bold">
                      {m.type === "INCREASE" ? (
                        <span className="text-emerald-600">+{m.quantity}</span>
                      ) : (
                        <span className="text-rose-600">-{m.quantity}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-700">{m.reason}</div>
                      {m.notes && <div className="text-slate-400 italic text-[11px]">{m.notes}</div>}
                    </TableCell>
                    <TableCell className="text-slate-600">{m.performedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsHistoryOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
