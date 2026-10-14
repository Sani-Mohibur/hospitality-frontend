"use client";

import { useRouter } from "next/navigation";
import { Eyebrow, Accent, ctaClass } from "@/components/home/primitives";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountProfileBannerProps {
  userName: string;
  userEmail: string;
  tenantName?: string;
  hasActiveAccess: boolean;
}

export function AccountProfileBanner({
  userName,
  userEmail,
  tenantName,
  hasActiveAccess,
}: AccountProfileBannerProps) {
  const router = useRouter();

  return (
    <div className="mk-grain relative overflow-hidden rounded-3xl bg-espresso text-ivory p-8 sm:p-12 shadow-xl border border-champagne/20">
      {/* Ambient atmospheric glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-10%] size-96 rounded-full bg-champagne/15 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-[-10%] size-96 rounded-full bg-forest/30 blur-[120px]"
      />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Eyebrow tone="light">Workspace &amp; Account Portal</Eyebrow>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-ivory">
            Welcome back, <Accent>{userName}</Accent>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-ivory/70 max-w-xl leading-relaxed">
            Connected workspace:{" "}
            <span className="font-semibold text-ivory">{tenantName || "Personal Workspace"}</span> ·{" "}
            {userEmail}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {hasActiveAccess ? (
            <button
              type="button"
              onClick={() => router.push("/tenant/dashboard")}
              className={cn(ctaClass("gold", "lg"), "justify-center shadow-lg shadow-champagne/20 cursor-pointer")}
            >
              <span>Enter Workspace Dashboard</span>
              <ArrowRight className="size-4 ml-1" />
            </button>
          ) : (
            <a
              href="#available-plans"
              className={cn(ctaClass("gold", "lg"), "justify-center shadow-lg shadow-champagne/20 cursor-pointer")}
            >
              <Sparkles className="size-4 mr-1 text-ink" />
              <span>Choose a Plan to Activate</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
