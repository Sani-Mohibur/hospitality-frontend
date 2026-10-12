"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, UserPlus, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface Guest {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  nationality?: string;
  notes?: string;
  tags?: string[];
  stats?: {
    stays: number;
    nights: number;
    visits: number;
    totalSpendMinor: number;
    lastStayAt?: string;
  };
  createdAt?: string;
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  // Add Guest dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationality: "",
    notes: "",
  });

  const fetchGuests = useCallback(async (query = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<Guest[]>("/guest", {
        params: query ? { searchTerm: query } : undefined,
      });
      setGuests(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load guest directory.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGuests(search);
  };

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) return;
    setIsSubmitting(true);
    try {
      await apiClient.post("/guest", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        nationality: formData.nationality.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
      setIsAddOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        nationality: "",
        notes: "",
      });
      fetchGuests(search);
    } catch (err: any) {
      alert(err?.message || "Failed to create guest");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Guest Directory</h1>
          <p className="text-sm text-slate-500">Manage guest profiles, history, and contact details.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchGuests(search)} disabled={isLoading} className="gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="w-4 h-4" /> Add Guest
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 border-slate-200"
            />
          </form>
          {search && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(""); fetchGuests(""); }}>
              Clear Search
            </Button>
          )}
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm">Loading guests...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-600">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <p className="text-sm font-medium">{error}</p>
              <Button variant="outline" size="sm" onClick={() => fetchGuests(search)} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : guests.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              <p className="text-base font-semibold text-slate-700">No guests found</p>
              <p className="text-sm text-slate-400 mt-1">
                {search ? "Try adjusting your search criteria." : "Create your first guest profile to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead className="text-center">Total Stays</TableHead>
                    <TableHead className="text-right">Total Spend</TableHead>
                    <TableHead>Tags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map((guest) => {
                    const spend = guest.stats?.totalSpendMinor ? `$${(guest.stats.totalSpendMinor / 100).toFixed(2)}` : "$0.00";
                    return (
                      <TableRow
                        key={guest._id}
                        className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                        onClick={() => setSelectedGuest(guest)}
                      >
                        <TableCell className="font-semibold text-slate-900">
                          {guest.firstName} {guest.lastName}
                        </TableCell>
                        <TableCell className="text-slate-600">{guest.email || "—"}</TableCell>
                        <TableCell className="text-slate-600">{guest.phone || "—"}</TableCell>
                        <TableCell className="text-slate-600">{guest.nationality || "—"}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {guest.stats?.stays ?? 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-900">{spend}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {guest.tags && guest.tags.length > 0 ? (
                              guest.tags.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guest Details Modal */}
      <Dialog open={!!selectedGuest} onOpenChange={(open) => !open && setSelectedGuest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Guest Profile</DialogTitle>
          </DialogHeader>
          {selectedGuest && (
            <div className="space-y-4 py-2 text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedGuest.firstName} {selectedGuest.lastName}
                  </h3>
                  <p className="text-xs text-slate-500">ID: {selectedGuest._id}</p>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {selectedGuest.stats?.stays || 0} Stays
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Email</p>
                  <p className="text-slate-800 break-all">{selectedGuest.email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Phone</p>
                  <p className="text-slate-800">{selectedGuest.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Nationality</p>
                  <p className="text-slate-800">{selectedGuest.nationality || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Total Spend</p>
                  <p className="text-slate-800 font-semibold">
                    ${((selectedGuest.stats?.totalSpendMinor || 0) / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              {selectedGuest.notes && (
                <div>
                  <p className="text-xs text-slate-400 font-medium">Notes</p>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                    {selectedGuest.notes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedGuest(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Guest Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Guest</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateGuest} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. John"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 555-0100"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                placeholder="e.g. United States"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Special requests or preferences"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Guest
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
