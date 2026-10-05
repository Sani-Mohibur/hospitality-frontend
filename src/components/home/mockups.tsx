import { cn } from "@/lib/utils";
import { BedDouble, ChefHat, Clock, CreditCard, Receipt, Sparkles, Utensils } from "lucide-react";

/* Static product UI previews rendered in HTML/CSS (crisp at any size). */

const shell =
  "rounded-2xl border border-ink/8 bg-white/95 shadow-[0_30px_80px_-30px_rgba(20,17,14,0.45)] backdrop-blur";

/* -------------------------------------------------------------------------- */

export function PosTicketMock({ className }: { className?: string }) {
  const items = [
    { qty: 2, name: "Tuna Tartare", mod: "No chili", price: 48 },
    { qty: 1, name: "Dry-aged Ribeye", mod: "Medium rare", price: 64 },
    { qty: 1, name: "Chablis 1er Cru", mod: "Bottle", price: 92 },
  ];
  const subtotal = items.reduce((a, i) => a + i.price, 0);
  return (
    <div className={cn(shell, "w-72 p-5 text-ink", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-forest text-ivory">
            <Utensils className="size-4" />
          </span>
          <div>
            <p className="text-[0.7rem] font-semibold">Table 12 · Le Jardin</p>
            <p className="text-[0.6rem] text-stone">Server: Amélie · 4 covers</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[0.55rem] font-semibold text-emerald-700">
          OPEN
        </span>
      </div>
      <ul className="mt-4 space-y-2.5 border-t border-dashed border-ink/10 pt-4">
        {items.map((i) => (
          <li key={i.name} className="flex items-start justify-between gap-3 text-[0.68rem]">
            <div>
              <p className="font-medium">
                <span className="text-champagne-dark">{i.qty}×</span> {i.name}
              </p>
              <p className="text-[0.58rem] text-stone">{i.mod}</p>
            </div>
            <span className="font-medium tabular-nums">${i.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3 text-[0.7rem]">
        <span className="text-stone">Subtotal</span>
        <span className="font-display text-lg font-semibold tabular-nums">${subtotal.toFixed(2)}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <span className="rounded-lg border border-ink/10 py-2 text-center text-[0.6rem] font-semibold">
          Send to kitchen
        </span>
        <span className="flex items-center justify-center gap-1 rounded-lg bg-ink py-2 text-[0.6rem] font-semibold text-ivory">
          <CreditCard className="size-3" /> Charge
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function OccupancyMock({ className }: { className?: string }) {
  const bars = [52, 61, 58, 70, 78, 86, 92];
  return (
    <div className={cn(shell, "w-60 p-5 text-ink", className)}>
      <div className="flex items-center justify-between">
        <p className="text-[0.62rem] font-semibold tracking-[0.18em] text-stone uppercase">Occupancy</p>
        <span className="flex items-center gap-1 text-[0.58rem] font-semibold text-emerald-700">
          <span className="size-1.5 animate-pulse-dot rounded-full bg-emerald-500" /> Live
        </span>
      </div>
      <p className="mt-2 font-display text-4xl font-medium">
        86<span className="text-xl text-stone">%</span>
      </p>
      <p className="text-[0.6rem] text-stone">142 of 165 rooms · +9% vs last week</p>
      <div className="mt-4 flex h-14 items-end gap-1.5">
        {bars.map((b, i) => (
          <span
            key={i}
            style={{ height: `${b}%` }}
            className={cn("flex-1 rounded-sm", i === bars.length - 1 ? "bg-champagne" : "bg-sand")}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

type RoomState = "occupied" | "available" | "cleaning" | "reserved";

const ROOM_STYLE: Record<RoomState, string> = {
  occupied: "bg-forest text-ivory",
  available: "bg-white text-ink border border-ink/10",
  cleaning: "bg-champagne-light/70 text-ink",
  reserved: "bg-bordeaux/90 text-ivory",
};

const ROOMS: { no: number; state: RoomState; guest?: string }[] = [
  { no: 301, state: "occupied", guest: "Laurent" },
  { no: 302, state: "available" },
  { no: 303, state: "cleaning" },
  { no: 304, state: "occupied", guest: "Okafor" },
  { no: 305, state: "reserved", guest: "Tanaka" },
  { no: 306, state: "occupied", guest: "Moreau" },
  { no: 307, state: "available" },
  { no: 308, state: "occupied", guest: "Haddad" },
  { no: 309, state: "reserved", guest: "Silva" },
  { no: 310, state: "occupied", guest: "Novak" },
  { no: 311, state: "cleaning" },
  { no: 312, state: "occupied", guest: "Rossi" },
];

export function RoomBoardMock({ className }: { className?: string }) {
  return (
    <div className={cn(shell, "p-5 text-ink sm:p-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-ink text-champagne-light">
            <BedDouble className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">Room Board</p>
            <p className="text-[0.65rem] text-stone">Floor 3 · Tuesday, 14 Oct</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-[0.6rem] text-stone">
          {(["occupied", "available", "cleaning", "reserved"] as RoomState[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5 capitalize">
              <span className={cn("size-2 rounded-sm", ROOM_STYLE[s])} /> {s}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {ROOMS.map((r) => (
          <div
            key={r.no}
            className={cn(
              "flex aspect-[4/3] flex-col justify-between rounded-xl p-2.5 transition-transform duration-300 hover:-translate-y-0.5",
              ROOM_STYLE[r.state],
            )}
          >
            <span className="font-display text-lg leading-none font-semibold">{r.no}</span>
            <span className="truncate text-[0.58rem] opacity-80">
              {r.guest ?? (r.state === "cleaning" ? "Housekeeping" : "Ready")}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-ink/8 pt-4">
        {[
          { k: "Arrivals", v: "18" },
          { k: "Departures", v: "11" },
          { k: "ADR", v: "$284" },
        ].map((s) => (
          <div key={s.k}>
            <p className="text-[0.58rem] tracking-[0.16em] text-stone uppercase">{s.k}</p>
            <p className="font-display text-xl font-semibold">{s.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function ReservationStripMock({ className }: { className?: string }) {
  const rows = [
    { room: "Deluxe King · 204", start: 0, span: 3, guest: "E. Laurent", tone: "bg-forest" },
    { room: "Junior Suite · 305", start: 1, span: 4, guest: "K. Tanaka", tone: "bg-bordeaux" },
    { room: "Garden Twin · 112", start: 2, span: 2, guest: "M. Okafor", tone: "bg-champagne-dark" },
  ];
  return (
    <div className={cn(shell, "w-80 p-4 text-ink", className)}>
      <div className="flex items-center justify-between">
        <p className="text-[0.7rem] font-semibold">Reservations</p>
        <p className="text-[0.58rem] text-stone">Oct 14 – 20</p>
      </div>
      <div className="mt-3 grid grid-cols-7 text-center text-[0.52rem] text-stone">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="mt-2 space-y-2">
        {rows.map((r) => (
          <div key={r.room}>
            <p className="mb-1 text-[0.55rem] text-stone">{r.room}</p>
            <div className="grid h-5 grid-cols-7 gap-0.5 rounded bg-linen/70">
              <span
                style={{ gridColumn: `${r.start + 1} / span ${r.span}` }}
                className={cn("flex items-center rounded px-1.5 text-[0.52rem] font-medium text-ivory", r.tone)}
              >
                {r.guest}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function KdsMock({ className }: { className?: string }) {
  const tickets = [
    { id: "#1042", table: "T12", time: "04:12", items: ["2× Tuna Tartare", "1× Ribeye · MR"], tone: "border-l-emerald-500" },
    { id: "#1043", table: "Rm 304", time: "07:48", items: ["1× Club Sandwich", "1× Fresh Juice"], tone: "border-l-champagne" },
    { id: "#1044", table: "T03", time: "11:05", items: ["3× Risotto", "1× Burrata"], tone: "border-l-bordeaux" },
  ];
  return (
    <div className={cn("rounded-2xl border border-ivory/10 bg-ink/90 p-4 text-ivory shadow-2xl backdrop-blur", className)}>
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-[0.7rem] font-semibold">
          <ChefHat className="size-4 text-champagne" /> Kitchen Display · Hot line
        </p>
        <span className="flex items-center gap-1 text-[0.55rem] text-emerald-400">
          <span className="size-1.5 animate-pulse-dot rounded-full bg-emerald-400" /> Live
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {tickets.map((t) => (
          <div key={t.id} className={cn("rounded-lg border-l-2 bg-ivory/[0.06] p-2.5", t.tone)}>
            <div className="flex items-center justify-between text-[0.55rem] text-ivory/60">
              <span className="font-semibold text-ivory">{t.table}</span>
              <span className="flex items-center gap-0.5">
                <Clock className="size-2.5" /> {t.time}
              </span>
            </div>
            <ul className="mt-1.5 space-y-0.5 text-[0.55rem] text-ivory/85">
              {t.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function FolioFlowMock({ className }: { className?: string }) {
  return (
    <div className={cn(shell, "w-full max-w-sm p-5 text-ink", className)}>
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-xs font-semibold">
          <Receipt className="size-4 text-champagne-dark" /> Guest Folio · Room 304
        </p>
        <span className="text-[0.6rem] text-stone">M. Okafor</span>
      </div>
      <ul className="mt-4 space-y-2.5 text-[0.7rem]">
        {[
          { d: "Junior Suite · 3 nights", v: "$852.00" },
          { d: "Spa · Signature massage", v: "$140.00" },
        ].map((l) => (
          <li key={l.d} className="flex justify-between">
            <span className="text-stone">{l.d}</span>
            <span className="tabular-nums">{l.v}</span>
          </li>
        ))}
        <li className="-mx-2 flex justify-between rounded-lg bg-champagne/15 px-2 py-1.5">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="size-3 text-champagne-dark" /> Le Jardin · Table 7
          </span>
          <span className="font-medium tabular-nums">$186.40</span>
        </li>
      </ul>
      <div className="mt-4 flex items-baseline justify-between border-t border-ink/10 pt-3">
        <span className="text-[0.65rem] tracking-[0.16em] text-stone uppercase">Balance</span>
        <span className="font-display text-2xl font-semibold tabular-nums">$1,178.40</span>
      </div>
    </div>
  );
}
