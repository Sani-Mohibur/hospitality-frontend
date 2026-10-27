"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AuthGuard } from "@/components/auth-guard";
import { Container } from "@/components/home/primitives";
import { BillingCycle, PackageId } from "@/lib/marketing/plans";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Store, CheckCircle2, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { AccountHeader } from "@/components/account/account-header";
import { AccountProfileBanner } from "@/components/account/account-profile-banner";
import { AccountProfileCard } from "@/components/account/account-profile-card";
import { SubscribedModulesCard } from "@/components/account/subscribed-modules-card";
import { AvailablePackagesGrid } from "@/components/account/available-packages-grid";
import { ComingSoonModules } from "@/components/account/coming-soon-modules";
import { MockCheckoutModal } from "@/components/account/mock-checkout-modal";

export default function AccountPage() {
  const { user, tenant, logout, refreshUser, isLoading } = useAuth();

  // Billing cycle toggle for plan selection
  const [cycle, setCycle] = useState<BillingCycle>("annual");

  // Mock Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<PackageId>("suite");
  const [selectedTierId, setSelectedTierId] = useState<"essentials" | "professional">("professional");

  // Retail activation state for testing
  const [isRetailLoading, setIsRetailLoading] = useState(false);
  const isRetailActive = Boolean(tenant?.subscribedModules?.includes("RETAIL"));

  const handleToggleRetail = async () => {
    setIsRetailLoading(true);
    try {
      const currentModules = tenant?.subscribedModules || ["HOSPITALITY"];
      const updatedModules = isRetailActive
        ? currentModules.filter((m) => m !== "RETAIL")
        : Array.from(new Set([...currentModules, "RETAIL"]));

      // Ensure at least one module exists
      if (updatedModules.length === 0) {
        updatedModules.push("HOSPITALITY");
      }

      const res = await apiFetch("/subscription/subscribe", {
        method: "POST",
        body: JSON.stringify({
          packageId: "suite",
          tierId: "professional",
          billingCycle: cycle === "annual" ? "YEARLY" : "MONTHLY",
          modules: updatedModules,
          planName: `${tenant?.subscription?.planName || "Workspace Plan"}${!isRetailActive ? " + Retail" : ""}`,
          mockPaymentSuccess: true,
          paymentRef: `MOCK_RETAIL_${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        await refreshUser();
        toast.success(
          isRetailActive
            ? "Retail module deactivated successfully."
            : "Retail module activated! Access it in your tenant dashboard."
        );
      } else {
        toast.error(data.message || "Failed to update Retail subscription.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while updating subscription.");
    } finally {
      setIsRetailLoading(false);
    }
  };

  if (isLoading || !user) return null;

  const isTenantUser = user.role !== "SUPER_ADMIN";
  const hasSubscribedModules = Array.isArray(tenant?.subscribedModules) && tenant.subscribedModules.length > 0;
  const isGoodStatus = tenant?.status === "ACTIVE" || tenant?.status === "TRIALING";
  const hasActiveAccess = isGoodStatus && hasSubscribedModules;

  // Open checkout modal for a package
  const openCheckoutFor = (pkgId: PackageId, tierId: "essentials" | "professional" = "professional") => {
    setSelectedPkg(pkgId);
    setSelectedTierId(tierId);
    setCheckoutModalOpen(true);
  };

  return (
    <AuthGuard allowedRoles={["TENANT_OWNER", "SUPER_ADMIN"]}>
      <div className="min-h-screen bg-ivory text-ink flex flex-col">
        {/* Top Navigation */}
        <AccountHeader onLogout={() => logout()} />

        <main className="flex-1 py-10 sm:py-14">
          <Container className="space-y-10">
            {/* Account Welcome Banner */}
            <AccountProfileBanner
              userName={user.name}
              userEmail={user.email}
              tenantName={tenant?.name}
              hasActiveAccess={hasActiveAccess}
            />

            {/* Profile & Active Module Entitlements Grid */}
            <div className="grid gap-8 lg:grid-cols-12 items-start">
              <div className="lg:col-span-4">
                <AccountProfileCard
                  user={user}
                  tenantName={tenant?.name}
                  isTenantUser={isTenantUser}
                />
              </div>

              <div className="lg:col-span-8">
                <SubscribedModulesCard
                  hasActiveAccess={hasActiveAccess}
                  tenant={tenant}
                />
              </div>
            </div>

            {/* Available Subscription Packages */}
            <AvailablePackagesGrid
              cycle={cycle}
              onCycleChange={setCycle}
              hasSubscribedModules={hasSubscribedModules}
              tenantSubscribedModules={tenant?.subscribedModules}
              onSelectPackage={openCheckoutFor}
            />

            {/* Roadmap Modules */}
            <ComingSoonModules />

            {/* Testing Only: Retail Activation Section */}
            <section className="pt-8 border-t border-ink/10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 border border-amber-300">
                  <Sparkles className="size-3 text-amber-600" />
                  Testing &amp; QA Control
                </span>
                <span className="text-xs text-stone">
                  Temporary module toggle for retail frontend validation
                </span>
              </div>

              <div className="rounded-3xl bg-white p-6 sm:p-7 border border-ink/10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-500/10 text-amber-700">
                    <Store className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-xl text-ink font-normal">
                        Retail POS &amp; Shop Module
                      </h3>
                      {isRetailActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="size-3.5" />
                          Active &amp; Entitled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-stone/10 px-2.5 py-0.5 text-xs font-semibold text-stone">
                          Not Activated
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-stone max-w-xl">
                      Activate the Retail module for this tenant to enable the Retail sidebar section, product catalog, inventory tracking, suppliers &amp; POs, stock operations, and the full POS terminal.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {isRetailActive ? (
                    <>
                      <Link
                        href="/tenant/retail/dashboard"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-ink text-white text-xs font-semibold hover:bg-ink/90 transition-colors shadow-sm w-full md:w-auto"
                      >
                        <span>Open Retail Dashboard</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                      <button
                        type="button"
                        disabled={isRetailLoading}
                        onClick={handleToggleRetail}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {isRetailLoading && <Loader2 className="size-3.5 animate-spin" />}
                        Deactivate
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={isRetailLoading}
                      onClick={handleToggleRetail}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50 w-full md:w-auto cursor-pointer"
                    >
                      {isRetailLoading ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-3.5" />
                      )}
                      <span>Activate Retail Module</span>
                    </button>
                  )}
                </div>
              </div>
            </section>
          </Container>
        </main>

        {/* Development Mock Checkout Modal */}
        <MockCheckoutModal
          isOpen={checkoutModalOpen}
          onClose={() => setCheckoutModalOpen(false)}
          selectedPkg={selectedPkg}
          selectedTierId={selectedTierId}
          cycle={cycle}
          onPaymentSuccess={async () => {
            await refreshUser();
          }}
        />
      </div>
    </AuthGuard>
  );
}
