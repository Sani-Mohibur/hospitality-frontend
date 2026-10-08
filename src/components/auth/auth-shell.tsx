import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Eyebrow, Logo } from "@/components/home/primitives";

/**
 * Split-screen frame shared by the Login and Signup pages.
 * Left: dark editorial brand panel in the /home visual language (lg+ only).
 * Right: calm ivory form surface.
 */
export function AuthShell({
  image,
  imageAlt,
  eyebrow,
  headline,
  aside,
  children,
  fullBleedImage,
}: {
  image: StaticImageData;
  imageAlt: string;
  eyebrow: string;
  headline: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
  fullBleedImage?: boolean;
}) {
  return (
    <div className="grid min-h-screen bg-ivory font-body text-ink antialiased selection:bg-champagne-light selection:text-ink lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Brand panel */}
      <aside className="mk-grain relative hidden overflow-hidden bg-espresso text-ivory lg:flex lg:flex-col">
        {fullBleedImage ? (
          <>
            <Image
              src={image}
              alt={imageAlt}
              fill
              placeholder="blur"
              sizes="50vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/60 to-espresso/20" />
          </>
        ) : (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute -top-40 -right-40 size-[34rem] rounded-full bg-champagne/15 blur-[140px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-48 -left-40 size-[30rem] rounded-full bg-forest/50 blur-[140px]"
            />
          </>
        )}

        <div className="relative flex flex-1 flex-col px-12 py-10 xl:px-16 z-10">
          <Logo tone="light" />

          <div className="mt-auto pt-12">
            {!fullBleedImage && (
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[17rem] rounded-t-full border border-champagne/25 p-2 animate-in fade-in zoom-in-95 duration-1000 xl:max-w-[19rem]">
                <div className="relative size-full overflow-hidden rounded-t-full">
                  <Image
                    src={image}
                    alt={imageAlt}
                    fill
                    placeholder="blur"
                    sizes="(min-width: 1280px) 19rem, 17rem"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/10 to-transparent" />
                </div>
              </div>
            )}

            <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Eyebrow tone="light">{eyebrow}</Eyebrow>
              <p className="mt-5 max-w-md font-display text-4xl leading-[1.08] tracking-tight text-balance xl:text-[2.75rem]">
                {headline}
              </p>
            </div>

            {aside && <div className="mt-10 border-t border-ivory/10 pt-8">{aside}</div>}
          </div>
        </div>
      </aside>

      {/* Form surface */}
      <main className="relative flex flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 size-80 rounded-full bg-champagne-light/25 blur-[120px]"
        />
        <header className="relative flex h-20 items-center justify-between px-5 sm:px-10">
          <Logo className="lg:invisible" />
          <Link
            href="/home"
            className="group inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.8rem] font-medium tracking-wide text-umber transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-champagne focus-visible:outline-none"
          >
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            Back to site
          </Link>
        </header>

        <div className="relative flex flex-1 items-center justify-center px-5 pt-4 pb-16 sm:px-10">
          <div className="w-full max-w-[26rem] animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </div>

        <footer className="relative px-5 pb-8 text-center text-[0.72rem] tracking-wide text-stone sm:px-10">
          © {new Date().getFullYear()} Hospitality OS · Hotel · Restaurant · POS
        </footer>
      </main>
    </div>
  );
}

/** Page title block used at the top of each auth form. */
export function AuthHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: React.ReactNode;
}) {
  return (
    <div className="mb-9">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-4 font-display text-[2.4rem] leading-[1.05] tracking-tight text-ink sm:text-[2.75rem]">
        {title}
      </h1>
      <p className="mt-3 text-[0.95rem] leading-relaxed text-stone">{description}</p>
    </div>
  );
}
