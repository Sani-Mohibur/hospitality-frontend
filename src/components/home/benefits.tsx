import {
  Activity,
  CreditCard,
  FileClock,
  MapPinned,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Accent, Container, SectionHeading } from "@/components/home/primitives";
import { Reveal } from "@/components/home/reveal";
import { cn } from "@/lib/utils";

const BENEFITS = [
  {
    icon: MapPinned,
    title: "Multi-location control",
    body: "Switch between properties and outlets in a click. Every report, order and reservation stays scoped to the right location.",
    span: "lg:col-span-2",
    feature: true,
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    body: "Owners, managers and staff each see exactly what they need — billing stays with the owner.",
    span: "",
  },
  {
    icon: Activity,
    title: "Real-time, everywhere",
    body: "New orders, check-ins and alerts appear instantly across every screen.",
    span: "",
  },
  {
    icon: CreditCard,
    title: "Secure payments",
    body: "PCI-DSS compliant card processing on folios and at the table, with tokenised cards.",
    span: "",
  },
  {
    icon: FileClock,
    title: "Complete audit trail",
    body: "Every change, void and refund recorded with who, what and when.",
    span: "",
  },
  {
    icon: Smartphone,
    title: "Any device",
    body: "Desktop at the back office, tablet at the desk, handheld on the floor — one platform.",
    span: "",
  },
];

const ROLES = [
  { role: "Owner", scope: "Everything, incl. billing", tone: "bg-champagne text-ink" },
  { role: "Manager", scope: "Operations & reports", tone: "bg-ivory/15 text-ivory" },
  { role: "Staff", scope: "POS, check-ins, tables", tone: "bg-ivory/10 text-ivory/80" },
];

export function Benefits() {
  return (
    <section id="features" className="scroll-mt-20 bg-ivory py-24 sm:py-32">
      <Container>
        <SectionHeading
          align="center"
          eyebrow="Why Hospitality OS"
          title={
            <>
              Built for the <Accent>realities</Accent> of hospitality.
            </>
          }
          description="Enterprise-grade foundations, wrapped in an interface your team will genuinely enjoy using on a Saturday night."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b, i) => (
            <Reveal
              key={b.title}
              delay={(i % 4) * 90}
              className={cn(
                "group relative overflow-hidden rounded-[1.75rem] border p-8 transition-all duration-500 hover:-translate-y-1",
                b.feature
                  ? "mk-grain border-transparent bg-espresso text-ivory sm:col-span-2 lg:row-span-2"
                  : "border-ink/8 bg-white hover:border-champagne/50 hover:shadow-[0_24px_60px_-30px_rgba(20,17,14,0.35)]",
                b.span,
              )}
            >
              <span
                className={cn(
                  "grid size-12 place-items-center rounded-full",
                  b.feature ? "bg-champagne/15 text-champagne-light" : "bg-linen text-champagne-dark",
                )}
              >
                <b.icon className="size-5" strokeWidth={1.5} />
              </span>
              <h3 className={cn("mt-6 font-display", b.feature ? "text-3xl sm:text-4xl" : "text-2xl text-ink")}>
                {b.title}
              </h3>
              <p className={cn("mt-3 text-sm leading-relaxed", b.feature ? "max-w-md text-ivory/65" : "text-stone")}>
                {b.body}
              </p>

              {b.feature && (
                <div className="mt-10 space-y-3">
                  {[
                    { name: "The Aldridge · Mayfair", meta: "Hotel · 86 rooms", active: true },
                    { name: "Le Jardin", meta: "Restaurant · 64 covers", active: false },
                    { name: "Olea Resort · Mallorca", meta: "Hotel + Restaurant", active: false },
                  ].map((l) => (
                    <div
                      key={l.name}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-colors",
                        l.active ? "border-champagne/60 bg-champagne/10" : "border-ivory/10 bg-ivory/[0.03]",
                      )}
                    >
                      <div>
                        <p className="font-medium">{l.name}</p>
                        <p className="text-xs text-ivory/50">{l.meta}</p>
                      </div>
                      {l.active && <span className="mk-eyebrow text-[0.55rem] text-champagne-light">Active</span>}
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-2 pt-4">
                    {ROLES.map((r) => (
                      <span key={r.role} className={cn("rounded-full px-3 py-1.5 text-[0.7rem]", r.tone)}>
                        <span className="font-semibold">{r.role}</span> · {r.scope}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
