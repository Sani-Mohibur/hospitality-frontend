"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { RoleGuard } from "@/components/auth/role-guard";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CreditCard, Download, Loader2, AlertCircle, RefreshCw, Calendar } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface TenantSubscription {
  _id: string;
  status: "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELLED";
  billingCycle: "MONTHLY" | "YEARLY";
  priceMinor: number;
  features?: string[];
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  trialEndsAt?: string;
  usage?: {
    rooms?: number;
    outlets?: number;
    locations?: number;
  };
}

interface PlatformInvoice {
  _id: string;
  number?: string;
  amountMinor: number;
  status: "PAID" | "OPEN" | "VOID";
  dueDate?: string;
  issuedAt?: string;
  createdAt: string;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<TenantSubscription | null>(null);
  const [invoices, setInvoices] = useState<PlatformInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingCycle, setIsUpdatingCycle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [subRes, invRes] = await Promise.all([
        apiClient.get<TenantSubscription>("/subscription/my-subscription"),
        apiClient.get<PlatformInvoice[]>("/subscription/my-invoices"),
      ]);
      setSubscription(subRes.data);
      setInvoices(Array.isArray(invRes.data) ? invRes.data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load subscription details.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  const handleToggleCycle = async () => {
    if (!subscription) return;
    const nextCycle = subscription.billingCycle === "MONTHLY" ? "YEARLY" : "MONTHLY";
    setIsUpdatingCycle(true);
    try {
      await apiClient.patch("/subscription/my-subscription/billing-cycle", {
        billingCycle: nextCycle,
      });
      fetchSubscriptionData();
    } catch (err: any) {
      alert(err?.message || "Failed to switch billing cycle");
    } finally {
      setIsUpdatingCycle(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-emerald-600 hover:bg-emerald-600">Active</Badge>;
      case "TRIALING":
        return <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">Trial Period</Badge>;
      case "PAST_DUE":
        return <Badge variant="destructive">Past Due</Badge>;
      default:
        return <Badge variant="secondary">{status || "Inactive"}</Badge>;
    }
  };

  return (
    <RoleGuard allowedRoles={["TENANT_OWNER"]}>
      <div className="space-y-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Subscription & Billing</h1>
            <p className="text-sm text-slate-500">Manage your workspace tier, active modules, and invoices.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchSubscriptionData()} disabled={isLoading} className="gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-600 flex items-center gap-3 border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm">Loading subscription details...</p>
          </div>
        ) : !subscription ? (
          <Card className="p-8 text-center text-slate-500">
            <p className="font-semibold text-slate-700">No active subscription found</p>
            <p className="text-sm text-slate-400 mt-1">Contact your organization administrator.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Plan Card */}
            <Card className="border-blue-200 shadow-sm flex flex-col">
              <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-blue-900 text-lg">Active Plan</CardTitle>
                  {getStatusBadge(subscription.status)}
                </div>
                <CardDescription className="text-xs">
                  Billing cycle: {subscription.billingCycle}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6 space-y-4 flex-1">
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">
                    ${((subscription.priceMinor || 0) / 100).toFixed(2)}
                  </span>
                  <span className="text-slate-500 mb-1 text-sm">
                    / {subscription.billingCycle?.toLowerCase() === "yearly" ? "year" : "month"}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                  <p className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
                    Enabled Modules
                  </p>
                  {subscription.features && subscription.features.length > 0 ? (
                    subscription.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{feat} Module</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Standard Hotel & Dining Outlets</span>
                    </div>
                  )}
                </div>

                {subscription.currentPeriodEnd && (
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Renews on: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-2 border-t border-slate-100 bg-slate-50/50">
                <Button
                  variant="outline"
                  onClick={handleToggleCycle}
                  disabled={isUpdatingCycle}
                  className="w-full text-xs"
                >
                  {isUpdatingCycle ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                  ) : null}
                  Switch to {subscription.billingCycle === "MONTHLY" ? "Yearly" : "Monthly"} Billing
                </Button>
              </CardFooter>
            </Card>

            {/* Invoices and Payment Card */}
            <div className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base text-slate-900">Payment & Billing Gateway</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50/70">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-md border border-slate-200 shadow-xs">
                        <CreditCard className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-slate-800">Direct Tenant Settle / Stripe</p>
                        <p className="text-[11px] text-slate-500">Managed via payment integration</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base text-slate-900 flex justify-between items-center">
                    <span>Recent Invoices</span>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {invoices.length} Invoices
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {invoices.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No billing invoices generated yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invoices.slice(0, 5).map((inv) => (
                        <div key={inv._id} className="flex justify-between items-center text-xs">
                          <div>
                            <span className="font-medium text-slate-800">
                              {inv.number ? `Invoice #${inv.number}` : "Platform Invoice"}
                            </span>
                            <p className="text-[11px] text-slate-400">
                              {new Date(inv.issuedAt || inv.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900">
                              ${((inv.amountMinor || 0) / 100).toFixed(2)}
                            </span>
                            <Badge
                              variant={inv.status === "PAID" ? "outline" : "default"}
                              className={`text-[10px] ${
                                inv.status === "PAID"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : ""
                              }`}
                            >
                              {inv.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
