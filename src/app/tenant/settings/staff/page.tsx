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
import { Search, UserPlus, Loader2, AlertCircle, RefreshCw, Trash2, MapPin, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "@/lib/location-context";

interface TenantLocation {
  _id: string;
  name: string;
  code?: string;
}

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "TENANT_OWNER" | "TENANT_MANAGER" | "STAFF";
  allLocations?: boolean;
  locationIds?: any[];
  isActive?: boolean;
  createdAt?: string;
}

function getRoleBadge(role: string) {
  switch (role) {
    case "TENANT_OWNER":
      return <Badge variant="outline" className="text-purple-700 bg-purple-50 border-purple-200">Owner</Badge>;
    case "TENANT_MANAGER":
      return <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">Tenant Manager</Badge>;
    case "STAFF":
      return <Badge variant="outline" className="text-slate-700 bg-slate-100 border-slate-200">Staff</Badge>;
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
}

export default function StaffSettingsPage() {
  const { user: currentUser } = useAuth();
  const { currentLocation, isAllLocations, locations } = useLocation();
  const isOwner = currentUser?.role === "TENANT_OWNER" || currentUser?.role === "SUPER_ADMIN";

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Add Staff Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Email availability check state
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ checked: boolean; exists: boolean; message: string | null }>({
    checked: false,
    exists: false,
    message: null,
  });

  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "STAFF" as "TENANT_MANAGER" | "STAFF",
    allLocations: false,
    locationIds: [] as string[],
  });

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<StaffMember[]>("/user/staff");
      setStaffList(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load staff roster.");
    } finally {
      setIsLoading(false);
    }
  }, [currentLocation]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.email && s.email.toLowerCase().includes(q))
      );
    });
  }, [staffList, search]);

  // Live database check for duplicate email
  const checkEmailAvailability = async (emailToCheck: string) => {
    const trimmed = emailToCheck.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setEmailStatus({ checked: false, exists: false, message: null });
      return;
    }

    setEmailCheckLoading(true);
    try {
      const res = await apiClient.get<{ exists: boolean }>(`/user/check-email?email=${encodeURIComponent(trimmed)}`);
      if (res.data?.exists) {
        setEmailStatus({
          checked: true,
          exists: true,
          message: "A user with this email address already exists in the database.",
        });
      } else {
        setEmailStatus({
          checked: true,
          exists: false,
          message: "Email address is available.",
        });
      }
    } catch {
      setEmailStatus({ checked: false, exists: false, message: null });
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormError(null);
    setEmailStatus({ checked: false, exists: false, message: null });

    // Determine default location from dashboard active selection
    let defaultLocations: string[] = [];
    let defaultAll = false;

    if (isOwner) {
      if (isAllLocations || !currentLocation || currentLocation._id === "ALL") {
        defaultAll = true;
      } else {
        defaultLocations = [currentLocation._id];
      }
    } else {
      // Manager is strictly restricted to assigned branches
      defaultAll = false;
      if (currentLocation && currentLocation._id !== "ALL" && locations.some((l) => l._id === currentLocation._id)) {
        defaultLocations = [currentLocation._id];
      } else if (locations.length > 0) {
        defaultLocations = [locations[0]._id];
      }
    }

    setStaffForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "STAFF",
      allLocations: defaultAll,
      locationIds: defaultLocations,
    });
    setIsAddOpen(true);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!staffForm.name.trim()) {
      setFormError("Full Name is required.");
      return;
    }

    if (!staffForm.email.trim()) {
      setFormError("Email address is required.");
      return;
    }

    if (!staffForm.password || staffForm.password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    if (!staffForm.allLocations && staffForm.locationIds.length === 0) {
      setFormError("Please select at least one branch for this staff member.");
      return;
    }

    if (!isOwner && staffForm.allLocations) {
      setFormError("Managers cannot assign staff to all locations.");
      return;
    }

    if (!isOwner && staffForm.role === "TENANT_MANAGER") {
      setFormError("Only the Tenant Owner can create managers.");
      return;
    }

    // Verify email duplicate before submission
    const trimmedEmail = staffForm.email.trim().toLowerCase();
    try {
      const checkRes = await apiClient.get<{ exists: boolean }>(`/user/check-email?email=${encodeURIComponent(trimmedEmail)}`);
      if (checkRes.data?.exists) {
        setEmailStatus({
          checked: true,
          exists: true,
          message: "A user with this email address already exists in the database.",
        });
        setFormError("Cannot create staff: This email address is already registered.");
        return;
      }
    } catch (err: any) {
      console.error("Email pre-check error", err);
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/user/staff", {
        name: staffForm.name.trim(),
        email: trimmedEmail,
        password: staffForm.password,
        phone: staffForm.phone.trim() || undefined,
        role: staffForm.role,
        allLocations: isOwner ? staffForm.allLocations : false,
        locationIds: staffForm.allLocations ? [] : staffForm.locationIds,
        sendInvite: false,
      });

      setIsAddOpen(false);
      fetchStaff();
    } catch (err: any) {
      setFormError(err?.message || "Failed to add staff member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from tenant staff?`)) return;
    try {
      await apiClient.delete(`/user/staff/${id}`);
      fetchStaff();
    } catch (err: any) {
      alert(err?.message || "Failed to remove staff member");
    }
  };

  return (
    <RoleGuard allowedRoles={["TENANT_OWNER", "TENANT_MANAGER"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Staff Management</h1>
            <p className="text-sm text-slate-500">
              Directly add and manage team members and managers across your locations.
              {currentLocation && (
                <span className="font-semibold text-blue-600 ml-1">
                  (Showing: {currentLocation.name})
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchStaff()} disabled={isLoading} className="gap-2 cursor-pointer">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button onClick={handleOpenAddModal} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
              <UserPlus className="w-4 h-4" /> Add Staff
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
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search staff by name or email..."
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
                <p className="text-sm">Loading staff members...</p>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-sm">
                No staff members found for the current filter/location. Click &apos;Add Staff&apos; to create one.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>System Role</TableHead>
                    <TableHead>Location Access</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => (
                    <TableRow key={staff._id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-semibold text-slate-900">{staff.name}</TableCell>
                      <TableCell className="text-slate-600">{staff.email}</TableCell>
                      <TableCell>{getRoleBadge(staff.role)}</TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {staff.allLocations !== false ? (
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <MapPin className="w-3 h-3 text-slate-400" /> All Locations
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-blue-600 font-medium">
                            <MapPin className="w-3 h-3 text-blue-500" /> {staff.locationIds?.length || 0} Location(s)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {staff.isActive !== false ? (
                          <span className="flex items-center text-emerald-600 text-xs font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Active
                          </span>
                        ) : (
                          <span className="flex items-center text-slate-400 text-xs font-medium">
                            <span className="w-2 h-2 rounded-full bg-slate-300 mr-2"></span> Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {staff.role !== "TENANT_OWNER" && (isOwner || staff.role === "STAFF") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteStaff(staff._id, staff.name)}
                              title="Remove staff member"
                              className="h-8 w-8 text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add Staff Modal */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" /> Add Staff Member
              </DialogTitle>
            </DialogHeader>

            {formError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 flex items-center gap-2 border border-red-200 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4 py-1">
              <div className="space-y-1">
                <Label htmlFor="staffName">Full Name *</Label>
                <Input
                  id="staffName"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-1">
                <Label htmlFor="staffRole">Role *</Label>
                {isOwner ? (
                  <select
                    id="staffRole"
                    value={staffForm.role}
                    onChange={(e) =>
                      setStaffForm({
                        ...staffForm,
                        role: e.target.value as "TENANT_MANAGER" | "STAFF",
                      })
                    }
                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="STAFF">Staff</option>
                    <option value="TENANT_MANAGER">Tenant Manager</option>
                  </select>
                ) : (
                  <div className="h-9 flex items-center px-3 rounded-md bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200">
                    Staff (Only Owner can create managers)
                  </div>
                )}
              </div>

              {/* Email & Database Duplicate Check */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="staffEmail">Email Address *</Label>
                  {emailCheckLoading && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Checking availability...
                    </span>
                  )}
                </div>
                <Input
                  id="staffEmail"
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStaffForm({ ...staffForm, email: val });
                    if (emailStatus.checked) {
                      setEmailStatus({ checked: false, exists: false, message: null });
                    }
                  }}
                  onBlur={() => checkEmailAvailability(staffForm.email)}
                  placeholder="e.g. sarah@example.com"
                  className={emailStatus.exists ? "border-red-500 focus-visible:ring-red-400" : ""}
                />
                {emailStatus.checked && (
                  <p
                    className={`text-xs mt-1 flex items-center gap-1 ${
                      emailStatus.exists ? "text-red-600 font-medium" : "text-emerald-600"
                    }`}
                  >
                    {emailStatus.exists ? (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {emailStatus.message}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        {emailStatus.message}
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="staffPassword">Password *</Label>
                <Input
                  id="staffPassword"
                  type="password"
                  required
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  placeholder="Min 8 characters"
                />
              </div>

              {/* Location Scope */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Location Assignment</Label>
                    {currentLocation && currentLocation._id !== "ALL" && (
                      <p className="text-[11px] text-slate-500">
                        Defaulted to active branch: <span className="font-medium text-slate-700">{currentLocation.name}</span>
                      </p>
                    )}
                  </div>
                  {isOwner && (
                    <label className="text-xs text-slate-600 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={staffForm.allLocations}
                        onChange={(e) =>
                          setStaffForm({
                            ...staffForm,
                            allLocations: e.target.checked,
                            locationIds: e.target.checked ? [] : staffForm.locationIds,
                          })
                        }
                        className="rounded border-slate-300 text-blue-600 cursor-pointer"
                      />
                      <span>All branches</span>
                    </label>
                  )}
                </div>

                {!staffForm.allLocations && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-500">Select permitted branches:</p>
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-md border border-slate-200 max-h-32 overflow-y-auto">
                      {locations.map((loc) => {
                        const isChecked = staffForm.locationIds.includes(loc._id);
                        return (
                          <label key={loc._id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setStaffForm((prev) => ({
                                  ...prev,
                                  locationIds: checked
                                    ? [...prev.locationIds, loc._id]
                                    : prev.locationIds.filter((id) => id !== loc._id),
                                }));
                              }}
                              className="rounded border-slate-300 text-blue-600 cursor-pointer"
                            />
                            <span className="truncate">{loc.name} {loc.code ? `(${loc.code})` : ""}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="staffPhone">Phone Number (Optional)</Label>
                <Input
                  id="staffPhone"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <DialogFooter className="pt-3">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || emailStatus.exists || emailCheckLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Add Staff Member
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
