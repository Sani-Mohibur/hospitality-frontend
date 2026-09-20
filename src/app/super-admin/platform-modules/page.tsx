"use client";

import React, { useState } from "react";
import { 
  Search, 
  MoreHorizontal, 
  Package, 
  Layers, 
  Settings2, 
  Power, 
  PowerOff, 
  Edit, 
  Plus, 
  Tag, 
  DollarSign, 
  Users 
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
import { toast } from "sonner";

type ModuleStatus = "ACTIVE" | "INACTIVE" | "DEPRECATED";
type ModulePricingModel = "FLAT_FEE" | "PER_USER" | "PER_LOCATION";

interface PlatformModule {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  pricingModel: ModulePricingModel;
  status: ModuleStatus;
  activeSubscribers: number;
  updatedAt: string;
}

const initialModules: PlatformModule[] = [
  {
    id: "MOD-001",
    code: "HOSPITALITY",
    name: "Hospitality Core",
    description: "Property, rooms, guests & bookings management.",
    category: "Core",
    basePrice: 199,
    pricingModel: "FLAT_FEE",
    status: "ACTIVE",
    activeSubscribers: 142,
    updatedAt: "2026-08-15T10:00:00Z",
  },
  {
    id: "MOD-002",
    code: "RESTAURANT",
    name: "Restaurant Core",
    description: "Point of sale, menu, tables & KDS management.",
    category: "Core",
    basePrice: 149,
    pricingModel: "FLAT_FEE",
    status: "ACTIVE",
    activeSubscribers: 98,
    updatedAt: "2026-08-15T10:00:00Z",
  },
  {
    id: "MOD-003",
    code: "INVENTORY",
    name: "Advanced Inventory",
    description: "Centralized stock levels and ingredient tracking.",
    category: "Add-on",
    basePrice: 49,
    pricingModel: "PER_LOCATION",
    status: "ACTIVE",
    activeSubscribers: 45,
    updatedAt: "2026-09-01T14:30:00Z",
  },
  {
    id: "MOD-004",
    code: "STAFF_MANAGEMENT",
    name: "Staff & Scheduling",
    description: "Roster, timesheets, and role-based permissions.",
    category: "Add-on",
    basePrice: 5,
    pricingModel: "PER_USER",
    status: "ACTIVE",
    activeSubscribers: 210,
    updatedAt: "2026-07-20T09:15:00Z",
  },
  {
    id: "MOD-005",
    code: "SPA_SERVICES",
    name: "Spa & Wellness",
    description: "Appointments, treatments, and therapist scheduling.",
    category: "Core",
    basePrice: 99,
    pricingModel: "FLAT_FEE",
    status: "INACTIVE",
    activeSubscribers: 0,
    updatedAt: "2026-09-15T11:20:00Z",
  },
];

export default function PlatformModulesPage() {
  const [modules, setModules] = useState<PlatformModule[]>(initialModules);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Form and action state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionModule, setActionModule] = useState<PlatformModule | null>(null);
  const [actionType, setActionType] = useState<"DISABLE" | "ENABLE">("DISABLE");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    category: "Core",
    basePrice: "",
    pricingModel: "FLAT_FEE" as ModulePricingModel,
  });

  const filteredModules = modules.filter(mod => {
    const term = search.toLowerCase();
    const matchesSearch = mod.name.toLowerCase().includes(term) || 
                          mod.code.toLowerCase().includes(term);
    const matchesStatus = statusFilter === "ALL" || mod.status === statusFilter;
    const matchesCategory = categoryFilter === "ALL" || mod.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: ModuleStatus) => {
    switch (status) {
      case "ACTIVE": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "INACTIVE": return "bg-slate-100 text-slate-700 border-slate-200";
      case "DEPRECATED": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPricingModelLabel = (model: ModulePricingModel) => {
    switch (model) {
      case "FLAT_FEE": return "Flat Fee";
      case "PER_USER": return "Per User";
      case "PER_LOCATION": return "Per Location";
      default: return model;
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      category: "Core",
      basePrice: "",
      pricingModel: "FLAT_FEE",
    });
    setIsFormOpen(true);
  };

  const openEditForm = (mod: PlatformModule) => {
    setEditingId(mod.id);
    setFormData({
      code: mod.code,
      name: mod.name,
      description: mod.description,
      category: mod.category,
      basePrice: mod.basePrice.toString(),
      pricingModel: mod.pricingModel,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formData.basePrice);

    if (!formData.name || !formData.code || isNaN(priceNum) || priceNum < 0) {
      toast.error("Please fill all required fields correctly. Price must be a positive number.");
      return;
    }

    if (editingId) {
      setModules(modules.map(m => 
        m.id === editingId ? { 
          ...m, 
          ...formData, 
          code: formData.code.toUpperCase(),
          basePrice: priceNum,
          updatedAt: new Date().toISOString()
        } : m
      ));
      toast.success("Platform module updated successfully.");
    } else {
      const newModule: PlatformModule = {
        id: `MOD-00${modules.length + 1}`,
        ...formData,
        code: formData.code.toUpperCase(),
        basePrice: priceNum,
        status: "INACTIVE", // Default to inactive when created
        activeSubscribers: 0,
        updatedAt: new Date().toISOString()
      };
      setModules([...modules, newModule]);
      toast.success("New platform module created.");
    }
    setIsFormOpen(false);
  };

  const openConfirmDialog = (mod: PlatformModule, type: "DISABLE" | "ENABLE") => {
    setActionModule(mod);
    setActionType(type);
    setIsConfirmOpen(true);
  };

  const confirmAction = () => {
    if (!actionModule) return;
    const newStatus = actionType === "DISABLE" ? "INACTIVE" : "ACTIVE";
    setModules(modules.map(m => m.id === actionModule.id ? { ...m, status: newStatus } : m));
    setIsConfirmOpen(false);
    toast.success(`Module ${actionModule.name} has been ${actionType === "DISABLE" ? "disabled" : "enabled"}.`);
  };

  const totalActiveModules = modules.filter(m => m.status === "ACTIVE").length;
  const totalSubscribers = modules.reduce((acc, mod) => acc + mod.activeSubscribers, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header & KPI Cards */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Modules</h1>
          <p className="text-slate-500 mt-1">Configure global modules, pricing, and system features.</p>
        </div>
        <Button onClick={openAddForm} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Module
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Modules</p>
            <h3 className="text-2xl font-bold text-slate-900">{modules.length}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Modules</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalActiveModules}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Deployments</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalSubscribers}</h3>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search modules by name or code..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="pl-9 bg-slate-50 border-slate-200" 
          />
        </div>
        <div className="flex w-full sm:w-auto gap-4">
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-full sm:w-[150px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="DEPRECATED">Deprecated</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
            <SelectTrigger className="w-full sm:w-[150px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="Core">Core</SelectItem>
              <SelectItem value="Add-on">Add-on</SelectItem>
              <SelectItem value="Integration">Integration</SelectItem>
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
                <TableHead className="font-semibold text-slate-700">Module Details</TableHead>
                <TableHead className="font-semibold text-slate-700">Category</TableHead>
                <TableHead className="font-semibold text-slate-700">Pricing</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">Subscribers</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModules.length > 0 ? (
                filteredModules.map((mod) => (
                  <TableRow key={mod.id} className="hover:bg-slate-50/50 transition-colors group">
                    <TableCell>
                      <div className="flex items-start gap-3 max-w-[300px]">
                        <div className="mt-1 p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{mod.name}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{mod.code}</div>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1" title={mod.description}>{mod.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm font-medium text-slate-600">
                        <Tag className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {mod.category}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900 flex items-center">
                        <DollarSign className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
                        {mod.basePrice}
                      </div>
                      <Badge variant="outline" className="mt-1 bg-white text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        {getPricingModelLabel(mod.pricingModel)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-slate-700">{mod.activeSubscribers}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getStatusColor(mod.status)} font-semibold`}>
                        {mod.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Module Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditForm(mod)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4 text-slate-500" /> Edit Configuration
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {mod.status === "ACTIVE" ? (
                            <DropdownMenuItem onClick={() => openConfirmDialog(mod, "DISABLE")} className="text-red-600 cursor-pointer focus:text-red-600">
                              <PowerOff className="mr-2 h-4 w-4" /> Disable Module
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => openConfirmDialog(mod, "ENABLE")} className="text-emerald-600 cursor-pointer focus:text-emerald-600">
                              <Power className="mr-2 h-4 w-4" /> Enable Module
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
                      <Layers className="w-8 h-8 text-slate-300 mb-3" />
                      <p className="font-medium text-slate-600">No modules found.</p>
                      <p className="text-sm">Try adjusting your filters or search query.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add / Edit Module Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Platform Module" : "Add Platform Module"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the configuration and pricing for this module." : "Define a new feature module available for tenant subscription."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Module Name <span className="text-red-500">*</span></Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Spa & Wellness" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Module Code <span className="text-red-500">*</span></Label>
                <Input id="code" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="e.g. SPA_SERVICES" className="uppercase" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Brief description of features..." />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(v) => v && setFormData({...formData, category: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Core">Core</SelectItem>
                  <SelectItem value="Add-on">Add-on</SelectItem>
                  <SelectItem value="Integration">Integration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price ($) <span className="text-red-500">*</span></Label>
                <Input id="basePrice" type="number" min="0" step="0.01" value={formData.basePrice} onChange={(e) => setFormData({...formData, basePrice: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Pricing Model</Label>
                <Select value={formData.pricingModel} onValueChange={(v) => v && setFormData({...formData, pricingModel: v as ModulePricingModel})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FLAT_FEE">Flat Fee</SelectItem>
                    <SelectItem value="PER_USER">Per User</SelectItem>
                    <SelectItem value="PER_LOCATION">Per Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                {editingId ? "Save Changes" : "Create Module"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className={actionType === "DISABLE" ? "text-red-600" : "text-emerald-600"}>
              {actionType === "DISABLE" ? "Disable Module?" : "Enable Module?"}
            </DialogTitle>
            <DialogDescription className="mt-2 text-slate-600">
              {actionType === "DISABLE" 
                ? `Are you sure you want to disable ${actionModule?.name}? New tenants will not be able to subscribe to it. Existing subscriptions will not be cancelled automatically.`
                : `Are you sure you want to enable ${actionModule?.name}? It will become available for new subscriptions immediately.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Back</Button>
            <Button 
              variant={actionType === "DISABLE" ? "destructive" : "default"} 
              onClick={confirmAction}
              className={actionType === "ENABLE" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
