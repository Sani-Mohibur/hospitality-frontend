import { Quote } from "lucide-react";
import { Container } from "@/components/home/primitives";
import { Reveal } from "@/components/home/reveal";

const QUOTES = [
  {
    quote:
      "We replaced three systems with Hospitality OS. Our restaurant now posts straight to guest folios, and checkout went from ten minutes to two.",
    name: "Isabelle Fontaine",
    role: "General Manager",
    venue: "The Aldridge, Mayfair",
    initials: "IF",
  },
  {
    quote:
      "The POS is the first one my servers actually like. Tickets hit the kitchen instantly and we turn tables noticeably faster on Fridays.",
    name: "Marcus Bell",
    role: "Owner",
    venue: "Saffron & Salt",
    initials: "MB",
  },
  {
    quote:
      "Running four properties used to mean four logins. Now I switch locations in a click and see the whole group's performance at a glance.",
    name: "Elena Marquez",
    role: "Director of Operations",
    venue: "Olea Resorts",
    initials: "EM",
  },
];

export function Testimonials() {
  const [lead, ...rest] = QUOTES;
  return (
    <section aria-labelledby="testimonials-title" className="bg-ivory py-24 sm:py-32">
      <Container>
        <h2 id="testimonials-title" className="sr-only">
          What our customers say
        </h2>
        <Reveal className="mx-auto max-w-4xl text-center">
          <Quote className="mx-auto size-10 text-champagne" strokeWidth={1} />
          <blockquote className="mt-8 font-display text-3xl leading-snug text-ink text-balance sm:text-[2.6rem]">
            “{lead.quote}”
          </blockquote>
          <figcaption className="mt-10 flex items-center justify-center gap-4">
            <span className="grid size-12 place-items-center rounded-full bg-ink font-display text-lg text-champagne-light">
              {lead.initials}
            </span>
            <span className="text-left">
              <span className="block text-sm font-semibold text-ink">{lead.name}</span>
              <span className="text-xs text-stone">
                {lead.role}, {lead.venue}
              </span>
            </span>
          </figcaption>
        </Reveal>

        <div className="mt-20 grid gap-6 md:grid-cols-2">
          {rest.map((q, i) => (
            <Reveal key={q.name} delay={i * 120}>
              <figure className="h-full rounded-[1.75rem] border border-ink/8 bg-white p-8 sm:p-10">
                <blockquote className="font-display text-xl leading-relaxed text-umber">“{q.quote}”</blockquote>
                <figcaption className="mt-8 flex items-center gap-4 border-t border-ink/8 pt-6">
                  <span className="grid size-10 place-items-center rounded-full bg-linen font-display text-champagne-dark">
                    {q.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">{q.name}</span>
                    <span className="text-xs text-stone">
                      {q.role}, {q.venue}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
