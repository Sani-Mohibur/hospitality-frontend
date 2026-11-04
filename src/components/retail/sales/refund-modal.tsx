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
import { RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatMinor } from "@/lib/retail-mock-data";
import { RetailSale } from "./types";

export interface ProcessRefundParams {
  lines: {
    productId: string;
    variantId?: string;
    quantity: number;
    restock: boolean;
    condition: "RESELLABLE" | "DAMAGED";
    reason: string;
  }[];
  refundMethod: string;
  notes: string;
}

interface RefundModalProps {
  sale: RetailSale | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitRefund: (params: ProcessRefundParams) => Promise<void>;
  isSubmitting: boolean;
}

function RefundModalInner({
  sale,
  onClose,
  onSubmitRefund,
  isSubmitting,
}: {
  sale: RetailSale;
  onClose: () => void;
  onSubmitRefund: (params: ProcessRefundParams) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [refundItems, setRefundItems] = useState<{ [index: number]: number }>(() => {
    const initial: { [index: number]: number } = {};
    sale.lines.forEach((l, idx) => {
      const availableToReturn = l.quantity - l.returnedQuantity;
      initial[idx] = availableToReturn > 0 ? 1 : 0;
    });
    return initial;
  });
  const [refundReason, setRefundReason] = useState("Customer changed mind");
  const [refundMethod, setRefundMethod] = useState(
    sale.paymentMethod === "Cash" ? "CASH" : "CARD"
  );
  const [restockToInventory, setRestockToInventory] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const linesToReturn = sale.lines
      .map((line, idx) => {
        const qty = refundItems[idx] || 0;
        return {
          productId: line.productId,
          variantId: line.variantId,
          quantity: qty,
          restock: restockToInventory,
          condition: restockToInventory ? ("RESELLABLE" as const) : ("DAMAGED" as const),
          reason: refundReason,
        };
      })
      .filter((l) => l.quantity > 0);

    if (linesToReturn.length === 0) {
      toast.error("Please select at least 1 item to return.");
      return;
    }

    const backendRefundMethod =
      refundMethod === "CASH"
        ? "CASH"
        : refundMethod === "CARD"
        ? "CARD_EXTERNAL"
        : "CITY_LEDGER";

    await onSubmitRefund({
      lines: linesToReturn,
      refundMethod: backendRefundMethod,
      notes: refundReason,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <RotateCcw className="h-5 w-5 text-purple-600" />
          Process Return / Refund
        </DialogTitle>
        <DialogDescription>
          Originating Receipt:{" "}
          <span className="font-mono font-semibold">{sale.receiptNumber}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 py-1">
        <Label className="text-xs font-semibold text-slate-700">
          Select Item(s) and Quantity to Return:
        </Label>
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {sale.lines.map((line, idx) => {
            const remainingToReturn = line.quantity - line.returnedQuantity;
            if (remainingToReturn <= 0) return null;
            return (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{line.name}</p>
                  <p className="text-slate-500">
                    Purchased: {line.quantity} | Available: {remainingToReturn} | Rate:{" "}
                    {formatMinor(line.unitPriceMinor)}
                  </p>
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min="0"
                    max={remainingToReturn}
                    value={refundItems[idx] ?? 0}
                    onChange={(e) =>
                      setRefundItems({
                        ...refundItems,
                        [idx]: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="h-8 text-right font-bold"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-1.5 pt-2">
          <Label className="text-xs font-medium text-slate-700">Return Reason *</Label>
          <Select value={refundReason} onValueChange={(val) => val && setRefundReason(val)}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Customer changed mind">Customer changed mind</SelectItem>
              <SelectItem value="Defective or damaged">Defective / Damaged</SelectItem>
              <SelectItem value="Incorrect size/spec">Incorrect item or size</SelectItem>
              <SelectItem value="Billing error">Cashier billing error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">Refund Method</Label>
            <Select value={refundMethod} onValueChange={(val) => val && setRefundMethod(val)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CARD">Original Card</SelectItem>
                <SelectItem value="CASH">Cash Refund</SelectItem>
                <SelectItem value="STORE_CREDIT">Store Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={restockToInventory}
                onChange={(e) => setRestockToInventory(e.target.checked)}
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
              />
              Return item to stock
            </label>
          </div>
        </div>
      </div>

      <DialogFooter className="pt-3 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
          Issue Refund
        </Button>
      </DialogFooter>
    </form>
  );
}

export function RefundModal({
  sale,
  isOpen,
  onClose,
  onSubmitRefund,
  isSubmitting,
}: RefundModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        {sale && (
          <RefundModalInner
            key={sale._id}
            sale={sale}
            onClose={onClose}
            onSubmitRefund={onSubmitRefund}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

