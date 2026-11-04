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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2 } from "lucide-react";
import { formatMinor } from "@/lib/retail-mock-data";
import { RetailProduct, calculateMargin } from "./types";

interface ProductViewModalProps {
  product: RetailProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: RetailProduct) => void;
}

export function ProductViewModal({
  product,
  isOpen,
  onClose,
  onEdit,
}: ProductViewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        {product && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold text-slate-900">
                  {product.name}
                </DialogTitle>
                <Badge
                  className={
                    product.isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                  }
                >
                  {product.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <DialogDescription>
                SKU: <span className="font-mono font-medium text-slate-700">{product.sku}</span>{" "}
                | Category: {product.categoryName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">Selling Price</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {formatMinor(product.priceMinor)}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">Cost Price</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {formatMinor(product.costPriceMinor)}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">Profit Margin</p>
                  <p className="text-lg font-bold text-emerald-600 mt-0.5">
                    {calculateMargin(product.priceMinor, product.costPriceMinor)}%
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-500 font-medium">Description: </span>
                  <span className="text-slate-700">
                    {product.description || "No description provided."}
                  </span>
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="text-slate-500 font-medium">Barcode: </span>
                    <span className="font-mono text-slate-700">{product.barcode || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Tax Category: </span>
                    <span className="text-slate-700">{product.taxCategory}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Unit: </span>
                    <span className="text-slate-700">{product.unitOfMeasure}</span>
                  </div>
                </div>
                {product.tags && product.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-slate-500 font-medium">Tags: </span>
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Variants List if present */}
              {product.hasVariants && product.variants.length > 0 && (
                <div className="border-t border-slate-200 pt-3">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">
                    Product Variants
                  </h4>
                  <div className="rounded-md border border-slate-200 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="text-xs">Variant Name</TableHead>
                          <TableHead className="text-xs">SKU</TableHead>
                          <TableHead className="text-xs text-right">Price</TableHead>
                          <TableHead className="text-xs text-right">Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.variants.map((v) => (
                          <TableRow key={v._id || v.sku}>
                            <TableCell className="text-xs font-medium text-slate-800">
                              {v.name}
                            </TableCell>
                            <TableCell className="text-xs font-mono text-slate-500">
                              {v.sku}
                            </TableCell>
                            <TableCell className="text-xs text-right font-medium">
                              {formatMinor(v.priceMinor)}
                            </TableCell>
                            <TableCell className="text-xs text-right text-slate-500">
                              {formatMinor(v.costPriceMinor)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  const toEdit = product;
                  onClose();
                  onEdit(toEdit);
                }}
                className="gap-1.5"
              >
                <Edit2 className="h-4 w-4" />
                Edit Product
              </Button>
              <Button onClick={onClose}>Close</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

