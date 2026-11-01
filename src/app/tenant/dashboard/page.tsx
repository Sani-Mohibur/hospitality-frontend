"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bed,
  DollarSign,
  ShoppingBag,
  Users,
  RefreshCw,
  Activity,
  ArrowUpRight,
  Clock,
  AlertCircle,
  Loader2,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Package,
} from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import {
  useLocation,
  getLocationDisplayName,
  ALL_LOCATIONS_ID,
  ALL_LOCATIONS_HOSPITALITY_ID,
  ALL_LOCATIONS_RESTAURANT_ID,
  ALL_LOCATIONS_RETAIL_ID,
} from "@/lib/location-context";
import {
  mockSales,
  mockStockItems,
  mockProducts,
  formatMinor,
} from "@/lib/retail-mock-data";
import { formatDistanceToNow, format, subDays } from "date-fns";
import Link from "next/link";

interface RecentOrder {
  _id: string;
  orderNumber?: string;
  status: string;
  totals?: { totalMinor?: number };
  createdAt: string;
}

interface RecentReservation {
  _id: string;
  confirmationNumber?: string;
  status: string;
  arrivalDate?: string;
  departureDate?: string;
  estimatedTotalMinor?: number;
  bookerGuestId?: {
    firstName?: string;
    lastName?: string;
  };
}

interface RecentActivity {
  _id: string;
  action: string;
  entity: string;
  details?: Record<string, unknown>;
  createdAt: string;
  user?: { name: string };
}

interface StaffRecord {
  _id: string;
}

interface DashboardReportData {
  rooms?: {
    roomRevenueMinor?: number;
    occupancyPct?: number;
  };
  fnb?: {
    netRevenueMinor?: number;
  };
  crossModule?: {
    totalRevenueMinor?: number;
  };
}

interface DashboardStats {
  totalRevenue: number;
  todayCheckins: number;
  activeOrders: number;
  staffCount: number;
  occupancyPct?: number;
  recentOrders: RecentOrder[];
  recentReservations: RecentReservation[];
  recentActivities: RecentActivity[];
}

export default function TenantDashboardPage() {
  const { tenant, hasModule } = useAuth();
  const { currentLocation } = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    todayCheckins: 0,
    activeOrders: 0,
    staffCount: 0,
    occupancyPct: 0,
    recentOrders: [],
    recentReservations: [],
    recentActivities: [],
  });

  // Module scopes based on active location and subscribed modules
  const isRetailScope =
    currentLocation?._id === ALL_LOCATIONS_RETAIL_ID ||
    currentLocation?.branchType === "RETAIL" ||
    (currentLocation?._id === ALL_LOCATIONS_ID && hasModule("RETAIL") && !hasModule("HOSPITALITY") && !hasModule("RESTAURANT"));

  const isHospitalityScope =
    !isRetailScope && (
      currentLocation?._id === ALL_LOCATIONS_HOSPITALITY_ID ||
      currentLocation?.branchType === "HOSPITALITY" ||
      (Boolean(currentLocation?.hasRooms) && currentLocation?._id !== ALL_LOCATIONS_ID) ||
      (currentLocation?._id === ALL_LOCATIONS_ID && hasModule("HOSPITALITY") && !hasModule("RESTAURANT") && !hasModule("RETAIL"))
    );

  const isRestaurantScope =
    !isRetailScope && (
      currentLocation?._id === ALL_LOCATIONS_RESTAURANT_ID ||
      currentLocation?.branchType === "RESTAURANT" ||
      (Boolean(currentLocation) &&
        currentLocation?._id !== ALL_LOCATIONS_ID &&
        !currentLocation?.hasRooms &&
        currentLocation?.branchType !== "HOSPITALITY") ||
      (currentLocation?._id === ALL_LOCATIONS_ID && hasModule("RESTAURANT") && !hasModule("HOSPITALITY") && !hasModule("RETAIL"))
    );

  const isHospitalityOnly = isHospitalityScope && !isRestaurantScope;
  const isRestaurantOnly = isRestaurantScope && !isHospitalityScope;

  // Retail metrics calculation scoped to selected location
  const isAllRetail =
    currentLocation?._id === ALL_LOCATIONS_RETAIL_ID ||
    currentLocation?._id === ALL_LOCATIONS_ID;

  const branchName = currentLocation?.name || "";

  const filteredRetailSales = useMemo(() => {
    if (isAllRetail) return mockSales;
    return mockSales.filter((s) => {
      const matchName = s.locationName.toLowerCase() === branchName.toLowerCase();
      const matchStore = branchName.toLowerCase().includes("store") && s.locationName === "Main Store";
      return matchName || matchStore;
    });
  }, [isAllRetail, branchName]);

  const filteredRetailStock = useMemo(() => {
    if (isAllRetail) return mockStockItems;
    return mockStockItems.filter(
      (si) =>
        si.locationName.toLowerCase() === branchName.toLowerCase() ||
        si.locationId === currentLocation?._id ||
        (branchName.toLowerCase().includes("store") && si.locationName === "Main Store") ||
        (branchName.toLowerCase().includes("warehouse") && si.locationName === "Warehouse")
    );
  }, [isAllRetail, branchName, currentLocation?._id]);

  const retailRevenueMinor = useMemo(() => {
    return filteredRetailSales
      .filter((s) => s.status !== "VOIDED")
      .reduce((sum, s) => sum + s.totalMinor, 0);
  }, [filteredRetailSales]);

  const retailTodaySales = useMemo(() => {
    return filteredRetailSales.filter(
      (s) => s.businessDate === "2025-11-10" || s.businessDate === "2026-11-01"
    );
  }, [filteredRetailSales]);

  const retailTodayRevenueMinor = useMemo(() => {
    return retailTodaySales
      .filter((s) => s.status !== "VOIDED")
      .reduce((sum, s) => sum + s.totalMinor, 0);
  }, [retailTodaySales]);

  const retailTotalTxns = useMemo(() => {
    return filteredRetailSales.filter((s) => s.status !== "VOIDED").length;
  }, [filteredRetailSales]);

  const retailAvgTxn = retailTotalTxns > 0 ? retailRevenueMinor / retailTotalTxns : 0;
  const retailLowStock = filteredRetailStock.filter((si) => si.onHand <= si.reorderPoint && si.isActive);
  const retailRecentSales = filteredRetailSales.slice(0, 5);

  const fetchDashboardData = useCallback(async () => {
    // Retail metrics are purely client-side static mock calculations.
    // Avoid making failing backend requests when viewing retail scope.
    if (isRetailScope) {
      setLoading(true);
      setError(null);
      setTimeout(() => {
        setLoading(false);
      }, 250);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const pastStr = format(subDays(new Date(), 30), "yyyy-MM-dd");

      // 1. Fetch Report Dashboard or Module stats
      const [reportRes, ordersRes, staffRes, reservationsRes, activityRes] = await Promise.allSettled([
        apiClient.get<DashboardReportData>(`/report/dashboard?from=${pastStr}&to=${todayStr}`).catch(() => null),
        hasModule("RESTAURANT") ? apiClient.get<RecentOrder[]>("/restaurant/order?limit=10").catch(() => null) : Promise.resolve(null),
        apiClient.get<StaffRecord[]>("/user/staff").catch(() => null),
        hasModule("HOSPITALITY") ? apiClient.get<RecentReservation[]>("/reservation?limit=20").catch(() => null) : Promise.resolve(null),
        apiClient.get<RecentActivity[]>("/audit-log?limit=6").catch(() => null),
      ]);

      let totalRevenue = 0;
      let occupancyPct = 0;

      if (reportRes.status === "fulfilled" && reportRes.value?.data) {
        const d = reportRes.value.data;
        if (isHospitalityOnly) {
          totalRevenue = (d.rooms?.roomRevenueMinor || 0) / 100;
          occupancyPct = d.rooms?.occupancyPct || 0;
        } else if (isRestaurantOnly) {
          totalRevenue = (d.fnb?.netRevenueMinor || 0) / 100;
          occupancyPct = 0;
        } else {
          totalRevenue = (d.crossModule?.totalRevenueMinor ?? ((d.rooms?.roomRevenueMinor || 0) + (d.fnb?.netRevenueMinor || 0))) / 100;
          occupancyPct = d.rooms?.occupancyPct || 0;
        }
      }

      // Add retail sales revenue to combined cross-module dashboard if subscribed
      if (!isHospitalityOnly && !isRestaurantOnly && hasModule("RETAIL")) {
        const crossModuleRetail = mockSales
          .filter((s) => s.status !== "VOIDED")
          .reduce((sum, s) => sum + s.totalMinor, 0) / 100;
        totalRevenue += crossModuleRetail;
      }

      let activeOrders = 0;
      let recentOrders: RecentOrder[] = [];
      if (ordersRes.status === "fulfilled" && ordersRes.value?.data) {
        const orderList = Array.isArray(ordersRes.value.data) ? ordersRes.value.data : [];
        recentOrders = orderList.slice(0, 5);
        activeOrders = orderList.filter((o) => o.status !== "CLOSED" && o.status !== "VOIDED").length;
        if (totalRevenue === 0 && (isRestaurantOnly || (!isHospitalityOnly && !isRestaurantOnly))) {
          totalRevenue = orderList.reduce((sum: number, o) => sum + (o.totals?.totalMinor || 0), 0) / 100;
        }
      }

      let staffCount = 0;
      if (staffRes.status === "fulfilled" && staffRes.value?.data) {
        const staffList = Array.isArray(staffRes.value.data) ? staffRes.value.data : [];
        staffCount = staffList.length;
      }

      let todayCheckins = 0;
      let recentReservations: RecentReservation[] = [];
      if (reservationsRes.status === "fulfilled" && reservationsRes.value?.data) {
        const resList = Array.isArray(reservationsRes.value.data) ? reservationsRes.value.data : [];
        recentReservations = resList.slice(0, 5);
        todayCheckins = resList.filter((r) => r.status === "CONFIRMED" || r.status === "CHECKED_IN").length;
      }

      let recentActivities: RecentActivity[] = [];
      if (activityRes.status === "fulfilled" && activityRes.value?.data) {
        recentActivities = Array.isArray(activityRes.value.data) ? activityRes.value.data : [];
      }

      setStats({
        totalRevenue,
        todayCheckins,
        activeOrders,
        staffCount,
        occupancyPct,
        recentOrders,
        recentReservations,
        recentActivities,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [hasModule, isHospitalityOnly, isRestaurantOnly, isRetailScope]);

  useEffect(() => {
    if (isRetailScope) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    let ignore = false;
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const pastStr = format(subDays(new Date(), 30), "yyyy-MM-dd");

    Promise.allSettled([
      apiClient.get<DashboardReportData>(`/report/dashboard?from=${pastStr}&to=${todayStr}`).catch(() => null),
      hasModule("RESTAURANT") ? apiClient.get<RecentOrder[]>("/restaurant/order?limit=10").catch(() => null) : Promise.resolve(null),
      apiClient.get<StaffRecord[]>("/user/staff").catch(() => null),
      hasModule("HOSPITALITY") ? apiClient.get<RecentReservation[]>("/reservation?limit=20").catch(() => null) : Promise.resolve(null),
      apiClient.get<RecentActivity[]>("/audit-log?limit=6").catch(() => null),
    ])
      .then(([reportRes, ordersRes, staffRes, reservationsRes, activityRes]) => {
        if (ignore) return;

        let totalRevenue = 0;
        let occupancyPct = 0;

        if (reportRes.status === "fulfilled" && reportRes.value?.data) {
          const d = reportRes.value.data;
          if (isHospitalityOnly) {
            totalRevenue = (d.rooms?.roomRevenueMinor || 0) / 100;
            occupancyPct = d.rooms?.occupancyPct || 0;
          } else if (isRestaurantOnly) {
            totalRevenue = (d.fnb?.netRevenueMinor || 0) / 100;
            occupancyPct = 0;
          } else {
            totalRevenue = (d.crossModule?.totalRevenueMinor ?? ((d.rooms?.roomRevenueMinor || 0) + (d.fnb?.netRevenueMinor || 0))) / 100;
            occupancyPct = d.rooms?.occupancyPct || 0;
          }
        }

        // Add retail sales revenue to combined cross-module dashboard if subscribed
        if (!isHospitalityOnly && !isRestaurantOnly && hasModule("RETAIL")) {
          const crossModuleRetail = mockSales
            .filter((s) => s.status !== "VOIDED")
            .reduce((sum, s) => sum + s.totalMinor, 0) / 100;
          totalRevenue += crossModuleRetail;
        }

        let activeOrders = 0;
        let recentOrders: RecentOrder[] = [];
        if (ordersRes.status === "fulfilled" && ordersRes.value?.data) {
          const orderList = Array.isArray(ordersRes.value.data) ? ordersRes.value.data : [];
          recentOrders = orderList.slice(0, 5);
          activeOrders = orderList.filter((o) => o.status !== "CLOSED" && o.status !== "VOIDED").length;
          if (totalRevenue === 0 && (isRestaurantOnly || (!isHospitalityOnly && !isRestaurantOnly))) {
            totalRevenue = orderList.reduce((sum: number, o) => sum + (o.totals?.totalMinor || 0), 0) / 100;
          }
        }

        let staffCount = 0;
        if (staffRes.status === "fulfilled" && staffRes.value?.data) {
          const staffList = Array.isArray(staffRes.value.data) ? staffRes.value.data : [];
          staffCount = staffList.length;
        }

        let todayCheckins = 0;
        let recentReservations: RecentReservation[] = [];
        if (reservationsRes.status === "fulfilled" && reservationsRes.value?.data) {
          const resList = Array.isArray(reservationsRes.value.data) ? reservationsRes.value.data : [];
          recentReservations = resList.slice(0, 5);
          todayCheckins = resList.filter((r) => r.status === "CONFIRMED" || r.status === "CHECKED_IN").length;
        }

        let recentActivities: RecentActivity[] = [];
        if (activityRes.status === "fulfilled" && activityRes.value?.data) {
          recentActivities = Array.isArray(activityRes.value.data) ? activityRes.value.data : [];
        }

        setStats({
          totalRevenue,
          todayCheckins,
          activeOrders,
          staffCount,
          occupancyPct,
          recentOrders,
          recentReservations,
          recentActivities,
        });
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (ignore) return;
        const msg = err instanceof Error ? err.message : "Failed to load dashboard data";
        setError(msg);
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [hasModule, isHospitalityOnly, isRestaurantOnly, isRetailScope, currentLocation?._id]);

  const locationSubtitle =
    currentLocation?._id === ALL_LOCATIONS_ID
      ? "all locations"
      : currentLocation?._id === ALL_LOCATIONS_HOSPITALITY_ID
      ? "all Hospitality locations"
      : currentLocation?._id === ALL_LOCATIONS_RESTAURANT_ID
      ? "all Restaurant locations"
      : currentLocation?._id === ALL_LOCATIONS_RETAIL_ID
      ? "all Retail locations"
      : getLocationDisplayName(currentLocation);

  return (
    <RoleGuard allowedRoles={["TENANT_OWNER", "TENANT_MANAGER", "STAFF"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {tenant?.name || "Workspace"} {isRetailScope ? "Retail Operations" : "Operations"}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Live metrics for {locationSubtitle}.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDashboardData} 
            disabled={loading}
            className="gap-2 cursor-pointer h-8 text-xs shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={fetchDashboardData} className="text-xs h-7">Retry</Button>
          </div>
        )}

        {/* ─── RETAIL DASHBOARD VIEW (Shown when a Retail location or All Locations · Retail is selected) ─── */}
        {isRetailScope ? (
          <div className="space-y-6">
            {/* KPI Metric Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Revenue
                  </CardTitle>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {formatMinor(retailRevenueMinor)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {isAllRetail ? "All completed retail sales" : `Completed sales for ${currentLocation?.name}`}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Today&apos;s Sales
                  </CardTitle>
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {formatMinor(retailTodayRevenueMinor)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {retailTodaySales.length} transaction{retailTodaySales.length !== 1 ? "s" : ""} today
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Avg. Transaction
                  </CardTitle>
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {formatMinor(Math.round(retailAvgTxn))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Across {retailTotalTxns} transactions
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Active Products
                  </CardTitle>
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <Package className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {mockProducts.filter((p) => p.isActive).length}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    In catalogue across all categories
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Content Panels: Recent Transactions & Low Stock Alerts */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              {/* Recent Transactions */}
              <Card className="col-span-4 shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-lg">Recent Transactions</CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Latest retail sales and checkout activity.
                    </p>
                  </div>
                  <Link
                    href="/tenant/retail/sales"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    View All <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </CardHeader>
                <CardContent>
                  {retailRecentSales.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {retailRecentSales.map((sale) => (
                        <div key={sale._id} className="py-3 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-slate-800">
                                {sale.receiptNumber}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  sale.status === "COMPLETED"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : sale.status === "PARTIALLY_REFUNDED"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : sale.status === "VOIDED"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-slate-50 text-slate-700 border-slate-200"
                                }`}
                              >
                                {sale.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {sale.customerName || "Walk-in"} • {sale.paymentMethod} • {sale.cashierName} • {sale.locationName}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-sm text-slate-900">
                              {formatMinor(sale.totalMinor)}
                            </div>
                            <p className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                              <Clock className="w-3 h-3" />
                              {sale.businessDate}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                      <ShoppingCart className="w-8 h-8 mb-2 opacity-40" />
                      <p className="text-sm font-medium">No transactions recorded yet.</p>
                      <p className="text-xs text-slate-500 mt-0.5">Sales completed at the POS terminal will appear here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Low Stock Alerts */}
              <Card className="col-span-3 shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Items below reorder threshold.
                    </p>
                  </div>
                  <Link
                    href="/tenant/retail/inventory"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Inventory <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </CardHeader>
                <CardContent>
                  {retailLowStock.length > 0 ? (
                    <div className="space-y-3">
                      {retailLowStock.map((item) => (
                        <div
                          key={item._id}
                          className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-3"
                        >
                          <div className="p-1.5 bg-amber-50 rounded-md border border-amber-200 text-amber-600 shrink-0 mt-0.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-800 truncate">
                                {item.productName}
                              </span>
                              <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200 ml-2 shrink-0">
                                {item.onHand} left
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.sku} • Reorder at {item.reorderPoint} • {item.locationName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                      <Package className="w-8 h-8 mb-2 opacity-40" />
                      <p className="text-sm font-medium">All stock levels healthy.</p>
                      <p className="text-xs text-slate-500 mt-0.5">No products currently need restocking.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Row */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Sales by Payment Method */}
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-500" />
                    Sales by Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    {["CARD", "CASH"].map((method) => {
                      const count = filteredRetailSales.filter(
                        (s) => s.paymentMethod === method && s.status !== "VOIDED"
                      ).length;
                      const total = filteredRetailSales
                        .filter((s) => s.paymentMethod === method && s.status !== "VOIDED")
                        .reduce((sum, s) => sum + s.totalMinor, 0);
                      const pct = retailTotalTxns > 0 ? Math.round((count / retailTotalTxns) * 100) : 0;
                      return (
                        <div key={method}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium text-slate-700">{method}</span>
                            <span className="text-slate-500">
                              {count} txns • {formatMinor(total)}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${method === "CARD" ? "bg-blue-500" : "bg-emerald-500"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-500" />
                    Top Products by Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    {(() => {
                      const productSales: Record<string, { name: string; total: number; qty: number }> = {};
                      filteredRetailSales
                        .filter((s) => s.status !== "VOIDED")
                        .forEach((s) =>
                          s.lines.forEach((l) => {
                            if (!productSales[l.sku]) productSales[l.sku] = { name: l.name, total: 0, qty: 0 };
                            productSales[l.sku].total += l.totalMinor;
                            productSales[l.sku].qty += l.quantity;
                          })
                        );
                      const topList = Object.values(productSales)
                        .sort((a, b) => b.total - a.total)
                        .slice(0, 4);
                      return topList.length > 0 ? (
                        topList.map((p, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              <span className="text-xs font-medium text-slate-700 truncate">{p.name}</span>
                            </div>
                            <span className="text-xs text-slate-500 shrink-0 ml-2">
                              {p.qty} sold • {formatMinor(p.total)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 py-4 text-center">No sales logged yet.</p>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Retail Quick Actions */}
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    Retail Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/tenant/retail/pos" className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
                      <ShoppingCart className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <span className="text-xs font-medium text-blue-700">Open POS</span>
                    </Link>
                    <Link href="/tenant/retail/products" className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-center transition-colors">
                      <Package className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                      <span className="text-xs font-medium text-emerald-700">Products</span>
                    </Link>
                    <Link href="/tenant/retail/inventory" className="p-3 bg-amber-50 hover:bg-amber-100 rounded-lg text-center transition-colors">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                      <span className="text-xs font-medium text-amber-700">Inventory</span>
                    </Link>
                    <Link href="/tenant/retail/reports" className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
                      <BarChart3 className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <span className="text-xs font-medium text-purple-700">Reports</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* ─── HOSPITALITY / RESTAURANT / CROSS-MODULE VIEW ─── */
          <>
            {/* Metric Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {isHospitalityOnly ? "Hospitality Net Revenue" : isRestaurantOnly ? "Restaurant Net Sales" : "Total Net Revenue"}
                  </CardTitle>
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {isHospitalityOnly ? "Hospitality room & folio revenue (30 days)" :
                     isRestaurantOnly ? "Restaurant F&B sales (30 days)" :
                     hasModule("RETAIL") ? "Rolling 30-day operating gross across all subscribed modules" :
                     "Rolling 30-day operating gross"}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {isRestaurantOnly ? "Restaurant Orders" : "Active Arrivals / Stays"}
                  </CardTitle>
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    {isRestaurantOnly ? <ShoppingBag className="h-4 w-4" /> : <Bed className="h-4 w-4" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {isRestaurantOnly ? stats.recentOrders.length : stats.todayCheckins}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {isRestaurantOnly ? "Recent ticket activity" : "Current active/confirmed stays"}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {isHospitalityOnly || !hasModule("RESTAURANT") ? "Room Occupancy" : "Active POS Orders"}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${isHospitalityOnly || !hasModule("RESTAURANT") ? "bg-indigo-50 text-indigo-600" : "bg-purple-50 text-purple-600"}`}>
                    {isHospitalityOnly || !hasModule("RESTAURANT") ? <Activity className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {isHospitalityOnly || !hasModule("RESTAURANT") ? `${stats.occupancyPct || 0}%` : stats.activeOrders}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {isHospitalityOnly || !hasModule("RESTAURANT") ? "30-day average room occupancy" : "Open tickets in progress"}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Team & Staff</CardTitle>
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <Users className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.staffCount}</div>
                  <p className="text-xs text-slate-500 mt-1">Active team members registered</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Content Rows */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              {/* Recent Orders or Hospitality Bookings */}
              <Card className="col-span-4 shadow-sm border-slate-200">
                {isHospitalityOnly || (hasModule("HOSPITALITY") && !hasModule("RESTAURANT")) ? (
                  <>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                      <div>
                        <CardTitle className="text-lg">Recent Bookings & Arrivals</CardTitle>
                        <p className="text-xs text-slate-500 mt-0.5">Live reservations and check-in status.</p>
                      </div>
                      {hasModule("HOSPITALITY") && (
                        <Link
                          href="/tenant/hospitality/reservations"
                          className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs text-blue-600" })}
                        >
                          View Reservations <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      )}
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex items-center justify-center h-48">
                          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        </div>
                      ) : stats.recentReservations.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {stats.recentReservations.map((res) => {
                            const guestName = res.bookerGuestId
                              ? `${res.bookerGuestId.firstName || ""} ${res.bookerGuestId.lastName || ""}`.trim()
                              : "Guest";
                            return (
                              <div key={res._id} className="py-3 flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm text-slate-800">
                                      #{res.confirmationNumber || res._id.slice(-6).toUpperCase()} • {guestName}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] ${
                                        res.status === 'CHECKED_IN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        res.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        res.status === 'CHECKED_OUT' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                                        'bg-amber-50 text-amber-700 border-amber-200'
                                      }`}
                                    >
                                      {res.status}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    Arrival: {res.arrivalDate} • Departure: {res.departureDate}
                                  </p>
                                </div>
                                <div className="font-bold text-sm text-slate-900">
                                  ${((res.estimatedTotalMinor || 0) / 100).toFixed(2)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                          <Bed className="w-8 h-8 mb-2 opacity-40" />
                          <p className="text-sm font-medium">No recent bookings recorded.</p>
                          <p className="text-xs text-slate-500 mt-0.5">New reservations will appear here.</p>
                        </div>
                      )}
                    </CardContent>
                  </>
                ) : (
                  <>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                      <div>
                        <CardTitle className="text-lg">Recent Outlet & POS Orders</CardTitle>
                        <p className="text-xs text-slate-500 mt-0.5">Live transactions from the restaurant and bar outlets.</p>
                      </div>
                      {hasModule("RESTAURANT") && (
                        <Link
                          href="/tenant/restaurant/pos"
                          className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs text-blue-600" })}
                        >
                          Open POS <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      )}
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex items-center justify-center h-48">
                          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        </div>
                      ) : stats.recentOrders.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {stats.recentOrders.map((order) => (
                            <div key={order._id} className="py-3 flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-slate-800">
                                    Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                                  </span>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-[10px] ${
                                      order.status === 'CLOSED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                      order.status === 'OPEN' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                      'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}
                                  >
                                    {order.status}
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {order.createdAt ? formatDistanceToNow(new Date(order.createdAt), { addSuffix: true }) : ""}
                                </p>
                              </div>
                              <div className="font-bold text-sm text-slate-900">
                                ${((order.totals?.totalMinor || 0) / 100).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                          <ShoppingBag className="w-8 h-8 mb-2 opacity-40" />
                          <p className="text-sm font-medium">No recent orders recorded.</p>
                          <p className="text-xs text-slate-500 mt-0.5">Orders taken at the POS will appear here.</p>
                        </div>
                      )}
                    </CardContent>
                  </>
                )}
              </Card>

              {/* Activity Feed */}
              <Card className="col-span-3 shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-lg">Recent Audit Activity</CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">Security and property event stream.</p>
                  </div>
                  <Link
                    href="/tenant/settings/audit-logs"
                    className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs text-blue-600" })}
                  >
                    View All <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center h-48">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  ) : stats.recentActivities.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentActivities.map((act) => (
                        <div key={act._id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-3">
                          <div className="p-1.5 bg-white rounded-md border border-slate-200 text-slate-600 shrink-0 mt-0.5">
                            <Activity className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-800 capitalize">
                                {act.action.toLowerCase().replace("_", " ")}
                              </span>
                              <span className="text-[10px] text-slate-400 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {act.createdAt ? formatDistanceToNow(new Date(act.createdAt), { addSuffix: true }) : ""}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {act.entity} • by {act.user?.name || "System"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                      <Activity className="w-8 h-8 mb-2 opacity-40" />
                      <p className="text-sm font-medium">No recent activity found.</p>
                      <p className="text-xs text-slate-500 mt-0.5">Events from actions will appear here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
