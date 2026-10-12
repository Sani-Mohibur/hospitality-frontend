"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CreditCard, PlusCircle, CheckCircle2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface FolioSummary {
  _id: string;
  number: string;
  name: string;
  type: string;
  status: "OPEN" | "CLOSED" | "VOID";
  balanceMinor: number;
  window?: number;
  guestId?: string;
  reservationId?: string;
  createdAt: string;
}

interface FolioLine {
  _id: string;
  type: "CHARGE" | "PAYMENT" | "ADJUSTMENT" | "TRANSFER";
  code: string;
  description: string;
  amountMinor: number;
  createdAt: string;
  postedAt?: string;
}

interface FolioDetail {
  folio: FolioSummary;
  lines: FolioLine[];
}

export default function FoliosPage() {
  const [folios, setFolios] = useState<FolioSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [folioDetail, setFolioDetail] = useState<FolioDetail | null>(null);

  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isChargeOpen, setIsChargeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment form
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentRef, setPaymentRef] = useState("");

  // Charge form
  const [chargeCode, setChargeCode] = useState("ROOM_SERVICE");
  const [chargeDesc, setChargeDesc] = useState("");
  const [chargeAmount, setChargeAmount] = useState("");

  const fetchFolios = useCallback(async () => {
    setIsLoadingList(true);
    setError(null);
    try {
      const res = await apiClient.get<FolioSummary[]>("/folio");
      const list = Array.isArray(res.data) ? res.data : [];
      setFolios(list);
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0]._id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load folios.");
    } finally {
      setIsLoadingList(false);
    }
  }, [selectedId]);

  const fetchFolioDetail = useCallback(async (id: string) => {
    setIsLoadingDetail(true);
    try {
      const res = await apiClient.get<FolioDetail>(`/folio/${id}`);
      setFolioDetail(res.data);
      if (res.data?.folio) {
        setPaymentAmount(((res.data.folio.balanceMinor || 0) / 100).toFixed(2));
      }
    } catch (err: any) {
      console.error("Failed to load folio detail:", err);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    fetchFolios();
  }, [fetchFolios]);

  useEffect(() => {
    if (selectedId) {
      fetchFolioDetail(selectedId);
    }
  }, [selectedId, fetchFolioDetail]);

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !paymentAmount) return;
    const amountMinor = Math.round(parseFloat(paymentAmount) * 100);
    if (isNaN(amountMinor) || amountMinor <= 0) return;

    setIsSubmitting(true);
    try {
      await apiClient.post(`/folio/${selectedId}/payments`, {
        method: paymentMethod,
        amountMinor,
        reference: paymentRef.trim() || undefined,
      });
      setIsPaymentOpen(false);
      setPaymentRef("");
      fetchFolioDetail(selectedId);
      fetchFolios();
    } catch (err: any) {
      alert(err?.message || "Failed to process payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !chargeAmount) return;
    const amountMinor = Math.round(parseFloat(chargeAmount) * 100);
    if (isNaN(amountMinor) || amountMinor <= 0) return;

    setIsSubmitting(true);
    try {
      await apiClient.post(`/folio/${selectedId}/charges`, {
        code: chargeCode,
        description: chargeDesc.trim() || "Manual Charge",
        quantity: 1,
        unitAmountMinor: amountMinor,
      });
      setIsChargeOpen(false);
      setChargeDesc("");
      setChargeAmount("");
      fetchFolioDetail(selectedId);
      fetchFolios();
    } catch (err: any) {
      alert(err?.message || "Failed to post charge");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseFolio = async () => {
    if (!selectedId) return;
    if (!confirm("Are you sure you want to close this folio and issue invoice?")) return;
    setIsSubmitting(true);
    try {
      await apiClient.post(`/folio/${selectedId}/close`, {});
      fetchFolioDetail(selectedId);
      fetchFolios();
    } catch (err: any) {
      alert(err?.message || "Failed to close folio");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Guest Folios & Billing</h1>
          <p className="text-sm text-slate-500">Manage customer billing ledgers, posted charges, and settle payments.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchFolios()} disabled={isLoadingList} className="gap-2">
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Folio List Sidebar */}
        <Card className="w-full lg:w-1/3 flex flex-col overflow-hidden border-slate-200">
          <div className="p-4 border-b border-slate-100 font-semibold bg-slate-50 text-slate-700 flex justify-between items-center">
            <span>Active Folios</span>
            <Badge variant="secondary" className="text-xs">
              {folios.length} Total
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoadingList ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                <p className="text-xs">Loading folios...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500 text-xs">
                <AlertCircle className="w-5 h-5 mx-auto mb-1" />
                {error}
              </div>
            ) : folios.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No active folios found.
              </div>
            ) : (
              folios.map((folio) => {
                const isSelected = folio._id === selectedId;
                const balance = `$${((folio.balanceMinor || 0) / 100).toFixed(2)}`;
                return (
                  <div
                    key={folio._id}
                    onClick={() => setSelectedId(folio._id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/70 shadow-sm"
                        : "hover:bg-slate-50 border-slate-100 bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm text-slate-900 truncate">
                        {folio.name || folio.number}
                      </span>
                      <Badge
                        variant={folio.status === "OPEN" ? "default" : "secondary"}
                        className={`text-[10px] ${folio.status === "OPEN" ? "bg-emerald-600 hover:bg-emerald-600" : ""}`}
                      >
                        {folio.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>Folio #{folio.number}</span>
                      <span className="font-bold text-slate-900">{balance}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Selected Folio Ledger */}
        <Card className="w-full lg:w-2/3 flex flex-col overflow-hidden border-slate-200">
          {isLoadingDetail ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm">Loading ledger items...</p>
            </div>
          ) : !folioDetail ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <p className="text-sm">Select a folio to inspect its billing ledger.</p>
            </div>
          ) : (
            <>
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4 shrink-0 bg-slate-50/60">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    {folioDetail.folio.name || `Folio #${folioDetail.folio.number}`}
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Folio ID: {folioDetail.folio.number} • Window {folioDetail.folio.window ?? 1}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsChargeOpen(true)}
                    className="text-xs gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Post Charge
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setPaymentAmount(((folioDetail.folio.balanceMinor || 0) / 100).toFixed(2));
                      setIsPaymentOpen(true);
                    }}
                    className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Process Payment
                  </Button>
                  {folioDetail.folio.status === "OPEN" && folioDetail.folio.balanceMinor === 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCloseFolio}
                      disabled={isSubmitting}
                      className="text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Close & Invoice
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-0">
                <Table>
                  <TableHeader className="bg-white sticky top-0 shadow-sm border-b">
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Code / Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {folioDetail.lines && folioDetail.lines.length > 0 ? (
                      folioDetail.lines.map((line) => {
                        const isPayment = line.type === "PAYMENT";
                        const amountStr = `$${(Math.abs(line.amountMinor) / 100).toFixed(2)}`;
                        return (
                          <TableRow key={line._id}>
                            <TableCell className="text-slate-500 text-xs whitespace-nowrap">
                              {new Date(line.postedAt || line.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={isPayment ? "default" : "outline"}
                                className={`text-[10px] ${isPayment ? "bg-emerald-100 text-emerald-800" : ""}`}
                              >
                                {line.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-slate-800 text-sm">
                              {line.description || line.code}
                            </TableCell>
                            <TableCell
                              className={`text-right font-semibold text-sm ${
                                isPayment ? "text-emerald-600" : "text-slate-900"
                              }`}
                            >
                              {isPayment ? `-${amountStr}` : amountStr}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10 text-slate-400 text-sm">
                          No ledger postings yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>

              <div className="p-4 border-t border-slate-100 bg-slate-50/80 shrink-0 flex justify-between items-center">
                <span className="text-slate-600 font-medium text-sm">Total Balance Due</span>
                <span
                  className={`text-2xl font-bold ${
                    (folioDetail.folio.balanceMinor || 0) > 0 ? "text-amber-600" : "text-emerald-600"
                  }`}
                >
                  ${((folioDetail.folio.balanceMinor || 0) / 100).toFixed(2)}
                </span>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Process Payment Modal */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProcessPayment} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="paymentAmount">Amount to Pay ($) *</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="MOBILE">Mobile Money</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="paymentRef">Reference / Transaction ID</Label>
              <Input
                id="paymentRef"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="e.g. TX-982319"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Record Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Post Charge Modal */}
      <Dialog open={isChargeOpen} onOpenChange={setIsChargeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Post Manual Charge</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCharge} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="chargeCode">Charge Category / Code *</Label>
              <select
                id="chargeCode"
                value={chargeCode}
                onChange={(e) => setChargeCode(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ROOM_SERVICE">Room Service</option>
                <option value="MINIBAR">Minibar</option>
                <option value="LAUNDRY">Laundry</option>
                <option value="SPA">Spa & Wellness</option>
                <option value="DAMAGE">Damage / Incidentals</option>
                <option value="OTHER">Other Miscellaneous</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="chargeDesc">Description</Label>
              <Input
                id="chargeDesc"
                value={chargeDesc}
                onChange={(e) => setChargeDesc(e.target.value)}
                placeholder="e.g. 2x sparkling water, laundry 4 items"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="chargeAmount">Amount ($) *</Label>
              <Input
                id="chargeAmount"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsChargeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Post Charge
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
