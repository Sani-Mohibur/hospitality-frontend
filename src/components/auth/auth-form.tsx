"use client";

import { useId, useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ctaClass } from "@/components/home/primitives";

type AuthFieldProps = Omit<React.ComponentProps<"input">, "id"> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trailingLabel?: React.ReactNode;
};

/** Labelled input with icon, hint, inline error and password reveal. */
export function AuthField({
  id,
  label,
  error,
  hint,
  icon: Icon,
  trailingLabel,
  type = "text",
  className,
  ...props
}: AuthFieldProps) {
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[0.8rem] font-semibold tracking-wide text-umber">
          {label}
        </label>
        {trailingLabel}
      </div>
      <div className="group relative">
        {Icon && (
          <Icon
            className={cn(
              "pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 transition-colors",
              error ? "text-bordeaux" : "text-stone/70 group-focus-within:text-champagne-dark",
            )}
          />
        )}
        <input
          id={id}
          type={isPassword && reveal ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-12 w-full rounded-xl border bg-white/80 text-[0.95rem] text-ink shadow-[0_1px_0_rgba(20,17,14,0.03)] transition-all duration-200 outline-none placeholder:text-stone/50",
            "hover:border-ink/20 focus:border-champagne focus:bg-white focus:ring-4 focus:ring-champagne/15",
            "disabled:cursor-not-allowed disabled:opacity-60",
            Icon ? "pl-11" : "pl-4",
            isPassword ? "pr-12" : "pr-4",
            error
              ? "border-bordeaux/60 focus:border-bordeaux focus:ring-bordeaux/10"
              : "border-ink/10",
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? "Hide password" : "Show password"}
            aria-pressed={reveal}
            aria-controls={id}
            className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-stone transition-colors hover:bg-ink/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-champagne focus-visible:outline-none"
          >
            {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-[0.78rem] text-bordeaux">
          <AlertCircle className="size-3.5 shrink-0" /> {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[0.78rem] text-stone">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Form-level error banner (server/API errors). */
export function AuthAlert({ message }: { message: string }) {
  const id = useId();
  if (!message) return null;
  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      className="flex items-start gap-3 rounded-xl border border-bordeaux/20 bg-bordeaux/[0.06] px-4 py-3.5 text-[0.85rem] leading-snug text-bordeaux animate-in fade-in slide-in-from-top-1 duration-300"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/** Full-width primary submit button with loading state. */
export function AuthSubmit({
  loading,
  loadingLabel,
  children,
}: {
  loading: boolean;
  loadingLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      className={ctaClass(
        "dark",
        "lg",
        "group w-full cursor-pointer disabled:cursor-wait disabled:opacity-80 focus-visible:ring-4 focus-visible:ring-champagne/40",
      )}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden /> {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
