"use client";

import {
  PACKAGES,
  PACKAGE_ORDER,
  TIERS,
  BillingCycle,
  priceFor,
  PackageId,
  suiteSavings,
  TRIAL_DAYS,
} from "@/lib/marketing/plans";
import { Eyebrow, Accent, ctaClass } from "@/components/home/primitives";
import { Building2, UtensilsCrossed, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvailablePackagesGridProps {
  cycle: BillingCycle;
  onCycleChange: (cycle: BillingCycle) => void;
  hasSubscribedModules: boolean;
  tenantSubscribedModules?: string[];
  onSelectPackage: (pkgId: PackageId, tierId: "essentials" | "professional") => void;
}

export function AvailablePackagesGrid({
  cycle,
  onCycleChange,
  hasSubscribedModules,
  tenantSubscribedModules,
  onSelectPackage,
}: AvailablePackagesGridProps) {
  return (
    <section id="available-plans" className="scroll-mt-24 pt-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <Eyebrow tone="dark">Modular Subscriptions</Eyebrow>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl text-ink font-normal">
            Select a platform <Accent>package</Accent>
          </h2>
          <p className="mt-1 text-sm text-stone max-w-xl">
            Choose the operational footprint for your property. Upgrade, downgrade, or cancel at any time.
          </p>
        </div>

        {/* Billing Cadence Toggle */}
        <div className="inline-flex items-center rounded-full bg-white p-1.5 ring-1 ring-ink/10 shadow-sm self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onCycleChange("monthly")}
            className={cn(
              "cursor-pointer rounded-full px-5 py-2 text-xs font-semibold transition-all duration-300",
              cycle === "monthly"
                ? "bg-ink text-ivory shadow-sm"
                : "text-stone hover:text-ink"
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => onCycleChange("annual")}
            className={cn(
              "cursor-pointer rounded-full px-5 py-2 text-xs font-semibold transition-all duration-300 flex items-center gap-1.5",
              cycle === "annual"
                ? "bg-ink text-ivory shadow-sm"
                : "text-stone hover:text-ink"
            )}
          >
            <span>Annual</span>
            <span className="rounded-full bg-champagne/20 text-champagne-dark px-1.5 py-0.2 text-[10px] font-bold">
              20% OFF
            </span>
          </button>
        </div>
      </div>

      {/* Package Cards Grid */}
      <div className="grid gap-6 lg:grid-cols-3 items-stretch">
        {PACKAGE_ORDER.map((pkgId) => {
          const pkg = PACKAGES[pkgId];
          const tier = TIERS[pkgId].find((t) => t.id === "professional") || TIERS[pkgId][1];
          const price = tier.monthly !== null ? priceFor(tier.monthly, cycle) : null;
          const isSuite = pkgId === "suite";
          const savings = isSuite ? suiteSavings("professional") : null;

          // Check if current tenant already has this package's modules
          const isCurrent =
            hasSubscribedModules &&
            pkg.modules.every((m) => tenantSubscribedModules?.includes(m as any));

          return (
            <div
              key={pkgId}
              className={cn(
                "relative flex flex-col justify-between rounded-3xl bg-white p-8 transition-all duration-300 shadow-sm",
                isSuite
                  ? "border-2 border-champagne shadow-[0_16px_40px_-12px_rgba(184,149,90,0.22)]"
                  : "border border-ink/10 hover:border-champagne/40"
              )}
            >
              {isSuite && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-champagne px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink shadow-md border border-champagne-light">
                    <Sparkles className="size-3" /> Most Popular · Save ~{savings}%
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-champagne/15 text-champagne-dark">
                    {pkgId === "hotel" ? (
                      <Building2 className="size-5" />
                    ) : pkgId === "restaurant" ? (
                      <UtensilsCrossed className="size-5" />
                    ) : (
                      <Sparkles className="size-5" />
                    )}
                  </span>
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-600/20">
                      <Check className="size-3 text-emerald-600" /> Active Plan
                    </span>
                  )}
                </div>

                <h3 className="mt-4 font-display text-2xl text-ink font-normal">{pkg.name}</h3>
                <p className="mt-2 text-xs text-stone min-h-[36px] leading-relaxed">
                  {pkg.tagline}
                </p>

                <div className="my-6 rounded-2xl bg-ivory/60 p-4 border border-ink/5">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-3xl sm:text-4xl font-medium text-ink">
                      ${price}
                    </span>
                    <span className="text-xs text-stone">/month</span>
                  </div>
                  <p className="text-[11px] text-champagne-dark font-medium mt-1">
                    {cycle === "annual" ? "Billed annually (20% savings)" : "Billed monthly"}
                  </p>
                  <p className="text-[10px] text-stone/75 mt-0.5">
                    {TRIAL_DAYS}-day free trial included
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink mb-3">
                    Included Capabilities
                  </p>
                  <ul className="space-y-2.5">
                    {tier.features.slice(0, 5).map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-stone">
                        <Check className="size-3.5 text-champagne-dark shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-ink/5">
                <button
                  type="button"
                  onClick={() => onSelectPackage(pkgId, "professional")}
                  disabled={isCurrent}
                  className={cn(
                    ctaClass(isSuite ? "gold" : "outline-dark", "md"),
                    "w-full justify-center cursor-pointer",
                    isCurrent && "opacity-50 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  {isCurrent ? "Currently Subscribed" : `Subscribe to ${pkg.shortName}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
