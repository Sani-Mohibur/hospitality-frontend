"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Truck, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useLocation } from "@/lib/location-context";
import { toast } from "sonner";
import {
  RetailSupplier,
  RetailPurchaseOrder,
  RetailPOLine,
  ProductOption,
  RawSupplier,
  RawPO,
  RawProduct,
  SupplierFormData,
  normalizeSupplier,
  normalizePO,
  PurchaseOrdersTab,
  SuppliersTab,
  ViewPoModal,
  ReceiveGoodsModal,
  CreatePoModal,
  SupplierModal,
} from "@/components/retail/suppliers";

// Re-export domain interfaces for backward-compatibility with other modules
export type { RetailSupplier, RetailPOLine, RetailPurchaseOrder, ProductOption };

export default function RetailSuppliersPage() {
  const { currentLocation, locations } = useLocation();

  // Tab & entity state
  const [activeTab, setActiveTab] = useState<"SUPPLIERS" | "ORDERS">("ORDERS");
  const [suppliers, setSuppliers] = useState<RetailSupplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<RetailPurchaseOrder[]>([]);
  const [availableProducts, setAvailableProducts] = useState<ProductOption[]>([]);

  // Loading & Error states
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal dialog states
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<RetailSupplier | null>(null);
  const [isCreatePoOpen, setIsCreatePoOpen] = useState(false);
  const [viewPo, setViewPo] = useState<RetailPurchaseOrder | null>(null);
  const [receivingPo, setReceivingPo] = useState<RetailPurchaseOrder | null>(null);

  // 1. Fetch Suppliers
  const fetchSuppliers = useCallback(() => {
    setIsLoadingSuppliers(true);
    apiClient
      .get<RawSupplier[]>("/retail/supplier")
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : [];
        setSuppliers(raw.map(normalizeSupplier));
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load suppliers";
        setError(msg);
      })
      .finally(() => {
        setIsLoadingSuppliers(false);
      });
  }, []);

  // 2. Fetch Purchase Orders
  const fetchPurchaseOrders = useCallback(() => {
    setIsLoadingOrders(true);
    const params: Record<string, string> = {};
    if (currentLocation?._id) {
      params.locationId = currentLocation._id;
    }
    apiClient
      .get<RawPO[]>("/retail/purchase-order", { params })
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : [];
        setPurchaseOrders(raw.map(normalizePO));
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load purchase orders";
        setError(msg);
      })
      .finally(() => {
        setIsLoadingOrders(false);
      });
  }, [currentLocation]);

  // 3. Fetch Products for PO line selector
  const fetchProducts = useCallback(() => {
    apiClient
      .get<RawProduct[]>("/retail/product")
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : [];
        const options: ProductOption[] = raw.map((p) => ({
          _id: p._id,
          name: p.name,
          sku: p.sku || "",
          costPriceMinor: p.costPriceMinor || 0,
        }));
        setAvailableProducts(options);
      })
      .catch(() => {
        // non-blocking
      });
  }, []);

  // Initial load on mount & location change
  useEffect(() => {
    let ignore = false;

    const supPromise = apiClient.get<RawSupplier[]>("/retail/supplier");
    const poParams: Record<string, string> = {};
    if (currentLocation?._id) {
      poParams.locationId = currentLocation._id;
    }
    const poPromise = apiClient.get<RawPO[]>("/retail/purchase-order", { params: poParams });
    const prodPromise = apiClient.get<RawProduct[]>("/retail/product");

    Promise.all([supPromise, poPromise, prodPromise])
      .then(([supRes, poRes, prodRes]) => {
        if (!ignore) {
          setError(null);
          const rawSup = Array.isArray(supRes.data) ? supRes.data : [];
          setSuppliers(rawSup.map(normalizeSupplier));

          const rawPO = Array.isArray(poRes.data) ? poRes.data : [];
          setPurchaseOrders(rawPO.map(normalizePO));

          const rawProd = Array.isArray(prodRes.data) ? prodRes.data : [];
          setAvailableProducts(
            rawProd.map((p) => ({
              _id: p._id,
              name: p.name,
              sku: p.sku || "",
              costPriceMinor: p.costPriceMinor || 0,
            }))
          );
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Failed to initialize purchasing data";
          setError(msg);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoadingSuppliers(false);
          setIsLoadingOrders(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentLocation]);

  // Filtered Suppliers memo
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [suppliers, searchQuery]);

  // Filtered POs memo
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchesSearch =
        po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || po.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, searchQuery, statusFilter]);

  // Supplier modal handlers
  const handleOpenSupplierModal = (sup?: RetailSupplier) => {
    setEditSupplier(sup || null);
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = async (formData: SupplierFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        contactName: formData.contactPerson.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        leadTimeDays: formData.leadTimeDays,
        isActive: formData.isActive,
      };

      if (editSupplier) {
        const res = await apiClient.patch<RawSupplier>(`/retail/supplier/${editSupplier._id}`, payload);
        toast.success("Supplier updated successfully");
        setSuppliers((prev) =>
          prev.map((s) => (s._id === editSupplier._id ? normalizeSupplier(res.data) : s))
        );
      } else {
        const res = await apiClient.post<RawSupplier>("/retail/supplier", payload);
        toast.success("Supplier created successfully");
        setSuppliers((prev) => [normalizeSupplier(res.data), ...prev]);
      }
      setIsSupplierModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save supplier";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSupplier = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete supplier "${name}"?`)) return;
    try {
      await apiClient.delete(`/retail/supplier/${id}`);
      toast.success("Supplier removed");
      setSuppliers((prev) => prev.filter((s) => s._id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete supplier";
      toast.error(msg);
    }
  };

  // PO handlers
  const handleOpenCreatePo = () => {
    if (suppliers.length === 0) {
      toast.error("Please add at least one supplier before creating a purchase order.");
      setActiveTab("SUPPLIERS");
      handleOpenSupplierModal();
      return;
    }
    if (availableProducts.length === 0) {
      toast.error("No products available to order. Create a retail product first.");
      return;
    }
    setIsCreatePoOpen(true);
  };

  const handleCreatePo = async (data: {
    supplierId: string;
    locationId: string;
    expectedDate?: string;
    notes?: string;
    lines: Array<{ productId: string; quantity: number; unitCost: number }>;
  }) => {
    setIsSubmitting(true);
    try {
      const payload = {
        supplierId: data.supplierId,
        locationId: data.locationId,
        expectedAt: data.expectedDate ? new Date(data.expectedDate).toISOString() : undefined,
        notes: data.notes?.trim() || undefined,
        lines: data.lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitCost: Math.round(l.unitCost * 100),
        })),
      };

      const res = await apiClient.post<RawPO>("/retail/purchase-order", payload);
      const createdPO = res.data;

      // Automatically dispatch / send order
      if (createdPO?._id) {
        try {
          const sentRes = await apiClient.post<RawPO>(`/retail/purchase-order/${createdPO._id}/send`);
          toast.success(
            `Purchase order ${sentRes.data.poNumber || createdPO.poNumber} created and dispatched to vendor!`
          );
          setPurchaseOrders((prev) => [normalizePO(sentRes.data), ...prev]);
        } catch {
          toast.success(`Purchase order ${createdPO.poNumber} created (Draft).`);
          setPurchaseOrders((prev) => [normalizePO(createdPO), ...prev]);
        }
      }

      setIsCreatePoOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create purchase order";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenReceiveModal = (po: RetailPurchaseOrder) => {
    setReceivingPo(po);
  };

  const handleCompleteReceiving = async (
    targetPo: RetailPurchaseOrder,
    receiveLines: { [index: number]: number }
  ) => {
    const linesPayload = targetPo.lines
      .map((line, idx) => {
        const qtyToReceive = receiveLines[idx] || 0;
        return {
          stockItemId: line.stockItemId || "",
          receivedQuantity: qtyToReceive,
        };
      })
      .filter((item) => item.receivedQuantity > 0 && Boolean(item.stockItemId));

    if (linesPayload.length === 0) {
      toast.error("Please enter a quantity greater than 0 for at least one item");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiClient.post<RawPO>(`/retail/purchase-order/${targetPo._id}/receive`, {
        lines: linesPayload,
        notes: "Goods received via web portal",
      });

      toast.success(`Successfully received goods for ${targetPo.poNumber}! Inventory updated.`);
      setPurchaseOrders((prev) =>
        prev.map((po) => (po._id === targetPo._id ? normalizePO(res.data) : po))
      );
      setReceivingPo(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record goods receipt";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelPo = async (po: RetailPurchaseOrder) => {
    if (!confirm(`Are you sure you want to cancel purchase order ${po.poNumber}?`)) return;
    try {
      const res = await apiClient.post<RawPO>(`/retail/purchase-order/${po._id}/cancel`);
      toast.success(`Purchase order ${po.poNumber} cancelled.`);
      setPurchaseOrders((prev) =>
        prev.map((p) => (p._id === po._id ? normalizePO(res.data) : p))
      );
      if (viewPo?._id === po._id) {
        setViewPo(normalizePO(res.data));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to cancel purchase order";
      toast.error(msg);
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
              onClick={handleOpenCreatePo}
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

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

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
        <PurchaseOrdersTab
          purchaseOrders={purchaseOrders}
          filteredPOs={filteredPOs}
          isLoading={isLoadingOrders}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onViewPo={setViewPo}
          onReceivePo={handleOpenReceiveModal}
        />
      )}

      {/* SUPPLIERS TAB */}
      {activeTab === "SUPPLIERS" && (
        <SuppliersTab
          filteredSuppliers={filteredSuppliers}
          isLoading={isLoadingSuppliers}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onEditSupplier={handleOpenSupplierModal}
          onDeleteSupplier={handleDeleteSupplier}
        />
      )}

      {/* View PO Modal */}
      <ViewPoModal
        po={viewPo}
        isOpen={!!viewPo}
        onClose={() => setViewPo(null)}
        onCancelPo={handleCancelPo}
      />

      {/* Goods Receiving Modal */}
      <ReceiveGoodsModal
        po={receivingPo}
        isOpen={!!receivingPo}
        onClose={() => setReceivingPo(null)}
        onConfirmReceipt={handleCompleteReceiving}
        isSubmitting={isSubmitting}
      />

      {/* Create Purchase Order Modal */}
      <CreatePoModal
        isOpen={isCreatePoOpen}
        onClose={() => setIsCreatePoOpen(false)}
        suppliers={suppliers}
        locations={locations}
        availableProducts={availableProducts}
        currentLocationId={currentLocation?._id}
        onSubmit={handleCreatePo}
        isSubmitting={isSubmitting}
      />

      {/* Supplier Create/Edit Modal */}
      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        supplier={editSupplier}
        onSubmit={handleSaveSupplier}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
