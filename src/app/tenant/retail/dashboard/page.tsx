"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  BarChart3,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { mockSales, mockStockItems, mockProducts, formatMinor } from "@/lib/retail-mock-data";

export default function RetailDashboardPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  // Compute mock metrics
  const totalRevenue = mockSales
    .filter((s) => s.status !== "VOIDED")
    .reduce((sum, s) => sum + s.totalMinor, 0);
  const todaySales = mockSales.filter((s) => s.businessDate === "2025-11-10");
  const todayRevenue = todaySales
    .filter((s) => s.status !== "VOIDED")
    .reduce((sum, s) => sum + s.totalMinor, 0);
  const totalTransactions = mockSales.filter((s) => s.status !== "VOIDED").length;
  const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const lowStockItems = mockStockItems.filter(
    (si) => si.onHand <= si.reorderPoint && si.isActive
  );

  const recentSales = mockSales.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Retail Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Sales overview, revenue summaries, and stock alerts.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2 cursor-pointer h-8 text-xs shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
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
            <div className="text-2xl font-bold text-slate-900">{formatMinor(totalRevenue)}</div>
            <p className="text-xs text-slate-500 mt-1">All completed sales</p>
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
            <div className="text-2xl font-bold text-slate-900">{formatMinor(todayRevenue)}</div>
            <p className="text-xs text-slate-500 mt-1">
              {todaySales.length} transaction{todaySales.length !== 1 ? "s" : ""} today
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
            <div className="text-2xl font-bold text-slate-900">{formatMinor(Math.round(avgTransaction))}</div>
            <p className="text-xs text-slate-500 mt-1">
              Across {totalTransactions} transactions
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

      {/* Content Panels */}
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
            {recentSales.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentSales.map((sale) => (
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
                        {sale.customerName || "Walk-in"} • {sale.paymentMethod} • {sale.cashierName}
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
                <p className="text-sm font-medium">No transactions yet.</p>
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
                Items below reorder point.
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
            {lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
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
                const count = mockSales.filter(
                  (s) => s.paymentMethod === method && s.status !== "VOIDED"
                ).length;
                const total = mockSales
                  .filter((s) => s.paymentMethod === method && s.status !== "VOIDED")
                  .reduce((sum, s) => sum + s.totalMinor, 0);
                const pct = totalTransactions > 0 ? Math.round((count / totalTransactions) * 100) : 0;
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
                mockSales
                  .filter((s) => s.status !== "VOIDED")
                  .forEach((s) =>
                    s.lines.forEach((l) => {
                      if (!productSales[l.sku]) productSales[l.sku] = { name: l.name, total: 0, qty: 0 };
                      productSales[l.sku].total += l.totalMinor;
                      productSales[l.sku].qty += l.quantity;
                    })
                  );
                return Object.values(productSales)
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 4)
                  .map((p, i) => (
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
                  ));
              })()}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Quick Actions
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
  );
}
