"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Container, SectionHeading, Eyebrow, Accent, ctaClass } from "@/components/home/primitives";
import { Reveal } from "@/components/home/reveal";
import {
  PACKAGES,
  PACKAGE_ORDER,
  TIERS,
  BillingCycle,
  priceFor,
  checkoutHref,
  PackageId,
  isPackageId,
  COMPARISON,
  suiteSavings,
  TRIAL_DAYS,
  SALES_EMAIL,
} from "@/lib/marketing/plans";
import {
  Check,
  Sparkles,
  ShieldCheck,
  Building2,
  UtensilsCrossed,
  ArrowRight,
  Compass,
  Boxes,
  Bot,
  Plus,
  Lock,
  Zap,
  HelpCircle,
  Clock,
  Layers,
} from "lucide-react";
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

const PRICING_FAQS = [
  {
    q: `How does the ${TRIAL_DAYS}-day free trial work?`,
    a: `You receive full, unrestricted access to all features in your selected tier for ${TRIAL_DAYS} days. No credit card is required to evaluate the software. At the end of the trial, you can choose to activate your subscription or safely export your data.`,
  },
  {
    q: "Can I subscribe to Hotel or Restaurant only, and upgrade later?",
    a: "Absolutely. Hotel Management and Restaurant POS are modular and sold independently. When you're ready to unite front desk, reservations, and dining operations, upgrade to the Suite with one click. We automatically prorate the difference.",
  },
  {
    q: "What advantages come with annual billing?",
    a: "Annual billing includes a 20% discount compared to monthly billing across all packages, priority onboarding guidance from a hospitality specialist, and a guaranteed price lock.",
  },
  {
    q: "How does the unified Suite charge-to-room feature work?",
    a: "With the Hotel + Restaurant Suite, POS terminals, bars, and room service stations search the live guest folio database in real time. Items post immediately to the guest folio with signature verification, eliminating manual end-of-day reconciliation.",
  },
  {
    q: "Are there any setup fees, contracts, or hardware lock-ins?",
    a: "None. Hospitality OS runs cleanly in any modern web browser on iPads, tablets, Mac, or PC. You can connect standard receipt printers, card terminals, and cash drawers without proprietary hardware lock-in.",
  },
  {
    q: "Can I manage multiple properties or restaurant outlets?",
    a: "Yes. Essentials supports single properties, Professional supports up to 3 properties/outlets with consolidated reporting, and Enterprise offers unlimited scale with group-level analytics.",
  },
];

function getModuleIcon(code: string) {
  switch (code) {
    case "HOSPITALITY":
      return Building2;
    case "RESTAURANT":
      return UtensilsCrossed;
    case "DISTRIBUTION":
      return Compass;
    case "INVENTORY":
      return Boxes;
    case "AI_ASSISTANT":
      return Bot;
    default:
      return Layers;
  }
}

function PricingContent() {
  const searchParams = useSearchParams();
  const pkgParam = searchParams.get("package");
  const initialPkg: PackageId = isPackageId(pkgParam) ? pkgParam : "suite";

  const [cycle, setCycle] = useState<BillingCycle>("annual");
  const [selectedPkg, setSelectedPkg] = useState<PackageId>(initialPkg);
  const [backendModules, setBackendModules] = useState<BackendModule[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(true);

  // Sync state if URL search param changes
  useEffect(() => {
    if (isPackageId(pkgParam)) {
      setSelectedPkg(pkgParam);
    }
  }, [pkgParam]);

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

  const packageInfo = PACKAGES[selectedPkg];
  const proSavings = suiteSavings("professional");

  return (
    <div className="flex flex-col min-h-screen bg-ivory">
      {/* =====================================================================
          Hero Section (Dark luxury aesthetic matching site header expectations)
          ===================================================================== */}
      <section className="mk-grain relative overflow-hidden bg-espresso text-ivory pt-36 pb-24 lg:pt-44 lg:pb-32">
        {/* Ambient atmospheric glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] size-[42rem] rounded-full bg-champagne/15 blur-[140px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[-20%] left-[-10%] size-[36rem] rounded-full bg-forest/35 blur-[140px]"
        />

        <Container className="relative">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <Eyebrow tone="light" className="justify-center">
                Transparent, Scalable Investment
              </Eyebrow>
              <h1 className="mt-5 font-display text-4xl leading-[1.08] font-normal tracking-tight text-balance sm:text-5xl lg:text-6xl text-ivory">
                Predictable pricing for properties of <Accent>every scale</Accent>.
              </h1>
              <p className="mt-6 text-base sm:text-lg leading-relaxed text-pretty text-ivory/70">
                Start with a {TRIAL_DAYS}-day free trial on any package. Pay only for what your
                property needs with modular expansion and unified guest folios.
              </p>
            </div>
          </Reveal>

          {/* Trust Guarantees */}
          <Reveal delay={100} className="mt-8 flex justify-center">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-ivory/60">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-champagne" /> {TRIAL_DAYS}-Day Free Evaluation
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-champagne" /> No Setup Fees or Hidden Costs
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-champagne" /> Cancel or Upgrade Anytime
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-champagne" /> 99.9% Uptime SLA
              </li>
            </ul>
          </Reveal>

          {/* Billing Cadence Toggle */}
          <Reveal delay={150} className="mt-12 flex justify-center">
            <div className="inline-flex items-center rounded-full bg-espresso/80 p-1.5 ring-1 ring-ivory/15 backdrop-blur-md shadow-2xl">
              <button
                type="button"
                onClick={() => setCycle("monthly")}
                className={cn(
                  "cursor-pointer rounded-full px-5 sm:px-7 py-2.5 text-xs sm:text-sm font-medium tracking-wide transition-all duration-300",
                  cycle === "monthly"
                    ? "bg-champagne text-ink font-semibold shadow-md"
                    : "text-ivory/70 hover:text-ivory"
                )}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setCycle("annual")}
                className={cn(
                  "cursor-pointer relative rounded-full px-5 sm:px-7 py-2.5 text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 flex items-center gap-2",
                  cycle === "annual"
                    ? "bg-champagne text-ink font-semibold shadow-md"
                    : "text-ivory/70 hover:text-ivory"
                )}
              >
                <span>Annual Billing</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                    cycle === "annual"
                      ? "bg-ink/15 text-ink"
                      : "bg-champagne/20 text-champagne-light ring-1 ring-champagne/40"
                  )}
                >
                  Save 20%
                </span>
              </button>
            </div>
          </Reveal>

          {/* Package Selector Tabs */}
          <Reveal delay={200} className="mt-8 flex flex-col items-center">
            <div className="inline-flex max-w-full flex-wrap justify-center gap-1.5 rounded-full bg-ivory/10 p-1.5 ring-1 ring-ivory/15 backdrop-blur-md">
              {PACKAGE_ORDER.map((pkgId) => {
                const pkg = PACKAGES[pkgId];
                const isSelected = selectedPkg === pkgId;
                const isSuite = pkgId === "suite";

                return (
                  <button
                    key={pkgId}
                    type="button"
                    onClick={() => setSelectedPkg(pkgId)}
                    className={cn(
                      "cursor-pointer flex items-center gap-2 rounded-full px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium transition-all duration-300",
                      isSelected
                        ? "bg-ivory text-ink font-semibold shadow-md"
                        : "text-ivory/75 hover:bg-ivory/5 hover:text-ivory"
                    )}
                  >
                    {pkgId === "hotel" && <Building2 className="size-3.5" />}
                    {pkgId === "restaurant" && <UtensilsCrossed className="size-3.5" />}
                    {pkgId === "suite" && <Sparkles className="size-3.5 text-champagne" />}
                    <span>{pkg.shortName}</span>
                    {isSuite && proSavings && (
                      <span
                        className={cn(
                          "hidden sm:inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          isSelected
                            ? "bg-champagne/20 text-champagne-dark"
                            : "bg-champagne/20 text-champagne-light"
                        )}
                      >
                        Bundle Save ~{proSavings}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mt-3.5 text-center text-xs text-ivory/60 max-w-md">
              {packageInfo.tagline}
            </p>
          </Reveal>
        </Container>
      </section>

      {/* =====================================================================
          Pricing Cards Section (Warm Ivory / Linen Canvas)
          ===================================================================== */}
      <section className="relative bg-ivory py-16 sm:py-24">
        <Container>
          {/* Suite Savings Notification Banner */}
          {selectedPkg === "suite" && (
            <Reveal className="mb-10">
              <div className="mx-auto max-w-4xl rounded-2xl bg-linen border border-champagne/30 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 text-left">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-champagne text-ink shadow-sm">
                    <Sparkles className="size-5" />
                  </span>
                  <div>
                    <h4 className="font-display text-base sm:text-lg text-ink font-medium">
                      Unified Hotel + Restaurant Advantage
                    </h4>
                    <p className="text-xs sm:text-sm text-stone mt-0.5">
                      Hotels with dining rooms save an average of $840/year bundling both platforms,
                      enabling instant charge-to-room from any POS.
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-champagne/15 px-3 py-1 text-xs font-semibold text-champagne-dark ring-1 ring-champagne/30">
                  Save ~{proSavings ?? 20}% Bundled
                </span>
              </div>
            </Reveal>
          )}

          {/* Pricing Cards Grid */}
          <div className="grid gap-8 lg:grid-cols-3 items-stretch">
            {TIERS[selectedPkg].map((tier, i) => {
              const price = tier.monthly !== null ? priceFor(tier.monthly, cycle) : null;
              const isHighlight = tier.highlight;

              return (
                <Reveal key={tier.id} delay={250 + i * 100} className="flex">
                  <div
                    className={cn(
                      "relative flex w-full flex-col justify-between rounded-3xl bg-white p-8 sm:p-9 transition-all duration-300",
                      isHighlight
                        ? "border-2 border-champagne shadow-[0_20px_50px_-12px_rgba(184,149,90,0.25)] lg:-translate-y-4 hover:shadow-[0_24px_60px_-12px_rgba(184,149,90,0.32)]"
                        : "border border-ink/10 shadow-[0_4px_24px_-4px_rgba(20,17,14,0.06)] hover:border-champagne/50 hover:shadow-xl"
                    )}
                  >
                    {/* Floating Luxury "Most Popular" Badge */}
                    {isHighlight && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-champagne px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-ink shadow-md border border-champagne-light">
                          <Sparkles className="size-3" /> Most Popular
                        </span>
                      </div>
                    )}

                    <div>
                      {/* Tier Name & Description */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-2xl sm:text-3xl font-normal text-ink">
                          {tier.name}
                        </h3>
                        {isHighlight && (
                          <span className="text-[11px] font-semibold text-champagne-dark uppercase tracking-wider bg-champagne/10 px-2.5 py-0.5 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-stone min-h-[48px]">
                        {tier.description}
                      </p>

                      {/* Pricing Display */}
                      <div className="my-8 rounded-2xl bg-ivory/60 p-5 border border-ink/5">
                        {price !== null ? (
                          <>
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-ink">
                                ${price}
                              </span>
                              <span className="text-sm font-medium text-stone">/month</span>
                            </div>
                            <div className="mt-2 space-y-0.5">
                              {cycle === "annual" ? (
                                <p className="text-xs font-semibold text-champagne-dark">
                                  Billed annually · Save ${(tier.monthly! - price) * 12}/year
                                </p>
                              ) : (
                                <p className="text-xs text-stone">Billed monthly</p>
                              )}
                              <p className="text-xs text-stone/75">
                                Includes {TRIAL_DAYS}-day free evaluation
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-ink">
                              Custom
                            </div>
                            <div className="mt-2 space-y-0.5">
                              <p className="text-xs font-medium text-ink">
                                Tailored portfolio licensing & SLA
                              </p>
                              <p className="text-xs text-stone/75">
                                Dedicated migration specialist included
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Call-to-Action Link */}
                      <Link
                        id={`pricing-card-cta-${tier.id}`}
                        href={checkoutHref(selectedPkg, tier.id, cycle)}
                        className={cn(
                          ctaClass(isHighlight ? "gold" : "outline-dark", "lg"),
                          "w-full justify-center text-center",
                          isHighlight && "shadow-lg shadow-champagne/20"
                        )}
                      >
                        {price !== null ? (
                          <span className="inline-flex items-center gap-2">
                            Start {TRIAL_DAYS}-Day Free Trial <ArrowRight className="size-4" />
                          </span>
                        ) : (
                          "Contact Sales & Architecture"
                        )}
                      </Link>

                      <div className="h-px w-full bg-ink/10 my-8" />

                      {/* What's Included */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-ink mb-4">
                          What's included in {tier.name}
                        </p>
                        <ul className="space-y-3.5">
                          {tier.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-stone leading-relaxed">
                              <span
                                className={cn(
                                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-xs",
                                  isHighlight
                                    ? "bg-champagne/20 text-champagne-dark"
                                    : "bg-ink/5 text-ink"
                                )}
                              >
                                <Check className="size-3 stroke-[2.5]" />
                              </span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Card Footer Footnote */}
                    <div className="mt-8 pt-4 border-t border-ink/5 text-center">
                      <span className="text-[11px] text-stone/70">
                        {price !== null
                          ? "No credit card needed to evaluate · Instant setup"
                          : "Custom SLA, SSO & API integrations available"}
                      </span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* =====================================================================
          Feature Comparison Matrix Section (Anchored at #compare for Footer)
          ===================================================================== */}
      <section id="compare" className="scroll-mt-24 bg-linen py-20 lg:py-28 border-t border-ink/5">
        <Container>
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Detailed Breakdown"
              title={<>Everything included, <Accent>side by side</Accent></>}
              description="Explore detailed capabilities across Hotel Management, Restaurant POS, and the Unified Suite at the Professional tier."
            />
          </Reveal>

          <Reveal delay={200} className="mt-14">
            <div className="overflow-hidden rounded-3xl bg-white shadow-md border border-ink/10">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-ink/10 bg-ivory/50">
                      <th className="py-5 px-6 font-display text-base font-semibold text-ink w-2/5">
                        Platform Capabilities
                      </th>
                      {PACKAGE_ORDER.map((pkgId) => {
                        const isSuite = pkgId === "suite";
                        return (
                          <th
                            key={pkgId}
                            className={cn(
                              "py-5 px-4 font-display text-base font-semibold text-center w-1/5",
                              isSuite ? "bg-champagne/10 text-ink" : "text-ink"
                            )}
                          >
                            <span className="block">{PACKAGES[pkgId].shortName}</span>
                            <span className="block text-[11px] font-sans font-normal text-stone mt-0.5">
                              {isSuite ? "Unified Platforms" : "Specialized"}
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5 text-sm">
                    {COMPARISON.map((group) => (
                      <tr key={group.title} className="contents">
                        <tr className="bg-linen/40">
                          <td
                            colSpan={4}
                            className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-stone"
                          >
                            {group.title}
                          </td>
                        </tr>
                        {group.rows.map((row, rowIdx) => (
                          <tr
                            key={rowIdx}
                            className="hover:bg-ivory/40 transition-colors"
                          >
                            <td className="py-4 px-6 text-ink font-medium">
                              {row.label}
                            </td>
                            {PACKAGE_ORDER.map((pkgId) => {
                              const val = row.values[pkgId];
                              const isSuite = pkgId === "suite";

                              return (
                                <td
                                  key={pkgId}
                                  className={cn(
                                    "py-4 px-4 text-center",
                                    isSuite && "bg-champagne/5"
                                  )}
                                >
                                  {typeof val === "boolean" ? (
                                    val ? (
                                      <span className="inline-grid size-6 place-items-center rounded-full bg-champagne/20 text-champagne-dark mx-auto">
                                        <Check className="size-3.5 stroke-[2.5]" />
                                      </span>
                                    ) : (
                                      <span className="font-mono text-stone/40">—</span>
                                    )
                                  ) : (
                                    <span className="inline-block rounded-full bg-sand/30 px-3 py-0.5 text-xs font-semibold text-ink">
                                      {val}
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Action Strip */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-ivory/50 border-t border-ink/10">
                <p className="text-xs text-stone">
                  Need custom module configurations or specialized integrations?
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href={`mailto:${SALES_EMAIL}`}
                    className={cn(ctaClass("outline-dark", "md"))}
                  >
                    Custom Enterprise Quote
                  </a>
                  <Link
                    href={checkoutHref(selectedPkg, "professional", cycle)}
                    className={cn(ctaClass("gold", "md"))}
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* =====================================================================
          Live Backend Platform Modules & Usage Rates Engine
          ===================================================================== */}
      <section className="bg-ivory py-20 lg:py-28 border-t border-ink/5">
        <Container>
          <Reveal>
            <div className="rounded-3xl bg-white p-8 sm:p-12 shadow-md border border-ink/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-ink/10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20 mb-3">
                    <span className="size-2 rounded-full bg-emerald-600 animate-pulse-dot" />
                    <span>Live Backend Pricing Engine</span>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl text-ink">
                    Modular Extensions &amp; Usage Rates
                  </h3>
                  <p className="text-sm text-stone mt-1.5 max-w-xl">
                    Expand capabilities on demand. Rates are calculated in real time by our core
                    billing engine, ensuring complete transparency with zero hidden fees.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone font-mono bg-ivory px-3.5 py-2 rounded-xl border border-ink/10 self-start">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>Real-Time Catalog Active</span>
                </div>
              </div>

              {isLoadingModules ? (
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-48 rounded-2xl border border-ink/10 bg-ivory/50 animate-pulse p-6"
                    />
                  ))}
                </div>
              ) : backendModules.length > 0 ? (
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {backendModules.map((mod) => {
                    const unitPriceUsd = (mod.unitPriceMinor / 100).toFixed(2);
                    const minPriceUsd = (mod.minimumMinor / 100).toFixed(2);
                    const bundlePriceUsd = mod.bundleUnitPriceMinor
                      ? (mod.bundleUnitPriceMinor / 100).toFixed(2)
                      : null;
                    const formatModel = mod.pricingModel.replace("PER_", "").toLowerCase();
                    const IconComponent = getModuleIcon(mod.code);

                    return (
                      <div
                        key={mod.code}
                        className="flex flex-col justify-between rounded-2xl border border-ink/10 p-6 bg-ivory/40 hover:bg-white hover:border-champagne hover:shadow-lg transition-all duration-300"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="grid size-9 place-items-center rounded-xl bg-champagne/15 text-champagne-dark">
                              <IconComponent className="size-4" />
                            </span>
                            <span className="font-mono text-[10px] px-2.5 py-1 rounded-md bg-ink/5 text-stone uppercase tracking-wide">
                              {mod.code}
                            </span>
                          </div>
                          <h4 className="font-semibold text-ink text-base">
                            {mod.name}
                          </h4>
                          {mod.description && (
                            <p className="text-xs text-stone leading-relaxed mt-2 mb-4">
                              {mod.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-4 border-t border-ink/5 text-xs text-stone flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span>Base Rate:</span>
                            <span className="font-semibold text-ink">
                              ${unitPriceUsd} / {formatModel}
                            </span>
                          </div>
                          {mod.minimumMinor > 0 && (
                            <div className="flex justify-between items-center text-stone/80">
                              <span>Plan Minimum:</span>
                              <span>${minPriceUsd}/mo</span>
                            </div>
                          )}
                          {bundlePriceUsd && (
                            <div className="flex justify-between items-center text-emerald-800 font-semibold bg-emerald-50/80 px-2.5 py-1 rounded-lg">
                              <span>Suite Bundle:</span>
                              <span>${bundlePriceUsd} / outlet</span>
                            </div>
                          )}
                          {mod.isAddOn && (
                            <span className="mt-1 inline-flex self-start rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-600/20">
                              Modular Add-on
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-8 text-center py-12 text-sm text-stone">
                  Module catalog is currently syncing with the platform billing engine.
                </div>
              )}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* =====================================================================
          Frequently Asked Questions (Anchored at #faq for Footer link)
          ===================================================================== */}
      <section id="faq" className="scroll-mt-24 bg-linen py-20 lg:py-28 border-t border-ink/5">
        <Container className="grid gap-14 lg:grid-cols-12 items-start">
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="Questions"
              title={<>Frequently <Accent>asked</Accent></>}
              description={
                <>
                  Have a specific question about your venue's hardware or operational migration?{" "}
                  Write to{" "}
                  <a
                    href="mailto:hello@hospitalityos.com"
                    className="text-ink font-medium underline decoration-champagne underline-offset-4 hover:text-champagne-dark"
                  >
                    hello@hospitalityos.com
                  </a>
                  .
                </>
              }
            />

            <div className="mt-8 rounded-2xl bg-white p-6 border border-ink/10 shadow-sm">
              <div className="flex items-center gap-3 text-ink font-semibold text-sm">
                <HelpCircle className="size-4 text-champagne-dark" /> Need an enterprise pilot?
              </div>
              <p className="mt-2 text-xs text-stone leading-relaxed">
                We provide custom sandbox environments for multi-property operators evaluating PMS
                and POS consolidations.
              </p>
              <a
                href={`mailto:${SALES_EMAIL}`}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-champagne-dark hover:underline"
              >
                Contact Solutions Team <ArrowRight className="size-3" />
              </a>
            </div>
          </div>

          <div className="mk-faq divide-y divide-ink/10 border-y border-ink/10 lg:col-span-8">
            {PRICING_FAQS.map((faq, idx) => (
              <details key={faq.q} className="group" open={idx === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left">
                  <span className="font-display text-lg sm:text-xl text-ink font-medium">
                    {faq.q}
                  </span>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-ink/15 text-ink transition-all duration-300 group-open:rotate-45 group-open:border-champagne group-open:bg-champagne">
                    <Plus className="size-3.5" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 text-sm sm:text-base leading-relaxed text-stone">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* =====================================================================
          Bottom Reassurance & Final CTA Banner
          ===================================================================== */}
      <section className="bg-ivory py-20 sm:py-28">
        <Container>
          <Reveal>
            <div className="mk-grain relative overflow-hidden rounded-[2.5rem] bg-espresso px-7 py-16 text-center text-ivory sm:px-16 sm:py-24">
              <div
                aria-hidden
                className="absolute inset-5 rounded-[2rem] border border-champagne/20 sm:inset-7"
              />
              <div
                aria-hidden
                className="absolute top-1/2 left-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne/10 blur-[120px]"
              />
              <div className="relative">
                <Eyebrow tone="light" className="justify-center">
                  Get Started Today
                </Eyebrow>
                <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl sm:text-5xl leading-[1.08] text-balance">
                  Experience hospitality software that <Accent>simply works</Accent>.
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-sm sm:text-base text-ivory/65 leading-relaxed">
                  Join over 1,200 luxury boutique hotels, dining rooms, and resorts running on
                  Hospitality OS. Start your {TRIAL_DAYS}-day trial in minutes.
                </p>
                <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    id="pricing-cta-bottom-trial"
                    href={checkoutHref(selectedPkg, "professional", cycle)}
                    className={ctaClass("gold", "lg")}
                  >
                    Start 14-Day Free Trial <ArrowRight className="size-4" />
                  </Link>
                  <a
                    id="pricing-cta-bottom-sales"
                    href={`mailto:${SALES_EMAIL}`}
                    className={ctaClass("outline-light", "lg")}
                  >
                    Talk with Enterprise Sales
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-espresso text-ivory/70 flex items-center justify-center pt-32">
          <div className="flex items-center gap-3">
            <span className="size-5 rounded-full border-2 border-champagne border-t-transparent animate-spin" />
            <span className="text-sm">Loading pricing plans...</span>
          </div>
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
