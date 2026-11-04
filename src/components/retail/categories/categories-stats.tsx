import React from "react";
import { Card } from "@/components/ui/card";
import { Tag, CheckCircle2, Package } from "lucide-react";

interface CategoriesStatsProps {
  totalCategories: number;
  activeCategories: number;
  totalProducts: number;
}

export function CategoriesStats({
  totalCategories,
  activeCategories,
  totalProducts,
}: CategoriesStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Categories</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalCategories}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Categories</p>
            <h3 className="text-2xl font-bold text-slate-900">{activeCategories}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Categorized Products</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalProducts}</h3>
          </div>
        </div>
      </Card>
    </div>
  );
}

