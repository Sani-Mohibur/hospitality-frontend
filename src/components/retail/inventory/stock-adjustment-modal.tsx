import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { RetailStockItem } from "./types";

export interface ApplyAdjustmentParams {
  stockItemId: string;
  quantity: number;
  type: "INCREASE" | "DECREASE";
  reason: string;
  notes?: string;
}

interface StockAdjustmentModalProps {
  item: RetailStockItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyAdjustment: (params: ApplyAdjustmentParams) => Promise<void>;
  isAdjusting: boolean;
}

function StockAdjustmentModalInner({
  item,
  onClose,
  onApplyAdjustment,
  isAdjusting,
}: {
  item: RetailStockItem;
  onClose: () => void;
  onApplyAdjustment: (params: ApplyAdjustmentParams) => Promise<void>;
  isAdjusting: boolean;
}) {
  const [adjustType, setAdjustType] = useState<"INCREASE" | "DECREASE">("INCREASE");
  const [adjustQty, setAdjustQty] = useState<string>("1");
  const [adjustReason, setAdjustReason] = useState<string>("Correction");
  const [adjustNotes, setAdjustNotes] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(adjustQty, 10);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid positive quantity");
      return;
    }

    if (adjustType === "DECREASE" && item.onHand - qty < 0) {
      toast.error("Cannot reduce stock below zero.");
      return;
    }

    await onApplyAdjustment({
      stockItemId: item._id,
      quantity: qty,
      type: adjustType,
      reason: adjustReason,
      notes: adjustNotes,
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-bold text-slate-900">
          Stock Adjustment
        </DialogTitle>
        <DialogDescription>
          Adjust on-hand inventory for{" "}
          <span className="font-semibold text-slate-800">{item.productName}</span> at{" "}
          <span className="font-medium text-slate-800">{item.locationName}</span>.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-sm">
          <div>
            <p className="text-xs text-slate-500">Current On Hand</p>
            <p className="text-lg font-bold text-slate-900">{item.onHand} units</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Available</p>
            <p className="text-lg font-semibold text-slate-700">{item.available} units</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-700">Adjustment Type</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={adjustType === "INCREASE" ? "default" : "outline"}
              className={`gap-1.5 ${
                adjustType === "INCREASE"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : ""
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
                adjustType === "DECREASE"
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : ""
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
          <Button
            type="button"
            variant="outline"
            disabled={isAdjusting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isAdjusting}
            className="bg-primary hover:bg-primary/90 text-white gap-2"
          >
            {isAdjusting && <Loader2 className="h-4 w-4 animate-spin" />}
            Apply Adjustment
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function StockAdjustmentModal({
  item,
  isOpen,
  onClose,
  onApplyAdjustment,
  isAdjusting,
}: StockAdjustmentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        {item && (
          <StockAdjustmentModalInner
            key={item._id}
            item={item}
            onClose={onClose}
            onApplyAdjustment={onApplyAdjustment}
            isAdjusting={isAdjusting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

