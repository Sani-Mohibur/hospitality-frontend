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
import { Warehouse, AlertTriangle, SlidersHorizontal, Loader2 } from "lucide-react";
import { RetailStockItem } from "./types";

interface InventoryTableProps {
  items: RetailStockItem[];
  isLoading: boolean;
  onOpenAdjust: (item: RetailStockItem) => void;
}

export function InventoryTable({
  items,
  isLoading,
  onOpenAdjust,
}: InventoryTableProps) {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[260px]">Product / SKU</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">On Hand</TableHead>
              <TableHead className="text-right">Reserved</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead className="text-right">Reorder Point</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              <TableHead className="text-center">Stock Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-sm font-medium">Loading stock levels...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Warehouse className="h-8 w-8 text-slate-300" />
                    <p className="text-sm font-medium">No inventory items matched your criteria</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const isLow = item.onHand <= item.reorderPoint;
                const isCritical = item.onHand === 0;

                return (
                  <TableRow key={item._id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-slate-900">{item.productName}</div>
                      <div className="text-xs font-mono text-slate-500 mt-0.5">{item.sku}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50 font-normal text-slate-700">
                        {item.locationName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      {item.onHand}
                    </TableCell>
                    <TableCell className="text-right text-slate-500">
                      {item.reserved > 0 ? (
                        <span className="text-amber-600 font-medium">{item.reserved}</span>
                      ) : (
                        0
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-700">
                      {item.available}
                    </TableCell>
                    <TableCell className="text-right text-slate-500 font-mono text-xs">
                      {item.reorderPoint} (Par: {item.parLevel})
                    </TableCell>
                    <TableCell className="text-right text-slate-600 font-mono">
                      ${item.unitCost.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      {isCritical ? (
                        <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">
                          Out of Stock
                        </Badge>
                      ) : isLow ? (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 flex items-center gap-1 mx-auto w-fit">
                          <AlertTriangle className="h-3 w-3" />
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                          Optimal
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={() => onOpenAdjust(item)}
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
                        Adjust
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

