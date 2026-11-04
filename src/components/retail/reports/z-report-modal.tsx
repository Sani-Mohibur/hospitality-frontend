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
import { FileSpreadsheet, Loader2, Printer, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { formatMinor } from "@/lib/retail-mock-data";
import { ZReportData, TenderBreakdownData } from "./types";

interface ZReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  data: ZReportData | null;
  locationName?: string;
  tenderBreakdown: TenderBreakdownData;
  totalRefundMinor: number;
  grossSalesMinor: number;
}

export function ZReportModal({
  isOpen,
  onClose,
  isLoading,
  data,
  locationName,
  tenderBreakdown,
  totalRefundMinor,
  grossSalesMinor,
}: ZReportModalProps) {
  const [countedCash, setCountedCash] = useState("200.00");

  const displayName = data?.location?.name || data?.store?.name || locationName || "Main Store";
  const displayDate = data?.location?.businessDate || data?.store?.businessDate || new Date().toLocaleDateString();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-slate-700" />
              Register End-of-Day (Z-Report)
            </DialogTitle>
          </div>
          <DialogDescription>
            Store: {displayName} | Date: {displayDate}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs">Aggregating register closure data...</span>
          </div>
        ) : (
          <div className="space-y-3 py-2 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span>Opening Cash Float:</span>
                <span>$200.00</span>
              </div>
              <div className="flex justify-between">
                <span>Cash Sales Ring:</span>
                <span>{formatMinor(tenderBreakdown.cashMinor)}</span>
              </div>
              <div className="flex justify-between text-purple-700">
                <span>Cash Paid Out (Refunds):</span>
                <span>-{formatMinor(totalRefundMinor)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200 pt-1 text-slate-900">
                <span>Expected Cash In Drawer:</span>
                <span>
                  $
                  {(
                    200 +
                    tenderBreakdown.cashMinor / 100 -
                    totalRefundMinor / 100
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-1 pt-1 font-sans">
              <Label className="text-xs font-medium text-slate-700">
                Counted Cash In Drawer ($)
              </Label>
              <Input
                type="number"
                step="0.01"
                value={countedCash}
                onChange={(e) => setCountedCash(e.target.value)}
                className="h-9 font-mono font-bold"
              />
            </div>

            <div className="p-2.5 bg-slate-100 rounded text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span>Card Transactions Total:</span>
                <span>{formatMinor(tenderBreakdown.cardMinor)}</span>
              </div>
              <div className="flex justify-between">
                <span>Room Charges Total:</span>
                <span>{formatMinor(tenderBreakdown.roomChargeMinor)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Register Turnover:</span>
                <span>{formatMinor(grossSalesMinor)}</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="pt-2 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.print();
              }
            }}
            className="gap-1 text-xs"
          >
            <Printer className="h-4 w-4" />
            Print Z-Report
          </Button>
          <Button
            size="sm"
            onClick={() => {
              toast.success("Register day-end finalized. Cash drawer balanced.");
              onClose();
            }}
            className="bg-primary hover:bg-primary/90 text-white text-xs gap-1"
          >
            <CheckCircle2 className="h-4 w-4" />
            Finalize Register Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
