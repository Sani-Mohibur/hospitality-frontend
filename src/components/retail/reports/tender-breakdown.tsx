import React from "react";
import { Card } from "@/components/ui/card";
import { CreditCard, Banknote, Bed } from "lucide-react";
import { formatMinor } from "@/lib/retail-mock-data";
import { TenderBreakdownData } from "./types";

interface TenderBreakdownCardProps {
  tenderBreakdown: TenderBreakdownData;
  grossSalesMinor: number;
}

export function TenderBreakdownCard({
  tenderBreakdown,
  grossSalesMinor,
}: TenderBreakdownCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm p-4 bg-white">
      <h3 className="font-bold text-slate-900 text-sm mb-3">Tender Method Breakdown</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded text-blue-700">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600">Electronic Cards</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {formatMinor(tenderBreakdown.cardMinor)}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-700">
            {grossSalesMinor > 0
              ? Math.round((tenderBreakdown.cardMinor / grossSalesMinor) * 100)
              : 0}
            %
          </span>
        </div>

        <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded text-emerald-700">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600">Cash Collections</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {formatMinor(tenderBreakdown.cashMinor)}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700">
            {grossSalesMinor > 0
              ? Math.round((tenderBreakdown.cashMinor / grossSalesMinor) * 100)
              : 0}
            %
          </span>
        </div>

        <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded text-indigo-700">
              <Bed className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600">Room Folio Charges</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {formatMinor(tenderBreakdown.roomChargeMinor)}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-700">
            {grossSalesMinor > 0
              ? Math.round((tenderBreakdown.roomChargeMinor / grossSalesMinor) * 100)
              : 0}
            %
          </span>
        </div>
      </div>
    </Card>
  );
}
