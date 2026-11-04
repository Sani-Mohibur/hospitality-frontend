import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

interface CategoriesHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
  onOpenCreate: () => void;
}

export function CategoriesHeader({
  isLoading,
  onRefresh,
  onOpenCreate,
}: CategoriesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categories</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Organize retail items into categories for streamlined inventory and POS navigation.
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
          Add Category
        </Button>
      </div>
    </div>
  );
}

