"use client";

import React, { useState, useMemo } from "react";
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
  Receipt,
  Search,
  Filter,
  Eye,
  RotateCcw,
  Printer,
  DollarSign,
  CreditCard,
  Banknote,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
} from "lucide-react";
import {
  mockSales,
  mockReturns,
  RetailSale,
  RetailReturn,
  formatMinor,
} from "@/lib/retail-mock-data";

export default function RetailSalesPage() {
  const [sales, setSales] = useState<RetailSale[]>(mockSales);
  const [returns, setReturns] = useState<RetailReturn[]>(mockReturns);
  const [activeTab, setActiveTab] = useState<"SALES" | "RETURNS">("SALES");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  // Transaction Details Modal
  const [selectedSale, setSelectedSale] = useState<RetailSale | null>(null);

  // Refund / Return Modal
  const [refundSale, setRefundSale] = useState<RetailSale | null>(null);
  const [refundItems, setRefundItems] = useState<{ [index: number]: number }>({});
  const [refundReason, setRefundReason] = useState("Customer changed mind");
  const [refundMethod, setRefundMethod] = useState("ORIGINAL");
  const [restockToInventory, setRestockToInventory] = useState(true);

  // Filtered Sales
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchesSearch =
        s.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.customerName && s.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.cashierName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
      const matchesPayment = paymentFilter === "ALL" || s.paymentMethod === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [sales, searchQuery, statusFilter, paymentFilter]);

  // Total summary metrics
  const totalRevenue = sales
    .filter((s) => s.status !== "VOIDED")
    .reduce((sum, s) => sum + s.totalMinor, 0);
  const totalRefunded = returns.reduce((sum, r) => sum + r.refundAmountMinor, 0);
  const totalTransactions = sales.filter((s) => s.status !== "VOIDED").length;

  const handleOpenRefund = (sale: RetailSale) => {
    setRefundSale(sale);
    const initialItems: { [index: number]: number } = {};
    sale.lines.forEach((l, idx) => {
      const availableToReturn = l.quantity - l.returnedQuantity;
      initialItems[idx] = availableToReturn > 0 ? 1 : 0;
    });
    setRefundItems(initialItems);
    setRefundReason("Customer changed mind");
    setRefundMethod(sale.paymentMethod);
    setRestockToInventory(true);
  };

  const handleProcessRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundSale) return;

    let refundTotal = 0;
    const returnLines: { name: string; sku: string; quantity: number; refundAmountMinor: number; condition: string }[] = [];

    const updatedSaleLines = refundSale.lines.map((line, idx) => {
      const qtyToReturn = refundItems[idx] || 0;
      if (qtyToReturn > 0) {
        const lineRefund = qtyToReturn * line.unitPriceMinor;
        refundTotal += lineRefund;
        returnLines.push({
          name: line.name,
          sku: line.sku,
          quantity: qtyToReturn,
          refundAmountMinor: lineRefund,
          condition: restockToInventory ? "RESELLABLE" : "DAMAGED",
        });
        return {
          ...line,
          returnedQuantity: line.returnedQuantity + qtyToReturn,
        };
      }
      return line;
    });

    if (refundTotal === 0) {
      alert("Please select at least 1 item to return.");
      return;
    }

    const allReturned = updatedSaleLines.every((l) => l.returnedQuantity >= l.quantity);

    // Update sale status
    setSales((prev) =>
      prev.map((s) =>
        s._id === refundSale._id
          ? {
              ...s,
              lines: updatedSaleLines,
              status: allReturned ? "REFUNDED" : "PARTIALLY_REFUNDED",
              paymentStatus: allReturned ? "REFUNDED" : "PARTIALLY_REFUNDED",
            }
          : s
      )
    );

    // Add to returns history
    const newReturn: RetailReturn = {
      _id: `ret-${Date.now()}`,
      returnNumber: `RTN-${new Date().getFullYear()}-${(returns.length + 1).toString().padStart(3, "0")}`,
      saleReceiptNumber: refundSale.receiptNumber,
      reason: refundReason,
      lines: returnLines,
      refundAmountMinor: refundTotal,
      refundMethod,
      processedBy: "Current User",
      createdAt: new Date().toISOString(),
    };

    setReturns((prev) => [newReturn, ...prev]);
    setRefundSale(null);
  };

  const getStatusBadge = (status: RetailSale["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-emerald-100 text-emerald-800">Completed</Badge>;
      case "PARTIALLY_REFUNDED":
        return <Badge className="bg-amber-100 text-amber-800">Partially Refunded</Badge>;
      case "REFUNDED":
        return <Badge className="bg-purple-100 text-purple-800">Refunded</Badge>;
      case "VOIDED":
        return <Badge variant="destructive">Voided</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sales & Transactions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit store receipts, track payment tenders, and manage customer returns.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Gross Sales Volume</p>
              <h3 className="text-2xl font-bold text-slate-900">{formatMinor(totalRevenue)}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Transactions</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalTransactions} orders</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Refunds Processed</p>
              <h3 className="text-2xl font-bold text-purple-700">{formatMinor(totalRefunded)}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("SALES")}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "SALES"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Receipt className="h-4 w-4" />
          Sales Receipts ({sales.length})
        </button>
        <button
          onClick={() => setActiveTab("RETURNS")}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "RETURNS"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <RotateCcw className="h-4 w-4" />
          Returns & Refunds ({returns.length})
        </button>
      </div>

      {/* ─── TAB 1: SALES TRANSACTIONS ────────────────────────── */}
      {activeTab === "SALES" && (
        <div className="space-y-4">
          {/* Filters */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search receipt #, invoice, customer, or cashier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 w-full"
                  />
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                  <div className="w-full sm:w-40">
                    <Select value={paymentFilter} onValueChange={(val) => val && setPaymentFilter(val)}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="All Methods" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Payments</SelectItem>
                        <SelectItem value="CARD">Card</SelectItem>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="ROOM_CHARGE">Room Charge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full sm:w-40">
                    <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Statuses</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="PARTIALLY_REFUNDED">Partially Refunded</SelectItem>
                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                        <SelectItem value="VOIDED">Voided</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales Table */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Receipt / Invoice</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Cashier</TableHead>
                    <TableHead className="text-center">Payment Method</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                        No transactions found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSales.map((sale) => (
                      <TableRow key={sale._id} className="hover:bg-slate-50/70">
                        <TableCell>
                          <div className="font-mono font-semibold text-slate-900">
                            {sale.receiptNumber}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {sale.invoiceNumber}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {new Date(sale.createdAt).toLocaleDateString()}{" "}
                          {new Date(sale.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="text-sm text-slate-800">
                          {sale.customerName || <span className="text-slate-400 italic">Walk-in</span>}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">{sale.cashierName}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-semibold text-xs bg-slate-50">
                            {sale.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-900">
                          {formatMinor(sale.totalMinor)}
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(sale.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-600"
                              onClick={() => setSelectedSale(sale)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {sale.status !== "REFUNDED" && sale.status !== "VOIDED" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs gap-1 text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100"
                                onClick={() => handleOpenRefund(sale)}
                                title="Process Refund"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Refund
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB 2: RETURNS & REFUNDS ─────────────────────────── */}
      {activeTab === "RETURNS" && (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Return #</TableHead>
                  <TableHead>Orig. Receipt</TableHead>
                  <TableHead>Date Processed</TableHead>
                  <TableHead>Returned Items</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-center">Refund Method</TableHead>
                  <TableHead className="text-right">Refund Amount</TableHead>
                  <TableHead>Processed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.map((ret) => (
                  <TableRow key={ret._id} className="hover:bg-slate-50/70">
                    <TableCell className="font-mono font-semibold text-slate-900">
                      {ret.returnNumber}
                    </TableCell>
                    <TableCell className="font-mono text-slate-600 text-xs">
                      {ret.saleReceiptNumber}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(ret.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-700">
                        {ret.lines.map((l, idx) => (
                          <span key={idx} className="block">
                            {l.quantity}x {l.name} ({l.condition})
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                      {ret.reason}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-slate-50">
                        {ret.refundMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-purple-700">
                      -{formatMinor(ret.refundAmountMinor)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{ret.processedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Transaction Details Modal */}
      <Dialog open={!!selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)}>
        <DialogContent className="max-w-md">
          {selectedSale && (
            <div className="space-y-4 font-sans">
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-lg font-bold text-slate-900">
                    {selectedSale.receiptNumber}
                  </DialogTitle>
                  {getStatusBadge(selectedSale.status)}
                </div>
                <DialogDescription>
                  Cashier: {selectedSale.cashierName} | Location: {selectedSale.locationName}
                </DialogDescription>
              </DialogHeader>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="border-b border-dashed border-slate-300 pb-2 space-y-1.5">
                  {selectedSale.lines.map((line, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-800">{line.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {line.quantity} @ {formatMinor(line.unitPriceMinor)}
                          {line.returnedQuantity > 0 && (
                            <span className="text-purple-600 ml-1">
                              ({line.returnedQuantity} refunded)
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="font-mono font-semibold text-slate-900">
                        {formatMinor(line.totalMinor)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-slate-600 pt-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatMinor(selectedSale.subtotalMinor)}</span>
                  </div>
                  {selectedSale.discountTotalMinor > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount</span>
                      <span className="font-mono">-{formatMinor(selectedSale.discountTotalMinor)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="font-mono">{formatMinor(selectedSale.taxTotalMinor)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Paid</span>
                    <span className="font-mono text-sm">{formatMinor(selectedSale.totalMinor)}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-300 pt-2 text-[11px] text-slate-500">
                  <p>
                    Payment Tender: <strong>{selectedSale.paymentMethod}</strong>
                  </p>
                  <p>Business Date: {selectedSale.businessDate}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={() => alert("Re-printing receipt copy...")}
                >
                  <Printer className="h-4 w-4" />
                  Re-print Receipt
                </Button>
                <Button className="flex-1 text-xs" onClick={() => setSelectedSale(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Return & Refund Modal */}
      <Dialog open={!!refundSale} onOpenChange={(open) => !open && setRefundSale(null)}>
        <DialogContent className="max-w-lg">
          {refundSale && (
            <form onSubmit={handleProcessRefund} className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-purple-600" />
                  Process Return / Refund
                </DialogTitle>
                <DialogDescription>
                  Originating Receipt: <span className="font-mono font-semibold">{refundSale.receiptNumber}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-1">
                <Label className="text-xs font-semibold text-slate-700">
                  Select Item(s) and Quantity to Return:
                </Label>
                <div className="space-y-2">
                  {refundSale.lines.map((line, idx) => {
                    const remainingToReturn = line.quantity - line.returnedQuantity;
                    if (remainingToReturn <= 0) return null;
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{line.name}</p>
                          <p className="text-slate-500">
                            Purchased: {line.quantity} | Available to return: {remainingToReturn} | Rate:{" "}
                            {formatMinor(line.unitPriceMinor)}
                          </p>
                        </div>
                        <div className="w-24">
                          <Input
                            type="number"
                            min="0"
                            max={remainingToReturn}
                            value={refundItems[idx] ?? 0}
                            onChange={(e) =>
                              setRefundItems({
                                ...refundItems,
                                [idx]: parseInt(e.target.value, 10) || 0,
                              })
                            }
                            className="h-8 text-right font-bold"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label className="text-xs font-medium text-slate-700">Return Reason *</Label>
                  <Select value={refundReason} onValueChange={(val) => val && setRefundReason(val)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Customer changed mind">Customer changed mind</SelectItem>
                      <SelectItem value="Defective or damaged">Defective / Damaged</SelectItem>
                      <SelectItem value="Incorrect size/spec">Incorrect item or size</SelectItem>
                      <SelectItem value="Billing error">Cashier billing error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-700">Refund Method</Label>
                    <Select value={refundMethod} onValueChange={(val) => val && setRefundMethod(val)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CARD">Original Card</SelectItem>
                        <SelectItem value="CASH">Cash Refund</SelectItem>
                        <SelectItem value="STORE_CREDIT">Store Credit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={restockToInventory}
                        onChange={(e) => setRestockToInventory(e.target.checked)}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                      />
                      Return item to stock
                    </label>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setRefundSale(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  Issue Refund
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
