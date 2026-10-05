"use client";

import { useSyncExternalStore } from "react";

/**
 * Mock visitor session for the public website.
 * Stored in localStorage so the "sign in before purchase" flow can be demoed
 * end-to-end without a backend. Replace with the real auth API later.
 */

const STORAGE_KEY = "hos.marketing.session";

export interface MarketingSession {
  name: string;
  email: string;
  business?: string;
}

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedSession: MarketingSession | null = null;

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot(): MarketingSession | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedSession = raw ? (JSON.parse(raw) as MarketingSession) : null;
    } catch {
      cachedSession = null;
    }
  }
  return cachedSession;
}

function getServerSnapshot(): MarketingSession | null {
  return null;
}

export function signIn(session: MarketingSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  emit();
}

export function signOut() {
  window.localStorage.removeItem(STORAGE_KEY);
  emit();
}

export function useMarketingSession() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const noopSubscribe = () => () => {};

/** `false` during SSR / hydration, `true` once running on the client. */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** Only allow internal redirects within the public website. */
export function safeNext(next: string | undefined | null, fallback = "/home/pricing") {
  if (next && next.startsWith("/home") && !next.startsWith("//")) return next;
  return fallback;
}

export function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "Guest";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}
