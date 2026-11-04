"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { useLocation } from "@/lib/location-context";
import { toast } from "sonner";
import {
  RetailStockItem,
  StockMovement,
  RawInventoryItem,
  RawStockMovement,
  normalizeStockItem,
  normalizeStockMovement,
  ApplyAdjustmentParams,
  InventoryHeader,
  InventoryKpis,
  InventoryFilterBar,
  InventoryTable,
  StockAdjustmentModal,
  MovementHistoryModal,
} from "@/components/retail/inventory";

export type {
  RetailStockItem,
  StockMovement,
} from "@/components/retail/inventory";

export default function RetailInventoryPage() {
  const { currentLocation, locations: availableLocations } = useLocation();

  const [stockItems, setStockItems] = useState<RetailStockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("ALL");
  const [filterLowStockOnly, setFilterLowStockOnly] = useState<boolean>(false);

  // Adjustment Modal
  const [adjustItem, setAdjustItem] = useState<RetailStockItem | null>(null);

  // History Modal
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchStockData = useCallback(() => {
    setIsLoading(true);
    setError(null);

    const params: Record<string, string | number> = { limit: 200 };
    if (currentLocation?._id) {
      params.locationId = currentLocation._id;
    }

    apiClient
      .get<RawInventoryItem[] | { data: RawInventoryItem[] }>("/retail/inventory", {
        params,
      })
      .then((res) => {
        const raw = res.data;
        const rawList = Array.isArray(raw)
          ? raw
          : raw && typeof raw === "object" && Array.isArray(raw.data)
          ? raw.data
          : [];

        setStockItems(rawList.map(normalizeStockItem));
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load retail inventory";
        setError(msg);
        toast.error(msg);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentLocation]);

  const fetchMovements = useCallback(() => {
    setIsLoadingHistory(true);
    const params: Record<string, string | number> = { limit: 100 };
    if (currentLocation?._id) {
      params.locationId = currentLocation._id;
    }

    apiClient
      .get<RawStockMovement[] | { data: RawStockMovement[] }>("/retail/inventory/movements", {
        params,
      })
      .then((res) => {
        const raw = res.data;
        const rawList = Array.isArray(raw)
          ? raw
          : raw && typeof raw === "object" && Array.isArray(raw.data)
          ? raw.data
          : [];

        setMovements(rawList.map(normalizeStockMovement));
      })
      .catch(() => {
        // Silently preserve current movements on error
      })
      .finally(() => {
        setIsLoadingHistory(false);
      });
  }, [currentLocation]);

  useEffect(() => {
    let ignore = false;

    const params: Record<string, string | number> = { limit: 200 };
    if (currentLocation?._id) {
      params.locationId = currentLocation._id;
    }

    apiClient
      .get<RawInventoryItem[] | { data: RawInventoryItem[] }>("/retail/inventory", {
        params,
      })
      .then((res) => {
        if (!ignore) {
          setError(null);
          const raw = res.data;
          const rawList = Array.isArray(raw)
            ? raw
            : raw && typeof raw === "object" && Array.isArray(raw.data)
            ? raw.data
            : [];

          setStockItems(rawList.map(normalizeStockItem));
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Failed to load retail inventory";
          setError(msg);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentLocation]);

  // Available locations
  const locations = useMemo(() => {
    const locSet = new Set<string>();
    stockItems.forEach((s) => {
      if (s.locationName) locSet.add(s.locationName);
    });
    if (availableLocations && availableLocations.length > 0) {
      availableLocations.forEach((l) => {
        if (l.name) locSet.add(l.name);
      });
    }
    return Array.from(locSet);
  }, [stockItems, availableLocations]);

  // Filtered Stock Items
  const filteredStock = useMemo(() => {
    return stockItems.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.productName.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        (item.barcode && item.barcode.includes(searchQuery));

      const matchesLocation =
        selectedLocation === "ALL" || item.locationName === selectedLocation;

      const isLowStock = item.onHand <= item.reorderPoint;
      const matchesLowStock = !filterLowStockOnly || isLowStock;

      return matchesSearch && matchesLocation && matchesLowStock;
    });
  }, [stockItems, searchQuery, selectedLocation, filterLowStockOnly]);

  const handleApplyAdjustment = async (params: ApplyAdjustmentParams) => {
    setIsAdjusting(true);

    try {
      const reasonText = params.notes
        ? `${params.reason}: ${params.notes}`
        : params.reason;
      await apiClient.post("/retail/inventory/adjust", {
        stockItemId: params.stockItemId,
        quantityChange: params.quantity,
        type: params.type === "INCREASE" ? "ADD" : "SUBTRACT",
        reason: reasonText,
      });

      toast.success(
        `Stock adjusted successfully (${params.type === "INCREASE" ? "+" : "-"}${params.quantity})`
      );

      const diff = params.type === "INCREASE" ? params.quantity : -params.quantity;
      setStockItems((prev) =>
        prev.map((item) => {
          if (item._id === params.stockItemId) {
            const newOnHand = Math.max(0, item.onHand + diff);
            const newAvailable = Math.max(0, newOnHand - item.reserved);
            return {
              ...item,
              onHand: newOnHand,
              available: newAvailable,
            };
          }
          return item;
        })
      );

      setAdjustItem(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to apply adjustment");
    } finally {
      setIsAdjusting(false);
    }
  };

  const openHistoryModal = () => {
    setIsHistoryOpen(true);
    fetchMovements();
  };

  // KPI calculations
  const totalStockOnHand = stockItems.reduce((acc, curr) => acc + curr.onHand, 0);
  const totalStockValuation = stockItems.reduce(
    (acc, curr) => acc + curr.onHand * curr.unitCost * 100,
    0
  );
  const lowStockCount = stockItems.filter((item) => item.onHand <= item.reorderPoint).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <InventoryHeader
        isLoading={isLoading}
        onRefresh={fetchStockData}
        onOpenHistory={openHistoryModal}
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-red-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStockData}
            className="text-red-800 border-red-300"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Retry
          </Button>
        </div>
      )}

      {/* KPI Cards */}
      <InventoryKpis
        totalStockOnHand={totalStockOnHand}
        totalStockValuation={totalStockValuation}
        lowStockCount={lowStockCount}
        filterLowStockOnly={filterLowStockOnly}
        onToggleLowStockFilter={() => setFilterLowStockOnly(!filterLowStockOnly)}
      />

      {/* Filter and Search Bar */}
      <InventoryFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        locations={locations}
        filterLowStockOnly={filterLowStockOnly}
        onClearLowStockFilter={() => setFilterLowStockOnly(false)}
      />

      {/* Inventory Table */}
      <InventoryTable
        items={filteredStock}
        isLoading={isLoading}
        onOpenAdjust={setAdjustItem}
      />

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentModal
        item={adjustItem}
        isOpen={!!adjustItem}
        onClose={() => setAdjustItem(null)}
        onApplyAdjustment={handleApplyAdjustment}
        isAdjusting={isAdjusting}
      />

      {/* Movement History Dialog */}
      <MovementHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        isLoading={isLoadingHistory}
        movements={movements}
      />
    </div>
  );
}
