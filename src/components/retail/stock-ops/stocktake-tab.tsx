"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileSpreadsheet, CheckCircle2, Loader2 } from "lucide-react";
import { RetailStocktake, ActiveStocktakeAudit } from "./types";

interface StocktakeTabProps {
  stocktakes: RetailStocktake[];
  isLoading: boolean;
  activeStocktakeAudit: ActiveStocktakeAudit | null;
  onCancelAudit: () => void;
  onCommitStocktake: () => void;
  onCountChange: (productId: string, val: number) => void;
  isSubmitting: boolean;
}

export function StocktakeTab({
  stocktakes,
  isLoading,
  activeStocktakeAudit,
  onCancelAudit,
  onCommitStocktake,
  onCountChange,
  isSubmitting,
}: StocktakeTabProps) {
  if (activeStocktakeAudit) {
    return (
      <Card className="border-slate-200 shadow-sm border-t-4 border-t-primary">
        <CardHeader className="bg-slate-50 border-b border-slate-200 pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Live Counting Sheet: {activeStocktakeAudit.stocktakeNumber}
              </CardTitle>
              <CardDescription>
                Auditing location:{" "}
                <span className="font-semibold text-slate-700">
                  {activeStocktakeAudit.location}
                </span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelAudit}
              >
                Cancel Audit
              </Button>
              <Button
                size="sm"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                onClick={onCommitStocktake}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Reconcile & Complete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Product / SKU</TableHead>
                <TableHead className="text-right">System Qty</TableHead>
                <TableHead className="text-right w-36">Counted Physical Qty</TableHead>
                <TableHead className="text-right">Variance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeStocktakeAudit.items.map((item) => {
                const variance = item.countedQty - item.systemQty;
                return (
                  <TableRow key={item.productId} className="hover:bg-slate-50/70">
                    <TableCell>
                      <div className="font-medium text-slate-900">{item.name}</div>
                      <div className="text-xs font-mono text-slate-400">{item.sku}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium text-slate-700">
                      {item.systemQty}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min="0"
                        value={item.countedQty}
                        onChange={(e) =>
                          onCountChange(item.productId, parseInt(e.target.value, 10) || 0)
                        }
                        className="h-8 text-right font-bold font-mono"
                      />
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      {variance === 0 ? (
                        <span className="text-emerald-600">0</span>
                      ) : variance > 0 ? (
                        <span className="text-blue-600">+{variance}</span>
                      ) : (
                        <span className="text-rose-600">{variance}</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Stocktake Number</TableHead>
                <TableHead>Audited Location</TableHead>
                <TableHead className="text-center">Items Counted</TableHead>
                <TableHead className="text-center">Variance Count</TableHead>
                <TableHead>Completed Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span>Loading stocktakes...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : stocktakes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    No stocktake audits recorded. Click &quot;Start New Stocktake&quot; to begin a physical count.
                  </TableCell>
                </TableRow>
              ) : (
                stocktakes.map((stk) => (
                  <TableRow key={stk._id} className="hover:bg-slate-50/70">
                    <TableCell className="font-mono font-semibold text-slate-900">
                      {stk.stocktakeNumber}
                    </TableCell>
                    <TableCell className="text-slate-800 font-medium">
                      {stk.locationName}
                    </TableCell>
                    <TableCell className="text-center">{stk.itemsCounted} items</TableCell>
                    <TableCell className="text-center">
                      {stk.varianceItems > 0 ? (
                        <Badge className="bg-amber-100 text-amber-800">
                          {stk.varianceItems} variances
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800">Zero variance</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {stk.completedAt ? new Date(stk.completedAt).toLocaleDateString() : "In progress"}
                    </TableCell>
                    <TableCell className="text-center">
                      {stk.status === "COMPLETED" ? (
                        <Badge className="bg-emerald-100 text-emerald-800">Completed</Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
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

