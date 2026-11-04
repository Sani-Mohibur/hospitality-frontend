import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, RotateCcw, Loader2 } from "lucide-react";
import { formatMinor } from "@/lib/retail-mock-data";
import { RetailSale } from "./types";
import { StatusBadge } from "./status-badge";

interface SalesTabProps {
  sales: RetailSale[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  paymentFilter: string;
  onPaymentFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onSelectSale: (sale: RetailSale) => void;
  onOpenRefund: (sale: RetailSale) => void;
}

export function SalesTab({
  sales,
  isLoading,
  searchQuery,
  onSearchChange,
  paymentFilter,
  onPaymentFilterChange,
  statusFilter,
  onStatusFilterChange,
  onSelectSale,
  onOpenRefund,
}: SalesTabProps) {
  return (
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
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 h-10 w-full"
              />
            </div>
            <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
              <div className="w-full sm:w-40">
                <Select
                  value={paymentFilter}
                  onValueChange={(val) => val && onPaymentFilterChange(val)}
                >
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
                <Select
                  value={statusFilter}
                  onValueChange={(val) => val && onStatusFilterChange(val)}
                >
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span>Loading sales receipts...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                    No transactions found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
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
                    <TableCell className="text-center">
                      <StatusBadge status={sale.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-600"
                          onClick={() => onSelectSale(sale)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {sale.status !== "REFUNDED" && sale.status !== "VOIDED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1 text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100"
                            onClick={() => onOpenRefund(sale)}
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
  );
}

