"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sparkles, Plus, Loader2 } from "lucide-react";
import { formatMinor } from "@/lib/retail-mock-data";
import { RestockSuggestion } from "./types";

interface RestockSuggestionsTabProps {
  suggestions: RestockSuggestion[];
  isLoading: boolean;
}

export function RestockSuggestionsTab({
  suggestions,
  isLoading,
}: RestockSuggestionsTabProps) {
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-amber-50/60 border-amber-200 shadow-sm flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-amber-900">Automated Replenishment Engine</p>
          <p className="text-amber-800 text-xs mt-0.5">
            The following products have breached minimum thresholds (reorder point) and require procurement to maintain optimal shelf availability.
          </p>
        </div>
      </Card>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Preferred Supplier</TableHead>
                <TableHead className="text-right">On Hand</TableHead>
                <TableHead className="text-right">Reorder Point</TableHead>
                <TableHead className="text-right">Par Level</TableHead>
                <TableHead className="text-right">Suggested Order Qty</TableHead>
                <TableHead className="text-right">Est. Cost</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span>Calculating replenishment requirements...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : suggestions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                    All products are currently stocked at optimal levels. No replenishment needed!
                  </TableCell>
                </TableRow>
              ) : (
                suggestions.map((item) => (
                  <TableRow key={item._id} className="hover:bg-slate-50/70">
                    <TableCell>
                      <div className="font-semibold text-slate-900">{item.productName}</div>
                      <div className="text-xs font-mono text-slate-400">{item.sku}</div>
                    </TableCell>
                    <TableCell className="text-slate-700 text-sm">
                      {item.supplierName || "—"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-rose-600">
                      {item.onHand}
                    </TableCell>
                    <TableCell className="text-right text-slate-600">{item.reorderPoint}</TableCell>
                    <TableCell className="text-right text-slate-600">{item.parLevel}</TableCell>
                    <TableCell className="text-right font-bold text-emerald-600 font-mono">
                      +{item.suggestedQty}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      {formatMinor(item.estimatedCostMinor)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href="/tenant/retail/suppliers">
                        <Button
                          size="sm"
                          className="h-8 text-xs bg-primary hover:bg-primary/90 text-white gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Draft PO
                        </Button>
                      </Link>
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

