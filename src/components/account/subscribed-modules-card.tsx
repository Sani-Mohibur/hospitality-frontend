"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Building2,
  UtensilsCrossed,
  Store,
  Sparkles,
  CreditCard,
  ArrowRight,
  ShieldAlert,
  Lock,
} from "lucide-react";
import { ctaClass } from "@/components/home/primitives";
import { cn } from "@/lib/utils";
import { TRIAL_DAYS } from "@/lib/marketing/plans";
import { Tenant } from "@/lib/auth-context";

interface SubscribedModulesCardProps {
  hasActiveAccess: boolean;
  tenant?: Tenant | null;
}

export function SubscribedModulesCard({
  hasActiveAccess,
  tenant,
}: SubscribedModulesCardProps) {
  const router = useRouter();

  if (hasActiveAccess) {
    return (
      <div className="rounded-3xl bg-white p-8 sm:p-9 shadow-sm border border-emerald-600/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ink/5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20 mb-2">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              <span>Active Subscription</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl text-ink font-normal">
              {tenant?.subscription?.planName || "Active Platform License"}
            </h2>
            <p className="text-xs text-stone mt-1">
              Workspace Status: <span className="font-semibold uppercase text-emerald-700">{tenant?.status}</span>
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end text-xs text-stone">
            <span className="font-semibold text-ink text-sm">
              {tenant?.subscription?.currentPeriodEnd
                ? `Renews on ${new Date(tenant.subscription.currentPeriodEnd).toLocaleDateString()}`
                : "14-Day Free Evaluation Active"}
            </span>
            <span className="text-[11px] text-stone mt-0.5">Automated billing managed</span>
          </div>
        </div>

        {/* Active Modules Display */}
        <div className="mt-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-4">
            Entitled Active Modules
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {tenant?.subscribedModules?.map((mod) => (
              <div
                key={mod}
                className="flex items-center gap-3.5 p-4 rounded-2xl border border-emerald-600/15 bg-emerald-50/40 text-ink"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                  {mod === "HOSPITALITY" ? (
                    <Building2 className="size-4" />
                  ) : mod === "RESTAURANT" ? (
                    <UtensilsCrossed className="size-4" />
                  ) : mod === "RETAIL" ? (
                    <Store className="size-4" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                </span>
                <div>
                  <div className="font-semibold text-sm">
                    {mod === "HOSPITALITY"
                      ? "Hotel & PMS Operations"
                      : mod === "RESTAURANT"
                        ? "Restaurant POS & Dining"
                        : mod === "RETAIL"
                          ? "Retail POS & Shop"
                          : mod}
                  </div>
                  <span className="text-[11px] text-emerald-800 font-medium">
                    Active &amp; Entitled
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-ink/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/tenant/settings/subscription"
            className="text-xs font-semibold text-stone hover:text-ink flex items-center gap-1.5"
          >
            <CreditCard className="size-3.5" /> View Invoices &amp; Billing History
          </Link>
          <button
            type="button"
            onClick={() => router.push("/tenant/dashboard")}
            className={cn(ctaClass("gold", "md"), "w-full sm:w-auto justify-center cursor-pointer")}
          >
            <span>Open Workspace Dashboard</span>
            <ArrowRight className="size-4 ml-1" />
          </button>
        </div>
      </div>
    );
  }

  // State B: Empty State (No Active Modules)
  return (
    <div className="rounded-3xl bg-white p-8 sm:p-10 shadow-sm border border-amber-200">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-600/20">
          <ShieldAlert className="size-6" />
        </span>
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 ring-1 ring-amber-600/20 mb-2">
            <span>Subscription Required</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-ink font-normal">
            No Active Modules Activated
          </h2>
          <p className="mt-2 text-sm text-stone leading-relaxed">
            Your user account is registered, but you have not activated an operational
            subscription for <span className="font-semibold text-ink">{tenant?.name || "your workspace"}</span> yet.
            Choose a package below to start your {TRIAL_DAYS}-day free evaluation.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-amber-50/60 p-4 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-3">
        <Lock className="size-4 shrink-0 text-amber-700 mt-0.5" />
        <div>
          <span className="font-semibold block mb-0.5">Workspace Access Protected</span>
          The operations dashboard is locked until you complete the subscription purchase.
          No charges are processed during the {TRIAL_DAYS}-day evaluation period.
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-ink/5 flex justify-end">
        <a
          href="#available-plans"
          className={cn(ctaClass("gold", "md"), "cursor-pointer")}
        >
          <span>Explore Subscription Options</span>
          <ArrowRight className="size-4 ml-1" />
        </a>
      </div>
    </div>
  );
}
