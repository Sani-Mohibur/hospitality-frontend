import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Star } from "lucide-react";
import heroLobby from "@/assets/home/hero-lobby.jpg";
import { Accent, Container, Eyebrow, ctaClass } from "@/components/home/primitives";
import { OccupancyMock, PosTicketMock } from "@/components/home/mockups";
import { TRIAL_DAYS } from "@/lib/marketing/plans";

export function Hero() {
  return (
    <section className="mk-grain relative overflow-hidden bg-espresso text-ivory">
      {/* Ambient light */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] size-[42rem] rounded-full bg-champagne/15 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-20%] left-[-10%] size-[36rem] rounded-full bg-forest/40 blur-[140px]"
      />

      <Container className="relative grid items-center gap-16 pt-36 pb-20 lg:min-h-[100svh] lg:grid-cols-12 lg:gap-10 lg:pt-32 lg:pb-24">
        {/* Copy */}
        <div className="lg:col-span-6 xl:col-span-6">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Eyebrow tone="light">Hotel &amp; Restaurant POS · Management Platform</Eyebrow>
          </div>
          <h1 className="mt-7 font-display text-[2.9rem] leading-[1.02] font-normal tracking-tight text-balance animate-in fade-in slide-in-from-bottom-6 duration-1000 sm:text-6xl xl:text-[5.1rem]">
            Where five-star service meets <Accent>flawless</Accent> operations.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-ivory/65 animate-in fade-in slide-in-from-bottom-8 duration-1000 sm:text-lg">
            Hospitality OS unites your front desk, reservations, point of sale, kitchen display and
            guest billing in one refined platform — so your team can focus on the guest, not the
            software.
          </p>

          <div className="mt-10 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-10 duration-1000 sm:flex-row">
            <Link id="hero-cta-plans" href="/home/pricing" className={ctaClass("gold", "lg")}>
              Explore plans <ArrowRight className="size-4" />
            </Link>
            <Link id="hero-cta-how" href="/home#how-it-works" className={ctaClass("outline-light", "lg")}>
              See how it works
            </Link>
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-[0.8rem] text-ivory/55">
            {[`${TRIAL_DAYS}-day free trial`, "No setup fees", "Cancel anytime"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="size-3.5 text-champagne" /> {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Visual */}
        <div className="relative lg:col-span-6 xl:col-span-6">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-t-full border border-champagne/25 p-2.5 animate-in fade-in zoom-in-95 duration-1000 sm:max-w-lg lg:ml-auto">
            <div className="relative size-full overflow-hidden rounded-t-full">
              <Image
                src={heroLobby}
                alt="Concierge desk of a boutique hotel lobby with a Hospitality OS tablet terminal"
                fill
                preload
                placeholder="blur"
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-transparent to-transparent" />
            </div>
          </div>

          <PosTicketMock className="absolute -bottom-6 left-0 hidden animate-float-slow sm:block lg:-left-10 xl:-left-16" />
          <OccupancyMock className="absolute top-16 right-0 hidden animate-float-slower sm:block lg:-right-4" />

          {/* Rating seal */}
          <div className="absolute top-6 left-4 hidden items-center gap-3 rounded-full border border-ivory/15 bg-espresso/60 py-2 pr-4 pl-2 backdrop-blur-md md:flex lg:left-0">
            <span className="grid size-8 place-items-center rounded-full bg-champagne text-ink">
              <Star className="size-4 fill-current" />
            </span>
            <span className="text-[0.7rem] leading-tight">
              <span className="block font-semibold">4.9 / 5 rating</span>
              <span className="text-ivory/60">from 1,200+ venues</span>
            </span>
          </div>
        </div>
      </Container>

      {/* Stat rail */}
      <div className="relative border-t border-ivory/10">
        <Container className="grid grid-cols-2 divide-ivory/10 lg:grid-cols-4 lg:divide-x">
          {[
            { v: "1,200+", k: "Hotels, restaurants & resorts" },
            { v: "18", k: "Countries served" },
            { v: "$2.4B", k: "Processed through our POS yearly" },
            { v: "99.9%", k: "Platform uptime" },
          ].map((s) => (
            <div key={s.k} className="py-8 lg:px-8 lg:first:pl-0">
              <p className="font-display text-3xl text-ivory sm:text-4xl">{s.v}</p>
              <p className="mt-1 text-xs tracking-wide text-ivory/50">{s.k}</p>
            </div>
          ))}
        </Container>
      </div>
    </section>
  );
}
