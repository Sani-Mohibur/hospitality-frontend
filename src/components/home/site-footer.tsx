import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container, Logo } from "@/components/home/primitives";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Hotel Management", href: "/home#hotel" },
      { label: "Restaurant POS", href: "/home#restaurant" },
      { label: "Hotel + Restaurant Suite", href: "/home#suite" },
      { label: "Features", href: "/home#features" },
    ],
  },
  {
    title: "Plans",
    links: [
      { label: "Pricing", href: "/home/pricing" },
      { label: "Compare packages", href: "/home/pricing#compare" },
      { label: "How it works", href: "/home#how-it-works" },
      { label: "FAQ", href: "/home/pricing#faq" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/home/login" },
      { label: "Create account", href: "/home/signup" },
      { label: "Client portal", href: "/tenant/dashboard" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mk-grain bg-ink text-ivory">
      <Container className="pt-20 pb-10">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo tone="light" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ivory/55">
              The hotel and restaurant POS &amp; management platform for operators who care about
              every detail — from the first reservation to the final bill.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-ivory/60">
              <li className="flex items-center gap-3">
                <Mail className="size-4 text-champagne" /> hello@hospitalityos.com
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4 text-champagne" /> +1 (415) 555-0142
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="size-4 text-champagne" /> 88 Market Street, San Francisco
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-5">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="mk-eyebrow text-champagne-light">{col.title}</h3>
                <ul className="mt-6 space-y-3.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-ivory/65 transition-colors hover:text-ivory"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <h3 className="mk-eyebrow text-champagne-light">The Concierge Letter</h3>
            <p className="mt-6 text-sm leading-relaxed text-ivory/55">
              Quarterly notes on hospitality operations, product releases and industry insight.
            </p>
            <form className="mt-5 flex overflow-hidden rounded-full border border-ivory/15 focus-within:border-champagne/60">
              <label htmlFor="footer-newsletter" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter"
                type="email"
                placeholder="you@hotel.com"
                className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm text-ivory placeholder:text-ivory/35 focus:outline-none"
              />
              <button
                type="button"
                className="cursor-pointer bg-champagne px-5 text-xs font-semibold tracking-wider text-ink uppercase transition-colors hover:bg-champagne-light"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-4 border-t border-ivory/10 pt-8 text-xs text-ivory/40 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Hospitality OS Inc. All rights reserved.</p>
          <div className="flex flex-wrap gap-6">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Security</span>
            <span>PCI-DSS compliant payments</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
