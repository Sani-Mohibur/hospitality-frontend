"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  RefreshCw, 
  Loader2, 
  AlertCircle, 
  MoreHorizontal, 
  LogIn, 
  LogOut, 
  XCircle,
  UserCheck
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useLocation } from "@/lib/location-context";
import { toast } from "sonner";
import { format, addDays } from "date-fns";

interface StayItem {
  _id: string;
  arrivalDate: string;
  departureDate: string;
  roomId?: {
    _id: string;
    roomNumber: string;
  } | null;
  roomTypeId?: {
    _id: string;
    name: string;
    code?: string;
  } | null;
  status?: string;
}

interface ReservationItem {
  _id: string;
  confirmationNumber: string;
  status: string;
  bookerGuestId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  } | null;
  stays: StayItem[];
  createdAt?: string;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "CONFIRMED": return <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">Confirmed</Badge>;
    case "CHECKED_IN":
    case "IN_HOUSE": return <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">Checked In</Badge>;
    case "CHECKED_OUT": return <Badge variant="outline" className="text-slate-600 bg-slate-100 border-slate-300">Checked Out</Badge>;
    case "TENTATIVE": return <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">Tentative</Badge>;
    case "CANCELLED": return <Badge variant="outline" className="text-rose-600 bg-rose-50 border-rose-200">Cancelled</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

export default function ReservationsPage() {
  const { currentLocation } = useLocation();
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // New Reservation Modal State
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roomCategories, setRoomCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [ratePlans, setRatePlans] = useState<Array<{ _id: string; name: string }>>([]);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roomTypeId: "",
    ratePlanId: "",
    arrivalDate: todayStr,
    departureDate: tomorrowStr,
    adults: 1,
  });

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("searchTerm", search);

      const res = await apiClient.get<ReservationItem[]>(`/reservation?${params.toString()}`);
      setReservations(Array.isArray(res.data) ? res.data : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load reservations";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, currentLocation]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Load room categories and rate plans for booking modal
  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [catsRes, plansRes] = await Promise.allSettled([
          apiClient.get<any[]>("/room-category"),
          apiClient.get<any[]>("/rate/plans"),
        ]);

        if (catsRes.status === "fulfilled" && Array.isArray(catsRes.value?.data)) {
          setRoomCategories(catsRes.value.data);
          if (catsRes.value.data.length > 0 && !form.roomTypeId) {
            setForm((f) => ({ ...f, roomTypeId: catsRes.value.data[0]._id }));
          }
        }

        if (plansRes.status === "fulfilled" && Array.isArray(plansRes.value?.data)) {
          setRatePlans(plansRes.value.data);
          if (plansRes.value.data.length > 0 && !form.ratePlanId) {
            setForm((f) => ({ ...f, ratePlanId: plansRes.value.data[0]._id }));
          }
        }
      } catch (err) {
        console.error("Failed to load booking prerequisites:", err);
      }
    };
    if (isNewOpen) {
      loadPrerequisites();
    }
  }, [isNewOpen, form.roomTypeId, form.ratePlanId]);

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) {
      toast.error("Guest first and last name are required.");
      return;
    }
    if (!form.roomTypeId) {
      toast.error("Please select a room category.");
      return;
    }

    setIsSubmitting(true);
    try {
      // If no rate plan exists yet, create or fallback
      let ratePlanId = form.ratePlanId;
      if (!ratePlanId && ratePlans.length > 0) {
        ratePlanId = ratePlans[0]._id;
      }

      await apiClient.post("/reservation", {
        guest: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email || undefined,
          phone: form.phone || undefined,
        },
        stays: [
          {
            roomTypeId: form.roomTypeId,
            ratePlanId: ratePlanId || form.roomTypeId,
            arrivalDate: form.arrivalDate,
            departureDate: form.departureDate,
            adults: Number(form.adults) || 1,
          },
        ],
        confirm: true,
      });

      toast.success("Reservation confirmed successfully!");
      setIsNewOpen(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        roomTypeId: roomCategories[0]?._id || "",
        ratePlanId: ratePlans[0]?._id || "",
        arrivalDate: todayStr,
        departureDate: tomorrowStr,
        adults: 1,
      });
      await fetchReservations();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create reservation";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIn = async (stayId: string, resNumber: string) => {
    try {
      await apiClient.post(`/reservation/stays/${stayId}/check-in`, {
        allowDirtyRoom: true,
      });
      toast.success(`Reservation #${resNumber} checked in.`);
      await fetchReservations();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to check in";
      toast.error(msg);
    }
  };

  const handleCheckOut = async (stayId: string, resNumber: string) => {
    try {
      await apiClient.post(`/reservation/stays/${stayId}/check-out`, {});
      toast.success(`Reservation #${resNumber} checked out.`);
      await fetchReservations();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to check out";
      toast.error(msg);
    }
  };

  const handleCancel = async (resId: string, resNumber: string) => {
    try {
      await apiClient.post(`/reservation/${resId}/cancel`, {
        reason: "Cancelled by guest request",
        waiveFee: true,
      });
      toast.success(`Reservation #${resNumber} cancelled.`);
      await fetchReservations();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel reservation";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reservations</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage incoming arrivals, in-house guests, and departures in {currentLocation?.name || "branch"}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchReservations} disabled={loading} className="gap-1 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsNewOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
            <Plus className="w-4 h-4" /> New Reservation
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={fetchReservations} className="text-xs h-7">Retry</Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by guest name or confirmation #..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9 bg-slate-50 border-slate-200 text-sm" 
          />
        </div>
        <div className="w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
            <SelectTrigger className="w-full sm:w-[170px] bg-slate-50 border-slate-200 text-sm cursor-pointer">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="CHECKED_IN">Checked In</SelectItem>
              <SelectItem value="TENTATIVE">Tentative</SelectItem>
              <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Confirmation #</TableHead>
                <TableHead className="font-semibold text-slate-700">Guest Name</TableHead>
                <TableHead className="font-semibold text-slate-700">Room / Type</TableHead>
                <TableHead className="font-semibold text-slate-700">Arrival</TableHead>
                <TableHead className="font-semibold text-slate-700">Departure</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                      <p className="text-sm">Loading reservations...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : reservations.length > 0 ? (
                reservations.map((res) => {
                  const firstStay = res.stays[0];
                  const guestName = res.bookerGuestId 
                    ? `${res.bookerGuestId.firstName} ${res.bookerGuestId.lastName}`
                    : "Anonymous Guest";
                  const roomDisplay = firstStay?.roomId?.roomNumber 
                    ? `Room ${firstStay.roomId.roomNumber}` 
                    : firstStay?.roomTypeId?.name || "Unassigned";

                  return (
                    <TableRow key={res._id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-mono font-medium text-blue-600 text-sm">
                        {res.confirmationNumber || res._id.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900 text-sm">{guestName}</div>
                        {res.bookerGuestId?.email && (
                          <div className="text-xs text-slate-500">{res.bookerGuestId.email}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {roomDisplay}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                        {firstStay?.arrivalDate || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                        {firstStay?.departureDate || "N/A"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={res.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {res.status === "CONFIRMED" && firstStay && (
                              <DropdownMenuItem 
                                onClick={() => handleCheckIn(firstStay._id, res.confirmationNumber)}
                                className="text-emerald-600 cursor-pointer"
                              >
                                <LogIn className="mr-2 h-4 w-4" /> Check In Guest
                              </DropdownMenuItem>
                            )}
                            {res.status === "CHECKED_IN" && firstStay && (
                              <DropdownMenuItem 
                                onClick={() => handleCheckOut(firstStay._id, res.confirmationNumber)}
                                className="text-blue-600 cursor-pointer"
                              >
                                <LogOut className="mr-2 h-4 w-4" /> Check Out Guest
                              </DropdownMenuItem>
                            )}
                            {res.status !== "CANCELLED" && res.status !== "CHECKED_OUT" && (
                              <DropdownMenuItem 
                                onClick={() => handleCancel(res._id, res.confirmationNumber)}
                                className="text-rose-600 cursor-pointer"
                              >
                                <XCircle className="mr-2 h-4 w-4" /> Cancel Booking
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <CalendarIcon className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="font-medium text-slate-600">No reservations found.</p>
                      <p className="text-sm">Click &quot;New Reservation&quot; to book a stay.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Reservation Modal */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              New Reservation
            </DialogTitle>
            <DialogDescription>
              Book a room stay in {currentLocation?.name || "current branch"}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateReservation} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={form.firstName} 
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })} 
                  placeholder="e.g. John" 
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={form.lastName} 
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })} 
                  placeholder="e.g. Doe" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  placeholder="guest@example.com" 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={form.phone} 
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                  placeholder="+1 555-0192" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="arrivalDate">Arrival Date</Label>
                <Input 
                  id="arrivalDate" 
                  type="date"
                  value={form.arrivalDate} 
                  onChange={(e) => setForm({ ...form, arrivalDate: e.target.value })} 
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="departureDate">Departure Date</Label>
                <Input 
                  id="departureDate" 
                  type="date"
                  value={form.departureDate} 
                  onChange={(e) => setForm({ ...form, departureDate: e.target.value })} 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Room Category</Label>
                <Select 
                  value={form.roomTypeId} 
                  onValueChange={(val) => val && setForm({ ...form, roomTypeId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomCategories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adults">Adults</Label>
                <Input 
                  id="adults" 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={form.adults} 
                  onChange={(e) => setForm({ ...form, adults: Number(e.target.value) })} 
                  required 
                />
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsNewOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Confirming...</>
                ) : (
                  "Create Reservation"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
