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
import { PackageCheck, CheckCircle2, Loader2 } from "lucide-react";
import { RetailPurchaseOrder } from "./types";

interface ReceiveGoodsModalProps {
  po: RetailPurchaseOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReceipt: (po: RetailPurchaseOrder, receiveLines: { [index: number]: number }) => void;
  isSubmitting: boolean;
}

export function ReceiveGoodsModal({
  po,
  isOpen,
  onClose,
  onConfirmReceipt,
  isSubmitting,
}: ReceiveGoodsModalProps) {
  if (!po) return null;

  return (
    <ReceiveGoodsModalInner
      key={po._id}
      po={po}
      isOpen={isOpen}
      onClose={onClose}
      onConfirmReceipt={onConfirmReceipt}
      isSubmitting={isSubmitting}
    />
  );
}

function ReceiveGoodsModalInner({
  po,
  isOpen,
  onClose,
  onConfirmReceipt,
  isSubmitting,
}: {
  po: RetailPurchaseOrder;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReceipt: (po: RetailPurchaseOrder, receiveLines: { [index: number]: number }) => void;
  isSubmitting: boolean;
}) {
  const [receiveLines, setReceiveLines] = useState<{ [index: number]: number }>(() => {
    const initialReceive: { [index: number]: number } = {};
    po.lines.forEach((line, index) => {
      initialReceive[index] = Math.max(0, line.quantity - line.receivedQty);
    });
    return initialReceive;
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-emerald-600" />
            Receive Goods — {po.poNumber}
          </DialogTitle>
          <DialogDescription>
            Confirm quantities delivered by {po.supplierName} to immediately increment on-hand inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {po.lines.map((line, idx) => {
              const remaining = Math.max(0, line.quantity - line.receivedQty);
              return (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{line.productName}</p>
                    <p className="text-xs text-slate-500">
                      Ordered: {line.quantity} | Already Received: {line.receivedQty} | Remaining:{" "}
                      <span className="font-medium text-amber-700">{remaining}</span>
                    </p>
                  </div>
                  <div className="w-28">
                    <Label className="text-[11px] text-slate-500">Qty Receiving</Label>
                    <Input
                      type="number"
                      min="0"
                      max={remaining}
                      value={receiveLines[idx] ?? remaining}
                      onChange={(e) =>
                        setReceiveLines({
                          ...receiveLines,
                          [idx]: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="h-8 text-right font-medium"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirmReceipt(po, receiveLines)}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Confirm Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

