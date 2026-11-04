"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { RetailTransfer } from "./types";

interface LocationTransfersTabProps {
  transfers: RetailTransfer[];
  isLoading: boolean;
  onReceiveTransfer: (transferId: string) => void;
}

export function LocationTransfersTab({
  transfers,
  isLoading,
  onReceiveTransfer,
}: LocationTransfersTabProps) {
  return (
    <div className="space-y-4">
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Transfer #</TableHead>
                <TableHead>Route (From → To)</TableHead>
                <TableHead>Items & Quantity</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span>Loading transfers...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    No location transfers recorded. Click &quot;New Transfer Request&quot; to shift stock.
                  </TableCell>
                </TableRow>
              ) : (
                transfers.map((tr) => (
                  <TableRow key={tr._id} className="hover:bg-slate-50/70">
                    <TableCell className="font-mono font-semibold text-slate-900">
                      {tr.transferNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                        <span>{tr.fromLocation}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                        <span>{tr.toLocation}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-700">
                        {tr.lines.map((l, idx) => (
                          <span key={idx} className="block text-xs">
                            {l.quantity}x {l.productName}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(tr.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {tr.status === "RECEIVED" ? (
                        <Badge className="bg-emerald-100 text-emerald-800">Received</Badge>
                      ) : tr.status === "DISPATCHED" ? (
                        <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {tr.status === "DISPATCHED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 gap-1"
                          onClick={() => onReceiveTransfer(tr._id)}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Acknowledge Receipt
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

