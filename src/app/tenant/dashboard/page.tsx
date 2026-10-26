"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bed, DollarSign, ShoppingBag, Users, RefreshCw, Activity, ArrowUpRight, Clock, AlertCircle, Loader2 } from "lucide-react";
import { RoleGuard } from "@/components/auth/role-guard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useLocation, getLocationDisplayName } from "@/lib/location-context";
import { formatDistanceToNow, format, subDays } from "date-fns";
import Link from "next/link";

interface DashboardStats {
  totalRevenue: number;
  todayCheckins: number;
  activeOrders: number;
  staffCount: number;
  occupancyPct?: number;
  recentOrders: Array<{ _id: string; orderNumber?: string; status: string; totals?: { totalMinor?: number }; createdAt: string }>;
  recentReservations: Array<any>;
  recentActivities: Array<{ _id: string; action: string; entity: string; details?: any; createdAt: string; user?: { name: string } }>;
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

  const isHospitalityScope =
    currentLocation?._id === "ALL_HOSPITALITY" ||
    currentLocation?.branchType === "HOSPITALITY" ||
    (Boolean(currentLocation?.hasRooms) && currentLocation?._id !== "ALL") ||
    (currentLocation?._id === "ALL" && hasModule("HOSPITALITY") && !hasModule("RESTAURANT"));

  const isRestaurantScope =
    currentLocation?._id === "ALL_RESTAURANT" ||
    currentLocation?.branchType === "RESTAURANT" ||
    (Boolean(currentLocation) &&
      currentLocation?._id !== "ALL" &&
      !currentLocation?.hasRooms &&
      currentLocation?.branchType !== "HOSPITALITY") ||
    (currentLocation?._id === "ALL" && hasModule("RESTAURANT") && !hasModule("HOSPITALITY"));

  const isHospitalityOnly = isHospitalityScope && !isRestaurantScope;
  const isRestaurantOnly = isRestaurantScope && !isHospitalityScope;

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const pastStr = format(subDays(new Date(), 30), "yyyy-MM-dd");

      // 1. Fetch Report Dashboard or Module stats
      const [reportRes, ordersRes, staffRes, reservationsRes, activityRes] = await Promise.allSettled([
        apiClient.get<any>(`/report/dashboard?from=${pastStr}&to=${todayStr}`).catch(() => null),
        hasModule("RESTAURANT") ? apiClient.get<any>("/restaurant/order?limit=10").catch(() => null) : Promise.resolve(null),
        apiClient.get<any>("/user/staff").catch(() => null),
        hasModule("HOSPITALITY") ? apiClient.get<any>("/reservation?limit=20").catch(() => null) : Promise.resolve(null),
        apiClient.get<any>("/audit-log?limit=6").catch(() => null),
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

      let activeOrders = 0;
      let recentOrders: any[] = [];
      if (ordersRes.status === "fulfilled" && ordersRes.value?.data) {
        const orderList = Array.isArray(ordersRes.value.data) ? ordersRes.value.data : [];
        recentOrders = orderList.slice(0, 5);
        activeOrders = orderList.filter((o: any) => o.status !== "CLOSED" && o.status !== "VOIDED").length;
        if (totalRevenue === 0 && (isRestaurantOnly || (!isHospitalityOnly && !isRestaurantOnly))) {
          totalRevenue = orderList.reduce((sum: number, o: any) => sum + (o.totals?.totalMinor || 0), 0) / 100;
        }
      }

      let staffCount = 0;
      if (staffRes.status === "fulfilled" && staffRes.value?.data) {
        const staffList = Array.isArray(staffRes.value.data) ? staffRes.value.data : [];
        staffCount = staffList.length;
      }

      let todayCheckins = 0;
      let recentReservations: any[] = [];
      if (reservationsRes.status === "fulfilled" && reservationsRes.value?.data) {
        const resList = Array.isArray(reservationsRes.value.data) ? reservationsRes.value.data : [];
        recentReservations = resList.slice(0, 5);
        todayCheckins = resList.filter((r: any) => r.status === "CONFIRMED" || r.status === "CHECKED_IN").length;
      }

      let recentActivities: any[] = [];
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
  }, [hasModule, currentLocation, isHospitalityOnly, isRestaurantOnly]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const locationSubtitle =
    currentLocation?._id === "ALL"
      ? "all locations"
      : currentLocation?._id === "ALL_HOSPITALITY"
      ? "all Hospitality locations"
      : currentLocation?._id === "ALL_RESTAURANT"
      ? "all Restaurant locations"
      : getLocationDisplayName(currentLocation);

  return (
    <RoleGuard allowedRoles={["TENANT_OWNER", "TENANT_MANAGER", "STAFF"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {tenant?.name || "Workspace"} Operations
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
                {isHospitalityOnly ? "Room Occupancy" : "Active POS Orders"}
              </CardTitle>
              <div className={`p-2 rounded-lg ${isHospitalityOnly ? "bg-indigo-50 text-indigo-600" : "bg-purple-50 text-purple-600"}`}>
                {isHospitalityOnly ? <Activity className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {isHospitalityOnly ? `${stats.occupancyPct || 0}%` : stats.activeOrders}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isHospitalityOnly ? "30-day average room occupancy" : "Open tickets in progress"}
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
          {/* Recent Orders or Hospitality Activity */}
          <Card className="col-span-4 shadow-sm border-slate-200">
            {isHospitalityOnly ? (
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
                      {stats.recentReservations.map((res: any) => {
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
      </div>
    </RoleGuard>
  );
}
