"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AuthGuard } from "@/components/auth-guard";
import { Container } from "@/components/home/primitives";
import { BillingCycle, PackageId } from "@/lib/marketing/plans";
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
    <AuthGuard>
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
