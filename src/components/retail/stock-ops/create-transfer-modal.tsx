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
import { Send, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProductOption } from "./types";

interface CreateTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: Array<{ _id: string; name: string }>;
  availableProducts: ProductOption[];
  onSubmit: (data: {
    fromLocationId: string;
    toLocationId: string;
    lines: Array<{ productId: string; quantity: number }>;
    notes?: string;
  }) => Promise<void> | void;
  isSubmitting: boolean;
}

export function CreateTransferModal(props: CreateTransferModalProps) {
  if (!props.isOpen) return null;

  return <CreateTransferModalInner key={String(props.isOpen)} {...props} />;
}

function CreateTransferModalInner({
  isOpen,
  onClose,
  locations,
  availableProducts,
  onSubmit,
  isSubmitting,
}: CreateTransferModalProps) {
  const [fromLocationId, setFromLocationId] = useState<string>(() => locations[0]?._id || "");
  const [toLocationId, setToLocationId] = useState<string>(() => locations[1]?._id || "");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<
    Array<{ productId: string; productName: string; sku: string; quantity: number }>
  >(() => {
    const firstProd = availableProducts[0];
    if (!firstProd) return [];
    return [
      {
        productId: firstProd._id,
        productName: firstProd.name,
        sku: firstProd.sku,
        quantity: 5,
      },
    ];
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromLocationId || !toLocationId) {
      toast.error("Please select both source and destination locations.");
      return;
    }
    if (fromLocationId === toLocationId) {
      toast.error("Source and destination locations must be different.");
      return;
    }
    if (lines.length === 0) {
      toast.error("Please add at least one item to transfer.");
      return;
    }

    await onSubmit({
      fromLocationId,
      toLocationId,
      lines: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Create Stock Transfer
          </DialogTitle>
          <DialogDescription>
            Transfer inventory items between your registered storage locations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">Source (From) *</Label>
              <Select value={fromLocationId} onValueChange={(val) => val && setFromLocationId(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select origin" />
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

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">Destination (To) *</Label>
              <Select value={toLocationId} onValueChange={(val) => val && setToLocationId(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
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

          <div className="space-y-3 pt-2">
            <Label className="text-xs font-medium text-slate-700">Items to Transfer</Label>
            {lines.map((line, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-12 gap-2 items-center"
              >
                <div className="col-span-8">
                  <Select
                    value={line.productId}
                    onValueChange={(val) => {
                      const prod = availableProducts.find((p) => p._id === val);
                      if (!prod) return;
                      setLines((prev) =>
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
                      {availableProducts.map((p) => (
                        <SelectItem key={p._id} value={p._id} className="text-xs">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(e) => {
                      const qty = parseInt(e.target.value, 10) || 1;
                      setLines((prev) =>
                        prev.map((l, i) => (i === idx ? { ...l, quantity: qty } : l))
                      );
                    }}
                    className="h-8 text-xs"
                    placeholder="Qty"
                  />
                </div>
                <div className="col-span-1 text-center">
                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">Transfer Notes</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Stock replenishment for weekend rush"
            />
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
              Dispatch Transfer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

