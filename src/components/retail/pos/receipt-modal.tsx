import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Printer } from "lucide-react";
import { formatMinor } from "@/lib/retail-mock-data";
import { CompletedSale } from "./types";

interface ReceiptModalProps {
  completedSale: CompletedSale | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptModal({
  completedSale,
  isOpen,
  onClose,
}: ReceiptModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        {completedSale && (
          <div className="space-y-4 text-center font-sans">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Payment Successful</h3>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                {completedSale.receiptNumber}
              </p>
              <p className="text-[11px] text-slate-400">{completedSale.date}</p>
            </div>

            {/* Receipt slip layout */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-left space-y-2">
              <div className="border-b border-dashed border-slate-300 pb-2 space-y-1">
                {completedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-slate-800">
                      {item.quantity}x {item.product.name}
                    </span>
                    <span className="font-mono text-slate-900">
                      {formatMinor(item.quantity * item.unitPriceMinor)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatMinor(completedSale.subtotal)}</span>
                </div>
                {completedSale.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span className="font-mono">-{formatMinor(completedSale.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (10%):</span>
                  <span className="font-mono">{formatMinor(completedSale.tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Paid:</span>
                  <span className="font-mono text-sm">{formatMinor(completedSale.total)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2 text-[11px] text-slate-500">
                <p>
                  Method: <strong>{completedSale.paymentMethod}</strong>
                </p>
                {completedSale.roomNumber && (
                  <p>
                    Charged to Room: {completedSale.roomNumber} ({completedSale.guestName})
                  </p>
                )}
                {completedSale.changeDue !== undefined && (
                  <p>Change Returned: {formatMinor(completedSale.changeDue)}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-1 text-xs"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.print();
                  }
                }}
              >
                <Printer className="h-4 w-4" />
                Print Receipt
              </Button>
              <Button
                className="flex-1 bg-primary text-white text-xs"
                onClick={onClose}
              >
                Next Sale
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
