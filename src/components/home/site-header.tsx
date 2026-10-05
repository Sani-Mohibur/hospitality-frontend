"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { ArrowUpRight, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo, ctaClass } from "@/components/home/primitives";
import { signOut, useMarketingSession } from "@/lib/marketing/session";

const NAV = [
  { label: "Hotel", href: "/home#hotel" },
  { label: "Restaurant", href: "/home#restaurant" },
  { label: "Suite", href: "/home#suite" },
  { label: "How it works", href: "/home#how-it-works" },
  { label: "Pricing", href: "/home/pricing" },
];

/** Pages whose hero is dark, so the header starts transparent over it. */
const DARK_HERO_ROUTES = ["/home", "/home/pricing"];

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}

export function SiteHeader() {
  const pathname = usePathname();
  const session = useMarketingSession();
  const [open, setOpen] = useState(false);
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 24,
    () => false,
  );

  const overDark = DARK_HERO_ROUTES.includes(pathname) && !scrolled && !open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        overDark
          ? "bg-transparent"
          : "border-b border-ink/5 bg-ivory/85 shadow-[0_8px_30px_-20px_rgba(20,17,14,0.35)] backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Logo tone={overDark ? "light" : "dark"} />

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-full px-4 py-2 text-[0.82rem] font-medium tracking-wide transition-colors",
                "after:absolute after:inset-x-4 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-champagne after:transition-transform after:duration-300 hover:after:scale-x-100",
                overDark ? "text-ivory/80 hover:text-ivory" : "text-umber hover:text-ink",
                pathname === item.href && "after:scale-x-100",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {session ? (
            <>
              <span className={cn("text-[0.82rem]", overDark ? "text-ivory/70" : "text-stone")}>
                Signed in as <span className={overDark ? "text-ivory" : "text-ink"}>{session.name}</span>
              </span>
              <button
                id="header-sign-out"
                type="button"
                onClick={signOut}
                className={cn(
                  "inline-flex size-9 cursor-pointer items-center justify-center rounded-full border transition-colors",
                  overDark
                    ? "border-ivory/20 text-ivory/80 hover:bg-ivory/10"
                    : "border-ink/10 text-umber hover:bg-ink/5",
                )}
                aria-label="Sign out"
              >
                <LogOut className="size-4" />
              </button>
              <Link id="header-cta" href="/home/pricing" className={ctaClass(overDark ? "gold" : "dark")}>
                Choose a plan
              </Link>
            </>
          ) : (
            <>
              <Link
                id="header-login"
                href="/home/login"
                className={cn(
                  "px-3 py-2 text-[0.82rem] font-medium tracking-wide transition-colors",
                  overDark ? "text-ivory/85 hover:text-ivory" : "text-umber hover:text-ink",
                )}
              >
                Log in
              </Link>
              <Link id="header-cta" href="/home/signup" className={ctaClass(overDark ? "gold" : "dark")}>
                Start free trial
                <ArrowUpRight className="size-4" />
              </Link>
            </>
          )}
        </div>

        <button
          id="mobile-menu-toggle"
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className={cn(
            "inline-flex size-11 cursor-pointer items-center justify-center rounded-full border transition-colors lg:hidden",
            overDark ? "border-ivory/25 text-ivory" : "border-ink/10 text-ink",
          )}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          "grid overflow-hidden bg-ivory transition-[grid-template-rows] duration-500 lg:hidden",
          open ? "grid-rows-[1fr] border-t border-ink/5" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0">
          <nav aria-label="Mobile" className="flex flex-col px-5 pt-4 pb-8 sm:px-8">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-ink/5 py-4 font-display text-2xl text-ink"
              >
                {item.label}
                <ArrowUpRight className="size-4 text-champagne" />
              </Link>
            ))}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {session ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      setOpen(false);
                    }}
                    className={ctaClass("outline-dark", "md", "cursor-pointer")}
                  >
                    Sign out
                  </button>
                  <Link href="/home/pricing" onClick={() => setOpen(false)} className={ctaClass("dark")}>
                    Choose a plan
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/home/login" onClick={() => setOpen(false)} className={ctaClass("outline-dark")}>
                    Log in
                  </Link>
                  <Link href="/home/signup" onClick={() => setOpen(false)} className={ctaClass("dark")}>
                    Start free trial
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
