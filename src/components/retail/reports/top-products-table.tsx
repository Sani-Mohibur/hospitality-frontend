import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { TopProductRow } from "./types";

interface TopProductsTableProps {
  products: TopProductRow[];
  isLoading: boolean;
}

export function TopProductsTable({
  products,
  isLoading,
}: TopProductsTableProps) {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-slate-900">
          Top Selling Products
        </CardTitle>
        <CardDescription className="text-xs">
          High velocity items generating the greatest return
        </CardDescription>
      </CardHeader>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="text-xs">Product Name</TableHead>
              <TableHead className="text-xs text-center">Units Sold</TableHead>
              <TableHead className="text-xs text-right">Gross Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Loading products...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-slate-400 text-xs">
                  No product sales recorded in this period.
                </TableCell>
              </TableRow>
            ) : (
              products.slice(0, 5).map((p) => (
                <TableRow key={p.productId || p.sku} className="hover:bg-slate-50/70 text-xs">
                  <TableCell>
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="font-mono text-[11px] text-slate-400">{p.sku}</div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-slate-800">
                    {p.totalQuantity}
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900">
                    {formatMinor(p.totalRevenueMinor)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

