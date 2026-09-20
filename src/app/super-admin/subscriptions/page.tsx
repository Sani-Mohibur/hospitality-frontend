"use client";

import React, { useState } from "react";
import { 
  Search, 
  MoreHorizontal, 
  CreditCard, 
  CalendarDays, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Gift,
  Building2,
  DollarSign,
  Receipt,
  FileEdit,
  Ban,
  RotateCcw
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

type SubscriptionStatus = "ACTIVE" | "OVERDUE" | "CANCELLED";
type BillingCycle = "MONTHLY" | "YEARLY";

interface Subscription {
  id: string;
  tenantName: string;
  tenantId: string;
  planName: string;
  price: number;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  nextBillingDate: string;
  appliedCredits: number;
}

const initialSubscriptions: Subscription[] = [
  {
    id: "SUB-001",
    tenantName: "Grand Hotel & Suites",
    tenantId: "TEN-001",
    planName: "Hospitality Pro",
    price: 299,
    billingCycle: "MONTHLY",
    status: "ACTIVE",
    nextBillingDate: "2026-10-15T00:00:00Z",
    appliedCredits: 0,
  },
  {
    id: "SUB-002",
    tenantName: "Bistro Plus",
    tenantId: "TEN-002",
    planName: "Restaurant Essentials",
    price: 99,
    billingCycle: "MONTHLY",
    status: "OVERDUE",
    nextBillingDate: "2026-09-20T00:00:00Z",
    appliedCredits: 0,
  },
  {
    id: "SUB-003",
    tenantName: "City Resort & Dining",
    tenantId: "TEN-003",
    planName: "Platform Enterprise",
    price: 3500,
    billingCycle: "YEARLY",
    status: "ACTIVE",
    nextBillingDate: "2027-09-18T00:00:00Z",
    appliedCredits: 500,
  },
  {
    id: "SUB-004",
    tenantName: "Lakeside Inn",
    tenantId: "TEN-004",
    planName: "Hospitality Basic",
    price: 149,
    billingCycle: "MONTHLY",
    status: "CANCELLED",
    nextBillingDate: "2025-12-05T00:00:00Z",
    appliedCredits: 0,
  },
  {
    id: "SUB-005",
    tenantName: "Spice Route Kitchens",
    tenantId: "TEN-005",
    planName: "Restaurant Pro",
    price: 199,
    billingCycle: "MONTHLY",
    status: "ACTIVE",
    nextBillingDate: "2026-10-10T00:00:00Z",
    appliedCredits: 50,
  }
];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cycleFilter, setCycleFilter] = useState("ALL");

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Form and action state
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [actionSub, setActionSub] = useState<Subscription | null>(null);
  const [actionType, setActionType] = useState<"CANCEL" | "REACTIVATE">("CANCEL");

  const [formData, setFormData] = useState({
    planName: "",
    price: "",
    billingCycle: "MONTHLY" as BillingCycle,
    appliedCredits: ""
  });

  const filteredSubscriptions = subscriptions.filter(sub => {
    const term = search.toLowerCase();
    const matchesSearch = sub.tenantName.toLowerCase().includes(term) || 
                          sub.tenantId.toLowerCase().includes(term) ||
                          sub.planName.toLowerCase().includes(term);
    const matchesStatus = statusFilter === "ALL" || sub.status === statusFilter;
    const matchesCycle = cycleFilter === "ALL" || sub.billingCycle === cycleFilter;
    
    return matchesSearch && matchesStatus && matchesCycle;
  });

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case "ACTIVE": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "OVERDUE": return "bg-red-100 text-red-700 border-red-200";
      case "CANCELLED": return "bg-slate-100 text-slate-700 border-slate-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status: SubscriptionStatus) => {
    switch (status) {
      case "ACTIVE": return <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />;
      case "OVERDUE": return <AlertCircle className="w-3.5 h-3.5 mr-1.5" />;
      case "CANCELLED": return <XCircle className="w-3.5 h-3.5 mr-1.5" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const openEditForm = (sub: Subscription) => {
    setEditingSub(sub);
    setFormData({
      planName: sub.planName,
      price: sub.price.toString(),
      billingCycle: sub.billingCycle,
      appliedCredits: sub.appliedCredits.toString()
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    
    const priceNum = parseFloat(formData.price);
    const creditsNum = parseFloat(formData.appliedCredits);

    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Please enter a valid positive price.");
      return;
    }
    if (isNaN(creditsNum) || creditsNum < 0) {
      toast.error("Please enter a valid credits amount (0 or more).");
      return;
    }

    setSubscriptions(subscriptions.map(s => 
      s.id === editingSub.id ? { 
        ...s, 
        planName: formData.planName, 
        price: priceNum, 
        billingCycle: formData.billingCycle, 
        appliedCredits: creditsNum 
      } : s
    ));
    
    toast.success(`Subscription for ${editingSub.tenantName} updated successfully.`);
    setIsEditOpen(false);
  };

  const openConfirmDialog = (sub: Subscription, type: "CANCEL" | "REACTIVATE") => {
    setActionSub(sub);
    setActionType(type);
    setIsConfirmOpen(true);
  };

  const confirmAction = () => {
    if (!actionSub) return;
    const newStatus = actionType === "CANCEL" ? "CANCELLED" : "ACTIVE";
    setSubscriptions(subscriptions.map(s => s.id === actionSub.id ? { ...s, status: newStatus } : s));
    setIsConfirmOpen(false);
    toast.success(`Subscription for ${actionSub.tenantName} has been ${actionType === "CANCEL" ? "cancelled" : "reactivated"}.`);
  };

  // Stats for the header
  const totalActive = subscriptions.filter(s => s.status === "ACTIVE").length;
  const totalOverdue = subscriptions.filter(s => s.status === "OVERDUE").length;
  const mrr = subscriptions.filter(s => s.status === "ACTIVE" || s.status === "OVERDUE")
    .reduce((acc, sub) => acc + (sub.billingCycle === "YEARLY" ? sub.price / 12 : sub.price), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header & KPI Cards */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Subscriptions & Billing</h1>
        <p className="text-slate-500 mt-1 mb-6">Manage platform pricing, billing cycles, and tenant subscriptions.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Est. MRR</p>
              <h3 className="text-2xl font-bold text-slate-900">${mrr.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Subscriptions</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalActive}</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Overdue Invoices</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalOverdue}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by tenant, ID, or plan..." 
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
              <SelectItem value="OVERDUE">Overdue</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={cycleFilter} onValueChange={(v) => v && setCycleFilter(v)}>
            <SelectTrigger className="w-full sm:w-[150px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Billing Cycle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Cycles</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
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
                <TableHead className="font-semibold text-slate-700">Subscription Plan</TableHead>
                <TableHead className="font-semibold text-slate-700">Amount</TableHead>
                <TableHead className="font-semibold text-slate-700">Next Billing</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.length > 0 ? (
                filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 bg-slate-100 text-slate-500 rounded-lg shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{sub.tenantName}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{sub.tenantId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-800">{sub.planName}</div>
                      <Badge variant="outline" className="mt-1 bg-white text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        {sub.billingCycle}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">${sub.price}</div>
                      {sub.appliedCredits > 0 && (
                        <div className="text-xs text-emerald-600 font-medium flex items-center mt-1">
                          <Gift className="w-3 h-3 mr-1" /> -${sub.appliedCredits} credit
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-slate-600">
                        <CalendarDays className="w-4 h-4 mr-2 text-slate-400" />
                        {sub.status === "CANCELLED" ? "-" : formatDate(sub.nextBillingDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`flex items-center w-fit ${getStatusColor(sub.status)} font-semibold`}>
                        {getStatusIcon(sub.status)}
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Subscription Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditForm(sub)} className="cursor-pointer">
                            <FileEdit className="mr-2 h-4 w-4 text-slate-500" /> Edit Plan Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {sub.status === "ACTIVE" || sub.status === "OVERDUE" ? (
                            <DropdownMenuItem onClick={() => openConfirmDialog(sub, "CANCEL")} className="text-red-600 cursor-pointer focus:text-red-600">
                              <Ban className="mr-2 h-4 w-4" /> Cancel Subscription
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => openConfirmDialog(sub, "REACTIVATE")} className="text-emerald-600 cursor-pointer focus:text-emerald-600">
                              <RotateCcw className="mr-2 h-4 w-4" /> Reactivate Plan
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
                      <Receipt className="w-8 h-8 text-slate-300 mb-3" />
                      <p className="font-medium text-slate-600">No subscriptions found.</p>
                      <p className="text-sm">Try adjusting your filters or search query.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Subscription Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Modify billing details for {editingSub?.tenantName}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="planName">Plan Name</Label>
              <Input id="planName" value={formData.planName} onChange={(e) => setFormData({...formData, planName: e.target.value})} required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Amount ($)</Label>
                <Input id="price" type="number" min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Billing Cycle</Label>
                <Select value={formData.billingCycle} onValueChange={(v) => v && setFormData({...formData, billingCycle: v as BillingCycle})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credits">Applied Credits ($)</Label>
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <Input 
                  id="credits" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  className="pl-9"
                  value={formData.appliedCredits} 
                  onChange={(e) => setFormData({...formData, appliedCredits: e.target.value})} 
                />
              </div>
              <p className="text-[11px] text-slate-500">Credits will be deducted from the next invoice.</p>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className={actionType === "CANCEL" ? "text-red-600" : "text-emerald-600"}>
              {actionType === "CANCEL" ? "Cancel Subscription?" : "Reactivate Subscription?"}
            </DialogTitle>
            <DialogDescription className="mt-2 text-slate-600">
              {actionType === "CANCEL" 
                ? `Are you sure you want to cancel the subscription for ${actionSub?.tenantName}? Their access will be revoked at the end of the current billing cycle.`
                : `Are you sure you want to reactivate the subscription for ${actionSub?.tenantName}? They will be billed immediately for the new cycle.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Back</Button>
            <Button 
              variant={actionType === "CANCEL" ? "destructive" : "default"} 
              onClick={confirmAction}
              className={actionType === "REACTIVATE" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
