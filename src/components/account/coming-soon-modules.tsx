"use client";

import { Eyebrow, Accent } from "@/components/home/primitives";
import { Boxes, Compass, Bot } from "lucide-react";

export function ComingSoonModules() {
  return (
    <section className="pt-8 border-t border-ink/10 space-y-6">
      <div>
        <Eyebrow tone="dark">Future Capabilities</Eyebrow>
        <h2 className="mt-2 font-display text-2xl sm:text-3xl text-ink font-normal">
          Upcoming modular <Accent>extensions</Accent>
        </h2>
        <p className="mt-1 text-sm text-stone max-w-xl">
          These specialized modules are currently in engineering preview and will be released to
          production in upcoming platform cycles.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 1. Recipe & Inventory */}
        <div className="flex flex-col justify-between rounded-3xl bg-white/70 p-7 border border-ink/10 shadow-sm opacity-90">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="grid size-10 place-items-center rounded-xl bg-sand/30 text-stone">
                <Boxes className="size-5" />
              </span>
              <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 ring-1 ring-amber-600/30">
                Coming Soon
              </span>
            </div>

            <h3 className="font-display text-xl text-ink font-normal">Recipe &amp; Inventory</h3>
            <p className="mt-2 text-xs text-stone leading-relaxed">
              Ingredient-level inventory tracking, vendor purchase orders, automated depletion from POS orders, and food cost analytics.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-ink/5 flex items-center justify-between">
            <span className="text-[11px] font-mono text-stone">CODE: INVENTORY</span>
            <button
              type="button"
              disabled
              className="rounded-full bg-ink/5 px-4 py-1.5 text-xs font-semibold text-stone/70 cursor-not-allowed"
            >
              In Development
            </button>
          </div>
        </div>

        {/* 2. Channel Distribution */}
        <div className="flex flex-col justify-between rounded-3xl bg-white/70 p-7 border border-ink/10 shadow-sm opacity-90">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="grid size-10 place-items-center rounded-xl bg-sand/30 text-stone">
                <Compass className="size-5" />
              </span>
              <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 ring-1 ring-amber-600/30">
                Coming Soon
              </span>
            </div>

            <h3 className="font-display text-xl text-ink font-normal">Channel Distribution</h3>
            <p className="mt-2 text-xs text-stone leading-relaxed">
              Two-way live OTA channel synchronization with Booking.com, Airbnb, Expedia, and direct booking engine with rate parity control.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-ink/5 flex items-center justify-between">
            <span className="text-[11px] font-mono text-stone">CODE: DISTRIBUTION</span>
            <button
              type="button"
              disabled
              className="rounded-full bg-ink/5 px-4 py-1.5 text-xs font-semibold text-stone/70 cursor-not-allowed"
            >
              In Development
            </button>
          </div>
        </div>

        {/* 3. AI Operations Assistant */}
        <div className="flex flex-col justify-between rounded-3xl bg-white/70 p-7 border border-ink/10 shadow-sm opacity-90">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="grid size-10 place-items-center rounded-xl bg-sand/30 text-stone">
                <Bot className="size-5" />
              </span>
              <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 ring-1 ring-amber-600/30">
                Coming Soon
              </span>
            </div>

            <h3 className="font-display text-xl text-ink font-normal">AI Operations Assistant</h3>
            <p className="mt-2 text-xs text-stone leading-relaxed">
              Automated 24/7 guest concierge SMS/WhatsApp agent, smart shift demand forecasting, and real-time night audit anomaly detection.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-ink/5 flex items-center justify-between">
            <span className="text-[11px] font-mono text-stone">CODE: AI_ASSISTANT</span>
            <button
              type="button"
              disabled
              className="rounded-full bg-ink/5 px-4 py-1.5 text-xs font-semibold text-stone/70 cursor-not-allowed"
            >
              In Development
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
