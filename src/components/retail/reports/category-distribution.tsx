import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { formatMinor } from "@/lib/retail-mock-data";
import { CategoryBreakdownRow } from "./types";

interface CategoryDistributionProps {
  categories: CategoryBreakdownRow[];
  isLoading: boolean;
}

export function CategoryDistribution({
  categories,
  isLoading,
}: CategoryDistributionProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-slate-900">
          Sales Distribution by Category
        </CardTitle>
        <CardDescription className="text-xs">
          Revenue contribution across merchandise groups
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3.5">
        {isLoading ? (
          <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Loading breakdown...</span>
          </div>
        ) : categories.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No category transactions found in this period.
          </p>
        ) : (
          categories.slice(0, 6).map((cat) => (
            <div key={cat.categoryName} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-800">{cat.categoryName}</span>
                <span className="font-mono text-slate-900">
                  {formatMinor(cat.totalRevenueMinor)} ({cat.percentage}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(3, cat.percentage))}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

