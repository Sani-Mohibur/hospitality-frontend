"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Building2, 
  Mail, 
  Phone, 
  Ban, 
  PlayCircle, 
  ShieldCheck, 
  Edit, 
  RefreshCw,
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

type TenantStatus = "ACTIVE" | "TRIALING" | "PENDING" | "PAST_DUE" | "SUSPENDED" | "CANCELLED";

interface Tenant {
  _id: string;
  name: string;
  slug: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  locationsCount?: number;
  status: TenantStatus;
  modules?: string[];
  createdAt: string;
}

export default function TenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Form and action state
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [actionTenant, setActionTenant] = useState<Tenant | null>(null);
  const [actionType, setActionType] = useState<"SUSPEND" | "ACTIVATE">("SUSPEND");
  
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    email: "",
    phone: "",
    modules: ["HOSPITALITY"] as string[]
  });

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/tenant");
      if (res.ok) {
        const data = await res.json();
        setTenants(data.data || []);
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.message || "Failed to load tenants");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while loading tenants");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const filteredTenants = tenants.filter(t => {
    const term = search.toLowerCase();
    const matchesSearch = 
      t.name.toLowerCase().includes(term) || 
      (t.slug && t.slug.toLowerCase().includes(term)) ||
      (t.email && t.email.toLowerCase().includes(term)) ||
      (t.ownerName && t.ownerName.toLowerCase().includes(term));
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: TenantStatus) => {
    switch (status) {
      case "ACTIVE": return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
      case "TRIALING":
      case "PENDING": return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100";
      case "PAST_DUE": return "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100";
      case "SUSPENDED": return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100";
      case "CANCELLED": return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const openAddForm = () => {
    setEditingTenant(null);
    setFormData({ name: "", ownerName: "", email: "", phone: "", modules: ["HOSPITALITY"] });
    setIsFormOpen(true);
  };

  const openEditForm = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      ownerName: tenant.ownerName || "",
      email: tenant.email || "",
      phone: tenant.phone || "",
      modules: tenant.modules && tenant.modules.length > 0 ? tenant.modules : ["HOSPITALITY"]
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || formData.modules.length === 0) {
      toast.error("Please fill all required fields and select at least one module.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTenant) {
        // Edit tenant
        const res = await apiFetch(`/tenant/${editingTenant._id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: formData.name,
            ownerName: formData.ownerName,
            email: formData.email,
            phone: formData.phone,
            modules: formData.modules,
          }),
        });

        if (res.ok) {
          toast.success("Tenant updated successfully.");
          setIsFormOpen(false);
          fetchTenants();
        } else {
          const errData = await res.json().catch(() => null);
          toast.error(errData?.message || "Failed to update tenant.");
        }
      } else {
        // Create new tenant
        const res = await apiFetch("/tenant", {
          method: "POST",
          body: JSON.stringify({
            businessName: formData.name,
            ownerName: formData.ownerName,
            email: formData.email,
            phone: formData.phone,
            modules: formData.modules,
          }),
        });

        if (res.ok) {
          toast.success("New tenant onboarded successfully.");
          setIsFormOpen(false);
          fetchTenants();
        } else {
          const errData = await res.json().catch(() => null);
          toast.error(errData?.message || "Failed to create tenant.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleModule = (module: string) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.includes(module) 
        ? prev.modules.filter(m => m !== module)
        : [...prev.modules, module]
    }));
  };

  const openConfirmDialog = (tenant: Tenant, type: "SUSPEND" | "ACTIVATE") => {
    setActionTenant(tenant);
    setActionType(type);
    setIsConfirmOpen(true);
  };

  const confirmAction = async () => {
    if (!actionTenant) return;
    setIsActionLoading(true);

    try {
      const endpoint = actionType === "SUSPEND" 
        ? `/tenant/${actionTenant._id}/suspend` 
        : `/tenant/${actionTenant._id}/reactivate`;

      const res = await apiFetch(endpoint, { method: "PATCH" });

      if (res.ok) {
        toast.success(`Tenant ${actionTenant.name} has been ${actionType === "SUSPEND" ? "suspended" : "activated"}.`);
        setIsConfirmOpen(false);
        fetchTenants();
      } else {
        const errData = await res.json().catch(() => null);
        toast.error(errData?.message || `Failed to ${actionType.toLowerCase()} tenant.`);
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tenants</h1>
          <p className="text-slate-500 mt-1">Manage platform tenants, property workspaces, and feature entitlements.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchTenants} 
            disabled={loading}
            className="cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={openAddForm} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer">
            <Plus className="w-4 h-4 mr-2" /> Onboard Tenant
          </Button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span className="text-sm">{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchTenants} className="cursor-pointer border-red-200 text-red-700 hover:bg-red-100">
            Retry
          </Button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by name, slug, owner, or email..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9 bg-slate-50 border-slate-200" 
          />
        </div>
        <div className="w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-slate-50 border-slate-200 cursor-pointer">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="cursor-pointer">All Statuses</SelectItem>
              <SelectItem value="ACTIVE" className="cursor-pointer">Active</SelectItem>
              <SelectItem value="TRIALING" className="cursor-pointer">Trialing</SelectItem>
              <SelectItem value="PAST_DUE" className="cursor-pointer">Past Due</SelectItem>
              <SelectItem value="SUSPENDED" className="cursor-pointer">Suspended</SelectItem>
              <SelectItem value="CANCELLED" className="cursor-pointer">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Business / Tenant</TableHead>
                <TableHead className="font-semibold text-slate-700">Owner & Contact</TableHead>
                <TableHead className="font-semibold text-slate-700">Platform Modules</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Locations</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mb-3" />
                      <p className="text-sm font-medium">Loading tenants from platform API...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTenants.length > 0 ? (
                filteredTenants.map((tenant) => (
                  <TableRow key={tenant._id} className="hover:bg-slate-50/50 transition-colors group">
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{tenant.name}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{tenant.slug || tenant._id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-slate-800">{tenant.ownerName || "Owner Account"}</div>
                      <div className="flex flex-col gap-1 mt-1 text-xs text-slate-500">
                        {tenant.email && (
                          <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {tenant.email}</div>
                        )}
                        {tenant.phone && (
                          <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {tenant.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {tenant.modules && tenant.modules.length > 0 ? (
                          tenant.modules.map(mod => (
                            <Badge key={mod} variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium tracking-wide">
                              {mod}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-medium bg-white">
                        {tenant.locationsCount ?? 1}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getStatusColor(tenant.status)} font-semibold`}>
                        {tenant.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditForm(tenant)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4 text-slate-500" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => router.push("/super-admin/subscriptions")} 
                            className="cursor-pointer"
                          >
                            <ShieldCheck className="mr-2 h-4 w-4 text-slate-500" /> View Subscriptions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {tenant.status === "SUSPENDED" ? (
                            <DropdownMenuItem onClick={() => openConfirmDialog(tenant, "ACTIVATE")} className="text-emerald-600 cursor-pointer focus:text-emerald-600">
                              <PlayCircle className="mr-2 h-4 w-4" /> Activate Tenant
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => openConfirmDialog(tenant, "SUSPEND")} className="text-red-600 cursor-pointer focus:text-red-600">
                              <Ban className="mr-2 h-4 w-4" /> Suspend Tenant
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-8 h-8 text-slate-300 mb-3" />
                      <p className="font-medium text-slate-600">No tenants found.</p>
                      <p className="text-sm">Try adjusting your filters or search query.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add / Edit Tenant Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTenant ? "Edit Tenant Details" : "Onboard New Tenant"}</DialogTitle>
            <DialogDescription>
              {editingTenant ? "Update the business and contact details below." : "Enter business and owner details to create a new property workspace."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-5 mt-3">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Business / Tenant Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Grand Hotel & Suites" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner">Owner Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="owner" 
                    value={formData.ownerName} 
                    onChange={(e) => setFormData({...formData, ownerName: e.target.value})} 
                    placeholder="John Doe" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    placeholder="+1 555-0000" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email <span className="text-red-500">*</span></Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  placeholder="admin@business.com" 
                  required 
                />
              </div>
              <div className="space-y-3 pt-2">
                <Label>Platform Modules <span className="text-red-500">*</span></Label>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="mod-hospitality" 
                      className="cursor-pointer"
                      checked={formData.modules.includes("HOSPITALITY")} 
                      onCheckedChange={() => toggleModule("HOSPITALITY")} 
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="mod-hospitality" className="font-medium cursor-pointer">HOSPITALITY</Label>
                      <p className="text-xs text-slate-500">Property, rooms, guests & bookings management.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="mod-restaurant" 
                      className="cursor-pointer"
                      checked={formData.modules.includes("RESTAURANT")} 
                      onCheckedChange={() => toggleModule("RESTAURANT")} 
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="mod-restaurant" className="font-medium cursor-pointer">RESTAURANT</Label>
                      <p className="text-xs text-slate-500">Point of sale, menu, tables & KDS management.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="mod-inventory" 
                      className="cursor-pointer"
                      checked={formData.modules.includes("INVENTORY")} 
                      onCheckedChange={() => toggleModule("INVENTORY")} 
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="mod-inventory" className="font-medium cursor-pointer">INVENTORY</Label>
                      <p className="text-xs text-slate-500">Recipe stock levels and ingredient tracking.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="cursor-pointer">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                {isSubmitting ? "Saving..." : editingTenant ? "Save Changes" : "Create Tenant"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className={actionType === "SUSPEND" ? "text-red-600" : "text-emerald-600"}>
              {actionType === "SUSPEND" ? "Suspend Tenant?" : "Activate Tenant?"}
            </DialogTitle>
            <DialogDescription className="mt-2 text-slate-600">
              {actionType === "SUSPEND" 
                ? `Are you sure you want to suspend ${actionTenant?.name}? They will lose access to all operational dashboards immediately.`
                : `Are you sure you want to activate ${actionTenant?.name}? They will regain access to their subscribed workspace.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button 
              variant={actionType === "SUSPEND" ? "destructive" : "default"} 
              onClick={confirmAction}
              disabled={isActionLoading}
              className={`cursor-pointer ${actionType === "ACTIVATE" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
            >
              {isActionLoading ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
