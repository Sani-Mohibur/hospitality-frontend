"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftRight,
  ClipboardCheck,
  Sparkles,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useLocation } from "@/lib/location-context";
import { toast } from "sonner";
import {
  RetailTransferLine,
  RetailTransfer,
  RetailStocktakeLine,
  RetailStocktake,
  RestockSuggestion,
  ProductOption,
  ActiveStocktakeAudit,
  RawTransferLine,
  RawTransfer,
  RawStocktakeLine,
  RawStocktake,
  RawRestockSuggestion,
  RawProductOption,
  LocationTransfersTab,
  StocktakeTab,
  RestockSuggestionsTab,
  CreateTransferModal,
} from "@/components/retail/stock-ops";

// Re-export domain interfaces for backward-compatibility with other modules
export type {
  RetailTransferLine,
  RetailTransfer,
  RetailStocktakeLine,
  RetailStocktake,
  RestockSuggestion,
  ProductOption,
  ActiveStocktakeAudit,
};

export default function RetailStockOpsPage() {
  const { currentLocation, locations } = useLocation();

  const [activeTab, setActiveTab] = useState<"TRANSFERS" | "STOCKTAKE" | "SUGGESTIONS">("TRANSFERS");

  // Transfers
  const [transfers, setTransfers] = useState<RetailTransfer[]>([]);
  const [isLoadingTransfers, setIsLoadingTransfers] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Stocktakes
  const [stocktakes, setStocktakes] = useState<RetailStocktake[]>([]);
  const [isLoadingStocktakes, setIsLoadingStocktakes] = useState(true);
  const [activeStocktakeAudit, setActiveStocktakeAudit] = useState<ActiveStocktakeAudit | null>(null);

  // Suggestions
  const [restockSuggestions, setRestockSuggestions] = useState<RestockSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);

  // Products for transfer line selector
  const [availableProducts, setAvailableProducts] = useState<ProductOption[]>([]);

  // Action state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Transfers
  const fetchTransfers = useCallback(() => {
    setIsLoadingTransfers(true);
    const params: Record<string, string> = {};
    if (currentLocation?._id) {
      params.locationId = currentLocation._id;
    }
    apiClient
      .get<RawTransfer[]>("/retail/transfer", { params })
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : [];
        const mapped: RetailTransfer[] = raw.map((t) => {
          const fromName =
            typeof t.fromLocationId === "object" && t.fromLocationId?.name
              ? t.fromLocationId.name
              : t.fromLocationName || "Origin";
          const toName =
            typeof t.toLocationId === "object" && t.toLocationId?.name
              ? t.toLocationId.name
              : t.toLocationName || "Destination";
          const lines: RetailTransferLine[] = (t.lines || []).map((l: RawTransferLine) => ({
            productId: typeof l.productId === "object" ? l.productId?._id || "" : l.productId || "",
            productName:
              typeof l.productId === "object" && l.productId?.name
                ? l.productId.name
                : l.productName || l.name || "Item",
            sku: typeof l.productId === "object" && l.productId?.sku ? l.productId.sku : l.sku || "",
            quantity: l.quantity || 0,
            unitCost: l.unitCost ? l.unitCost / 100 : undefined,
          }));

          return {
            _id: t._id,
            transferNumber: t.transferNumber || `TRF-${t._id.slice(-6).toUpperCase()}`,
            fromLocationId: typeof t.fromLocationId === "object" ? t.fromLocationId?._id : t.fromLocationId,
            fromLocation: fromName,
            toLocationId: typeof t.toLocationId === "object" ? t.toLocationId?._id : t.toLocationId,
            toLocation: toName,
            status: t.status,
            lines,
            notes: t.notes,
            createdAt: t.createdAt,
          };
        });
        setTransfers(mapped);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load transfers";
        setError(msg);
      })
      .finally(() => {
        setIsLoadingTransfers(false);
      });
  }, [currentLocation]);

  // 2. Fetch Stocktakes
  const fetchStocktakes = useCallback(() => {
    setIsLoadingStocktakes(true);
    const params: Record<string, string> = {};
    if (currentLocation?._id) {
      params.locationId = currentLocation._id;
    }
    apiClient
      .get<RawStocktake[]>("/retail/stocktake", { params })
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : [];
        const mapped: RetailStocktake[] = raw.map((s) => {
          const locName =
            typeof s.locationId === "object" && s.locationId?.name
              ? s.locationId.name
              : s.locationName || "Store";
          const lines: RetailStocktakeLine[] = (s.lines || []).map((l: RawStocktakeLine) => ({
            productId: typeof l.productId === "object" ? l.productId?._id || "" : l.productId || "",
            variantId: typeof l.variantId === "object" ? l.variantId?._id : l.variantId,
            stockItemId: typeof l.stockItemId === "object" ? l.stockItemId?._id || "" : l.stockItemId || "",
            productName: l.productName || l.name || "Item",
            sku: l.sku || "",
            systemQty: l.systemQty || 0,
            countedQty: l.countedQty,
            unitCost: l.unitCost,
          }));

          const varianceCount = lines.filter(
            (l) => l.countedQty !== undefined && l.countedQty !== l.systemQty
          ).length;

          return {
            _id: s._id,
            stocktakeNumber: s.stocktakeNumber || `STK-${s._id.slice(-6).toUpperCase()}`,
            locationId: typeof s.locationId === "object" ? s.locationId?._id : s.locationId,
            locationName: locName,
            status: s.status,
            itemsCounted: lines.length,
            varianceItems: varianceCount,
            lines,
            createdAt: s.createdAt,
            completedAt: s.completedAt,
          };
        });
        setStocktakes(mapped);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load stocktakes";
        setError(msg);
      })
      .finally(() => {
        setIsLoadingStocktakes(false);
      });
  }, [currentLocation]);

  // 3. Fetch Restock Suggestions
  const fetchSuggestions = useCallback(() => {
    setIsLoadingSuggestions(true);
    const params: Record<string, string> = {};
    if (currentLocation?._id) {
      params.locationId = currentLocation._id;
    }
    apiClient
      .get<RawRestockSuggestion[]>("/retail/inventory/restock-suggestions", { params })
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : [];
        const mapped: RestockSuggestion[] = raw.map((item) => {
          const onHand = item.quantity ?? item.onHand ?? 0;
          const reorderPoint = item.reorderPoint ?? 10;
          const parLevel = item.parLevel ?? 20;
          const reorderQty = item.reorderQty ?? 10;
          const suggestedQty = Math.max(reorderQty, parLevel - onHand);
          const unitCostMinor = item.unitCost ?? (item.costPriceMinor || 1000);
          const estimatedCostMinor = suggestedQty * unitCostMinor;

          return {
            _id: item._id,
            productId: typeof item.productId === "object" ? item.productId?._id || "" : item.productId || "",
            productName:
              item.name ||
              item.productName ||
              (typeof item.productId === "object" ? item.productId?.name : "Item") ||
              "Item",
            sku: item.sku || "",
            supplierName:
              typeof item.supplierId === "object" && item.supplierId?.name
                ? item.supplierId.name
                : item.supplierName || undefined,
            onHand,
            reorderPoint,
            parLevel,
            suggestedQty,
            estimatedCostMinor,
            unitCost: unitCostMinor / 100,
          };
        });
        setRestockSuggestions(mapped);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load restock suggestions";
        setError(msg);
      })
      .finally(() => {
        setIsLoadingSuggestions(false);
      });
  }, [currentLocation]);

  // Initial load
  useEffect(() => {
    let ignore = false;

    const params: Record<string, string> = {};
    if (currentLocation?._id) {
      params.locationId = currentLocation._id;
    }

    Promise.all([
      apiClient.get<RawTransfer[]>("/retail/transfer", { params }),
      apiClient.get<RawStocktake[]>("/retail/stocktake", { params }),
      apiClient.get<RawRestockSuggestion[]>("/retail/inventory/restock-suggestions", { params }),
      apiClient.get<RawProductOption[]>("/retail/product"),
    ])
      .then(([trRes, stkRes, sugRes, prodRes]) => {
        if (!ignore) {
          setError(null);
          // Transfers
          const rawTr = Array.isArray(trRes.data) ? trRes.data : [];
          setTransfers(
            rawTr.map((t) => ({
              _id: t._id,
              transferNumber: t.transferNumber || `TRF-${t._id.slice(-6).toUpperCase()}`,
              fromLocationId: typeof t.fromLocationId === "object" ? t.fromLocationId?._id : t.fromLocationId,
              fromLocation:
                typeof t.fromLocationId === "object" && t.fromLocationId?.name
                  ? t.fromLocationId.name
                  : t.fromLocationName || "Origin",
              toLocationId: typeof t.toLocationId === "object" ? t.toLocationId?._id : t.toLocationId,
              toLocation:
                typeof t.toLocationId === "object" && t.toLocationId?.name
                  ? t.toLocationId.name
                  : t.toLocationName || "Destination",
              status: t.status,
              lines: (t.lines || []).map((l: RawTransferLine) => ({
                productId: typeof l.productId === "object" ? l.productId?._id || "" : l.productId || "",
                productName:
                  typeof l.productId === "object" && l.productId?.name
                    ? l.productId.name
                    : l.productName || l.name || "Item",
                sku: typeof l.productId === "object" && l.productId?.sku ? l.productId.sku : l.sku || "",
                quantity: l.quantity || 0,
                unitCost: l.unitCost ? l.unitCost / 100 : undefined,
              })),
              notes: t.notes,
              createdAt: t.createdAt,
            }))
          );

          // Stocktakes
          const rawStk = Array.isArray(stkRes.data) ? stkRes.data : [];
          setStocktakes(
            rawStk.map((s) => {
              const lines: RetailStocktakeLine[] = (s.lines || []).map((l: RawStocktakeLine) => ({
                productId: typeof l.productId === "object" ? l.productId?._id || "" : l.productId || "",
                variantId: typeof l.variantId === "object" ? l.variantId?._id : l.variantId,
                stockItemId: typeof l.stockItemId === "object" ? l.stockItemId?._id || "" : l.stockItemId || "",
                productName: l.productName || l.name || "Item",
                sku: l.sku || "",
                systemQty: l.systemQty || 0,
                countedQty: l.countedQty,
                unitCost: l.unitCost,
              }));
              const varianceCount = lines.filter(
                (l) => l.countedQty !== undefined && l.countedQty !== l.systemQty
              ).length;

              return {
                _id: s._id,
                stocktakeNumber: s.stocktakeNumber || `STK-${s._id.slice(-6).toUpperCase()}`,
                locationId: typeof s.locationId === "object" ? s.locationId?._id : s.locationId,
                locationName:
                  typeof s.locationId === "object" && s.locationId?.name
                    ? s.locationId.name
                    : s.locationName || "Store",
                status: s.status,
                itemsCounted: lines.length,
                varianceItems: varianceCount,
                lines,
                createdAt: s.createdAt,
                completedAt: s.completedAt,
              };
            })
          );

          // Suggestions
          const rawSug = Array.isArray(sugRes.data) ? sugRes.data : [];
          setRestockSuggestions(
            rawSug.map((item) => {
              const onHand = item.quantity ?? item.onHand ?? 0;
              const reorderPoint = item.reorderPoint ?? 10;
              const parLevel = item.parLevel ?? 20;
              const reorderQty = item.reorderQty ?? 10;
              const suggestedQty = Math.max(reorderQty, parLevel - onHand);
              const unitCostMinor = item.unitCost ?? (item.costPriceMinor || 1000);
              return {
                _id: item._id,
                productId: typeof item.productId === "object" ? item.productId?._id || "" : item.productId || "",
                productName:
                  item.name ||
                  item.productName ||
                  (typeof item.productId === "object" ? item.productId?.name : "Item") ||
                  "Item",
                sku: item.sku || "",
                supplierName:
                  typeof item.supplierId === "object" && item.supplierId?.name
                    ? item.supplierId.name
                    : item.supplierName || undefined,
                onHand,
                reorderPoint,
                parLevel,
                suggestedQty,
                estimatedCostMinor: suggestedQty * unitCostMinor,
                unitCost: unitCostMinor / 100,
              };
            })
          );

          // Products
          const rawProd = Array.isArray(prodRes.data) ? prodRes.data : [];
          setAvailableProducts(
            rawProd.map((p) => ({
              _id: p._id,
              name: p.name,
              sku: p.sku || "",
              costPriceMinor: p.costPriceMinor || 0,
            }))
          );
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Failed to load stock operations";
          setError(msg);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoadingTransfers(false);
          setIsLoadingStocktakes(false);
          setIsLoadingSuggestions(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentLocation]);

  // Open Transfer Modal
  const handleOpenTransferModal = () => {
    if (locations.length < 2) {
      toast.error("Internal transfers require at least two configured tenant locations.");
      return;
    }
    if (availableProducts.length === 0) {
      toast.error("No retail products available to transfer.");
      return;
    }
    setIsTransferModalOpen(true);
  };

  // Create Transfer
  const handleCreateTransferSubmit = async (data: {
    fromLocationId: string;
    toLocationId: string;
    lines: Array<{ productId: string; quantity: number }>;
    notes?: string;
  }) => {
    setIsSubmitting(true);
    try {
      const payload = {
        fromLocationId: data.fromLocationId,
        toLocationId: data.toLocationId,
        lines: data.lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
        })),
        notes: data.notes?.trim() || undefined,
        autoDispatch: true,
      };

      const res = await apiClient.post<RawTransfer>("/retail/transfer", payload);
      toast.success(`Transfer ${res.data.transferNumber || "request"} created & dispatched!`);
      setIsTransferModalOpen(false);
      fetchTransfers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create transfer";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Acknowledge Receipt
  const handleReceiveTransfer = async (transferId: string) => {
    try {
      await apiClient.post(`/retail/transfer/${transferId}/receive`);
      toast.success("Stock transfer acknowledged & received into destination inventory!");
      fetchTransfers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to acknowledge receipt";
      toast.error(msg);
    }
  };

  // Stocktake audit start
  const handleStartStocktake = async () => {
    const locId = currentLocation?._id || locations[0]?._id;
    if (!locId) {
      toast.error("Please select a location to audit.");
      return;
    }

    const locName = locations.find((l) => l._id === locId)?.name || "Store";

    setIsSubmitting(true);
    try {
      const res = await apiClient.post<RawStocktake>("/retail/stocktake", {
        name: `Audit - ${locName} - ${new Date().toLocaleDateString()}`,
        locationId: locId,
      });

      const stk = res.data;
      const items = (stk.lines || []).map((l: RawStocktakeLine) => ({
        productId: typeof l.productId === "object" ? l.productId?._id || "" : l.productId || "",
        stockItemId: typeof l.stockItemId === "object" ? l.stockItemId?._id || "" : l.stockItemId || "",
        name: l.productName || l.name || "Item",
        sku: l.sku || "",
        systemQty: l.systemQty || 0,
        countedQty: l.systemQty || 0,
      }));

      setActiveStocktakeAudit({
        _id: stk._id,
        stocktakeNumber: stk.stocktakeNumber || `STK-${Date.now().toString().slice(-4)}`,
        location: locName,
        items,
      });

      toast.success(`Started new stocktake audit ${stk.stocktakeNumber}!`);
      fetchStocktakes();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to start stocktake";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCountChange = (productId: string, val: number) => {
    if (!activeStocktakeAudit) return;
    setActiveStocktakeAudit({
      ...activeStocktakeAudit,
      items: activeStocktakeAudit.items.map((item) =>
        item.productId === productId ? { ...item, countedQty: Math.max(0, val) } : item
      ),
    });
  };

  const handleCommitStocktake = async () => {
    if (!activeStocktakeAudit) return;
    setIsSubmitting(true);
    try {
      // 1. Record counts
      const countsPayload = {
        lines: activeStocktakeAudit.items.map((i) => ({
          stockItemId: i.stockItemId,
          countedQty: i.countedQty,
        })),
        notes: "Counted physical quantities entered via portal",
      };
      await apiClient.post(`/retail/stocktake/${activeStocktakeAudit._id}/counts`, countsPayload);

      // 2. Reconcile & Post
      await apiClient.post(`/retail/stocktake/${activeStocktakeAudit._id}/post`, {
        notes: "Reconciled and approved audit counts",
      });

      toast.success(`Stocktake ${activeStocktakeAudit.stocktakeNumber} reconciled and completed!`);
      setActiveStocktakeAudit(null);
      fetchStocktakes();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to complete stocktake";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Stock Operations</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Internal stock movements, physical audits (stocktakes), and automated replenishment.
          </p>
        </div>

        {activeTab === "TRANSFERS" && (
          <Button
            onClick={handleOpenTransferModal}
            className="bg-primary hover:bg-primary/90 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            New Transfer Request
          </Button>
        )}
        {activeTab === "STOCKTAKE" && !activeStocktakeAudit && (
          <Button
            onClick={handleStartStocktake}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-white gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ClipboardCheck className="h-4 w-4" />
            )}
            Start New Stocktake
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("TRANSFERS")}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "TRANSFERS"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ArrowLeftRight className="h-4 w-4" />
          Location Transfers ({transfers.length})
        </button>
        <button
          onClick={() => setActiveTab("STOCKTAKE")}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "STOCKTAKE"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ClipboardCheck className="h-4 w-4" />
          Stocktake Auditing ({stocktakes.length})
        </button>
        <button
          onClick={() => setActiveTab("SUGGESTIONS")}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "SUGGESTIONS"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          Restock Suggestions ({restockSuggestions.length})
        </button>
      </div>

      {/* TAB 1: TRANSFERS */}
      {activeTab === "TRANSFERS" && (
        <LocationTransfersTab
          transfers={transfers}
          isLoading={isLoadingTransfers}
          onReceiveTransfer={handleReceiveTransfer}
        />
      )}

      {/* TAB 2: STOCKTAKE */}
      {activeTab === "STOCKTAKE" && (
        <StocktakeTab
          stocktakes={stocktakes}
          isLoading={isLoadingStocktakes}
          activeStocktakeAudit={activeStocktakeAudit}
          onCancelAudit={() => setActiveStocktakeAudit(null)}
          onCommitStocktake={handleCommitStocktake}
          onCountChange={handleCountChange}
          isSubmitting={isSubmitting}
        />
      )}

      {/* TAB 3: RESTOCK SUGGESTIONS */}
      {activeTab === "SUGGESTIONS" && (
        <RestockSuggestionsTab
          suggestions={restockSuggestions}
          isLoading={isLoadingSuggestions}
        />
      )}

      {/* Create Transfer Modal */}
      <CreateTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        locations={locations}
        availableProducts={availableProducts}
        onSubmit={handleCreateTransferSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
