import Link from "next/link";
import { ArrowRight, KeyRound, LayoutTemplate, PackageCheck, Rocket } from "lucide-react";
import { Accent, Container, SectionHeading, ctaClass } from "@/components/home/primitives";
import { Reveal } from "@/components/home/reveal";
import { TRIAL_DAYS } from "@/lib/marketing/plans";

const STEPS = [
  {
    icon: KeyRound,
    title: "Create your account",
    body: "Sign up in under a minute. An account is required before any subscription, so your billing and data stay secure.",
  },
  {
    icon: PackageCheck,
    title: "Choose your package",
    body: "Hotel, Restaurant, or both together. Pick a tier and billing cycle — monthly, or annual to save 20%.",
  },
  {
    icon: LayoutTemplate,
    title: "Configure your venue",
    body: "A guided setup walks you through room categories, menus, tables, staff roles and locations.",
  },
  {
    icon: Rocket,
    title: "Go live",
    body: `Open the doors with your ${TRIAL_DAYS}-day trial. Our onboarding team is on hand for your first service.`,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-ink/5 bg-linen py-24 sm:py-32">
      <Container>
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="How it works"
            title={
              <>
                Live in days, <Accent>not months</Accent>.
              </>
            }
            description="No servers to install and no lengthy contracts. Four calm steps from sign-up to your first service."
          />
          <Link href="/signup" className={ctaClass("dark", "lg", "self-start lg:self-end")}>
            Create your account <ArrowRight className="size-4" />
          </Link>
        </div>

        <ol className="relative mt-20 grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div aria-hidden className="absolute top-7 right-0 left-0 hidden h-px bg-gradient-to-r from-champagne/0 via-champagne/50 to-champagne/0 lg:block" />
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 120} className="relative">
              <div className="flex items-center gap-4">
                <span className="relative grid size-14 place-items-center rounded-full border border-champagne/50 bg-ivory text-champagne-dark">
                  <s.icon className="size-5" strokeWidth={1.5} />
                </span>
                <span className="font-display text-5xl text-ink/10">0{i + 1}</span>
              </div>
              <h3 className="mt-7 font-display text-2xl text-ink">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
