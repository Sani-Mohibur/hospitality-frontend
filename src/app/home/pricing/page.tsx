"use client";

import { useState } from "react";
import { Container, SectionHeading, Accent, ctaClass } from "@/components/home/primitives";
import { Reveal } from "@/components/home/reveal";
import { PACKAGES, PACKAGE_ORDER, TIERS, BillingCycle, priceFor, checkoutHref, suiteSavings, PackageId } from "@/lib/marketing/plans";
import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>("annual");
  const [selectedPkg, setSelectedPkg] = useState<PackageId>("suite");

  return (
    <div className="pt-32 pb-24 lg:pt-40 lg:pb-32 bg-mk-ivory-50">
      <Container>
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Pricing"
            title={<>Simple, transparent <Accent>pricing</Accent></>}
            description="Choose the right package for your hospitality business."
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
              Annually <span className="ml-1 text-[10px] text-mk-champagne-dark">20% OFF</span>
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
                    ? "bg-white text-mk-ink shadow-sm ring-1 ring-mk-ink/5"
                    : "text-mk-stone hover:text-mk-ink"
                )}
              >
                {PACKAGES[pkgId].shortName}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {TIERS[selectedPkg].map((tier, i) => {
            const price = tier.monthly !== null ? priceFor(tier.monthly, cycle) : null;
            return (
              <Reveal key={tier.id} delay={300 + i * 100}>
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-3xl bg-white p-8 shadow-xl ring-1 transition-all duration-300",
                    tier.highlight ? "ring-mk-champagne-light shadow-mk-champagne/10" : "ring-mk-ink/5 shadow-mk-ink/5",
                    tier.highlight && "md:-translate-y-4"
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
                  </div>
                  
                  <Link
                    href={checkoutHref(selectedPkg, tier.id, cycle)}
                    className={cn(
                      ctaClass(tier.highlight ? "gold" : "outline-dark"),
                      "w-full justify-center"
                    )}
                  >
                    {price !== null ? "Get started" : "Contact sales"}
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
      </Container>
    </div>
  );
}
