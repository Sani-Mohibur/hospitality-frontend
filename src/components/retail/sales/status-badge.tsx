import React from "react";
import { Badge } from "@/components/ui/badge";
import { RetailSale } from "./types";

interface StatusBadgeProps {
  status: RetailSale["status"];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "COMPLETED":
      return <Badge className="bg-emerald-100 text-emerald-800">Completed</Badge>;
    case "PARTIALLY_REFUNDED":
      return <Badge className="bg-amber-100 text-amber-800">Partially Refunded</Badge>;
    case "REFUNDED":
      return <Badge className="bg-purple-100 text-purple-800">Refunded</Badge>;
    case "VOIDED":
      return <Badge variant="destructive">Voided</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

