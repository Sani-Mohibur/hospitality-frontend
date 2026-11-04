import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface InventoryFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedLocation: string;
  onLocationChange: (value: string) => void;
  locations: string[];
  filterLowStockOnly: boolean;
  onClearLowStockFilter: () => void;
}

export function InventoryFilterBar({
  searchQuery,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  locations,
  filterLowStockOnly,
  onClearLowStockFilter,
}: InventoryFilterBarProps) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search items by product name, SKU, or barcode..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
            <div className="w-full sm:w-48">
              <Select
                value={selectedLocation}
                onValueChange={(val) => val && onLocationChange(val)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filterLowStockOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearLowStockFilter}
                className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
              >
                Clear Alert Filter
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

