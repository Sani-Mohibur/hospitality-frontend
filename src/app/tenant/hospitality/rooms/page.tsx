"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BedDouble, CheckCircle, RefreshCcw, XCircle, AlertCircle, Loader2, RefreshCw, Plus, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useLocation } from "@/lib/location-context";
import { toast } from "sonner";
import Link from "next/link";

interface RoomItem {
  _id: string;
  roomNumber: string;
  floor?: string;
  roomCategoryId?: {
    _id: string;
    name: string;
    code?: string;
  };
  housekeepingStatus: "CLEAN" | "DIRTY" | "INSPECTED" | "CLEANING";
  occupancyStatus: "VACANT" | "OCCUPIED";
  currentStayId?: {
    _id: string;
    guestName?: string;
  } | string;
  isActive: boolean;
}

function StatusIcon({ status, isOccupied }: { status: string; isOccupied: boolean }) {
  if (isOccupied) return <BedDouble className="w-5 h-5 text-blue-500" />;
  switch (status) {
    case "CLEAN": return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case "INSPECTED": return <Sparkles className="w-5 h-5 text-purple-500" />;
    case "DIRTY": return <RefreshCcw className="w-5 h-5 text-amber-500" />;
    case "OUT_OF_ORDER": return <XCircle className="w-5 h-5 text-red-500" />;
    default: return <RefreshCcw className="w-5 h-5 text-slate-400" />;
  }
}

function StatusBadge({ status, isOccupied }: { status: string; isOccupied: boolean }) {
  if (isOccupied) {
    return <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">Occupied</Badge>;
  }
  switch (status) {
    case "CLEAN": return <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">Clean</Badge>;
    case "INSPECTED": return <Badge variant="outline" className="text-purple-600 bg-purple-50 border-purple-200">Inspected</Badge>;
    case "DIRTY": return <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">Dirty</Badge>;
    case "OUT_OF_ORDER": return <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">Out of Order</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

export default function RoomsPage() {
  const { currentLocation } = useLocation();
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Status Change Dialog
  const [selectedRoom, setSelectedRoom] = useState<RoomItem | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<RoomItem[]>("/room");
      const list = Array.isArray(res.data) ? res.data : [];
      setRooms(list);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load rooms";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [currentLocation]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleUpdateStatus = async () => {
    if (!selectedRoom || !newStatus) return;
    setIsUpdating(true);
    try {
      await apiClient.patch(`/room/${selectedRoom._id}/housekeeping-status`, {
        status: newStatus,
      });
      toast.success(`Room ${selectedRoom.roomNumber} marked as ${newStatus.toLowerCase()}.`);
      setSelectedRoom(null);
      await fetchRooms();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update room status";
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "OCCUPIED") return r.occupancyStatus === "OCCUPIED";
    return r.housekeepingStatus === filterStatus;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Room Board</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Live overview of all physical rooms in {currentLocation?.name || "current branch"}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={(val) => val && setFilterStatus(val)}>
            <SelectTrigger className="w-[150px] bg-white text-sm">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Rooms</SelectItem>
              <SelectItem value="CLEAN">Clean</SelectItem>
              <SelectItem value="INSPECTED">Inspected</SelectItem>
              <SelectItem value="DIRTY">Dirty</SelectItem>
              <SelectItem value="OCCUPIED">Occupied</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={fetchRooms} disabled={loading} className="gap-1 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Link
            href="/tenant/hospitality/config"
            className={buttonVariants({ size: "sm", className: "gap-1.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer" })}
          >
            <Plus className="w-4 h-4" /> Manage Rooms
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={fetchRooms} className="text-xs h-7">Retry</Button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Loading rooms...</p>
        </div>
      ) : filteredRooms.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredRooms.map((room) => {
            const isOccupied = room.occupancyStatus === "OCCUPIED";
            return (
              <Card 
                key={room._id} 
                onClick={() => {
                  setSelectedRoom(room);
                  setNewStatus(room.housekeepingStatus);
                }}
                className="cursor-pointer hover:shadow-md transition-shadow border-slate-200 bg-white"
              >
                <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start space-y-0">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">{room.roomNumber}</CardTitle>
                    {room.floor && <span className="text-[10px] text-slate-400">Floor {room.floor}</span>}
                  </div>
                  <StatusIcon status={room.housekeepingStatus} isOccupied={isOccupied} />
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <p className="text-xs text-slate-500 font-medium mb-3 truncate">
                    {room.roomCategoryId?.name || "Standard Room"}
                  </p>
                  <div className="flex justify-between items-end">
                    <StatusBadge status={room.housekeepingStatus} isOccupied={isOccupied} />
                  </div>
                  {isOccupied && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs">
                      <span className="text-slate-400">Status:</span>{" "}
                      <span className="font-medium text-slate-700">Occupied</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-xl border border-dashed border-slate-200 p-8">
          <BedDouble className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-800 text-lg">No Rooms Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">
            {filterStatus !== "ALL" 
              ? "No rooms match the selected filter." 
              : "No physical rooms have been configured in this location yet."}
          </p>
          <Link
            href="/tenant/hospitality/config"
            className={buttonVariants({ size: "sm", className: "mt-4 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white" })}
          >
            <Plus className="w-4 h-4" /> Add Room Categories & Numbers
          </Link>
        </div>
      )}

      {/* Housekeeping Update Modal */}
      <Dialog open={!!selectedRoom} onOpenChange={(open) => !open && setSelectedRoom(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Update Room {selectedRoom?.roomNumber}</DialogTitle>
            <DialogDescription>
              Change housekeeping status for {selectedRoom?.roomCategoryId?.name || "Room"}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Housekeeping Status
              </label>
              <Select value={newStatus} onValueChange={(val) => val && setNewStatus(val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLEAN">Clean (Ready for Guest)</SelectItem>
                  <SelectItem value="INSPECTED">Inspected (Supervisor Approved)</SelectItem>
                  <SelectItem value="DIRTY">Dirty (Needs Housekeeping)</SelectItem>
                  <SelectItem value="CLEANING">Cleaning In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedRoom(null)}>Cancel</Button>
            <Button 
              onClick={handleUpdateStatus} 
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUpdating ? "Saving..." : "Save Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
