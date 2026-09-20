"use client";

import React, { useState } from "react";
import { Plus, Search, MoreHorizontal, Building2, Mail, Phone, MapPin, CalendarDays, Key, Ban, PlayCircle, ShieldCheck, Edit } from "lucide-react";
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

type TenantStatus = "ACTIVE" | "PENDING" | "SUSPENDED";

interface Tenant {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  locationsCount: number;
  status: TenantStatus;
  subscribedModules: string[];
  createdAt: string;
}

const initialTenants: Tenant[] = [
  {
    id: "TEN-001",
    name: "Grand Hotel & Suites",
    ownerName: "Sarah Jenkins",
    email: "admin@grandhotel.com",
    phone: "+1 555-0192",
    locationsCount: 3,
    status: "ACTIVE",
    subscribedModules: ["HOSPITALITY"],
    createdAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "TEN-002",
    name: "Bistro Plus",
    ownerName: "Marco Silva",
    email: "marco@bistroplus.com",
    phone: "+1 555-0234",
    locationsCount: 1,
    status: "ACTIVE",
    subscribedModules: ["RESTAURANT"],
    createdAt: "2026-04-20T14:30:00Z",
  },
  {
    id: "TEN-003",
    name: "City Resort & Dining",
    ownerName: "Elena Rodriguez",
    email: "erodriguez@cityresort.com",
    phone: "+1 555-0456",
    locationsCount: 2,
    status: "PENDING",
    subscribedModules: ["HOSPITALITY", "RESTAURANT"],
    createdAt: "2026-09-18T09:15:00Z",
  },
  {
    id: "TEN-004",
    name: "Lakeside Inn",
    ownerName: "David Chen",
    email: "management@lakesideinn.com",
    phone: "+1 555-0891",
    locationsCount: 1,
    status: "SUSPENDED",
    subscribedModules: ["HOSPITALITY"],
    createdAt: "2025-11-05T11:20:00Z",
  },
  {
    id: "TEN-005",
    name: "Spice Route Kitchens",
    ownerName: "Ananya Patel",
    email: "contact@spiceroute.com",
    phone: "+1 555-7833",
    locationsCount: 5,
    status: "ACTIVE",
    subscribedModules: ["RESTAURANT"],
    createdAt: "2026-01-10T08:45:00Z",
  }
];

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  // Form and action state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionTenant, setActionTenant] = useState<Tenant | null>(null);
  const [actionType, setActionType] = useState<"SUSPEND" | "ACTIVATE">("SUSPEND");
  
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    email: "",
    phone: "",
    modules: [] as string[]
  });

  const filteredTenants = tenants.filter(t => {
    const term = search.toLowerCase();
    const matchesSearch = t.name.toLowerCase().includes(term) || 
                          t.email.toLowerCase().includes(term) ||
                          t.ownerName.toLowerCase().includes(term);
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: TenantStatus) => {
    switch (status) {
      case "ACTIVE": return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
      case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100";
      case "SUSPENDED": return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData({ name: "", ownerName: "", email: "", phone: "", modules: [] });
    setIsFormOpen(true);
  };

  const openEditForm = (tenant: Tenant) => {
    setEditingId(tenant.id);
    setFormData({
      name: tenant.name,
      ownerName: tenant.ownerName,
      email: tenant.email,
      phone: tenant.phone,
      modules: tenant.subscribedModules
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || formData.modules.length === 0) {
      toast.error("Please fill all required fields and select at least one module.");
      return;
    }

    if (editingId) {
      setTenants(tenants.map(t => t.id === editingId ? { ...t, ...formData, subscribedModules: formData.modules } : t));
      toast.success("Tenant updated successfully.");
    } else {
      const newTenant: Tenant = {
        id: `TEN-00${tenants.length + 1}`,
        ...formData,
        subscribedModules: formData.modules,
        locationsCount: 1, // Defaulting for demo
        status: "PENDING",
        createdAt: new Date().toISOString()
      };
      setTenants([newTenant, ...tenants]);
      toast.success("New tenant onboarded successfully.");
    }
    setIsFormOpen(false);
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

  const confirmAction = () => {
    if (!actionTenant) return;
    const newStatus = actionType === "SUSPEND" ? "SUSPENDED" : "ACTIVE";
    setTenants(tenants.map(t => t.id === actionTenant.id ? { ...t, status: newStatus } : t));
    setIsConfirmOpen(false);
    toast.success(`Tenant ${actionTenant.name} has been ${actionType === "SUSPEND" ? "suspended" : "activated"}.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tenants</h1>
          <p className="text-slate-500 mt-1">Manage platform tenants, subscriptions, and modules.</p>
        </div>
        <Button onClick={openAddForm} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Onboard Tenant
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by name, owner, or email..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9 bg-slate-50 border-slate-200" 
          />
        </div>
        <div className="w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
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
              {filteredTenants.length > 0 ? (
                filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id} className="hover:bg-slate-50/50 transition-colors group">
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{tenant.name}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{tenant.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-slate-800">{tenant.ownerName}</div>
                      <div className="flex flex-col gap-1 mt-1 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {tenant.email}</div>
                        <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {tenant.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {tenant.subscribedModules.map(mod => (
                          <Badge key={mod} variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium tracking-wide">
                            {mod}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-medium bg-white">
                        {tenant.locationsCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getStatusColor(tenant.status)} font-semibold`}>
                        {tenant.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditForm(tenant)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4 text-slate-500" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <ShieldCheck className="mr-2 h-4 w-4 text-slate-500" /> Manage Subscriptions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {tenant.status === "ACTIVE" || tenant.status === "PENDING" ? (
                            <DropdownMenuItem onClick={() => openConfirmDialog(tenant, "SUSPEND")} className="text-red-600 cursor-pointer focus:text-red-600">
                              <Ban className="mr-2 h-4 w-4" /> Suspend Tenant
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => openConfirmDialog(tenant, "ACTIVATE")} className="text-emerald-600 cursor-pointer focus:text-emerald-600">
                              <PlayCircle className="mr-2 h-4 w-4" /> Activate Tenant
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
            <DialogTitle>{editingId ? "Edit Tenant Details" : "Onboard New Tenant"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the business details below." : "Enter the details for the new business entity to get them started."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-6 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Business / Tenant Name <span className="text-red-500">*</span></Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Grand Hotel" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner">Owner Name <span className="text-red-500">*</span></Label>
                  <Input id="owner" value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+1 555-0000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email <span className="text-red-500">*</span></Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="admin@business.com" required />
              </div>
              <div className="space-y-3 pt-2">
                <Label>Platform Modules <span className="text-red-500">*</span></Label>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id="mod-hospitality" 
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
                      checked={formData.modules.includes("RESTAURANT")} 
                      onCheckedChange={() => toggleModule("RESTAURANT")} 
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="mod-restaurant" className="font-medium cursor-pointer">RESTAURANT</Label>
                      <p className="text-xs text-slate-500">Point of sale, menu, tables & KDS management.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                {editingId ? "Save Changes" : "Create Tenant"}
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
            <DialogDescription className="mt-2">
              {actionType === "SUSPEND" 
                ? `Are you sure you want to suspend ${actionTenant?.name}? They will lose access to all operational dashboards immediately.`
                : `Are you sure you want to activate ${actionTenant?.name}? They will regain access to their subscribed modules.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
            <Button 
              variant={actionType === "SUSPEND" ? "destructive" : "default"} 
              onClick={confirmAction}
              className={actionType === "ACTIVATE" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
