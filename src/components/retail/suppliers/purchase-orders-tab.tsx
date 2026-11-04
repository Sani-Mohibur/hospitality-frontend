"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Search, Eye, PackageCheck, Loader2 } from "lucide-react";
import { formatMinor } from "@/lib/retail-mock-data";
import { RetailPurchaseOrder } from "./types";
import { PurchaseOrderKpis } from "./purchase-order-kpis";
import { StatusBadge } from "./status-badge";

interface PurchaseOrdersTabProps {
  purchaseOrders: RetailPurchaseOrder[];
  filteredPOs: RetailPurchaseOrder[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  onViewPo: (po: RetailPurchaseOrder) => void;
  onReceivePo: (po: RetailPurchaseOrder) => void;
}

export function PurchaseOrdersTab({
  purchaseOrders,
  filteredPOs,
  isLoading,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onViewPo,
  onReceivePo,
}: PurchaseOrdersTabProps) {
  return (
    <div className="space-y-4">
      {/* PO KPI cards */}
      <PurchaseOrderKpis purchaseOrders={purchaseOrders} />

      {/* Search & Filter */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search PO number or vendor..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 h-10 w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={(val) => val && onStatusFilterChange(val)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="PARTIALLY_RECEIVED">Partially Received</SelectItem>
                  <SelectItem value="RECEIVED">Received</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PO Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead>Expected Date</TableHead>
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
                      <span>Loading purchase orders...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredPOs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                    No purchase orders found matching your filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPOs.map((po) => (
                  <TableRow key={po._id} className="hover:bg-slate-50/70">
                    <TableCell className="font-mono font-semibold text-slate-900">
                      {po.poNumber}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {po.supplierName}
                    </TableCell>
                    <TableCell className="text-slate-600">{po.locationName}</TableCell>
                    <TableCell className="text-center font-medium">
                      {po.lines.length} lines
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      {formatMinor(po.subtotalMinor)}
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs">
                      {po.expectedAt || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={po.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-600"
                          onClick={() => onViewPo(po)}
                          title="View PO"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {(po.status === "SENT" || po.status === "PARTIALLY_RECEIVED") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            onClick={() => onReceivePo(po)}
                          >
                            <PackageCheck className="h-3.5 w-3.5" />
                            Receive
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

