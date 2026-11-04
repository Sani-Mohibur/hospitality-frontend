import React from "react";
import { Button } from "@/components/ui/button";
import { History, RefreshCw } from "lucide-react";

interface InventoryHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
  onOpenHistory: () => void;
}

export function InventoryHeader({
  isLoading,
  onRefresh,
  onOpenHistory,
}: InventoryHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Retail Inventory</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Monitor real-time on-hand levels, location distribution, and perform stock adjustments.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="gap-1.5 text-slate-600"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button
          variant="outline"
          onClick={onOpenHistory}
          className="gap-2 border-slate-200"
        >
          <History className="h-4 w-4 text-slate-600" />
          Movement History
        </Button>
      </div>
    </div>
  );
}

