const VENUES = [
  { name: "The Aldridge", style: "font-display italic text-2xl" },
  { name: "MAISON VERTE", style: "font-body tracking-[0.35em] text-sm font-semibold" },
  { name: "Saffron & Salt", style: "font-display text-2xl" },
  { name: "HARBOUR HOUSE", style: "font-display tracking-[0.2em] text-lg" },
  { name: "Olea Resort", style: "font-display italic text-2xl" },
  { name: "KENSINGTON ROW", style: "font-body tracking-[0.3em] text-xs font-bold" },
  { name: "Nomad Kitchen", style: "font-body text-lg font-light tracking-wide" },
  { name: "The Linden", style: "font-display text-2xl" },
];

export function TrustStrip() {
  const loop = [...VENUES, ...VENUES];
  return (
    <section aria-label="Trusted by" className="border-b border-ink/5 bg-ivory py-14">
      <p className="mk-eyebrow text-center text-stone">
        Trusted by independent hotels, restaurant groups &amp; resorts
      </p>
      <div className="relative mt-9 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <ul className="flex w-max animate-marquee items-center gap-16 pr-16 hover:[animation-play-state:paused]">
          {loop.map((v, i) => (
            <li
              key={`${v.name}-${i}`}
              aria-hidden={i >= VENUES.length}
              className={`whitespace-nowrap text-umber/60 transition-colors hover:text-ink ${v.style}`}
            >
              {v.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
