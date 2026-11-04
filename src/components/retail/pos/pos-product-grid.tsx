import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from "lucide-react";
import { formatMinor } from "@/lib/retail-mock-data";
import { RetailProduct } from "./types";

interface PosProductGridProps {
  products: RetailProduct[];
  isLoading: boolean;
  onAddToCart: (product: RetailProduct) => void;
}

export function PosProductGrid({
  products,
  isLoading,
  onAddToCart,
}: PosProductGridProps) {
  return (
    <div className="flex-1 overflow-y-auto pr-1">
      {isLoading ? (
        <div className="h-64 flex items-center justify-center gap-2 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Loading catalogue...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
          <p className="font-semibold text-slate-600">No products found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting search or category filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {products.map((p) => (
            <Card
              key={p._id}
              onClick={() => onAddToCart(p)}
              className="cursor-pointer border-slate-200 hover:border-primary/50 hover:shadow-md transition-all group flex flex-col justify-between overflow-hidden bg-white active:scale-[0.98]"
            >
              <div className="p-3.5 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] font-mono uppercase font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {p.categoryName}
                    </span>
                    {p.hasVariants && (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0">
                        Variants
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm mt-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {p.name}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">{p.sku}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-base">
                    {formatMinor(p.priceMinor)}
                  </span>
                  <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <Plus className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
