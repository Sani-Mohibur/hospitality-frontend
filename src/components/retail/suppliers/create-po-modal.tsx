"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Trash2, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { RetailSupplier, ProductOption, CreatePoLine } from "./types";

interface CreatePoModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: RetailSupplier[];
  locations: Array<{ _id: string; name: string }>;
  availableProducts: ProductOption[];
  currentLocationId?: string;
  onSubmit: (data: {
    supplierId: string;
    locationId: string;
    expectedDate?: string;
    notes?: string;
    lines: Array<{ productId: string; quantity: number; unitCost: number }>;
  }) => Promise<void> | void;
  isSubmitting: boolean;
}

export function CreatePoModal(props: CreatePoModalProps) {
  if (!props.isOpen) return null;

  return <CreatePoModalInner key={String(props.isOpen)} {...props} />;
}

function CreatePoModalInner({
  isOpen,
  onClose,
  suppliers,
  locations,
  availableProducts,
  currentLocationId,
  onSubmit,
  isSubmitting,
}: CreatePoModalProps) {
  const [supplierId, setSupplierId] = useState<string>(() => suppliers[0]?._id || "");
  const [locationId, setLocationId] = useState<string>(
    () => currentLocationId || locations[0]?._id || ""
  );
  const [expectedDate, setExpectedDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [lines, setLines] = useState<CreatePoLine[]>(() => {
    const firstProd = availableProducts[0];
    if (!firstProd) return [];
    return [
      {
        productId: firstProd._id,
        productName: firstProd.name,
        sku: firstProd.sku,
        quantity: 10,
        unitCost: firstProd.costPriceMinor > 0 ? firstProd.costPriceMinor / 100 : 10.0,
      },
    ];
  });

  const handleAddPoLine = () => {
    const prod = availableProducts[0];
    if (!prod) return;
    setLines((prev) => [
      ...prev,
      {
        productId: prod._id,
        productName: prod.name,
        sku: prod.sku,
        quantity: 1,
        unitCost: prod.costPriceMinor > 0 ? prod.costPriceMinor / 100 : 10.0,
      },
    ]);
  };

  const handleRemovePoLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, newProductId: string) => {
    const prod = availableProducts.find((p) => p._id === newProductId);
    if (!prod) return;
    setLines((prev) =>
      prev.map((line, i) =>
        i === index
          ? {
              ...line,
              productId: prod._id,
              productName: prod.name,
              sku: prod.sku,
              unitCost: prod.costPriceMinor > 0 ? prod.costPriceMinor / 100 : line.unitCost,
            }
          : line
      )
    );
  };

  const handleQuantityChange = (index: number, qty: number) => {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, quantity: Math.max(1, qty) } : line))
    );
  };

  const handleCostChange = (index: number, cost: number) => {
    setLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, unitCost: Math.max(0, cost) } : line))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      toast.error("Please select a vendor supplier");
      return;
    }
    if (lines.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    await onSubmit({
      supplierId,
      locationId: locationId || currentLocationId || locations[0]?._id || "",
      expectedDate,
      notes,
      lines: lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        unitCost: l.unitCost,
      })),
    });
  };

  const totalValue = lines.reduce((sum, l) => sum + l.quantity * l.unitCost, 0).toFixed(2);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Create Purchase Order
          </DialogTitle>
          <DialogDescription>
            Draft an order to replenish inventory from an approved supplier.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">Vendor / Supplier *</Label>
              <Select value={supplierId} onValueChange={(val) => val && setSupplierId(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">Destination Location *</Label>
              <Select
                value={locationId || currentLocationId || locations[0]?._id || ""}
                onValueChange={(val) => val && setLocationId(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc._id} value={loc._id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">Expected Delivery Date</Label>
              <Input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">Order Notes / Instructions</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Expedited shipping requested"
              />
            </div>
          </div>

          {/* Line items */}
          <div className="border-t border-slate-200 pt-3 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Order Line Items
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPoLine}
                className="h-7 text-xs gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Line Item
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {lines.map((line, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-12 gap-2 items-center"
                >
                  <div className="col-span-5">
                    <Label className="text-[10px] text-slate-500">Product</Label>
                    <Select
                      value={line.productId}
                      onValueChange={(val) => val && handleProductChange(idx, val)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.map((p) => (
                          <SelectItem key={p._id} value={p._id} className="text-xs">
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label className="text-[10px] text-slate-500">Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) =>
                        handleQuantityChange(idx, parseInt(e.target.value, 10) || 1)
                      }
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="text-[10px] text-slate-500">Unit Cost ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={line.unitCost}
                      onChange={(e) =>
                        handleCostChange(idx, parseFloat(e.target.value) || 0)
                      }
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="col-span-2 text-right">
                    <Label className="text-[10px] text-slate-500 block">Total</Label>
                    <span className="text-xs font-semibold text-slate-900 block mt-1">
                      ${(line.quantity * line.unitCost).toFixed(2)}
                    </span>
                  </div>

                  <div className="col-span-1 text-center">
                    {lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePoLine(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-right pt-2">
              <span className="text-xs text-slate-500">Total Purchase Value: </span>
              <span className="text-base font-bold text-slate-900">
                ${totalValue}
              </span>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-white gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Create & Dispatch PO
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

