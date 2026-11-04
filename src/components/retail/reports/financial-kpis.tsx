import React from "react";
import { Card } from "@/components/ui/card";
import { DollarSign, CreditCard, RotateCcw, TrendingUp } from "lucide-react";
import { formatMinor } from "@/lib/retail-mock-data";
import { SalesOverview } from "./types";

interface FinancialKpisProps {
  overview: SalesOverview;
}

export function FinancialKpis({ overview }: FinancialKpisProps) {
  const grossSalesMinor = overview.totalRevenueMinor;
  const netSalesMinor = overview.netRevenueMinor;
  const totalRefundMinor = overview.refundedMinor;
  const totalTaxMinor = overview.taxMinor;
  const totalDiscountMinor = overview.discountMinor;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <DollarSign className="h-4 w-4 text-emerald-600" />
          Gross Sales
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatMinor(grossSalesMinor)}</h3>
        <p className="text-[11px] text-slate-400 mt-1">
          {overview.transactionCount} transactions recorded
        </p>
      </Card>

      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <CreditCard className="h-4 w-4 text-blue-600" />
          Net Sales (Post-refund)
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatMinor(netSalesMinor)}</h3>
        <p className="text-[11px] text-slate-400 mt-1">Reflects all deductions</p>
      </Card>

      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <RotateCcw className="h-4 w-4 text-purple-600" />
          Total Refunds
        </div>
        <h3 className="text-2xl font-bold text-purple-700 mt-1">{formatMinor(totalRefundMinor)}</h3>
        <p className="text-[11px] text-slate-400 mt-1">Customer returns deducted</p>
      </Card>

      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <TrendingUp className="h-4 w-4 text-amber-600" />
          Tax & Discounts
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatMinor(totalTaxMinor)}</h3>
        <p className="text-[11px] text-slate-400 mt-1">
          Discounts: -{formatMinor(totalDiscountMinor)}
        </p>
      </Card>
    </div>
  );
}

