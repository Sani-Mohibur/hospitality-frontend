"use client";

import Link from "next/link";
import { Logo, ctaClass } from "@/components/home/primitives";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountHeaderProps {
  onLogout: () => void;
}

export function AccountHeader({ onLogout }: AccountHeaderProps) {
  return (
    <header className="border-b border-ink/5 bg-ivory/85 backdrop-blur-xl sticky top-0 z-40">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Logo tone="dark" />
        <div className="flex items-center gap-3">
          <Link
            href="/home/pricing"
            className="hidden sm:inline-flex text-xs font-semibold uppercase tracking-wider text-stone hover:text-ink px-3 py-2 rounded-lg transition-colors"
          >
            Pricing &amp; Modules
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className={cn(ctaClass("outline-dark", "md"), "cursor-pointer gap-2")}
          >
            <LogOut className="size-4" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
