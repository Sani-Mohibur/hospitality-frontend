"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Users,
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
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

type ModulePricingModel = "FLAT" | "PER_ROOM" | "PER_OUTLET" | "PER_LOCATION";

interface PlatformModule {
  _id: string;
  code: string;
  name: string;
  description?: string;
  isAddOn?: boolean;
  unitPriceMinor: number;
  minimumMinor?: number;
  bundleUnitPriceMinor?: number;
  pricingModel: ModulePricingModel;
  isActive: boolean;
  activeSubscribers?: number;
  updatedAt?: string;
}

export default function PlatformModulesPage() {
  const [modules, setModules] = useState<PlatformModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form and action state
  const [editingModule, setEditingModule] = useState<PlatformModule | null>(null);
  const [actionModule, setActionModule] = useState<PlatformModule | null>(null);
  const [actionType, setActionType] = useState<"DISABLE" | "ENABLE">("DISABLE");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    category: "Core",
    basePrice: "",
    pricingModel: "FLAT" as ModulePricingModel,
  });

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/platform-module");
      if (res.ok) {
        const data = await res.json();
        setModules(data.data || []);
      } else {
        const errData = await res.json().catch(() => null);
        setError(errData?.message || "Failed to load platform modules");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while loading modules");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const filteredModules = modules.filter(mod => {
    const term = search.toLowerCase();
    const matchesSearch = mod.name.toLowerCase().includes(term) || 
                          mod.code.toLowerCase().includes(term);
    const modStatus = mod.isActive ? "ACTIVE" : "INACTIVE";
    const matchesStatus = statusFilter === "ALL" || modStatus === statusFilter;
    const modCategory = mod.isAddOn ? "Add-on" : "Core";
    const matchesCategory = categoryFilter === "ALL" || modCategory === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getPricingModelLabel = (model: ModulePricingModel) => {
    switch (model) {
      case "FLAT": return "Flat Fee";
      case "PER_ROOM": return "Per Room";
      case "PER_OUTLET": return "Per Outlet";
      case "PER_LOCATION": return "Per Location";
      default: return model;
    }
  };

  const openAddForm = () => {
    setEditingModule(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      category: "Core",
      basePrice: "",
      pricingModel: "FLAT",
    });
    setIsFormOpen(true);
  };

  const openEditForm = (mod: PlatformModule) => {
    setEditingModule(mod);
    setFormData({
      code: mod.code,
      name: mod.name,
      description: mod.description || "",
      category: mod.isAddOn ? "Add-on" : "Core",
      basePrice: ((mod.unitPriceMinor || 0) / 100).toString(),
      pricingModel: mod.pricingModel || "FLAT",
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formData.basePrice);

    if (!formData.name || !formData.code || isNaN(priceNum) || priceNum < 0) {
      toast.error("Please fill all required fields correctly. Price must be positive.");
      return;
    }

    setIsSubmitting(true);
    const unitPriceMinor = Math.round(priceNum * 100);
    const isAddOn = formData.category !== "Core";

    try {
      if (editingModule) {
        const res = await apiFetch(`/platform-module/${editingModule._id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: formData.name,
            code: formData.code.toUpperCase(),
            description: formData.description,
            isAddOn,
            unitPriceMinor,
            pricingModel: formData.pricingModel,
          }),
        });

        if (res.ok) {
          toast.success("Platform module updated successfully.");
          setIsFormOpen(false);
          fetchModules();
        } else {
          const errData = await res.json().catch(() => null);
          toast.error(errData?.message || "Failed to update module.");
        }
      } else {
        const res = await apiFetch("/platform-module", {
          method: "POST",
          body: JSON.stringify({
            name: formData.name,
            code: formData.code.toUpperCase(),
            description: formData.description,
            isAddOn,
            unitPriceMinor,
            pricingModel: formData.pricingModel,
            isActive: true,
          }),
        });

        if (res.ok) {
          toast.success("New platform module created successfully.");
          setIsFormOpen(false);
          fetchModules();
        } else {
          const errData = await res.json().catch(() => null);
          toast.error(errData?.message || "Failed to create module.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openConfirmDialog = (mod: PlatformModule, type: "DISABLE" | "ENABLE") => {
    setActionModule(mod);
    setActionType(type);
    setIsConfirmOpen(true);
  };

  const confirmAction = async () => {
    if (!actionModule) return;
    setIsActionLoading(true);

    try {
      const newActive = actionType === "ENABLE";
      const res = await apiFetch(`/platform-module/${actionModule._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: newActive }),
      });

      if (res.ok) {
        toast.success(`Module ${actionModule.name} has been ${actionType === "DISABLE" ? "disabled" : "enabled"}.`);
        setIsConfirmOpen(false);
        fetchModules();
      } else {
        const errData = await res.json().catch(() => null);
        toast.error(errData?.message || "Failed to update module status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const totalActiveModules = modules.filter(m => m.isActive).length;
  const totalSubscribers = modules.reduce((acc, mod) => acc + (mod.activeSubscribers || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header & KPI Cards */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Modules</h1>
          <p className="text-slate-500 mt-1">Configure global catalog modules, unit rates, and pricing models.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchModules} 
            disabled={loading}
            className="cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={openAddForm} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer">
            <Plus className="w-4 h-4 mr-2" /> Add Module
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span className="text-sm">{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchModules} className="cursor-pointer border-red-200 text-red-700 hover:bg-red-100">
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Catalog Modules</p>
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
            <p className="text-sm font-medium text-slate-500">Subscribed Deployments</p>
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
            <SelectTrigger className="w-full sm:w-[150px] bg-slate-50 border-slate-200 cursor-pointer">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="cursor-pointer">All Statuses</SelectItem>
              <SelectItem value="ACTIVE" className="cursor-pointer">Active</SelectItem>
              <SelectItem value="INACTIVE" className="cursor-pointer">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
            <SelectTrigger className="w-full sm:w-[150px] bg-slate-50 border-slate-200 cursor-pointer">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="cursor-pointer">All Categories</SelectItem>
              <SelectItem value="Core" className="cursor-pointer">Core</SelectItem>
              <SelectItem value="Add-on" className="cursor-pointer">Add-on</SelectItem>
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mb-3" />
                      <p className="text-sm font-medium">Loading catalog modules...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredModules.length > 0 ? (
                filteredModules.map((mod) => {
                  const dollars = ((mod.unitPriceMinor || 0) / 100).toFixed(2);
                  const isCore = !mod.isAddOn;

                  return (
                    <TableRow key={mod._id} className="hover:bg-slate-50/50 transition-colors group">
                      <TableCell>
                        <div className="flex items-start gap-3 max-w-[300px]">
                          <div className="mt-1 p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{mod.name}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">{mod.code}</div>
                            {mod.description && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1" title={mod.description}>
                                {mod.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm font-medium text-slate-600">
                          <Tag className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                          {isCore ? "Core" : "Add-on"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-900 flex items-center">
                          <DollarSign className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
                          {dollars}
                        </div>
                        <Badge variant="outline" className="mt-1 bg-white text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          {getPricingModelLabel(mod.pricingModel)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium text-slate-700">{mod.activeSubscribers ?? 0}</span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`font-semibold ${
                            mod.isActive 
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {mod.isActive ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Module Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditForm(mod)} className="cursor-pointer">
                              <Edit className="mr-2 h-4 w-4 text-slate-500" /> Edit Configuration
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {mod.isActive ? (
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
                  );
                })
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
            <DialogTitle>{editingModule ? "Edit Platform Module" : "Add Platform Module"}</DialogTitle>
            <DialogDescription>
              {editingModule ? "Update the rate and model configuration for this module." : "Define a new feature module available in the SaaS catalog."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Module Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Spa & Wellness" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Module Code <span className="text-red-500">*</span></Label>
                <Input 
                  id="code" 
                  value={formData.code} 
                  onChange={(e) => setFormData({...formData, code: e.target.value})} 
                  placeholder="e.g. SPA_SERVICES" 
                  className="uppercase" 
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="Brief description of features..." 
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(v) => v && setFormData({...formData, category: v})}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Core" className="cursor-pointer">Core</SelectItem>
                  <SelectItem value="Add-on" className="cursor-pointer">Add-on</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price ($) <span className="text-red-500">*</span></Label>
                <Input 
                  id="basePrice" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={formData.basePrice} 
                  onChange={(e) => setFormData({...formData, basePrice: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Pricing Model</Label>
                <Select value={formData.pricingModel} onValueChange={(v) => v && setFormData({...formData, pricingModel: v as ModulePricingModel})}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FLAT" className="cursor-pointer">Flat Fee</SelectItem>
                    <SelectItem value="PER_ROOM" className="cursor-pointer">Per Room</SelectItem>
                    <SelectItem value="PER_OUTLET" className="cursor-pointer">Per Outlet</SelectItem>
                    <SelectItem value="PER_LOCATION" className="cursor-pointer">Per Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="cursor-pointer">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                {isSubmitting ? "Saving..." : editingModule ? "Save Changes" : "Create Module"}
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
                ? `Are you sure you want to disable ${actionModule?.name}? New tenants will not be able to subscribe to it.`
                : `Are you sure you want to enable ${actionModule?.name}? It will become available for subscriptions immediately.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="cursor-pointer">Back</Button>
            <Button 
              variant={actionType === "DISABLE" ? "destructive" : "default"} 
              onClick={confirmAction}
              disabled={isActionLoading}
              className={`cursor-pointer ${actionType === "ENABLE" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
            >
              {isActionLoading ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
