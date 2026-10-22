"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RoleGuard } from "@/components/auth/role-guard";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MapPin,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Edit2,
  ExternalLink,
  Compass,
  Phone,
  Mail,
  Building,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useLocation, TenantLocation } from "@/lib/location-context";

interface ExtendedLocation extends TenantLocation {
  phone?: string;
  email?: string;
  address?: string;
  checkInTime?: string;
  checkOutTime?: string;
  invoicePrefix?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  mapUrl?: string;
}

export default function LocationsSettingsPage() {
  const { refreshLocations } = useLocation();

  const [locationsList, setLocationsList] = useState<ExtendedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<ExtendedLocation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
    email: "",
    timezone: "UTC",
    currency: "USD",
    latitude: "",
    longitude: "",
    mapUrl: "",
    checkInTime: "15:00",
    checkOutTime: "11:00",
    invoicePrefix: "INV-",
  });

  const fetchLocationsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<ExtendedLocation[]>("/location");
      const list = Array.isArray(res.data) ? res.data : [];
      setLocationsList(list);
    } catch (err: any) {
      setError(err?.message || "Failed to load branch locations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocationsData();
  }, [fetchLocationsData]);

  const filteredLocations = useMemo(() => {
    const q = search.toLowerCase();
    return locationsList.filter((loc) => {
      return (
        loc.name.toLowerCase().includes(q) ||
        (loc.code && loc.code.toLowerCase().includes(q)) ||
        (loc.address && loc.address.toLowerCase().includes(q))
      );
    });
  }, [locationsList, search]);

  const handleOpenAdd = () => {
    setEditingLocation(null);
    setFormError(null);
    setFormData({
      name: "",
      code: "",
      address: "",
      phone: "",
      email: "",
      timezone: "UTC",
      currency: "USD",
      latitude: "",
      longitude: "",
      mapUrl: "",
      checkInTime: "15:00",
      checkOutTime: "11:00",
      invoicePrefix: "INV-",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc: ExtendedLocation) => {
    setEditingLocation(loc);
    setFormError(null);
    setFormData({
      name: loc.name || "",
      code: loc.code || "",
      address: loc.address || "",
      phone: loc.phone || "",
      email: loc.email || "",
      timezone: loc.timezone || "UTC",
      currency: loc.currency || "USD",
      latitude: loc.coordinates?.latitude !== undefined ? String(loc.coordinates.latitude) : "",
      longitude: loc.coordinates?.longitude !== undefined ? String(loc.coordinates.longitude) : "",
      mapUrl: loc.mapUrl || "",
      checkInTime: loc.checkInTime || "15:00",
      checkOutTime: loc.checkOutTime || "11:00",
      invoicePrefix: loc.invoicePrefix || "INV-",
    });
    setIsModalOpen(true);
  };

  const handleAutoGenerateMapLink = () => {
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      setFormData((prev) => ({
        ...prev,
        mapUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      }));
    } else if (formData.address.trim()) {
      setFormData((prev) => ({
        ...prev,
        mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.address.trim())}`,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Branch Name is required.");
      return;
    }

    const lat = formData.latitude.trim() ? parseFloat(formData.latitude) : undefined;
    const lng = formData.longitude.trim() ? parseFloat(formData.longitude) : undefined;

    if (lat !== undefined && (isNaN(lat) || lat < -90 || lat > 90)) {
      setFormError("Latitude must be a valid number between -90 and 90.");
      return;
    }

    if (lng !== undefined && (isNaN(lng) || lng < -180 || lng > 180)) {
      setFormError("Longitude must be a valid number between -180 and 180.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, any> = {
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        address: formData.address.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        timezone: formData.timezone.trim() || "UTC",
        currency: formData.currency.trim() || "USD",
        checkInTime: formData.checkInTime.trim() || "15:00",
        checkOutTime: formData.checkOutTime.trim() || "11:00",
        invoicePrefix: formData.invoicePrefix.trim() || "INV-",
        mapUrl: formData.mapUrl.trim() || undefined,
        coordinates:
          lat !== undefined || lng !== undefined
            ? { latitude: lat, longitude: lng }
            : undefined,
      };

      if (editingLocation) {
        await apiClient.patch(`/location/${editingLocation._id}`, payload);
      } else {
        await apiClient.post("/location", payload);
      }

      setIsModalOpen(false);
      await fetchLocationsData();
      await refreshLocations();
    } catch (err: any) {
      setFormError(err?.message || "Failed to save location.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLocation = async (id: string, name: string) => {
    if (locationsList.length <= 1) {
      alert("A tenant must have at least one active location. You cannot delete the only branch.");
      return;
    }
    if (!confirm(`Are you sure you want to deactivate and remove location "${name}"?`)) return;

    try {
      await apiClient.delete(`/location/${id}`);
      await fetchLocationsData();
      await refreshLocations();
    } catch (err: any) {
      alert(err?.message || "Failed to delete location");
    }
  };

  return (
    <RoleGuard allowedRoles={["TENANT_OWNER", "SUPER_ADMIN"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Branch & Location Management</h1>
            <p className="text-sm text-slate-500">
              Configure hotel and dining branch locations, physical addresses, coordinates, and Google Maps links.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLocationsData}
              disabled={isLoading}
              className="gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button
              onClick={handleOpenAdd}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Location
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-600 flex items-center gap-3 border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <Card className="border-slate-200 shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="relative w-full sm:w-72">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search branch name, code, or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 border-slate-200 text-xs"
              />
            </div>
          </div>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <p className="text-sm">Loading branches...</p>
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-sm">
                No locations found. Click &apos;Add Location&apos; to register a new branch.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead>Branch / Code</TableHead>
                    <TableHead>Address & Contacts</TableHead>
                    <TableHead>Coordinates & Map</TableHead>
                    <TableHead>Timezone / Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLocations.map((loc) => {
                    const hasCoords =
                      loc.coordinates?.latitude !== undefined &&
                      loc.coordinates?.longitude !== undefined;
                    const googleMapsUrl =
                      loc.mapUrl ||
                      (hasCoords
                        ? `https://www.google.com/maps/search/?api=1&query=${loc.coordinates?.latitude},${loc.coordinates?.longitude}`
                        : loc.address
                        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`
                        : null);

                    return (
                      <TableRow key={loc._id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-blue-600 shrink-0" />
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{loc.name}</p>
                              {loc.code && (
                                <Badge variant="outline" className="text-[10px] font-mono mt-0.5">
                                  {loc.code}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 space-y-1">
                          {loc.address ? (
                            <p className="font-medium text-slate-800">{loc.address}</p>
                          ) : (
                            <p className="text-slate-400 italic">No address specified</p>
                          )}
                          <div className="flex items-center gap-3 text-slate-500">
                            {loc.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" /> {loc.phone}
                              </span>
                            )}
                            {loc.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" /> {loc.email}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {hasCoords ? (
                            <div className="space-y-1">
                              <span className="font-mono text-slate-700 flex items-center gap-1">
                                <Compass className="w-3 h-3 text-emerald-600" />
                                {loc.coordinates?.latitude?.toFixed(4)}, {loc.coordinates?.longitude?.toFixed(4)}
                              </span>
                              {googleMapsUrl && (
                                <a
                                  href={googleMapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  Open Google Maps <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ) : googleMapsUrl ? (
                            <a
                              href={googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Open Google Maps <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">No map link</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 space-y-0.5">
                          <div>
                            <span className="font-medium text-slate-700">{loc.timezone || "UTC"}</span>{" "}
                            <span className="text-slate-400">({loc.currency || "USD"})</span>
                          </div>
                          {loc.businessDate && (
                            <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px] border border-blue-100">
                              Date: {loc.businessDate}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {loc.isActive !== false ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-400 text-xs">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(loc)}
                              className="h-8 text-xs gap-1 text-blue-600 hover:bg-blue-50 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </Button>
                            {locationsList.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteLocation(loc._id, loc.name)}
                                title="Deactivate location"
                                className="h-8 w-8 text-red-600 hover:bg-red-50 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create / Edit Location Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                {editingLocation ? `Edit Location: ${editingLocation.name}` : "Add New Location"}
              </DialogTitle>
            </DialogHeader>

            {formError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 flex items-center gap-2 border border-red-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 py-1">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="branchName">Branch Name *</Label>
                  <Input
                    id="branchName"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Downtown Grand Hotel"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="branchCode">Code / Identifier</Label>
                  <Input
                    id="branchCode"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. DT-01"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="branchAddress">Full Street Address</Label>
                <Input
                  id="branchAddress"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 742 Evergreen Terrace, Springfield"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="branchPhone">Phone Number</Label>
                  <Input
                    id="branchPhone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="branchEmail">Contact Email</Label>
                  <Input
                    id="branchEmail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="branch@hospitality.com"
                  />
                </div>
              </div>

              {/* Coordinates & Google Maps */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-blue-600" /> Google Maps & Coordinates
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoGenerateMapLink}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer"
                  >
                    Auto-generate link
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="latitude" className="text-xs text-slate-600">
                      Latitude (-90 to 90)
                    </Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="e.g. 40.7128"
                      className="bg-white text-xs h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="longitude" className="text-xs text-slate-600">
                      Longitude (-180 to 180)
                    </Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="e.g. -74.0060"
                      className="bg-white text-xs h-8"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="mapUrl" className="text-xs text-slate-600">
                    Google Maps URL or Link
                  </Label>
                  <Input
                    id="mapUrl"
                    value={formData.mapUrl}
                    onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                    placeholder="https://maps.google.com/?q=..."
                    className="bg-white text-xs h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    placeholder="e.g. America/New_York or UTC"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="currency">Currency Code</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    placeholder="e.g. USD, EUR, GBP"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="checkIn">Check-In Time</Label>
                  <Input
                    id="checkIn"
                    value={formData.checkInTime}
                    onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                    placeholder="15:00"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="checkOut">Check-Out Time</Label>
                  <Input
                    id="checkOut"
                    value={formData.checkOutTime}
                    onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                    placeholder="11:00"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                  <Input
                    id="invoicePrefix"
                    value={formData.invoicePrefix}
                    onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                    placeholder="INV-"
                  />
                </div>
              </div>

              <DialogFooter className="pt-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingLocation ? "Save Changes" : "Create Location"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
