import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatMinor } from "@/lib/retail-mock-data";
import { RetailSale } from "./types";
import { StatusBadge } from "./status-badge";

interface SaleDetailsModalProps {
  sale: RetailSale | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SaleDetailsModal({
  sale,
  isOpen,
  onClose,
}: SaleDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        {sale && (
          <div className="space-y-4 font-sans">
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle className="text-lg font-bold text-slate-900">
                  {sale.receiptNumber}
                </DialogTitle>
                <StatusBadge status={sale.status} />
              </div>
              <DialogDescription>
                Cashier: {sale.cashierName} | Location: {sale.locationName}
              </DialogDescription>
            </DialogHeader>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="border-b border-dashed border-slate-300 pb-2 space-y-1.5">
                {sale.lines.map((line, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-800">{line.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {line.quantity} @ {formatMinor(line.unitPriceMinor)}
                        {line.returnedQuantity > 0 && (
                          <span className="text-purple-600 ml-1">
                            ({line.returnedQuantity} refunded)
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="font-mono font-semibold text-slate-900">
                      {formatMinor(line.totalMinor)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatMinor(sale.subtotalMinor)}</span>
                </div>
                {sale.discountTotalMinor > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-mono">-{formatMinor(sale.discountTotalMinor)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-mono">{formatMinor(sale.taxTotalMinor)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Paid</span>
                  <span className="font-mono text-sm">{formatMinor(sale.totalMinor)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2 text-[11px] text-slate-500">
                <p>
                  Payment Tender: <strong>{sale.paymentMethod}</strong>
                </p>
                <p>Business Date: {sale.businessDate}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-1.5 text-xs"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.print();
                  }
                }}
              >
                <Printer className="h-4 w-4" />
                Print Receipt
              </Button>
              <Button className="flex-1 text-xs" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

