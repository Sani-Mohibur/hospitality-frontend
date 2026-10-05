import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import resortTerrace from "@/assets/home/resort-terrace.jpg";
import { Accent, Container, SectionHeading, ctaClass } from "@/components/home/primitives";
import { Reveal } from "@/components/home/reveal";
import { FolioFlowMock } from "@/components/home/mockups";
import { suiteSavings } from "@/lib/marketing/plans";

const PILLARS = [
  {
    title: "Charge-to-room, everywhere",
    body: "Restaurant, bar, spa or room service — every outlet posts straight to the guest's folio.",
  },
  {
    title: "One guest profile",
    body: "Stay history and dining preferences together, so the sommelier knows what the front desk knows.",
  },
  {
    title: "Shared inventory",
    body: "Kitchen, minibar and housekeeping stock drawn from one ledger with unified purchasing.",
  },
  {
    title: "Consolidated reporting",
    body: "RevPAR and covers, ADR and average spend — one view across every property and outlet.",
  },
];

export function SuiteSection() {
  const save = suiteSavings("professional");
  return (
    <section id="suite" className="mk-grain relative scroll-mt-20 overflow-hidden bg-ink text-ivory">
      <div className="absolute inset-0">
        <Image
          src={resortTerrace}
          alt="Boutique resort at dusk with a candlelit terrace restaurant"
          fill
          placeholder="blur"
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
      </div>

      <Container className="relative grid gap-16 py-28 sm:py-36 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <SectionHeading
            tone="light"
            eyebrow="Hotel + Restaurant Suite"
            title={
              <>
                One guest. One folio. <Accent>One source of truth.</Accent>
              </>
            }
            description="When your hotel and restaurant share a platform, the seams disappear. Guests enjoy effortless service, and you gain a single, honest view of the business."
          />
          <ol className="mt-12 grid gap-8 sm:grid-cols-2">
            {PILLARS.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 90}>
                <span className="font-display text-champagne">0{i + 1}</span>
                <h3 className="mt-2 font-display text-xl">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ivory/60">{p.body}</p>
              </Reveal>
            ))}
          </ol>
          <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link href="/home/pricing?package=suite" className={ctaClass("gold", "lg")}>
              View Suite pricing <ArrowRight className="size-4" />
            </Link>
            {save && (
              <p className="text-sm text-ivory/60">
                Save <span className="text-champagne-light">{save}%</span> versus subscribing separately.
              </p>
            )}
          </div>
        </div>

        <div className="relative flex items-center justify-center lg:col-span-6 lg:justify-end">
          <Reveal delay={150} className="relative w-full max-w-sm">
            <div className="mb-4 flex items-center gap-3 rounded-full border border-ivory/15 bg-ink/50 px-4 py-2.5 text-xs backdrop-blur-md">
              <span className="size-2 animate-pulse-dot rounded-full bg-champagne" />
              Le Jardin · Table 7 posted to Room 304
              <span className="ml-auto text-ivory/50">just now</span>
            </div>
            <FolioFlowMock className="animate-float-slow" />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
