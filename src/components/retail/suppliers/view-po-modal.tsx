"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMinor } from "@/lib/retail-mock-data";
import { RetailPurchaseOrder } from "./types";
import { StatusBadge } from "./status-badge";

interface ViewPoModalProps {
  po: RetailPurchaseOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelPo: (po: RetailPurchaseOrder) => void;
}

export function ViewPoModal({ po, isOpen, onClose, onCancelPo }: ViewPoModalProps) {
  if (!po) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-slate-900">
              {po.poNumber}
            </DialogTitle>
            <StatusBadge status={po.status} />
          </div>
          <DialogDescription>
            Vendor: <span className="font-semibold text-slate-800">{po.supplierName}</span> | Destination: {po.locationName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-md border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-xs">Product & SKU</TableHead>
                  <TableHead className="text-xs text-right">Ordered</TableHead>
                  <TableHead className="text-xs text-right">Received</TableHead>
                  <TableHead className="text-xs text-right">Unit Cost</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {po.lines.map((line, idx) => (
                  <TableRow key={idx} className="text-xs">
                    <TableCell>
                      <div className="font-medium text-slate-800">{line.productName}</div>
                      <div className="font-mono text-slate-400 text-[11px]">{line.sku}</div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{line.quantity}</TableCell>
                    <TableCell className="text-right text-emerald-600 font-semibold">
                      {line.receivedQty}
                    </TableCell>
                    <TableCell className="text-right text-slate-600 font-mono">
                      ${line.unitCost.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-900">
                      {formatMinor(line.totalMinor)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center text-sm pt-2">
            <div className="text-xs text-slate-500">
              Created: {new Date(po.createdAt).toLocaleDateString()}
              {po.notes && <p className="mt-1">Notes: {po.notes}</p>}
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Total Order Cost: </span>
              <span className="text-lg font-bold text-slate-900">
                {formatMinor(po.subtotalMinor)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center">
          {po.status === "DRAFT" || po.status === "SENT" ? (
            <Button
              variant="outline"
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
              onClick={() => onCancelPo(po)}
            >
              Cancel Order
            </Button>
          ) : (
            <div />
          )}
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

