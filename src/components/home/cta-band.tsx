import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Accent, Container, Eyebrow, ctaClass } from "@/components/home/primitives";
import { Reveal } from "@/components/home/reveal";
import { SALES_EMAIL, TRIAL_DAYS } from "@/lib/marketing/plans";

export function CtaBand() {
  return (
    <section className="bg-ivory pb-24 sm:pb-32">
      <Container>
        <Reveal>
          <div className="mk-grain relative overflow-hidden rounded-[2.5rem] bg-espresso px-7 py-20 text-center text-ivory sm:px-16 sm:py-28">
            <div aria-hidden className="absolute inset-6 rounded-[2rem] border border-champagne/20 sm:inset-8" />
            <div
              aria-hidden
              className="absolute top-1/2 left-1/2 size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne/10 blur-[120px]"
            />
            <div className="relative">
              <Eyebrow tone="light" className="justify-center">
                Your next chapter
              </Eyebrow>
              <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-[1.05] text-balance sm:text-6xl">
                Elevate every stay and <Accent>every service</Accent>.
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-base text-ivory/60">
                Join 1,200+ hospitality businesses running on Hospitality OS. Start your {TRIAL_DAYS}-day free
                trial today — no credit card required to explore.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                <Link id="cta-band-signup" href="/home/signup" className={ctaClass("gold", "lg")}>
                  Start your free trial <ArrowRight className="size-4" />
                </Link>
                <a id="cta-band-sales" href={`mailto:${SALES_EMAIL}`} className={ctaClass("outline-light", "lg")}>
                  Talk to sales
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
