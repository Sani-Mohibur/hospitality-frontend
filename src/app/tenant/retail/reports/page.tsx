"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  DollarSign,
  TrendingUp,
  CreditCard,
  Banknote,
  Bed,
  RotateCcw,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
} from "lucide-react";
import {
  mockSales,
  mockReturns,
  mockProducts,
  mockCategories,
  formatMinor,
} from "@/lib/retail-mock-data";

export default function RetailReportsPage() {
  const [dateRange, setDateRange] = useState("TODAY");
  const [isZReportOpen, setIsZReportOpen] = useState(false);
  const [countedCash, setCountedCash] = useState("250.00");

  // Computations for report
  const validSales = mockSales.filter((s) => s.status !== "VOIDED");
  const grossSalesMinor = validSales.reduce((acc, s) => acc + s.totalMinor, 0);
  const totalTaxMinor = validSales.reduce((acc, s) => acc + s.taxTotalMinor, 0);
  const totalDiscountMinor = validSales.reduce((acc, s) => acc + s.discountTotalMinor, 0);
  const totalRefundMinor = mockReturns.reduce((acc, r) => acc + r.refundAmountMinor, 0);
  const netSalesMinor = grossSalesMinor - totalRefundMinor;

  const cardSalesMinor = validSales
    .filter((s) => s.paymentMethod === "CARD")
    .reduce((acc, s) => acc + s.totalMinor, 0);

  const cashSalesMinor = validSales
    .filter((s) => s.paymentMethod === "CASH")
    .reduce((acc, s) => acc + s.totalMinor, 0);

  const roomChargeMinor = validSales
    .filter((s) => s.paymentMethod === "ROOM_CHARGE")
    .reduce((acc, s) => acc + s.totalMinor, 0);

  // Category sales breakdown
  const categorySales = mockCategories.map((cat) => {
    // Generate realistic share
    const count = cat.productCount;
    const estShare = Math.round(grossSalesMinor * (count / 150));
    const percent = Math.min(100, Math.round((estShare / grossSalesMinor) * 100));
    return {
      name: cat.name,
      code: cat.code,
      productCount: cat.productCount,
      estimatedSalesMinor: estShare,
      percent,
    };
  }).sort((a, b) => b.estimatedSalesMinor - a.estimatedSalesMinor);

  // Top products performance
  const topProducts = [
    { name: "Wireless Bluetooth Earbuds", sku: "ELEC-WBE-001", unitsSold: 42, revenueMinor: 335958, margin: 47.5 },
    { name: "Running Shoes Pro", sku: "SPRT-RSP-009", unitsSold: 18, revenueMinor: 269982, margin: 50.0 },
    { name: "Organic Cotton T-Shirt", sku: "APRL-OCT-002", unitsSold: 35, revenueMinor: 87465, margin: 56.0 },
    { name: "Artisan Granola 500g", sku: "FOOD-AGR-005", unitsSold: 58, revenueMinor: 75342, margin: 57.6 },
    { name: "Vitamin C Serum 30ml", sku: "HLTH-VCS-004", unitsSold: 20, revenueMinor: 69980, margin: 60.0 },
  ];

  // Cashier performance
  const cashierStats = [
    { name: "Alex R.", orders: 48, revenueMinor: 384000, avgBasketMinor: 8000 },
    { name: "Maria T.", orders: 32, revenueMinor: 245000, avgBasketMinor: 7656 },
    { name: "Sarah K.", orders: 19, revenueMinor: 112000, avgBasketMinor: 5894 },
  ];

  const handleExportCSV = () => {
    alert("Downloading retail revenue summary report (CSV)...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Retail Analytics & Reports
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            End-of-day register closure, financial summaries, and sales velocity breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(val) => val && setDateRange(val)}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAY">Today</SelectItem>
              <SelectItem value="YESTERDAY">Yesterday</SelectItem>
              <SelectItem value="LAST_7_DAYS">Last 7 Days</SelectItem>
              <SelectItem value="THIS_MONTH">This Month</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 gap-1.5 text-xs border-slate-200"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={() => setIsZReportOpen(true)}
            className="h-9 bg-slate-900 hover:bg-slate-800 text-white gap-1.5 text-xs"
          >
            <FileSpreadsheet className="h-4 w-4" />
            End-of-Day Z-Report
          </Button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            Gross Sales
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatMinor(grossSalesMinor)}</h3>
          <p className="text-[11px] text-emerald-600 flex items-center gap-0.5 mt-1 font-medium">
            <TrendingUp className="h-3 w-3" /> +14.2% vs last week
          </p>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <CreditCard className="h-4 w-4 text-blue-600" />
            Net Sales (Post-refund)
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatMinor(netSalesMinor)}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Reflects all deductions</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <RotateCcw className="h-4 w-4 text-purple-600" />
            Total Refunds
          </div>
          <h3 className="text-2xl font-bold text-purple-700 mt-1">{formatMinor(totalRefundMinor)}</h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {mockReturns.length} customer returns
          </p>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <TrendingUp className="h-4 w-4 text-amber-600" />
            Tax & Discounts
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatMinor(totalTaxMinor)}</h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Discounts: -{formatMinor(totalDiscountMinor)}
          </p>
        </Card>
      </div>

      {/* Tender Breakdown Grid */}
      <Card className="border-slate-200 shadow-sm p-4 bg-white">
        <h3 className="font-bold text-slate-900 text-sm mb-3">Tender Method Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded text-blue-700">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600">Electronic Cards</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {formatMinor(cardSalesMinor)}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-700">
              {Math.round((cardSalesMinor / grossSalesMinor) * 100)}%
            </span>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded text-emerald-700">
                <Banknote className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600">Cash Collections</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {formatMinor(cashSalesMinor)}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700">
              {Math.round((cashSalesMinor / grossSalesMinor) * 100)}%
            </span>
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded text-indigo-700">
                <Bed className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600">Room Folio Charges</p>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {formatMinor(roomChargeMinor)}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-700">
              {Math.round((roomChargeMinor / grossSalesMinor) * 100)}%
            </span>
          </div>
        </div>
      </Card>

      {/* Two Column Layout: Category Share & Cashier Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Share */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900">
              Sales Distribution by Category
            </CardTitle>
            <CardDescription className="text-xs">
              Revenue contribution across merchandise groups
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {categorySales.slice(0, 5).map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-800">{cat.name}</span>
                  <span className="font-mono text-slate-900">
                    {formatMinor(cat.estimatedSalesMinor)} ({cat.percent}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cashier Performance */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900">
              Register & Cashier Performance
            </CardTitle>
            <CardDescription className="text-xs">
              Shift transaction volume and average ticket size
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-xs">Staff Member</TableHead>
                  <TableHead className="text-xs text-center">Tickets</TableHead>
                  <TableHead className="text-xs text-right">Total Ring</TableHead>
                  <TableHead className="text-xs text-right">Avg Basket</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashierStats.map((c) => (
                  <TableRow key={c.name} className="text-xs">
                    <TableCell className="font-semibold text-slate-800 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                        {c.name.charAt(0)}
                      </div>
                      {c.name}
                    </TableCell>
                    <TableCell className="text-center font-medium">{c.orders}</TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      {formatMinor(c.revenueMinor)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-slate-600">
                      {formatMinor(c.avgBasketMinor)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Top Velocity Items */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900">
            Top Selling Products by Volume & Margin
          </CardTitle>
          <CardDescription className="text-xs">
            High velocity items generating the greatest return
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-center">Units Sold</TableHead>
                <TableHead className="text-right">Gross Revenue</TableHead>
                <TableHead className="text-right">Gross Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((p) => (
                <TableRow key={p.sku} className="hover:bg-slate-50/70">
                  <TableCell className="font-semibold text-slate-900">{p.name}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">{p.sku}</TableCell>
                  <TableCell className="text-center font-bold text-slate-800">
                    {p.unitsSold}
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900">
                    {formatMinor(p.revenueMinor)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      {p.margin}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* End-of-Day Z-Report Modal */}
      <Dialog open={isZReportOpen} onOpenChange={setIsZReportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-slate-700" />
                Register End-of-Day (Z-Report)
              </DialogTitle>
            </div>
            <DialogDescription>
              Store: Main Store | Register #1 | Date: {new Date().toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span>Opening Cash Float:</span>
                <span>$200.00</span>
              </div>
              <div className="flex justify-between">
                <span>Cash Sales Ring:</span>
                <span>{formatMinor(cashSalesMinor)}</span>
              </div>
              <div className="flex justify-between text-purple-700">
                <span>Cash Paid Out (Refunds):</span>
                <span>-$45.99</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200 pt-1 text-slate-900">
                <span>Expected Cash In Drawer:</span>
                <span>
                  $
                  {(
                    200 +
                    cashSalesMinor / 100 -
                    45.99
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-1 pt-1 font-sans">
              <Label className="text-xs font-medium text-slate-700">
                Counted Cash In Drawer ($)
              </Label>
              <Input
                type="number"
                step="0.01"
                value={countedCash}
                onChange={(e) => setCountedCash(e.target.value)}
                className="h-9 font-mono font-bold"
              />
            </div>

            <div className="p-2.5 bg-slate-100 rounded text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span>Card Transactions Total:</span>
                <span>{formatMinor(cardSalesMinor)}</span>
              </div>
              <div className="flex justify-between">
                <span>Room Charges Total:</span>
                <span>{formatMinor(roomChargeMinor)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Register Turnover:</span>
                <span>{formatMinor(grossSalesMinor)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Printing Z-Report...")}
              className="gap-1 text-xs"
            >
              <Printer className="h-4 w-4" />
              Print Z-Report
            </Button>
            <Button
              size="sm"
              onClick={() => {
                alert("Day closed successfully. Cash drawer balanced.");
                setIsZReportOpen(false);
              }}
              className="bg-primary hover:bg-primary/90 text-white text-xs gap-1"
            >
              <CheckCircle2 className="h-4 w-4" />
              Finalize Register Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
