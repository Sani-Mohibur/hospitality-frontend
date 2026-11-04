import React from "react";
import { Card } from "@/components/ui/card";
import { DollarSign, Package, AlertTriangle } from "lucide-react";
import { formatMinor } from "@/lib/retail-mock-data";

interface InventoryKpisProps {
  totalStockOnHand: number;
  totalStockValuation: number;
  lowStockCount: number;
  filterLowStockOnly: boolean;
  onToggleLowStockFilter: () => void;
}

export function InventoryKpis({
  totalStockOnHand,
  totalStockValuation,
  lowStockCount,
  filterLowStockOnly,
  onToggleLowStockFilter,
}: InventoryKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Units On Hand</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {totalStockOnHand.toLocaleString()}
            </h3>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Inventory Valuation</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {formatMinor(totalStockValuation)}
            </h3>
          </div>
        </div>
      </Card>

      <Card
        className={`p-4 bg-white border-slate-200 shadow-sm cursor-pointer transition-all ${
          filterLowStockOnly ? "ring-2 ring-amber-500 bg-amber-50/20" : ""
        }`}
        onClick={onToggleLowStockFilter}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Low Stock Alerts</p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-amber-600">{lowStockCount}</h3>
              <span className="text-[11px] text-slate-400">
                {filterLowStockOnly ? "(Filtered)" : "(Click to filter)"}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

