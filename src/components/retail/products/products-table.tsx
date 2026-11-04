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
import { Package, Barcode, Eye, Edit2, Trash2, Loader2 } from "lucide-react";
import { formatMinor } from "@/lib/retail-mock-data";
import { RetailProduct, calculateMargin } from "./types";

interface ProductsTableProps {
  products: RetailProduct[];
  isLoading: boolean;
  onClearFilters: () => void;
  onToggleStatus: (product: RetailProduct) => void;
  onViewProduct: (product: RetailProduct) => void;
  onEditProduct: (product: RetailProduct) => void;
  onDeleteProduct: (id: string, name: string) => void;
}

export function ProductsTable({
  products,
  isLoading,
  onClearFilters,
  onToggleStatus,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
}: ProductsTableProps) {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[280px]">Product / SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Margin</TableHead>
              <TableHead className="text-center">Variants</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-sm font-medium">Loading retail product catalog...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-36 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Package className="h-8 w-8 text-slate-300" />
                    <p className="text-sm font-medium">No products match your search or filter</p>
                    <Button variant="link" size="sm" onClick={onClearFilters}>
                      Reset filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const margin = calculateMargin(product.priceMinor, product.costPriceMinor);
                return (
                  <TableRow key={product._id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell>
                      <div className="font-semibold text-slate-900">{product.name}</div>
                      <div className="text-xs font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                        <span>{product.sku}</span>
                        {product.unitOfMeasure && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                            {product.unitOfMeasure}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50 font-normal text-slate-700">
                        {product.categoryName || "General"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.barcode ? (
                        <span className="text-xs font-mono text-slate-600 flex items-center gap-1">
                          <Barcode className="h-3 w-3 text-slate-400" />
                          {product.barcode}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-900">
                      {formatMinor(product.priceMinor)}
                    </TableCell>
                    <TableCell className="text-right text-slate-600">
                      {formatMinor(product.costPriceMinor)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                          Number(margin) >= 40
                            ? "bg-emerald-50 text-emerald-700"
                            : Number(margin) >= 20
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {margin}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {product.hasVariants ? (
                        <Badge
                          variant="secondary"
                          className="bg-purple-50 text-purple-700 border-purple-200"
                        >
                          {(product.variants || []).length} Variants
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">Single</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => onToggleStatus(product)}
                        className="inline-flex items-center"
                        title="Click to toggle status"
                      >
                        {product.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 cursor-pointer">
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                          >
                            Inactive
                          </Badge>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-600 hover:text-slate-900"
                          onClick={() => onViewProduct(product)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-600 hover:text-slate-900"
                          onClick={() => onEditProduct(product)}
                          title="Edit Product"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => onDeleteProduct(product._id, product.name)}
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

