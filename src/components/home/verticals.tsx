import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import hotelSuite from "@/assets/home/hotel-suite.jpg";
import restaurantDining from "@/assets/home/restaurant-dining.jpg";
import { Accent, Container, SectionHeading } from "@/components/home/primitives";
import { Reveal } from "@/components/home/reveal";
import { suiteSavings } from "@/lib/marketing/plans";

interface Vertical {
  no: string;
  label: string;
  title: string;
  body: string;
  chips: string[];
  href: string;
  image: StaticImageData;
  alt: string;
}

const VERTICALS: Vertical[] = [
  {
    no: "01",
    label: "Hotel Management",
    title: "A front desk that runs itself.",
    body: "Live room board, reservations, guest profiles, housekeeping and itemised folios — designed for hotels from twelve keys to twelve hundred.",
    chips: ["Room board", "Reservations", "Guest folios", "Housekeeping"],
    href: "/home#hotel",
    image: hotelSuite,
    alt: "Elegant hotel suite with city view",
  },
  {
    no: "02",
    label: "Restaurant Management",
    title: "A POS worthy of your dining room.",
    body: "Take orders tableside, fire tickets to the kitchen display, split bills gracefully and keep stock in check — all from one beautiful terminal.",
    chips: ["POS terminal", "Floor plan", "Kitchen display", "Menu builder"],
    href: "/home#restaurant",
    image: restaurantDining,
    alt: "Fine dining room with a server taking an order on a handheld POS",
  },
];

export function Verticals() {
  const save = suiteSavings("professional");
  return (
    <section id="platform" className="scroll-mt-20 bg-ivory py-24 sm:py-32">
      <Container>
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="The Platform"
            title={
              <>
                Two disciplines. <Accent>One</Accent> platform.
              </>
            }
            description="Subscribe to the module your business needs today — Hotel, Restaurant, or both — and grow into the rest whenever you're ready."
          />
          <Link
            href="/home/pricing"
            className="group inline-flex items-center gap-2 self-start text-sm font-semibold text-ink lg:self-end"
          >
            View all plans
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {VERTICALS.map((v, i) => (
            <Reveal key={v.no} delay={i * 120} as="article">
              <Link
                href={v.href}
                className="group relative block overflow-hidden rounded-[2rem] bg-ink text-ivory"
              >
                <div className="relative aspect-[4/5] sm:aspect-[5/4]">
                  <Image
                    src={v.image}
                    alt={v.alt}
                    fill
                    placeholder="blur"
                    sizes="(min-width: 1024px) 45vw, 95vw"
                    className="object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/5" />
                </div>
                <div className="absolute inset-0 flex flex-col justify-between p-7 sm:p-10">
                  <div className="flex items-center justify-between">
                    <span className="mk-eyebrow text-champagne-light">
                      {v.no} — {v.label}
                    </span>
                    <span className="grid size-11 place-items-center rounded-full border border-ivory/25 transition-all duration-500 group-hover:rotate-45 group-hover:border-champagne group-hover:bg-champagne group-hover:text-ink">
                      <ArrowUpRight className="size-5" />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-3xl leading-tight sm:text-[2.6rem]">{v.title}</h3>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory/70 sm:text-base">{v.body}</p>
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {v.chips.map((c) => (
                        <li
                          key={c}
                          className="rounded-full border border-ivory/20 bg-ivory/5 px-3.5 py-1.5 text-[0.7rem] tracking-wide backdrop-blur-sm"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <Link
            href="/home#suite"
            className="group mt-6 flex flex-col items-start justify-between gap-6 rounded-[2rem] border border-champagne/30 bg-linen px-7 py-8 transition-colors hover:border-champagne sm:flex-row sm:items-center sm:px-10"
          >
            <div className="flex items-center gap-6">
              <span className="hidden font-display text-6xl leading-none text-champagne sm:block">+</span>
              <div>
                <p className="mk-eyebrow text-champagne-dark">03 — Hotel + Restaurant Suite</p>
                <p className="mt-2 font-display text-2xl text-ink sm:text-3xl">
                  Run both under one roof, on one guest folio.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-3 text-sm font-semibold text-ink">
              {save && (
                <span className="rounded-full bg-ink px-3 py-1 text-[0.7rem] text-champagne-light">
                  Save {save}%
                </span>
              )}
              Discover the Suite
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
