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
  Truck,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  PackageCheck,
  Building,
  Mail,
  Phone,
  Calendar,
  Send,
} from "lucide-react";
import {
  mockSuppliers,
  mockPurchaseOrders,
  mockProducts,
  RetailSupplier,
  RetailPurchaseOrder,
  formatMinor,
} from "@/lib/retail-mock-data";

export default function RetailSuppliersPage() {
  const [activeTab, setActiveTab] = useState<"SUPPLIERS" | "ORDERS">("ORDERS");
  const [suppliers, setSuppliers] = useState<RetailSupplier[]>(mockSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<RetailPurchaseOrder[]>(mockPurchaseOrders);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Supplier modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<RetailSupplier | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    leadTimeDays: 5,
    isActive: true,
  });

  // PO modals
  const [isCreatePoOpen, setIsCreatePoOpen] = useState(false);
  const [viewPo, setViewPo] = useState<RetailPurchaseOrder | null>(null);
  const [receivingPo, setReceivingPo] = useState<RetailPurchaseOrder | null>(null);

  // New PO Form
  const [poFormSupplierId, setPoFormSupplierId] = useState<string>(mockSuppliers[0]?._id || "");
  const [poFormLocation, setPoFormLocation] = useState<string>("Main Store");
  const [poFormExpectedDate, setPoFormExpectedDate] = useState<string>("");
  const [poFormNotes, setPoFormNotes] = useState<string>("");
  const [poFormLines, setPoFormLines] = useState<
    { productId: string; productName: string; sku: string; quantity: number; unitCost: number }[]
  >([
    {
      productId: mockProducts[0]?._id || "",
      productName: mockProducts[0]?.name || "",
      sku: mockProducts[0]?.sku || "",
      quantity: 10,
      unitCost: (mockProducts[0]?.costPriceMinor || 1000) / 100,
    },
  ]);

  // Receiving state
  const [receiveLines, setReceiveLines] = useState<{ [index: number]: number }>({});

  // Suppliers Filtered
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [suppliers, searchQuery]);

  // POs Filtered
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchesSearch =
        po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || po.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, searchQuery, statusFilter]);

  // Supplier handlers
  const handleOpenSupplierModal = (sup?: RetailSupplier) => {
    if (sup) {
      setEditSupplier(sup);
      setSupplierForm({
        name: sup.name,
        contactPerson: sup.contactPerson,
        email: sup.email,
        phone: sup.phone,
        address: sup.address,
        leadTimeDays: sup.leadTimeDays,
        isActive: sup.isActive,
      });
    } else {
      setEditSupplier(null);
      setSupplierForm({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        leadTimeDays: 5,
        isActive: true,
      });
    }
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (editSupplier) {
      setSuppliers((prev) =>
        prev.map((s) => (s._id === editSupplier._id ? { ...s, ...supplierForm } : s))
      );
    } else {
      const newSup: RetailSupplier = {
        _id: `sup-${Date.now()}`,
        ...supplierForm,
        productsSupplied: 0,
      };
      setSuppliers((prev) => [newSup, ...prev]);
    }
    setIsSupplierModalOpen(false);
  };

  // PO Handlers
  const handleAddPoLine = () => {
    const prod = mockProducts[0];
    setPoFormLines((prev) => [
      ...prev,
      {
        productId: prod._id,
        productName: prod.name,
        sku: prod.sku,
        quantity: 1,
        unitCost: prod.costPriceMinor / 100,
      },
    ]);
  };

  const handleRemovePoLine = (index: number) => {
    setPoFormLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePoProductChange = (index: number, productId: string) => {
    const prod = mockProducts.find((p) => p._id === productId);
    if (!prod) return;
    setPoFormLines((prev) =>
      prev.map((line, i) =>
        i === index
          ? {
              ...line,
              productId: prod._id,
              productName: prod.name,
              sku: prod.sku,
              unitCost: prod.costPriceMinor / 100,
            }
          : line
      )
    );
  };

  const handlePoLineQuantityChange = (index: number, qty: number) => {
    setPoFormLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, quantity: Math.max(1, qty) } : line))
    );
  };

  const handlePoLineCostChange = (index: number, cost: number) => {
    setPoFormLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, unitCost: Math.max(0, cost) } : line))
    );
  };

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s._id === poFormSupplierId);
    const lines = poFormLines.map((l) => ({
      productName: l.productName,
      sku: l.sku,
      quantity: l.quantity,
      unitCost: l.unitCost,
      receivedQty: 0,
      totalMinor: Math.round(l.quantity * l.unitCost * 100),
    }));
    const subtotalMinor = lines.reduce((acc, curr) => acc + curr.totalMinor, 0);

    const newPo: RetailPurchaseOrder = {
      _id: `po-${Date.now()}`,
      poNumber: `PO-${new Date().getFullYear()}-${(purchaseOrders.length + 1).toString().padStart(3, "0")}`,
      supplierId: poFormSupplierId,
      supplierName: sup?.name || "Supplier",
      locationName: poFormLocation,
      status: "SENT",
      lines,
      subtotalMinor,
      notes: poFormNotes || undefined,
      expectedAt: poFormExpectedDate || undefined,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setPurchaseOrders((prev) => [newPo, ...prev]);
    setIsCreatePoOpen(false);
  };

  const handleOpenReceiveModal = (po: RetailPurchaseOrder) => {
    setReceivingPo(po);
    const initialReceive: { [index: number]: number } = {};
    po.lines.forEach((line, index) => {
      initialReceive[index] = Math.max(0, line.quantity - line.receivedQty);
    });
    setReceiveLines(initialReceive);
  };

  const handleCompleteReceiving = () => {
    if (!receivingPo) return;

    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po._id === receivingPo._id) {
          const updatedLines = po.lines.map((line, index) => {
            const addedQty = receiveLines[index] || 0;
            return {
              ...line,
              receivedQty: line.receivedQty + addedQty,
            };
          });

          const allComplete = updatedLines.every((l) => l.receivedQty >= l.quantity);
          const anyReceived = updatedLines.some((l) => l.receivedQty > 0);

          return {
            ...po,
            lines: updatedLines,
            status: allComplete ? "RECEIVED" : anyReceived ? "PARTIALLY_RECEIVED" : po.status,
            receivedAt: allComplete ? new Date().toISOString() : po.receivedAt,
          };
        }
        return po;
      })
    );

    setReceivingPo(null);
  };

  const getStatusBadge = (status: RetailPurchaseOrder["status"]) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="secondary" className="bg-slate-100 text-slate-700">Draft</Badge>;
      case "SENT":
        return <Badge className="bg-blue-100 text-blue-800">Sent to Supplier</Badge>;
      case "PARTIALLY_RECEIVED":
        return <Badge className="bg-amber-100 text-amber-800">Partially Received</Badge>;
      case "RECEIVED":
        return <Badge className="bg-emerald-100 text-emerald-800">Fully Received</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Suppliers & Purchasing
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage procurement vendors, issue purchase orders, and accept goods into stock.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "ORDERS" ? (
            <Button
              onClick={() => setIsCreatePoOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              New Purchase Order
            </Button>
          ) : (
            <Button
              onClick={() => handleOpenSupplierModal()}
              className="bg-primary hover:bg-primary/90 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Supplier
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab("ORDERS");
            setSearchQuery("");
          }}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "ORDERS"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="h-4 w-4" />
          Purchase Orders ({purchaseOrders.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("SUPPLIERS");
            setSearchQuery("");
          }}
          className={`pb-3 px-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "SUPPLIERS"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Truck className="h-4 w-4" />
          Vendor Suppliers ({suppliers.length})
        </button>
      </div>

      {/* ORDERS TAB */}
      {activeTab === "ORDERS" && (
        <div className="space-y-4">
          {/* PO KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="p-4 bg-white border-slate-200 shadow-sm">
              <p className="text-xs font-medium text-slate-500">Active POs</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                {purchaseOrders.filter((p) => p.status === "SENT" || p.status === "PARTIALLY_RECEIVED").length}
              </h3>
            </Card>
            <Card className="p-4 bg-white border-slate-200 shadow-sm">
              <p className="text-xs font-medium text-slate-500">Pending Goods Arrival</p>
              <h3 className="text-xl font-bold text-amber-600 mt-1">
                {purchaseOrders.filter((p) => p.status === "SENT").length} orders
              </h3>
            </Card>
            <Card className="p-4 bg-white border-slate-200 shadow-sm">
              <p className="text-xs font-medium text-slate-500">Completed Orders</p>
              <h3 className="text-xl font-bold text-emerald-600 mt-1">
                {purchaseOrders.filter((p) => p.status === "RECEIVED").length}
              </h3>
            </Card>
            <Card className="p-4 bg-white border-slate-200 shadow-sm">
              <p className="text-xs font-medium text-slate-500">Total Procurement Value</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                {formatMinor(purchaseOrders.reduce((sum, p) => sum + p.subtotalMinor, 0))}
              </h3>
            </Card>
          </div>

          {/* Search & Filter */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search PO number or vendor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 w-full"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="SENT">Sent</SelectItem>
                      <SelectItem value="PARTIALLY_RECEIVED">Partially Received</SelectItem>
                      <SelectItem value="RECEIVED">Received</SelectItem>
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
                  {filteredPOs.length === 0 ? (
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
                        <TableCell className="text-center">{getStatusBadge(po.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-600"
                              onClick={() => setViewPo(po)}
                              title="View PO"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {(po.status === "SENT" || po.status === "PARTIALLY_RECEIVED") && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                onClick={() => handleOpenReceiveModal(po)}
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
      )}

      {/* SUPPLIERS TAB */}
      {activeTab === "SUPPLIERS" && (
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search suppliers by name, contact, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-center">Lead Time</TableHead>
                    <TableHead className="text-center">Products</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((sup) => (
                    <TableRow key={sup._id} className="hover:bg-slate-50/70">
                      <TableCell className="font-semibold text-slate-900">{sup.name}</TableCell>
                      <TableCell className="text-slate-700">{sup.contactPerson}</TableCell>
                      <TableCell>
                        <div className="text-xs text-slate-600 flex items-center gap-1">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {sup.email}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {sup.phone}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                        {sup.address}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs">
                        {sup.leadTimeDays} days
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          {sup.productsSupplied} items
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {sup.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-600"
                          onClick={() => handleOpenSupplierModal(sup)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* View PO Modal */}
      <Dialog open={!!viewPo} onOpenChange={(open) => !open && setViewPo(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {viewPo && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold text-slate-900">
                    {viewPo.poNumber}
                  </DialogTitle>
                  {getStatusBadge(viewPo.status)}
                </div>
                <DialogDescription>
                  Vendor: <span className="font-semibold text-slate-800">{viewPo.supplierName}</span> | Destination: {viewPo.locationName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="rounded-md border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="text-xs">Product & SKU</TableHead>
                        <TableHead className="text-xs text-right">Ordered</TableHead>
                        <TableHead className="text-xs text-right">Received</TableHead>
                        <TableHead className="text-xs text-right">Unit Cost</TableHead>
                        <TableHead className="text-xs text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewPo.lines.map((line, idx) => (
                        <TableRow key={idx} className="text-xs">
                          <TableCell>
                            <div className="font-medium text-slate-800">{line.productName}</div>
                            <div className="font-mono text-slate-400 text-[11px]">{line.sku}</div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">{line.quantity}</TableCell>
                          <TableCell className="text-right text-emerald-600 font-semibold">
                            {line.receivedQty}
                          </TableCell>
                          <TableCell className="text-right text-slate-600 font-mono">
                            ${line.unitCost.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-slate-900">
                            {formatMinor(line.totalMinor)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-center text-sm pt-2">
                  <div className="text-xs text-slate-500">
                    Created: {new Date(viewPo.createdAt).toLocaleDateString()}
                    {viewPo.notes && <p className="mt-1">Notes: {viewPo.notes}</p>}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Total Order Cost: </span>
                    <span className="text-lg font-bold text-slate-900">
                      {formatMinor(viewPo.subtotalMinor)}
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setViewPo(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Goods Receiving Modal */}
      <Dialog open={!!receivingPo} onOpenChange={(open) => !open && setReceivingPo(null)}>
        <DialogContent className="max-w-xl">
          {receivingPo && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <PackageCheck className="h-5 w-5 text-emerald-600" />
                  Receive Goods — {receivingPo.poNumber}
                </DialogTitle>
                <DialogDescription>
                  Confirm quantities delivered by {receivingPo.supplierName} to immediately increment on-hand inventory.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-3">
                  {receivingPo.lines.map((line, idx) => {
                    const remaining = Math.max(0, line.quantity - line.receivedQty);
                    return (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-sm"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{line.productName}</p>
                          <p className="text-xs text-slate-500">
                            Ordered: {line.quantity} | Already Received: {line.receivedQty} | Remaining:{" "}
                            <span className="font-medium text-amber-700">{remaining}</span>
                          </p>
                        </div>
                        <div className="w-28">
                          <Label className="text-[11px] text-slate-500">Qty Receiving Now</Label>
                          <Input
                            type="number"
                            min="0"
                            max={remaining}
                            value={receiveLines[idx] ?? remaining}
                            onChange={(e) =>
                              setReceiveLines({
                                ...receiveLines,
                                [idx]: parseInt(e.target.value, 10) || 0,
                              })
                            }
                            className="h-8 text-right font-medium"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setReceivingPo(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCompleteReceiving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm Receipt
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Purchase Order Modal */}
      <Dialog open={isCreatePoOpen} onOpenChange={setIsCreatePoOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Create Purchase Order
            </DialogTitle>
            <DialogDescription>
              Draft an order to replenish inventory from an approved supplier.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePo} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Vendor / Supplier *</Label>
                <Select value={poFormSupplierId} onValueChange={(val) => val && setPoFormSupplierId(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Destination Location *</Label>
                <Select value={poFormLocation} onValueChange={(val) => val && setPoFormLocation(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Store">Main Store</SelectItem>
                    <SelectItem value="Warehouse">Central Warehouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Expected Delivery Date</Label>
                <Input
                  type="date"
                  value={poFormExpectedDate}
                  onChange={(e) => setPoFormExpectedDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-700">Order Notes / Instructions</Label>
                <Input
                  value={poFormNotes}
                  onChange={(e) => setPoFormNotes(e.target.value)}
                  placeholder="e.g. Expedited shipping requested"
                />
              </div>
            </div>

            {/* Line items */}
            <div className="border-t border-slate-200 pt-3 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Order Line Items
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPoLine}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Line Item
                </Button>
              </div>

              <div className="space-y-2">
                {poFormLines.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-12 gap-2 items-center"
                  >
                    <div className="col-span-5">
                      <Label className="text-[10px] text-slate-500">Product</Label>
                      <Select
                        value={line.productId}
                        onValueChange={(val) => val && handlePoProductChange(idx, val)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mockProducts.map((p) => (
                            <SelectItem key={p._id} value={p._id} className="text-xs">
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label className="text-[10px] text-slate-500">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) =>
                          handlePoLineQuantityChange(idx, parseInt(e.target.value, 10) || 1)
                        }
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-[10px] text-slate-500">Unit Cost ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={line.unitCost}
                        onChange={(e) =>
                          handlePoLineCostChange(idx, parseFloat(e.target.value) || 0)
                        }
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="col-span-2 text-right">
                      <Label className="text-[10px] text-slate-500 block">Total</Label>
                      <span className="text-xs font-semibold text-slate-900 block mt-1">
                        ${(line.quantity * line.unitCost).toFixed(2)}
                      </span>
                    </div>

                    <div className="col-span-1 text-center">
                      {poFormLines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePoLine(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-right pt-2">
                <span className="text-xs text-slate-500">Total Purchase Value: </span>
                <span className="text-base font-bold text-slate-900">
                  $
                  {poFormLines
                    .reduce((sum, l) => sum + l.quantity * l.unitCost, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsCreatePoOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white gap-1.5">
                <Send className="h-4 w-4" />
                Create & Dispatch PO
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Supplier Create/Edit Modal */}
      <Dialog open={isSupplierModalOpen} onOpenChange={setIsSupplierModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editSupplier ? "Edit Supplier" : "New Supplier"}
            </DialogTitle>
            <DialogDescription>
              {editSupplier ? "Update vendor details and terms." : "Add a new vendor partner."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSupplier} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-700">Company Name *</Label>
              <Input
                required
                value={supplierForm.name}
                onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                placeholder="e.g. Apex Global Distributors"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-700">Contact Person *</Label>
              <Input
                required
                value={supplierForm.contactPerson}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, contactPerson: e.target.value })
                }
                placeholder="e.g. Marcus Vance"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">Email *</Label>
                <Input
                  type="email"
                  required
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                  placeholder="contact@apex.com"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">Phone</Label>
                <Input
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  placeholder="+1-555-0199"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">Lead Time (Days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={supplierForm.leadTimeDays}
                  onChange={(e) =>
                    setSupplierForm({
                      ...supplierForm,
                      leadTimeDays: parseInt(e.target.value, 10) || 1,
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">Status</Label>
                <Select
                  value={supplierForm.isActive ? "ACTIVE" : "INACTIVE"}
                  onValueChange={(val) =>
                    setSupplierForm({ ...supplierForm, isActive: val === "ACTIVE" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-700">Address / City</Label>
              <Input
                value={supplierForm.address}
                onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                placeholder="100 Logistics Way, Suite 400"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSupplierModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                {editSupplier ? "Save Changes" : "Create Supplier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
