import React from "react";
import { Card } from "@/components/ui/card";
import { Package, CheckCircle2, Layers, Tag } from "lucide-react";

interface ProductsStatsProps {
  totalProducts: number;
  activeProducts: number;
  withVariantsCount: number;
  categoriesCount: number;
}

export function ProductsStats({
  totalProducts,
  activeProducts,
  withVariantsCount,
  categoriesCount,
}: ProductsStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Products</p>
            <h3 className="text-xl font-bold text-slate-900">{totalProducts}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Items</p>
            <h3 className="text-xl font-bold text-slate-900">{activeProducts}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">With Variants</p>
            <h3 className="text-xl font-bold text-slate-900">{withVariantsCount}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Categories</p>
            <h3 className="text-xl font-bold text-slate-900">{categoriesCount}</h3>
          </div>
        </div>
      </Card>
    </div>
  );
}

