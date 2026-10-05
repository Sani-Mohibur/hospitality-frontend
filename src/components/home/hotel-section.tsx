import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  Building2,
  CalendarRange,
  Receipt,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Accent, Container, SectionHeading, ctaClass } from "@/components/home/primitives";
import { Reveal } from "@/components/home/reveal";
import { ReservationStripMock, RoomBoardMock } from "@/components/home/mockups";

const FEATURES = [
  {
    icon: BedDouble,
    title: "Live room board",
    body: "A colour-coded view of every room — occupied, vacant, reserved or being turned — updated in real time.",
  },
  {
    icon: CalendarRange,
    title: "Reservation calendar",
    body: "Drag-and-drop timeline across rooms and dates, with instant availability and conflict checks.",
  },
  {
    icon: UserRound,
    title: "Guest profiles",
    body: "Preferences, stay history and notes, so every returning guest is welcomed by name.",
  },
  {
    icon: Receipt,
    title: "Folios & billing",
    body: "Itemised guest ledgers with card payments, split charges and polished invoices at checkout.",
  },
  {
    icon: Sparkles,
    title: "Housekeeping",
    body: "Room-status workflow that tells your team what to clean next — and the desk the moment it's ready.",
  },
  {
    icon: Building2,
    title: "Property configuration",
    body: "Room categories, rates and rooms set up once, then managed across every property you run.",
  },
];

export function HotelSection() {
  return (
    <section id="hotel" className="scroll-mt-20 overflow-hidden bg-linen py-24 sm:py-32">
      <Container className="grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="Hotel Management"
            title={
              <>
                Every room, every stay, run with <Accent>quiet precision</Accent>.
              </>
            }
            description="From the first reservation to the final folio, Hospitality OS gives your front office a calm, complete picture of the property — on desktop, tablet or at the concierge desk."
          />
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/home/pricing?package=hotel" className={ctaClass("dark", "lg")}>
              Hotel plans from $149 <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="relative lg:col-span-7">
          <div
            aria-hidden
            className="absolute -inset-8 -z-0 rounded-[3rem] bg-gradient-to-br from-sand/80 via-transparent to-champagne/20"
          />
          <Reveal className="relative">
            <RoomBoardMock />
          </Reveal>
          <ReservationStripMock className="relative mt-5 ml-auto hidden animate-float-slow sm:block lg:absolute lg:-bottom-10 lg:-left-10 lg:mt-0" />
        </div>
      </Container>

      <Container className="mt-24">
        <ul className="grid gap-px overflow-hidden rounded-[2rem] border border-ink/8 bg-ink/8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal as="li" key={f.title} delay={(i % 3) * 100} className="group bg-ivory p-8 transition-colors duration-500 hover:bg-white sm:p-10">
              <span className="grid size-12 place-items-center rounded-full border border-champagne/40 text-champagne-dark transition-colors duration-500 group-hover:bg-ink group-hover:text-champagne-light">
                <f.icon className="size-5" strokeWidth={1.5} />
              </span>
              <h3 className="mt-6 font-display text-2xl text-ink">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone">{f.body}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
