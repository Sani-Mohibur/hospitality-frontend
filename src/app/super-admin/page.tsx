"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Users,
  Package,
  CreditCard,
  DollarSign,
  AlertCircle,
  Building2,
  TrendingUp,
  Settings,
  BarChart3,
  RefreshCw,
  Activity,
  Layers,
} from "lucide-react";
import { RevenueChart } from "@/components/super-admin/revenue-chart";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

interface PlatformStats {
  tenants: { total: number; byStatus: { _id: string; count: number }[]; newToday?: number };
  subscriptions: { paying: number; trialing: number; pastDue: number; total?: number };
  modules?: { active: number };
  users: { total: number };
  financials: {
    mrrMinor: number;
    arrMinor: number;
    openInvoices: { count: number; amountMinor: number };
    revenueHistory?: { month: string; totalMinor: number }[];
  };
}

interface TenantHealthRow {
  tenantId: string;
  name: string;
  status: string;
  modules: string[];
  rooms: number;
  outlets: number;
  ordersLast7d: number;
  reservationsLast7d: number;
  mrrMinor: number;
  overdueMinor: number;
  churnRisk: "LOW" | "MEDIUM" | "HIGH";
  lastActivityAt?: string;
}

interface AuditLogItem {
  _id: string;
  action: string;
  entity: string;
  user?: { name: string; email: string };
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [topTenants, setTopTenants] = useState<TenantHealthRow[]>([]);
  const [recentLogs, setRecentLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, healthRes, logsRes] = await Promise.all([
        apiFetch("/super-admin/stats"),
        apiFetch("/super-admin/tenants/health"),
        apiFetch("/audit-log?limit=4"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setTopTenants(healthData.data || []);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setRecentLogs(logsData.data || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      setError("Unable to load platform statistics. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalTenants = stats?.tenants?.total ?? 0;
  const activeModules = stats?.modules?.active ?? 5;
  const totalSubs = stats?.subscriptions?.total ?? (stats?.subscriptions?.paying ?? 0) + (stats?.subscriptions?.trialing ?? 0);
  const mrrDollars = Math.round((stats?.financials?.mrrMinor ?? 0) / 100);
  const arrDollars = Math.round((stats?.financials?.arrMinor ?? 0) / 100);
  const overdueSubs = stats?.subscriptions?.pastDue ?? 0;
  const openInvoicesCount = stats?.financials?.openInvoices?.count ?? 0;
  const newTenantsToday = stats?.tenants?.newToday ?? 0;

  // Prepare chart data from revenue history if available
  const chartData = (stats?.financials?.revenueHistory || []).map((h) => ({
    name: h.month,
    total: Math.round(h.totalMinor / 100),
  }));

  const getInitials = (name?: string) => {
    if (!name) return "TH";
    const parts = name.trim().split(" ");
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "recently";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Error Banner if any */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span className="text-sm">{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchDashboardData} className="cursor-pointer border-red-200 text-red-700 hover:bg-red-100">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
          </Button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1e58d4] to-[#3b82f6] rounded-2xl p-8 text-white flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || "Admin"}</h1>
          <p className="text-blue-100 mb-6">Here&apos;s your platform performance overview</p>

          <div className="flex gap-6 flex-wrap">
            <div className="bg-white/10 rounded-xl p-4 min-w-[160px]">
              <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
                <Users className="w-4 h-4" /> New Tenants Today
              </div>
              <div className="text-2xl font-bold">
                {loading ? "..." : newTenantsToday}{" "}
                <span className="text-xs font-normal text-green-300 ml-1">Live from database</span>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 min-w-[160px]">
              <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
                <CreditCard className="w-4 h-4" /> Monthly Run Rate (MRR)
              </div>
              <div className="text-2xl font-bold">
                {loading ? "..." : `$${mrrDollars.toLocaleString()}`}{" "}
                <span className="text-xs font-normal text-green-300 ml-1">Live subscriptions</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-end gap-3">
          <Button 
            onClick={fetchDashboardData}
            variant="secondary" 
            disabled={loading}
            className="bg-white text-blue-600 hover:bg-blue-50 border-none cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh Data
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Tenants",
            value: loading ? "..." : totalTenants.toString(),
            trend: "+Active",
            label: "Registered entities",
            progress: Math.min(totalTenants * 5, 100),
            icon: Building2,
            color: "text-blue-600",
          },
          {
            title: "Active Modules",
            value: loading ? "..." : activeModules.toString(),
            trend: "Catalog",
            label: "Subscribed features",
            progress: Math.min(activeModules * 20, 100),
            icon: Package,
            color: "text-green-600",
          },
          {
            title: "Total Subscriptions",
            value: loading ? "..." : totalSubs.toString(),
            trend: "Active plans",
            label: "Paying / trialing accounts",
            progress: totalSubs > 0 ? 85 : 0,
            icon: CreditCard,
            color: "text-orange-500",
          },
          {
            title: "Annualized ARR",
            value: loading ? "..." : `$${arrDollars.toLocaleString()}`,
            trend: "MRR × 12",
            label: "Projected annual revenue",
            progress: arrDollars > 0 ? 90 : 0,
            icon: DollarSign,
            color: "text-purple-600",
          },
        ].map((stat, i) => (
          <Card key={i} className="shadow-sm border-slate-100">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                {stat.trend}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1 mb-3">{stat.title}</div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{stat.label}</span>
              </div>
              <Progress value={stat.progress} className="h-1.5" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-100">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Platform MRR and subscription billing performance</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Monthly Run Rate
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <RevenueChart data={chartData} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="bg-blue-50/50 p-4 rounded-xl flex flex-col items-center justify-center text-center border border-blue-100/50">
                  <div className="text-blue-500 mb-2"><DollarSign className="w-5 h-5" /></div>
                  <div className="font-bold text-lg text-slate-800">${mrrDollars.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 font-medium">Monthly MRR</div>
                </div>
                <div className="bg-green-50/50 p-4 rounded-xl flex flex-col items-center justify-center text-center border border-green-100/50">
                  <div className="text-green-500 mb-2"><TrendingUp className="w-5 h-5" /></div>
                  <div className="font-bold text-lg text-slate-800">${arrDollars.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 font-medium">Estimated ARR</div>
                </div>
                <div className="bg-purple-50/50 p-4 rounded-xl flex flex-col items-center justify-center text-center border border-purple-100/50">
                  <div className="text-purple-500 mb-2"><BarChart3 className="w-5 h-5" /></div>
                  <div className="font-bold text-lg text-slate-800">{totalSubs}</div>
                  <div className="text-xs text-slate-500 font-medium">Subscriptions</div>
                </div>
                <div className="bg-orange-50/50 p-4 rounded-xl flex flex-col items-center justify-center text-center border border-orange-100/50">
                  <div className="text-orange-500 mb-2"><Building2 className="w-5 h-5" /></div>
                  <div className="font-bold text-lg text-slate-800">{totalTenants}</div>
                  <div className="text-xs text-slate-500 font-medium">Total Entities</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end mb-1">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Quick Actions</h3>
                  <p className="text-xs text-slate-500">Frequently used admin tasks</p>
                </div>
              </div>
              <Card className="shadow-sm border-slate-100 bg-[#1e58d4] text-white border-none flex-1">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-1 text-lg">Onboard Tenant</h3>
                  <p className="text-sm text-blue-100 mb-6">Create a new business entity with modules</p>
                  <Link 
                    href="/super-admin/tenants" 
                    className={cn(buttonVariants({ variant: "secondary" }), "w-full bg-white text-[#1e58d4] hover:bg-blue-50 border-none cursor-pointer")}
                  >
                    Manage Tenants
                  </Link>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-100 bg-[#8b5cf6] text-white border-none flex-1">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Layers className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-1 text-lg">Configure Modules</h3>
                  <p className="text-sm text-purple-100 mb-6">Update platform module rates and status</p>
                  <Link 
                    href="/super-admin/platform-modules" 
                    className={cn(buttonVariants({ variant: "secondary" }), "w-full bg-white text-[#8b5cf6] hover:bg-purple-50 border-none cursor-pointer")}
                  >
                    Manage Modules
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end mb-1">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Tenant Health & Activity</h3>
                  <p className="text-xs text-slate-500">Live property metrics</p>
                </div>
                <Link 
                  href="/super-admin/tenants" 
                  className="text-blue-600 font-medium text-sm hover:underline cursor-pointer"
                >
                  View All &gt;
                </Link>
              </div>
              <Card className="shadow-sm border-slate-100 flex-1">
                <CardContent className="p-0 h-full">
                  <div className="divide-y divide-slate-100 h-full flex flex-col">
                    {topTenants.length > 0 ? (
                      topTenants.slice(0, 3).map((tenant, i) => (
                        <div key={tenant.tenantId} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors flex-1">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs bg-blue-100 text-blue-700">
                                {getInitials(tenant.name)}
                              </div>
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm border border-slate-100 text-slate-600">
                                {i + 1}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-800">{tenant.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {tenant.rooms} rooms • {tenant.outlets} outlets
                                <Badge 
                                  variant="outline" 
                                  className={`ml-2 text-[9px] px-1.5 py-0 ${
                                    tenant.churnRisk === "HIGH" 
                                      ? "bg-red-50 text-red-600 border-red-200" 
                                      : tenant.churnRisk === "MEDIUM" 
                                        ? "bg-amber-50 text-amber-600 border-amber-200" 
                                        : "bg-emerald-50 text-emerald-600 border-emerald-200"
                                  }`}
                                >
                                  {tenant.churnRisk} RISK
                                </Badge>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-slate-800">
                              ${Math.round(tenant.mrrMinor / 100)}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">MRR</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-sm text-slate-500 flex flex-col items-center justify-center h-full">
                        <Building2 className="w-8 h-8 text-slate-300 mb-2" />
                        No active tenants yet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Sidebar Data */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-100">
            <CardHeader>
              <CardTitle className="text-lg flex justify-between items-center">
                Live Activity
                <span className="flex items-center text-xs font-normal text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse"></span> Live
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div key={log._id} className="flex gap-3 text-sm">
                    <div className="mt-0.5 p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {log.action} on {log.entity}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        By {log.user?.name || log.user?.email || "System"} • {formatRelativeTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-slate-500">
                  No activity events recorded yet.
                </div>
              )}
              <Link 
                href="/super-admin/audit-logs" 
                className={cn(buttonVariants({ variant: "link" }), "w-full text-blue-600 cursor-pointer pt-2")}
              >
                View All Audit Logs
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-100 border-t-4 border-t-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                Pending Actions
                <Badge variant="destructive" className="rounded-full bg-red-500 hover:bg-red-600">
                  {overdueSubs + openInvoicesCount} Pending
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl text-sm">
                  <span className="font-medium text-red-800">Past Due Subscriptions</span>
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">{overdueSubs}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl text-sm">
                  <span className="font-medium text-orange-800">Open Invoices Due</span>
                  <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold">{openInvoicesCount}</span>
                </div>
                <Link 
                  href="/super-admin/subscriptions" 
                  className={cn(buttonVariants({ variant: "outline" }), "w-full mt-2 cursor-pointer")}
                >
                  Review Subscriptions
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
