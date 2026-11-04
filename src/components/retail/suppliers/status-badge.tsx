"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { RetailPurchaseOrder } from "./types";

interface StatusBadgeProps {
  status: RetailPurchaseOrder["status"];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "DRAFT":
      return <Badge variant="secondary" className="bg-slate-100 text-slate-700">Draft</Badge>;
    case "SENT":
      return <Badge className="bg-blue-100 text-blue-800">Sent to Supplier</Badge>;
    case "PARTIALLY_RECEIVED":
      return <Badge className="bg-amber-100 text-amber-800">Partially Received</Badge>;
    case "RECEIVED":
      return <Badge className="bg-emerald-100 text-emerald-800">Fully Received</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

