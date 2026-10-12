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
import { Search, UserPlus, Loader2, AlertCircle, RefreshCw, Trash2, Mail } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface StaffMember {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "TENANT_OWNER" | "TENANT_MANAGER" | "STAFF";
  isActive?: boolean;
  createdAt?: string;
}

function getRoleBadge(role: string) {
  switch (role) {
    case "TENANT_OWNER":
      return <Badge variant="outline" className="text-purple-700 bg-purple-50 border-purple-200">Owner</Badge>;
    case "TENANT_MANAGER":
      return <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">Manager</Badge>;
    case "STAFF":
      return <Badge variant="outline" className="text-slate-700 bg-slate-100 border-slate-200">Staff</Badge>;
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
}

export default function StaffSettingsPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Invite Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "STAFF" as "TENANT_MANAGER" | "STAFF",
    password: "",
    pin: "",
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
  }, []);

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

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name.trim()) return;

    setIsSubmitting(true);
    try {
      await apiClient.post("/user/staff", {
        name: inviteForm.name.trim(),
        email: inviteForm.email.trim() || undefined,
        role: inviteForm.role,
        password: inviteForm.password || undefined,
        pin: inviteForm.pin || undefined,
        allLocations: true,
      });

      setIsInviteOpen(false);
      setInviteForm({
        name: "",
        email: "",
        role: "STAFF",
        password: "",
        pin: "",
      });
      fetchStaff();
    } catch (err: any) {
      alert(err?.message || "Failed to invite staff member");
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

  const handleResendInvite = async (id: string) => {
    try {
      await apiClient.post(`/user/staff/${id}/invite`, {});
      alert("Invitation sent successfully!");
    } catch (err: any) {
      alert(err?.message || "Could not resend invite");
    }
  };

  return (
    <RoleGuard allowedRoles={["TENANT_OWNER", "TENANT_MANAGER"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Staff Management</h1>
            <p className="text-sm text-slate-500">Manage tenant users, assign roles, and control access permissions.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchStaff()} disabled={isLoading} className="gap-2">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button onClick={() => setIsInviteOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <UserPlus className="w-4 h-4" /> Invite Staff
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
                No staff members found matching criteria.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50/75">
                  <TableRow>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>System Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => (
                    <TableRow key={staff._id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-semibold text-slate-900">{staff.name}</TableCell>
                      <TableCell className="text-slate-600">{staff.email || "—"}</TableCell>
                      <TableCell>{getRoleBadge(staff.role)}</TableCell>
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
                          {staff.email && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleResendInvite(staff._id)}
                              title="Resend invite email"
                              className="h-8 w-8 text-slate-500 hover:bg-slate-100"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {staff.role !== "TENANT_OWNER" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteStaff(staff._id, staff.name)}
                              className="h-8 w-8 text-red-600 hover:bg-red-50"
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

        {/* Invite Staff Modal */}
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateStaff} className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="staffName">Full Name *</Label>
                <Input
                  id="staffName"
                  required
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="staffEmail">Email Address</Label>
                  <Input
                    id="staffEmail"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="sarah@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="staffRole">Role</Label>
                  <select
                    id="staffRole"
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })}
                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="STAFF">Front-line Staff</option>
                    <option value="TENANT_MANAGER">Tenant Manager</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="staffPassword">Password (Optional)</Label>
                  <Input
                    id="staffPassword"
                    type="password"
                    value={inviteForm.password}
                    onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                    placeholder="Min 8 chars"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="staffPin">Quick POS PIN (4-6 digits)</Label>
                  <Input
                    id="staffPin"
                    maxLength={6}
                    value={inviteForm.pin}
                    onChange={(e) => setInviteForm({ ...inviteForm, pin: e.target.value })}
                    placeholder="e.g. 1234"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Send Invitation
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
