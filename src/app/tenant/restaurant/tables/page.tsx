"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Users, Plus, Loader2, AlertCircle, RefreshCw, Trash2, UtensilsCrossed } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface TableItem {
  _id: string;
  tableNumber: string;
  capacity: number;
  outletId: string;
  zone?: string;
  shape?: "SQUARE" | "ROUND" | "RECT" | "BAR";
  status?: "OPEN" | "OCCUPIED" | "CLEANING" | "RESERVED";
  isActive?: boolean;
}

interface OutletItem {
  _id: string;
  name: string;
  type?: string;
}

function getStatusStyle(status: string = "OPEN") {
  switch (status) {
    case "OPEN":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "OCCUPIED":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "CLEANING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "RESERVED":
      return "border-purple-200 bg-purple-50 text-purple-700";
    default:
      return "border-gray-200 bg-gray-50 text-gray-700";
  }
}

export default function TablesPage() {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [outlets, setOutlets] = useState<OutletItem[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Table Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tableForm, setTableForm] = useState({
    tableNumber: "",
    capacity: 4,
    zone: "Main Dining",
    shape: "SQUARE" as "SQUARE" | "ROUND" | "RECT" | "BAR",
    outletId: "",
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [tableRes, outletRes] = await Promise.all([
        apiClient.get<TableItem[]>("/restaurant/table"),
        apiClient.get<OutletItem[]>("/outlet"),
      ]);

      const tList = Array.isArray(tableRes.data) ? tableRes.data : [];
      const oList = Array.isArray(outletRes.data) ? outletRes.data : [];

      setTables(tList);
      setOutlets(oList);

      if (oList.length > 0 && !selectedOutletId) {
        setSelectedOutletId(oList[0]._id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load restaurant floor plan.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedOutletId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAdd = () => {
    setTableForm({
      tableNumber: (tables.length + 1).toString(),
      capacity: 4,
      zone: "Main Dining",
      shape: "SQUARE",
      outletId: selectedOutletId || (outlets[0]?._id ?? ""),
    });
    setIsAddOpen(true);
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableForm.tableNumber.trim() || !tableForm.outletId) return;

    setIsSubmitting(true);
    try {
      await apiClient.post("/restaurant/table", {
        tableNumber: tableForm.tableNumber.trim(),
        capacity: Number(tableForm.capacity),
        outletId: tableForm.outletId,
        zone: tableForm.zone.trim() || undefined,
        shape: tableForm.shape,
      });
      setIsAddOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err?.message || "Failed to add table");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (table: TableItem) => {
    const nextStatus = table.status === "CLEANING" ? "OPEN" : "CLEANING";
    try {
      await apiClient.patch(`/restaurant/table/${table._id}/status`, {
        status: nextStatus,
      });
      fetchData();
    } catch (err: any) {
      alert(err?.message || "Could not update table status (it may have an open order)");
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!confirm("Are you sure you want to delete this table?")) return;
    try {
      await apiClient.delete(`/restaurant/table/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err?.message || "Failed to delete table");
    }
  };

  const filteredTables = selectedOutletId
    ? tables.filter((t) => t.outletId === selectedOutletId)
    : tables;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Floor Plan & Tables</h1>
          <p className="text-sm text-slate-500">Live view of dining outlets, tables, seating, and status.</p>
        </div>
        <div className="flex items-center gap-2">
          {outlets.length > 0 && (
            <select
              value={selectedOutletId}
              onChange={(e) => setSelectedOutletId(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs focus:ring-2 focus:ring-blue-500"
            >
              {outlets.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name}
                </option>
              ))}
            </select>
          )}
          <Button variant="outline" size="sm" onClick={() => fetchData()} disabled={isLoading} className="gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={handleOpenAdd} disabled={outlets.length === 0} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4" /> Add Table
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-600 flex items-center gap-3 border border-red-200">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-sm">Loading floor tables...</p>
        </div>
      ) : outlets.length === 0 ? (
        <div className="py-20 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-8">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Dining Outlets Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            An outlet (e.g. Main Restaurant, Bar, Lounge) is required before tables can be configured.
          </p>
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="py-20 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-8">
          <p className="text-base font-semibold text-slate-700">No tables configured for this outlet</p>
          <p className="text-sm text-slate-400 mt-1">Click &apos;Add Table&apos; to map your dining floor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 p-5 bg-slate-50/70 rounded-xl border border-slate-200 min-h-[500px]">
          {filteredTables.map((table) => {
            const status = table.status || "OPEN";
            return (
              <Card
                key={table._id}
                className={`transition-all hover:shadow-md border-2 ${getStatusStyle(status)} relative group`}
              >
                <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center space-y-0">
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Table {table.tableNumber}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={`bg-white/90 text-xs font-semibold cursor-pointer select-none`}
                    onClick={() => handleToggleStatus(table)}
                    title="Click to toggle OPEN / CLEANING"
                  >
                    {status}
                  </Badge>
                </CardHeader>

                <CardContent className="p-4 pt-2">
                  <div className="flex justify-between items-center text-xs text-slate-600 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 opacity-70" />
                      <span className="font-medium">{table.capacity} Seats</span>
                    </div>
                    {table.zone && (
                      <span className="bg-white/60 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200/50">
                        {table.zone}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-100 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{table.shape || "SQUARE"}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTable(table._id)}
                      className="h-6 w-6 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Table Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Dining Table</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTable} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="outletSelect">Outlet *</Label>
              <select
                id="outletSelect"
                required
                value={tableForm.outletId}
                onChange={(e) => setTableForm({ ...tableForm, outletId: e.target.value })}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {outlets.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="tableNumber">Table Number *</Label>
                <Input
                  id="tableNumber"
                  required
                  value={tableForm.tableNumber}
                  onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })}
                  placeholder="e.g. 12 or B-01"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="capacity">Seating Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  required
                  value={tableForm.capacity}
                  onChange={(e) => setTableForm({ ...tableForm, capacity: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="zone">Dining Zone</Label>
                <Input
                  id="zone"
                  value={tableForm.zone}
                  onChange={(e) => setTableForm({ ...tableForm, zone: e.target.value })}
                  placeholder="e.g. Patio, VIP, Bar"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="shape">Table Shape</Label>
                <select
                  id="shape"
                  value={tableForm.shape}
                  onChange={(e) => setTableForm({ ...tableForm, shape: e.target.value as any })}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SQUARE">Square</option>
                  <option value="ROUND">Round</option>
                  <option value="RECT">Rectangle</option>
                  <option value="BAR">Bar Counter</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Table
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
