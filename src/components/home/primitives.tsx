import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/* -------------------------------------------------------------------------- */
/* Brand                                                                       */
/* -------------------------------------------------------------------------- */

export function Logo({
  tone = "dark",
  className,
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const light = tone === "light";
  return (
    <Link
      href="/home"
      aria-label="Hospitality OS — home"
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <span
        className={cn(
          "relative grid size-9 place-items-center rounded-full border transition-colors duration-500",
          light
            ? "border-champagne-light/50 group-hover:border-champagne-light"
            : "border-champagne/50 group-hover:border-champagne",
        )}
      >
        <span
          className={cn(
            "font-display text-[1.35rem] leading-none italic",
            light ? "text-champagne-light" : "text-champagne-dark",
          )}
        >
          H
        </span>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.35rem] font-medium tracking-tight",
            light ? "text-ivory" : "text-ink",
          )}
        >
          Hospitality<span className="text-champagne"> OS</span>
        </span>
        <span
          className={cn(
            "mt-1 text-[0.55rem] font-semibold tracking-[0.32em] uppercase",
            light ? "text-ivory/50" : "text-stone",
          )}
        >
          Hotel · Restaurant · POS
        </span>
      </span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Call-to-action styles (extends the shared shadcn button base)               */
/* -------------------------------------------------------------------------- */

type CtaVariant = "gold" | "dark" | "light" | "outline-light" | "outline-dark";

const ctaVariantClass: Record<CtaVariant, string> = {
  gold: "bg-champagne text-ink hover:bg-champagne-light shadow-[0_10px_30px_-12px_rgba(184,149,90,0.7)]",
  dark: "bg-ink text-ivory hover:bg-umber",
  light: "bg-ivory text-ink hover:bg-white",
  "outline-light": "border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10 hover:border-ivory/60",
  "outline-dark": "border-ink/20 bg-transparent text-ink hover:bg-ink hover:text-ivory hover:border-ink",
};

export function ctaClass(
  variant: CtaVariant = "gold",
  size: "md" | "lg" = "md",
  className?: string,
) {
  return cn(
    buttonVariants({ variant: "default" }),
    "rounded-full font-body font-semibold tracking-wide transition-all duration-300",
    size === "lg" ? "h-13 px-8 text-[0.9rem] gap-2.5" : "h-11 px-6 text-[0.82rem] gap-2",
    ctaVariantClass[variant],
    className,
  );
}

/* -------------------------------------------------------------------------- */
/* Typography                                                                  */
/* -------------------------------------------------------------------------- */

export function Eyebrow({
  children,
  tone = "dark",
  className,
}: {
  children: React.ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "mk-eyebrow inline-flex items-center gap-3",
        tone === "light" ? "text-champagne-light" : "text-champagne-dark",
        className,
      )}
    >
      <span className="h-px w-8 bg-current opacity-60" aria-hidden />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "dark",
  align = "left",
  className,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: "dark" | "light";
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
}) {
  const light = tone === "light";
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center [&_.mk-eyebrow]:justify-center",
        className,
      )}
    >
      {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
      <Tag
        className={cn(
          "mt-5 font-display text-4xl leading-[1.05] font-normal tracking-tight text-balance sm:text-5xl lg:text-[3.5rem]",
          light ? "text-ivory" : "text-ink",
        )}
      >
        {title}
      </Tag>
      {description && (
        <p
          className={cn(
            "mt-6 text-base leading-relaxed text-pretty sm:text-lg",
            light ? "text-ivory/65" : "text-stone",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/** Italic champagne accent for headline words. */
export function Accent({ children }: { children: React.ReactNode }) {
  return <em className="font-display text-champagne italic">{children}</em>;
}

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10", className)}>
      {children}
    </div>
  );
}
