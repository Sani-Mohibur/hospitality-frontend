import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { History, Loader2 } from "lucide-react";
import { StockMovement } from "./types";

interface MovementHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  movements: StockMovement[];
}

export function MovementHistoryModal({
  isOpen,
  onClose,
  isLoading,
  movements,
}: MovementHistoryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading movement ledger...</p>
          </div>
        ) : (
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
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                      No stock movement records found
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((m) => (
                    <TableRow key={m.id} className="text-xs">
                      <TableCell className="font-mono text-slate-500 whitespace-nowrap">
                        {new Date(m.timestamp).toLocaleDateString()}{" "}
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
                        {m.notes && (
                          <div className="text-slate-400 italic text-[11px]">{m.notes}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600">{m.performedBy}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

