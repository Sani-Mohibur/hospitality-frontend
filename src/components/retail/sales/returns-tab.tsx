import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { formatMinor } from "@/lib/retail-mock-data";
import { RetailReturn } from "./types";

interface ReturnsTabProps {
  returns: RetailReturn[];
  isLoading: boolean;
}

export function ReturnsTab({ returns, isLoading }: ReturnsTabProps) {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Return #</TableHead>
              <TableHead>Orig. Receipt</TableHead>
              <TableHead>Date Processed</TableHead>
              <TableHead>Returned Items</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-center">Refund Method</TableHead>
              <TableHead className="text-right">Refund Amount</TableHead>
              <TableHead>Processed By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span>Loading return records...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : returns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                  No customer returns or refunds recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              returns.map((ret) => (
                <TableRow key={ret._id} className="hover:bg-slate-50/70">
                  <TableCell className="font-mono font-semibold text-slate-900">
                    {ret.returnNumber}
                  </TableCell>
                  <TableCell className="font-mono text-slate-600 text-xs">
                    {ret.saleReceiptNumber}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {new Date(ret.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-700">
                      {ret.lines.map((l, idx) => (
                        <span key={idx} className="block">
                          {l.quantity}x {l.name} ({l.condition})
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                    {ret.reason}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-slate-50">
                      {ret.refundMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-purple-700">
                    -{formatMinor(ret.refundAmountMinor)}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{ret.processedBy}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

