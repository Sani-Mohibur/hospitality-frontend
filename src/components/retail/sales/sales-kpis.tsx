import React from "react";
import { Card } from "@/components/ui/card";
import { DollarSign, Receipt, RotateCcw } from "lucide-react";
import { formatMinor } from "@/lib/retail-mock-data";

interface SalesKpisProps {
  totalRevenue: number;
  totalTransactions: number;
  totalRefunded: number;
}

export function SalesKpis({
  totalRevenue,
  totalTransactions,
  totalRefunded,
}: SalesKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Gross Sales Volume</p>
            <h3 className="text-2xl font-bold text-slate-900">{formatMinor(totalRevenue)}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Transactions</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalTransactions} orders</h3>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Refunds Processed</p>
            <h3 className="text-2xl font-bold text-purple-700">{formatMinor(totalRefunded)}</h3>
          </div>
        </div>
      </Card>
    </div>
  );
}

