import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  ChefHat,
  LayoutGrid,
  MonitorSmartphone,
  Split,
} from "lucide-react";
import chefKitchen from "@/assets/home/chef-kitchen.jpg";
import { Accent, Container, SectionHeading, ctaClass } from "@/components/home/primitives";
import { Reveal } from "@/components/home/reveal";
import { KdsMock, PosTicketMock } from "@/components/home/mockups";

const FEATURES = [
  { icon: MonitorSmartphone, title: "POS terminal", body: "Fast, elegant order entry on tablet or handheld — built for service at the table." },
  { icon: LayoutGrid, title: "Floor plan & tables", body: "Live table status, covers and timings on a floor plan that mirrors your room." },
  { icon: ChefHat, title: "Kitchen display", body: "Orders route instantly to the right station, with timers and bump-to-complete." },
  { icon: BookOpen, title: "Menu builder", body: "Categories, items and modifiers — from cooking temperatures to wine pairings." },
  { icon: Split, title: "Split bills & tips", body: "Split by seat, item or amount, apply discounts and accept tips gracefully." },
  { icon: Boxes, title: "Inventory", body: "Ingredient-level stock that depletes with every sale, with low-stock alerts." },
];

export function RestaurantSection() {
  return (
    <section id="restaurant" className="scroll-mt-20 overflow-hidden bg-ivory py-24 sm:py-32">
      <Container className="grid items-center gap-16 lg:grid-cols-12 lg:gap-14">
        {/* Visual */}
        <div className="relative order-2 lg:order-1 lg:col-span-7">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
              <Image
                src={chefKitchen}
                alt="Chef plating a dish at the pass with a kitchen display screen behind"
                fill
                placeholder="blur"
                sizes="(min-width: 1024px) 55vw, 95vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-ink/50 via-transparent to-transparent" />
            </div>
          </Reveal>
          <KdsMock className="relative mt-5 w-full sm:absolute sm:-bottom-10 sm:left-6 sm:mt-0 sm:w-[26rem]" />
          <PosTicketMock className="absolute -top-10 -right-4 hidden animate-float-slow xl:block" />
        </div>

        {/* Copy */}
        <div className="order-1 lg:order-2 lg:col-span-5">
          <SectionHeading
            eyebrow="Restaurant Management"
            title={
              <>
                From the first pour to the <Accent>final bill</Accent>.
              </>
            }
            description="A point of sale designed with front-of-house in mind: graceful at the table, relentless in the kitchen, and meticulous in the back office."
          />
          <dl className="mt-10 grid grid-cols-3 gap-6 border-y border-ink/10 py-6">
            {[
              { v: "<200ms", k: "Order to kitchen" },
              { v: "38%", k: "Faster table turns" },
              { v: "0", k: "Lost tickets" },
            ].map((s) => (
              <div key={s.k}>
                <dt className="text-[0.65rem] tracking-[0.16em] text-stone uppercase">{s.k}</dt>
                <dd className="mt-1 font-display text-3xl text-ink">{s.v}</dd>
              </div>
            ))}
          </dl>
          <Link href="/home/pricing?package=restaurant" className={ctaClass("dark", "lg", "mt-10")}>
            Restaurant plans from $99 <ArrowRight className="size-4" />
          </Link>
        </div>
      </Container>

      <Container className="mt-28">
        <ul className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal as="li" key={f.title} delay={(i % 3) * 100} className="group flex gap-5">
              <span className="font-display text-sm text-champagne-dark tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 border-t border-ink/10 pt-5 transition-colors duration-500 group-hover:border-champagne">
                <f.icon className="size-5 text-umber" strokeWidth={1.5} />
                <h3 className="mt-4 font-display text-2xl text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
