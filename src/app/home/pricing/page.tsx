"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Container, SectionHeading, Accent, ctaClass } from "@/components/home/primitives";
import { Reveal } from "@/components/home/reveal";
import { PACKAGES, PACKAGE_ORDER, TIERS, BillingCycle, priceFor, checkoutHref, PackageId, isPackageId } from "@/lib/marketing/plans";
import { Check, Sparkles, Server, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

interface BackendModule {
  _id?: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  isAddOn: boolean;
  pricingModel: string;
  unitPriceMinor: number;
  minimumMinor: number;
  bundleUnitPriceMinor?: number;
  bundleMinimumMinor?: number;
  requires?: string[];
  activeSubscribers?: number;
}

function PricingContent() {
  const searchParams = useSearchParams();
  const pkgParam = searchParams.get("package");
  const initialPkg: PackageId = isPackageId(pkgParam) ? pkgParam : "suite";

  const [cycle, setCycle] = useState<BillingCycle>("annual");
  const [selectedPkg, setSelectedPkg] = useState<PackageId>(initialPkg);
  const [backendModules, setBackendModules] = useState<BackendModule[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(true);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await apiFetch("/platform-module/public", { requireAuth: false });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data)) {
            setBackendModules(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load platform module catalog", err);
      } finally {
        setIsLoadingModules(false);
      }
    }
    fetchCatalog();
  }, []);

  return (
    <div className="pt-32 pb-24 lg:pt-40 lg:pb-32 bg-mk-ivory-50">
      <Container>
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Pricing & Modules"
            title={<>Transparent, scalable <Accent>pricing</Accent></>}
            description="Start with a 14-day free trial on any package. Pay only for what your property needs with modular pricing."
          />
        </Reveal>

        <Reveal delay={100} className="mt-12 flex justify-center">
          <div className="inline-flex rounded-full bg-white p-1 shadow-sm ring-1 ring-mk-ink/5">
            <button
              onClick={() => setCycle("monthly")}
              className={cn(
                "rounded-full px-6 py-2 text-sm font-medium transition-all duration-300",
                cycle === "monthly" ? "bg-mk-ink text-mk-ivory shadow-md" : "text-mk-stone hover:text-mk-ink"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setCycle("annual")}
              className={cn(
                "relative rounded-full px-6 py-2 text-sm font-medium transition-all duration-300",
                cycle === "annual" ? "bg-mk-ink text-mk-ivory shadow-md" : "text-mk-stone hover:text-mk-ink"
              )}
            >
              Annually <span className="ml-1 text-[10px] text-mk-champagne-dark font-semibold">20% OFF</span>
            </button>
          </div>
        </Reveal>

        <Reveal delay={200} className="mt-8 flex justify-center">
          <div className="flex flex-wrap gap-2 rounded-full bg-white/50 p-1 ring-1 ring-mk-ink/5 backdrop-blur-md">
            {PACKAGE_ORDER.map((pkgId) => (
              <button
                key={pkgId}
                onClick={() => setSelectedPkg(pkgId)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                  selectedPkg === pkgId
                    ? "bg-white text-mk-ink shadow-sm ring-1 ring-mk-ink/5 font-semibold"
                    : "text-mk-stone hover:text-mk-ink"
                )}
              >
                {PACKAGES[pkgId].shortName}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Tier Cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {TIERS[selectedPkg].map((tier, i) => {
            const price = tier.monthly !== null ? priceFor(tier.monthly, cycle) : null;
            return (
              <Reveal key={tier.id} delay={300 + i * 100}>
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-3xl bg-white p-8 shadow-xl ring-1 transition-all duration-300",
                    tier.highlight ? "ring-mk-champagne-light shadow-mk-champagne/10 md:-translate-y-4" : "ring-mk-ink/5 shadow-mk-ink/5"
                  )}
                >
                  {tier.highlight && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <span className="rounded-full bg-mk-champagne px-4 py-1 text-xs font-bold uppercase tracking-wider text-mk-ink shadow-sm">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <h3 className="font-display text-2xl text-mk-ink">{tier.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-mk-stone min-h-[60px]">
                    {tier.description}
                  </p>
                  
                  <div className="my-8">
                    {price !== null ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-semibold tracking-tight text-mk-ink">${price}</span>
                        <span className="text-sm font-medium text-mk-stone">/mo</span>
                      </div>
                    ) : (
                      <div className="text-4xl font-semibold tracking-tight text-mk-ink">Custom</div>
                    )}
                    <p className="text-xs text-mk-stone/70 mt-1">14-day free trial included</p>
                  </div>
                  
                  <Link
                    href={checkoutHref(selectedPkg, tier.id, cycle)}
                    className={cn(
                      ctaClass(tier.highlight ? "gold" : "outline-dark"),
                      "w-full justify-center"
                    )}
                  >
                    {price !== null ? "Start 14-Day Free Trial" : "Contact Sales"}
                  </Link>
                  
                  <div className="mt-10 flex-1">
                    <p className="text-sm font-semibold tracking-wide text-mk-ink uppercase">What's included</p>
                    <ul className="mt-6 space-y-4">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-mk-stone">
                          <Check className="mt-0.5 size-4 shrink-0 text-mk-champagne-dark" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Live Backend Module Catalog & Usage Rates */}
        {backendModules.length > 0 && (
          <Reveal delay={600} className="mt-20">
            <div className="rounded-3xl bg-white p-8 sm:p-10 shadow-lg ring-1 ring-mk-ink/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-mk-ink/5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 mb-2">
                    <ShieldCheck className="size-3.5" /> Live Backend Pricing Engine
                  </div>
                  <h3 className="font-display text-2xl text-mk-ink">Platform Modules & Usage Rates</h3>
                  <p className="text-sm text-mk-stone mt-1">
                    Transparent rates powered directly by our live billing engine.
                  </p>
                </div>
                <div className="text-xs text-mk-stone font-mono bg-mk-ivory-50 px-3 py-1.5 rounded-lg border border-mk-ink/5 self-start">
                  API: /platform-module/public
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {backendModules.map((mod) => {
                  const unitPriceUsd = (mod.unitPriceMinor / 100).toFixed(2);
                  const minPriceUsd = (mod.minimumMinor / 100).toFixed(2);
                  const bundlePriceUsd = mod.bundleUnitPriceMinor ? (mod.bundleUnitPriceMinor / 100).toFixed(2) : null;
                  const formatModel = mod.pricingModel.replace("PER_", "").toLowerCase();

                  return (
                    <div
                      key={mod.code}
                      className="flex flex-col justify-between rounded-2xl border border-mk-ink/10 p-5 bg-mk-ivory-50/40 hover:bg-white hover:border-mk-champagne transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-mk-ink text-base">{mod.name}</span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-mk-ink/5 text-mk-stone uppercase">
                            {mod.code}
                          </span>
                        </div>
                        {mod.description && (
                          <p className="text-xs text-mk-stone leading-relaxed mb-4">
                            {mod.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-mk-ink/5 text-xs text-mk-stone flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span>Base Rate:</span>
                          <span className="font-semibold text-mk-ink">${unitPriceUsd} / {formatModel}</span>
                        </div>
                        {mod.minimumMinor > 0 && (
                          <div className="flex justify-between items-center text-mk-stone/80">
                            <span>Plan Minimum:</span>
                            <span>${minPriceUsd}/mo</span>
                          </div>
                        )}
                        {bundlePriceUsd && (
                          <div className="flex justify-between items-center text-emerald-700 font-medium">
                            <span>Suite Bundle:</span>
                            <span>${bundlePriceUsd} / outlet</span>
                          </div>
                        )}
                        {mod.isAddOn && (
                          <span className="mt-1 inline-flex self-start rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-600/10">
                            Add-on Module
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        )}
      </Container>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="pt-40 text-center text-mk-stone min-h-screen">Loading pricing plans...</div>}>
      <PricingContent />
    </Suspense>
  );
}
