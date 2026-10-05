import { Plus } from "lucide-react";
import { Container, SectionHeading } from "@/components/home/primitives";
import { TRIAL_DAYS } from "@/lib/marketing/plans";

const FAQS = [
  {
    q: "Do I need an account before subscribing?",
    a: "Yes. To keep billing and your business data secure, you'll be asked to log in or create a free account before choosing a plan at checkout. It takes less than a minute.",
  },
  {
    q: "Can I subscribe to Hotel or Restaurant only?",
    a: "Absolutely. Hotel Management and Restaurant Management are sold independently. If you later add the other module, you can upgrade to the Suite at any time and we'll prorate the difference.",
  },
  {
    q: "Is there a free trial?",
    a: `Every Essentials and Professional plan includes a ${TRIAL_DAYS}-day free trial. You won't be charged until the trial ends, and you can cancel anytime before then.`,
  },
  {
    q: "What hardware do I need?",
    a: "Hospitality OS runs in the browser on any modern computer, iPad or Android tablet. For restaurants we support popular receipt printers, cash drawers and card readers — or we can supply a pre-configured kit.",
  },
  {
    q: "How are payments processed?",
    a: "Card payments are processed through our PCI-DSS compliant payment partner. Cards are tokenised, so sensitive data never touches your devices.",
  },
  {
    q: "Can I manage multiple locations?",
    a: "Yes. Professional plans include up to three properties or outlets, and Enterprise is unlimited. Owners and managers can switch locations instantly, with data kept separate per location.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 bg-linen py-24 sm:py-32">
      <Container className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading
            eyebrow="Questions"
            title="Frequently asked"
            description={
              <>
                Something else on your mind? Write to{" "}
                <a href="mailto:hello@hospitalityos.com" className="text-ink underline decoration-champagne underline-offset-4">
                  hello@hospitalityos.com
                </a>
                .
              </>
            }
          />
        </div>
        <div className="mk-faq divide-y divide-ink/10 border-y border-ink/10 lg:col-span-8">
          {FAQS.map((f, i) => (
            <details key={f.q} className="group" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left">
                <span className="font-display text-xl text-ink sm:text-2xl">{f.q}</span>
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-ink/15 text-ink transition-all duration-300 group-open:rotate-45 group-open:border-champagne group-open:bg-champagne">
                  <Plus className="size-4" />
                </span>
              </summary>
              <p className="max-w-2xl pb-7 text-sm leading-relaxed text-stone sm:text-base">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
