"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { useLocation } from "@/lib/location-context";
import { RefreshCw, AlertCircle, Loader2, Clock, Flame, CheckCircle } from "lucide-react";

interface KdsItem {
  _id: string;
  name: string;
  quantity: number;
  status: "QUEUED" | "COOKING" | "READY" | "SERVED";
  modifiers?: Array<{ name?: string }>;
  specialInstructions?: string;
  course?: number;
}

interface KdsTicket {
  orderId: string;
  orderNumber: string;
  type: string;
  table?: string;
  server?: string;
  covers?: number;
  allergies?: string[];
  firedAt: string;
  elapsedMinutes: number;
  targetMinutes: number;
  urgency: "OK" | "WARNING" | "LATE";
  items: KdsItem[];
}

function getUrgencyHeader(urgency: string) {
  switch (urgency) {
    case "LATE":
      return "bg-rose-600 text-white";
    case "WARNING":
      return "bg-amber-500 text-white";
    default:
      return "bg-slate-800 text-white";
  }
}

export default function KDSPage() {
  const { currentLocation } = useLocation();
  const [tickets, setTickets] = useState<KdsTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await apiClient.get<KdsTicket[]>("/restaurant/order/kitchen-queue");
      setTickets(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to sync kitchen queue.");
    } finally {
      setIsLoading(false);
    }
  }, [currentLocation]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleUpdateItemStatus = async (
    orderId: string,
    itemIds: string[],
    newStatus: "COOKING" | "READY"
  ) => {
    setUpdatingId(orderId);
    try {
      await apiClient.post("/restaurant/order/kitchen-queue/items", {
        orderId,
        itemIds,
        status: newStatus,
      });
      await fetchQueue();
    } catch (err: any) {
      alert(err?.message || "Failed to update item status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStartAll = async (ticket: KdsTicket) => {
    const queuedIds = ticket.items
      .filter((i) => i.status === "QUEUED")
      .map((i) => i._id);
    if (queuedIds.length === 0) return;
    await handleUpdateItemStatus(ticket.orderId, queuedIds, "COOKING");
  };

  const handleReadyAll = async (ticket: KdsTicket) => {
    const cookingIds = ticket.items
      .filter((i) => i.status === "COOKING" || i.status === "QUEUED")
      .map((i) => i._id);
    if (cookingIds.length === 0) return;
    await handleUpdateItemStatus(ticket.orderId, cookingIds, "READY");
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Kitchen Display System (KDS)
          </h1>
          <p className="text-xs text-slate-500">Live order queue for line cooks and kitchen expeditors.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white px-3 py-1 text-xs border-emerald-200 text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            Auto-Sync (10s)
          </Badge>
          <Button variant="outline" size="sm" onClick={() => fetchQueue()} disabled={isLoading} className="gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 flex items-center gap-2 border border-red-200 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-slate-950 p-6 rounded-xl shadow-inner border border-slate-800 flex gap-5">
        {isLoading && tickets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
            <p className="text-sm">Connecting to kitchen order queue...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <p className="text-lg font-semibold text-slate-300">No Active Kitchen Tickets</p>
            <p className="text-xs text-slate-500 mt-1">Orders sent from the POS will appear here immediately.</p>
          </div>
        ) : (
          tickets.map((ticket) => {
            const allReady = ticket.items.every((i) => i.status === "READY");
            const hasQueued = ticket.items.some((i) => i.status === "QUEUED");
            const isUpdating = updatingId === ticket.orderId;

            return (
              <Card
                key={ticket.orderId}
                className="w-84 shrink-0 flex flex-col h-full bg-white shadow-xl overflow-hidden border-0"
              >
                <CardHeader className={`p-4 ${getUrgencyHeader(ticket.urgency)} shrink-0`}>
                  <div className="flex justify-between items-center mb-1">
                    <CardTitle className="text-lg font-bold">
                      {ticket.table ? `Table ${ticket.table}` : ticket.type}
                    </CardTitle>
                    <Badge variant="outline" className="bg-white/20 border-white/30 text-white text-[11px]">
                      {ticket.urgency}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-xs opacity-90 font-mono">
                    <span>#{ticket.orderNumber}</span>
                    <span className="flex items-center gap-1 font-sans">
                      <Clock className="w-3.5 h-3.5" /> {ticket.elapsedMinutes}m ago
                    </span>
                  </div>
                  {ticket.allergies && ticket.allergies.length > 0 && (
                    <div className="mt-2 text-[11px] bg-white/20 px-2 py-0.5 rounded font-sans font-medium text-white">
                      ⚠️ Allergy: {ticket.allergies.join(", ")}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-0 divide-y divide-slate-100">
                  {ticket.items.map((item) => {
                    const statusColor =
                      item.status === "READY"
                        ? "text-emerald-600 bg-emerald-50"
                        : item.status === "COOKING"
                        ? "text-amber-600 bg-amber-50"
                        : "text-slate-600 bg-slate-50";

                    return (
                      <div key={item._id} className="p-3.5 hover:bg-slate-50/60 transition-colors">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-slate-900 text-sm">
                            <span className="text-blue-600 font-bold mr-1.5">
                              {item.quantity}x
                            </span>
                            {item.name}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${statusColor}`}
                          >
                            {item.status}
                          </span>
                        </div>

                        {item.specialInstructions && (
                          <div className="text-xs text-rose-600 font-medium mt-1 bg-rose-50 px-2 py-0.5 rounded">
                            {item.specialInstructions}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>

                <CardFooter className="p-3 border-t border-slate-100 bg-slate-50/80 shrink-0 flex gap-2">
                  {hasQueued && (
                    <Button
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => handleStartAll(ticket)}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs gap-1"
                    >
                      <Flame className="w-3.5 h-3.5" /> Start Cooking
                    </Button>
                  )}
                  {!allReady ? (
                    <Button
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => handleReadyAll(ticket)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Ready
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUpdating}
                      className="w-full text-xs text-emerald-700 border-emerald-300 bg-emerald-50"
                    >
                      ✓ All Items Ready
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
