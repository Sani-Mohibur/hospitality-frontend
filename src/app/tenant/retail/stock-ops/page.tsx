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
  ArrowLeftRight,
  ClipboardCheck,
  Sparkles,
  Plus,
  Send,
  CheckCircle2,
  AlertTriangle,
  Package,
  Layers,
  ArrowRight,
  FileSpreadsheet,
} from "lucide-react";
import {
  mockTransfers,
  mockStocktakes,
  mockStockItems,
  mockProducts,
  RetailTransfer,
  RetailStocktake,
  RetailStockItem,
  formatMinor,
} from "@/lib/retail-mock-data";

export default function RetailStockOpsPage() {
  const [activeTab, setActiveTab] = useState<"TRANSFERS" | "STOCKTAKE" | "SUGGESTIONS">("TRANSFERS");

  // Transfers
  const [transfers, setTransfers] = useState<RetailTransfer[]>(mockTransfers);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferFrom, setTransferFrom] = useState("Warehouse");
  const [transferTo, setTransferTo] = useState("Main Store");
  const [transferNotes, setTransferNotes] = useState("");
  const [transferLines, setTransferLines] = useState<
    { productId: string; productName: string; sku: string; quantity: number }[]
  >([
    {
      productId: mockProducts[0]?._id || "",
      productName: mockProducts[0]?.name || "",
      sku: mockProducts[0]?.sku || "",
      quantity: 5,
    },
  ]);

  // Stocktake
  const [stocktakes, setStocktakes] = useState<RetailStocktake[]>(mockStocktakes);
  const [activeStocktakeAudit, setActiveStocktakeAudit] = useState<{
    stocktakeNumber: string;
    location: string;
    items: {
      productId: string;
      name: string;
      sku: string;
      systemQty: number;
      countedQty: number;
    }[];
  } | null>(null);

  // Restock items
  const restockSuggestions = useMemo(() => {
    return mockStockItems
      .filter((item) => item.onHand <= item.reorderPoint)
      .map((item) => {
        const suggestedQty = Math.max(item.reorderQty, item.parLevel - item.onHand);
        return {
          ...item,
          suggestedQty,
          estimatedCostMinor: Math.round(suggestedQty * item.unitCost * 100),
        };
      });
  }, []);

  // Transfer action handlers
  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferFrom === transferTo) {
      alert("Source and Destination locations must be different.");
      return;
    }

    const newTransfer: RetailTransfer = {
      _id: `tr-${Date.now()}`,
      transferNumber: `TRF-${new Date().getFullYear()}-${(transfers.length + 1).toString().padStart(3, "0")}`,
      fromLocation: transferFrom,
      toLocation: transferTo,
      status: "DISPATCHED",
      lines: transferLines.map((l) => ({
        productName: l.productName,
        sku: l.sku,
        quantity: l.quantity,
        unitCost: 15.0,
      })),
      notes: transferNotes || undefined,
      createdAt: new Date().toISOString(),
    };

    setTransfers((prev) => [newTransfer, ...prev]);
    setIsTransferModalOpen(false);
  };

  const handleUpdateTransferStatus = (
    transferId: string,
    newStatus: RetailTransfer["status"]
  ) => {
    setTransfers((prev) =>
      prev.map((t) => (t._id === transferId ? { ...t, status: newStatus } : t))
    );
  };

  // Stocktake audit start
  const handleStartStocktake = () => {
    const items = mockStockItems.map((s) => ({
      productId: s.productId,
      name: s.productName,
      sku: s.sku,
      systemQty: s.onHand,
      countedQty: s.onHand, // Default to system, user modifies
    }));

    setActiveStocktakeAudit({
      stocktakeNumber: `STK-${new Date().getFullYear()}-${(stocktakes.length + 1).toString().padStart(3, "0")}`,
      location: "Main Store",
      items,
    });
  };

  const handleCountChange = (productId: string, val: number) => {
    if (!activeStocktakeAudit) return;
    setActiveStocktakeAudit({
      ...activeStocktakeAudit,
      items: activeStocktakeAudit.items.map((item) =>
        item.productId === productId ? { ...item, countedQty: Math.max(0, val) } : item
      ),
    });
  };

  const handleCommitStocktake = () => {
    if (!activeStocktakeAudit) return;
    const varianceCount = activeStocktakeAudit.items.filter(
      (item) => item.countedQty !== item.systemQty
    ).length;

    const completedStocktake: RetailStocktake = {
      _id: `st-${Date.now()}`,
      stocktakeNumber: activeStocktakeAudit.stocktakeNumber,
      locationName: activeStocktakeAudit.location,
      status: "COMPLETED",
      itemsCounted: activeStocktakeAudit.items.length,
      varianceItems: varianceCount,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    setStocktakes((prev) => [completedStocktake, ...prev]);
    setActiveStocktakeAudit(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Stock Operations</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Internal stock movements, physical audits (stocktakes), and automated replenishment.
          </p>
        </div>

        {activeTab === "TRANSFERS" && (
          <Button
            onClick={() => setIsTransferModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            New Transfer Request
          </Button>
        )}
        {activeTab === "STOCKTAKE" && !activeStocktakeAudit && (
          <Button
            onClick={handleStartStocktake}
            className="bg-primary hover:bg-primary/90 text-white gap-2"
          >
            <ClipboardCheck className="h-4 w-4" />
            Start New Stocktake
          </Button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("TRANSFERS")}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "TRANSFERS"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ArrowLeftRight className="h-4 w-4" />
          Location Transfers ({transfers.length})
        </button>
        <button
          onClick={() => setActiveTab("STOCKTAKE")}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "STOCKTAKE"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ClipboardCheck className="h-4 w-4" />
          Stocktake Auditing ({stocktakes.length})
        </button>
        <button
          onClick={() => setActiveTab("SUGGESTIONS")}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "SUGGESTIONS"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          Restock Suggestions ({restockSuggestions.length})
        </button>
      </div>

      {/* ─── TAB 1: TRANSFERS ────────────────────────────────────── */}
      {activeTab === "TRANSFERS" && (
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Transfer #</TableHead>
                    <TableHead>Route (From → To)</TableHead>
                    <TableHead>Items & Quantity</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((tr) => (
                    <TableRow key={tr._id} className="hover:bg-slate-50/70">
                      <TableCell className="font-mono font-semibold text-slate-900">
                        {tr.transferNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                          <span>{tr.fromLocation}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                          <span>{tr.toLocation}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-700">
                          {tr.lines.map((l, idx) => (
                            <span key={idx} className="block text-xs">
                              {l.quantity}x {l.productName}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(tr.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-center">
                        {tr.status === "RECEIVED" ? (
                          <Badge className="bg-emerald-100 text-emerald-800">Received</Badge>
                        ) : tr.status === "DISPATCHED" ? (
                          <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {tr.status === "DISPATCHED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 gap-1"
                            onClick={() => handleUpdateTransferStatus(tr._id, "RECEIVED")}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Acknowledge Receipt
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB 2: STOCKTAKE ────────────────────────────────────── */}
      {activeTab === "STOCKTAKE" && (
        <div className="space-y-4">
          {activeStocktakeAudit ? (
            <Card className="border-slate-200 shadow-sm border-t-4 border-t-primary">
              <CardHeader className="bg-slate-50 border-b border-slate-200 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-primary" />
                      Live Counting Sheet: {activeStocktakeAudit.stocktakeNumber}
                    </CardTitle>
                    <CardDescription>
                      Auditing location:{" "}
                      <span className="font-semibold text-slate-700">
                        {activeStocktakeAudit.location}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveStocktakeAudit(null)}
                    >
                      Cancel Audit
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                      onClick={handleCommitStocktake}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Reconcile & Complete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Product / SKU</TableHead>
                      <TableHead className="text-right">System Qty</TableHead>
                      <TableHead className="text-right w-36">Counted Physical Qty</TableHead>
                      <TableHead className="text-right">Variance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeStocktakeAudit.items.map((item) => {
                      const variance = item.countedQty - item.systemQty;
                      return (
                        <TableRow key={item.productId} className="hover:bg-slate-50/70">
                          <TableCell>
                            <div className="font-medium text-slate-900">{item.name}</div>
                            <div className="text-xs font-mono text-slate-400">{item.sku}</div>
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium text-slate-700">
                            {item.systemQty}
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="0"
                              value={item.countedQty}
                              onChange={(e) =>
                                handleCountChange(item.productId, parseInt(e.target.value, 10) || 0)
                              }
                              className="h-8 text-right font-bold font-mono"
                            />
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold">
                            {variance === 0 ? (
                              <span className="text-emerald-600">0</span>
                            ) : variance > 0 ? (
                              <span className="text-blue-600">+{variance}</span>
                            ) : (
                              <span className="text-rose-600">{variance}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Stocktake Number</TableHead>
                      <TableHead>Audited Location</TableHead>
                      <TableHead className="text-center">Items Counted</TableHead>
                      <TableHead className="text-center">Variance Count</TableHead>
                      <TableHead>Completed Date</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stocktakes.map((stk) => (
                      <TableRow key={stk._id} className="hover:bg-slate-50/70">
                        <TableCell className="font-mono font-semibold text-slate-900">
                          {stk.stocktakeNumber}
                        </TableCell>
                        <TableCell className="text-slate-800 font-medium">
                          {stk.locationName}
                        </TableCell>
                        <TableCell className="text-center">{stk.itemsCounted} items</TableCell>
                        <TableCell className="text-center">
                          {stk.varianceItems > 0 ? (
                            <Badge className="bg-amber-100 text-amber-800">
                              {stk.varianceItems} variances
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-800">Zero variance</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {stk.completedAt ? new Date(stk.completedAt).toLocaleDateString() : "In progress"}
                        </TableCell>
                        <TableCell className="text-center">
                          {stk.status === "COMPLETED" ? (
                            <Badge className="bg-emerald-100 text-emerald-800">Completed</Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ─── TAB 3: RESTOCK SUGGESTIONS ──────────────────────────── */}
      {activeTab === "SUGGESTIONS" && (
        <div className="space-y-4">
          <Card className="p-4 bg-amber-50/60 border-amber-200 shadow-sm flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-amber-900">Automated Replenishment Engine</p>
              <p className="text-amber-800 text-xs mt-0.5">
                The following products have breached minimum thresholds (reorder point) and require procurement to maintain optimal shelf availability.
              </p>
            </div>
          </Card>

          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Preferred Supplier</TableHead>
                    <TableHead className="text-right">On Hand</TableHead>
                    <TableHead className="text-right">Reorder Point</TableHead>
                    <TableHead className="text-right">Par Level</TableHead>
                    <TableHead className="text-right">Suggested Order Qty</TableHead>
                    <TableHead className="text-right">Est. Cost</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restockSuggestions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                        All products are currently stocked at optimal levels. No replenishment needed!
                      </TableCell>
                    </TableRow>
                  ) : (
                    restockSuggestions.map((item) => (
                      <TableRow key={item._id} className="hover:bg-slate-50/70">
                        <TableCell>
                          <div className="font-semibold text-slate-900">{item.productName}</div>
                          <div className="text-xs font-mono text-slate-400">{item.sku}</div>
                        </TableCell>
                        <TableCell className="text-slate-700 text-sm">
                          {item.supplierName || "—"}
                        </TableCell>
                        <TableCell className="text-right font-bold text-rose-600">
                          {item.onHand}
                        </TableCell>
                        <TableCell className="text-right text-slate-600">{item.reorderPoint}</TableCell>
                        <TableCell className="text-right text-slate-600">{item.parLevel}</TableCell>
                        <TableCell className="text-right font-bold text-emerald-600 font-mono">
                          +{item.suggestedQty}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-slate-900">
                          {formatMinor(item.estimatedCostMinor)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-primary hover:bg-primary/90 text-white gap-1"
                            onClick={() => alert(`PO drafted for ${item.suggestedQty}x ${item.productName}`)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Draft PO
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* Create Transfer Modal */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Create Stock Transfer
            </DialogTitle>
            <DialogDescription>
              Transfer inventory items between your registered storage locations.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTransfer} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Source (From) *</Label>
                <Select value={transferFrom} onValueChange={(val) => val && setTransferFrom(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Warehouse">Central Warehouse</SelectItem>
                    <SelectItem value="Main Store">Main Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Destination (To) *</Label>
                <Select value={transferTo} onValueChange={(val) => val && setTransferTo(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Store">Main Store</SelectItem>
                    <SelectItem value="Warehouse">Central Warehouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-xs font-medium text-slate-700">Items to Transfer</Label>
              {transferLines.map((line, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-8">
                    <Select
                      value={line.productId}
                      onValueChange={(val) => {
                        const prod = mockProducts.find((p) => p._id === val);
                        if (!prod) return;
                        setTransferLines((prev) =>
                          prev.map((l, i) =>
                            i === idx
                              ? {
                                  ...l,
                                  productId: prod._id,
                                  productName: prod.name,
                                  sku: prod.sku,
                                }
                              : l
                          )
                        );
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProducts.map((p) => (
                          <SelectItem key={p._id} value={p._id} className="text-xs">
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-4">
                    <Input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => {
                        const qty = parseInt(e.target.value, 10) || 1;
                        setTransferLines((prev) =>
                          prev.map((l, i) => (i === idx ? { ...l, quantity: qty } : l))
                        );
                      }}
                      className="h-8 text-xs"
                      placeholder="Qty"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">Transfer Notes</Label>
              <Input
                value={transferNotes}
                onChange={(e) => setTransferNotes(e.target.value)}
                placeholder="e.g. Stock replenishment for weekend rush"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsTransferModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white gap-1.5">
                <Send className="h-4 w-4" />
                Dispatch Transfer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
