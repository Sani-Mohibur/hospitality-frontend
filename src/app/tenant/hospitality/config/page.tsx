"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleGuard } from "@/components/auth/role-guard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Edit2, Plus, Trash2, Loader2, AlertCircle, RefreshCw, DoorOpen } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface RoomCategory {
  _id: string;
  name: string;
  code?: string;
  capacity: number;
  baseRateMinor: number;
  rooms?: number;
  description?: string;
}

interface Room {
  _id: string;
  roomNumber: string;
  floor?: string;
  roomCategoryId?: {
    _id: string;
    name: string;
    code?: string;
  };
  housekeepingStatus?: string;
  occupancyStatus?: string;
}

export default function HospitalityConfigPage() {
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RoomCategory | null>(null);
  const [catForm, setCatForm] = useState({
    name: "",
    code: "",
    capacity: 2,
    baseRate: "100.00",
    description: "",
  });

  // Room Modal State
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({
    roomNumber: "",
    roomCategoryId: "",
    floor: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [catRes, roomRes] = await Promise.all([
        apiClient.get<RoomCategory[]>("/room-category"),
        apiClient.get<Room[]>("/room"),
      ]);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      setRooms(Array.isArray(roomRes.data) ? roomRes.data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load hospitality configuration.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Add Category Modal
  const handleOpenAddCat = () => {
    setEditingCategory(null);
    setCatForm({
      name: "",
      code: "",
      capacity: 2,
      baseRate: "100.00",
      description: "",
    });
    setIsCatModalOpen(true);
  };

  // Open Edit Category Modal
  const handleOpenEditCat = (cat: RoomCategory) => {
    setEditingCategory(cat);
    setCatForm({
      name: cat.name,
      code: cat.code || "",
      capacity: cat.capacity,
      baseRate: ((cat.baseRateMinor || 0) / 100).toFixed(2),
      description: cat.description || "",
    });
    setIsCatModalOpen(true);
  };

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;
    const rateMinor = Math.round(parseFloat(catForm.baseRate) * 100);
    if (isNaN(rateMinor) || rateMinor <= 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: catForm.name.trim(),
        code: catForm.code.trim() || undefined,
        capacity: Number(catForm.capacity),
        baseRateMinor: rateMinor,
        description: catForm.description.trim() || undefined,
      };

      if (editingCategory) {
        await apiClient.patch(`/room-category/${editingCategory._id}`, payload);
      } else {
        await apiClient.post("/room-category", payload);
      }
      setIsCatModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err?.message || "Failed to save room category");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room category?")) return;
    try {
      await apiClient.delete(`/room-category/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err?.message || "Failed to delete room category");
    }
  };

  // Open Add Room Modal
  const handleOpenAddRoom = () => {
    setRoomForm({
      roomNumber: "",
      roomCategoryId: categories.length > 0 ? categories[0]._id : "",
      floor: "1",
    });
    setIsRoomModalOpen(true);
  };

  // Save Room
  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.roomNumber.trim() || !roomForm.roomCategoryId) return;

    setIsSubmitting(true);
    try {
      await apiClient.post("/room", {
        roomNumber: roomForm.roomNumber.trim(),
        roomCategoryId: roomForm.roomCategoryId,
        floor: roomForm.floor.trim() || undefined,
      });
      setIsRoomModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err?.message || "Failed to add room");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Room
  const handleDeleteRoom = async (id: string) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      await apiClient.delete(`/room/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err?.message || "Failed to delete room");
    }
  };

  const filteredRooms = selectedCategoryId === "ALL"
    ? rooms
    : rooms.filter((r) => {
      const catId = typeof r.roomCategoryId === "object" ? r.roomCategoryId?._id : r.roomCategoryId;
      return catId === selectedCategoryId;
    });

  return (
    <RoleGuard allowedRoles={["TENANT_OWNER", "TENANT_MANAGER"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hospitality Configuration</h1>
            <p className="text-sm text-slate-500">Manage room categories, physical rooms, and lodging setup.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchData()} disabled={isLoading} className="gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-600 flex items-center gap-3 border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Room Categories Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-lg">Room Categories</CardTitle>
              <p className="text-xs text-slate-500 mt-1">Define types of rooms available in this location.</p>
            </div>
            <Button size="sm" onClick={handleOpenAddCat} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-12 flex items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No room categories configured yet. Click &apos;Add Category&apos; above.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Base Rate</TableHead>
                    <TableHead>Rooms Mapped</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat._id}>
                      <TableCell className="font-semibold text-slate-900">{cat.name}</TableCell>
                      <TableCell className="text-slate-500 font-mono text-xs">{cat.code || "—"}</TableCell>
                      <TableCell className="text-slate-700">{cat.capacity} Persons</TableCell>
                      <TableCell className="font-medium text-slate-900">
                        ${((cat.baseRateMinor || 0) / 100).toFixed(2)} / night
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {cat.rooms ?? 0} Rooms
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditCat(cat)}
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCategory(cat._id)}
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Physical Rooms Management Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-lg">Physical Rooms</CardTitle>
              <p className="text-xs text-slate-500 mt-1">Map physical room numbers to category types and floors.</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Categories ({rooms.length})</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                onClick={handleOpenAddRoom}
                disabled={categories.length === 0}
                className="gap-2 bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Plus className="w-4 h-4" /> Add Room
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-12 flex items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading rooms...
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No physical rooms found in this view. Click &apos;Add Room&apos; above.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead>Room Number</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Housekeeping</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.map((room) => {
                    const catName = typeof room.roomCategoryId === "object" ? room.roomCategoryId?.name : "—";
                    return (
                      <TableRow key={room._id}>
                        <TableCell className="font-bold text-slate-900 flex items-center gap-2">
                          <DoorOpen className="w-4 h-4 text-blue-500" /> Room {room.roomNumber}
                        </TableCell>
                        <TableCell className="text-slate-600">{catName}</TableCell>
                        <TableCell className="text-slate-600">Floor {room.floor || 1}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {room.housekeepingStatus || "CLEAN"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={room.occupancyStatus === "OCCUPIED" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {room.occupancyStatus || "VACANT"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRoom(room._id)}
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Category Modal */}
        <Dialog open={isCatModalOpen} onOpenChange={setIsCatModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add Room Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveCategory} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="catName">Category Name *</Label>
                <Input
                  id="catName"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. Deluxe Ocean Suite"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="catCode">Code</Label>
                  <Input
                    id="catCode"
                    value={catForm.code}
                    onChange={(e) => setCatForm({ ...catForm, code: e.target.value })}
                    placeholder="e.g. DLX"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="catCapacity">Max Capacity</Label>
                  <Input
                    id="catCapacity"
                    type="number"
                    min="1"
                    required
                    value={catForm.capacity}
                    onChange={(e) => setCatForm({ ...catForm, capacity: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="catRate">Base Rate per Night ($) *</Label>
                <Input
                  id="catRate"
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={catForm.baseRate}
                  onChange={(e) => setCatForm({ ...catForm, baseRate: e.target.value })}
                  placeholder="150.00"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="catDesc">Description</Label>
                <Input
                  id="catDesc"
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  placeholder="Features and room amenities"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCatModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Category
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Room Modal */}
        <Dialog open={isRoomModalOpen} onOpenChange={setIsRoomModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Physical Room</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveRoom} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="roomNumber">Room Number *</Label>
                <Input
                  id="roomNumber"
                  required
                  value={roomForm.roomNumber}
                  onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                  placeholder="e.g. 101 or 302B"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="roomCategory">Room Category *</Label>
                <select
                  id="roomCategory"
                  required
                  value={roomForm.roomCategoryId}
                  onChange={(e) => setRoomForm({ ...roomForm, roomCategoryId: e.target.value })}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} (${((c.baseRateMinor || 0) / 100).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="floor">Floor / Level</Label>
                <Input
                  id="floor"
                  value={roomForm.floor}
                  onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                  placeholder="e.g. 1"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsRoomModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Room
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
