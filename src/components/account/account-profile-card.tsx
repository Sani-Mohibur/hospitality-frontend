"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ctaClass } from "@/components/home/primitives";
import { cn } from "@/lib/utils";

interface AccountProfileCardProps {
  user: {
    name: string;
    email: string;
    role?: string;
  };
  tenantName?: string;
  isTenantUser: boolean;
}

export function AccountProfileCard({
  user,
  tenantName,
  isTenantUser,
}: AccountProfileCardProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-7 shadow-sm border border-ink/10 space-y-6">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink mb-1">
            Account Profile
          </h2>
          <p className="text-xs text-stone">Your authenticated owner credentials</p>
        </div>

        <div className="space-y-4 text-sm divide-y divide-ink/5">
          <div className="pt-2 flex justify-between items-center">
            <span className="text-stone">Full Name:</span>
            <span className="font-semibold text-ink">{user.name}</span>
          </div>
          <div className="pt-3 flex justify-between items-center">
            <span className="text-stone">Email Address:</span>
            <span className="font-mono text-xs text-ink">{user.email}</span>
          </div>
          <div className="pt-3 flex justify-between items-center">
            <span className="text-stone">Assigned Role:</span>
            <span className="inline-flex rounded-full bg-sand/30 px-2.5 py-0.5 text-xs font-semibold text-ink">
              {user.role ? user.role.replace("_", " ") : "TENANT OWNER"}
            </span>
          </div>
          <div className="pt-3 flex justify-between items-center">
            <span className="text-stone">Workspace:</span>
            <span className="font-medium text-ink">{tenantName || "Active Property"}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-ivory/60 p-4 border border-ink/5 text-xs text-stone space-y-1.5">
          <div className="flex items-center gap-2 text-ink font-semibold">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span>Security &amp; Encryption</span>
          </div>
          <p className="text-[11px] text-stone leading-relaxed">
            All tenant folios and payments are tokenized in compliance with PCI-DSS standards.
          </p>
        </div>
      </div>

      {/* Super Admin Notice if applicable */}
      {!isTenantUser && (
        <div className="rounded-3xl bg-white p-7 shadow-sm border border-blue-200">
          <div className="flex items-center gap-2 text-blue-800 font-semibold text-sm mb-2">
            <ShieldCheck className="size-4 text-blue-600" /> Platform Super Administrator
          </div>
          <p className="text-xs text-stone leading-relaxed mb-4">
            You have platform-wide super administrative privileges across all hospitality tenants.
          </p>
          <Link
            href="/super-admin"
            className={cn(ctaClass("dark", "md"), "w-full justify-center")}
          >
            Enter Super Admin Portal
          </Link>
        </div>
      )}
    </div>
  );
}
