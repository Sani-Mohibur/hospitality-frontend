import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

interface ProductsHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
  onOpenCreate: () => void;
}

export function ProductsHeader({
  isLoading,
  onRefresh,
  onOpenCreate,
}: ProductsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products Catalog</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your retail product listings, barcodes, variants, and pricing.
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
        <Button onClick={onOpenCreate} className="bg-primary hover:bg-primary/90 text-white gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>
    </div>
  );
}

