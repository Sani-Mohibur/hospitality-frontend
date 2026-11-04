"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { formatMinor } from "@/lib/retail-mock-data";
import { RetailPurchaseOrder } from "./types";

interface PurchaseOrderKpisProps {
  purchaseOrders: RetailPurchaseOrder[];
}

export function PurchaseOrderKpis({ purchaseOrders }: PurchaseOrderKpisProps) {
  const activeCount = purchaseOrders.filter(
    (p) => p.status === "SENT" || p.status === "PARTIALLY_RECEIVED"
  ).length;

  const pendingArrivalCount = purchaseOrders.filter((p) => p.status === "SENT").length;

  const completedCount = purchaseOrders.filter((p) => p.status === "RECEIVED").length;

  const totalValueMinor = purchaseOrders.reduce((sum, p) => sum + p.subtotalMinor, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <p className="text-xs font-medium text-slate-500">Active POs</p>
        <h3 className="text-xl font-bold text-slate-900 mt-1">{activeCount}</h3>
      </Card>
      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <p className="text-xs font-medium text-slate-500">Pending Goods Arrival</p>
        <h3 className="text-xl font-bold text-amber-600 mt-1">{pendingArrivalCount} orders</h3>
      </Card>
      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <p className="text-xs font-medium text-slate-500">Completed Orders</p>
        <h3 className="text-xl font-bold text-emerald-600 mt-1">{completedCount}</h3>
      </Card>
      <Card className="p-4 bg-white border-slate-200 shadow-sm">
        <p className="text-xs font-medium text-slate-500">Total Procurement Value</p>
        <h3 className="text-xl font-bold text-slate-900 mt-1">{formatMinor(totalValueMinor)}</h3>
      </Card>
    </div>
  );
}

