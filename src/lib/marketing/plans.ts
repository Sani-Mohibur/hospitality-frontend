/**
 * Static catalogue for the public website (/home).
 * Package codes intentionally mirror the platform module codes used in the
 * Super Admin ("HOSPITALITY" / "RESTAURANT") so this can later be fed by the API.
 */

export type PackageId = "hotel" | "restaurant" | "suite";
export type TierId = "essentials" | "professional" | "enterprise";
export type BillingCycle = "monthly" | "annual";

export const ANNUAL_DISCOUNT = 0.2;
export const TRIAL_DAYS = 14;

export interface PackageInfo {
  id: PackageId;
  name: string;
  shortName: string;
  tagline: string;
  modules: ("HOSPITALITY" | "RESTAURANT")[];
}

export const PACKAGES: Record<PackageId, PackageInfo> = {
  hotel: {
    id: "hotel",
    name: "Hotel Management",
    shortName: "Hotel",
    tagline: "Front desk, reservations, guests and folios.",
    modules: ["HOSPITALITY"],
  },
  restaurant: {
    id: "restaurant",
    name: "Restaurant Management",
    shortName: "Restaurant",
    tagline: "POS, tables, kitchen display and menus.",
    modules: ["RESTAURANT"],
  },
  suite: {
    id: "suite",
    name: "Hotel + Restaurant Suite",
    shortName: "Hotel + Restaurant",
    tagline: "Both platforms, unified on one guest folio.",
    modules: ["HOSPITALITY", "RESTAURANT"],
  },
};

export const PACKAGE_ORDER: PackageId[] = ["hotel", "restaurant", "suite"];

export interface Tier {
  id: TierId;
  name: string;
  description: string;
  /** Monthly price in USD; null = custom / contact sales */
  monthly: number | null;
  highlight?: boolean;
  features: string[];
}

export const TIERS: Record<PackageId, Tier[]> = {
  hotel: [
    {
      id: "essentials",
      name: "Essentials",
      description: "For boutique hotels and guesthouses getting organised.",
      monthly: 149,
      features: [
        "Up to 40 rooms · 1 property",
        "Front desk & live room board",
        "Reservation calendar",
        "Guest directory & profiles",
        "Guest folios & invoicing",
        "5 staff accounts",
        "Email support",
      ],
    },
    {
      id: "professional",
      name: "Professional",
      description: "For established hotels running multiple departments.",
      monthly: 299,
      highlight: true,
      features: [
        "Up to 200 rooms · 3 properties",
        "Everything in Essentials",
        "Housekeeping & room status workflow",
        "Room categories & rate configuration",
        "Card payments on folios",
        "Inventory & stock control",
        "Unlimited staff · role permissions",
        "Audit logs & priority support",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For groups and resorts with complex portfolios.",
      monthly: null,
      features: [
        "Unlimited rooms & properties",
        "Everything in Professional",
        "Group-level reporting",
        "Custom integrations & API access",
        "Dedicated success manager",
        "99.9% uptime SLA",
      ],
    },
  ],
  restaurant: [
    {
      id: "essentials",
      name: "Essentials",
      description: "For cafés, bistros and single-site restaurants.",
      monthly: 99,
      features: [
        "1 location · up to 20 tables",
        "POS terminal & order taking",
        "Floor plan & table status",
        "Menu builder with modifiers",
        "1 kitchen display (KDS)",
        "Card & cash payments",
        "5 staff accounts",
      ],
    },
    {
      id: "professional",
      name: "Professional",
      description: "For busy dining rooms and growing restaurant groups.",
      monthly: 199,
      highlight: true,
      features: [
        "Up to 3 locations · unlimited tables",
        "Everything in Essentials",
        "Multiple KDS stations & routing",
        "Split bills, tips & discounts",
        "Ingredient-level inventory",
        "Sales & menu performance reports",
        "Unlimited staff · role permissions",
        "Audit logs & priority support",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For multi-brand groups and franchise operators.",
      monthly: null,
      features: [
        "Unlimited locations",
        "Everything in Professional",
        "Central menu management",
        "Custom integrations & API access",
        "Dedicated success manager",
        "99.9% uptime SLA",
      ],
    },
  ],
  suite: [
    {
      id: "essentials",
      name: "Essentials",
      description: "A hotel with an in-house restaurant, beautifully connected.",
      monthly: 219,
      features: [
        "Hotel Essentials + Restaurant Essentials",
        "Charge-to-room from the POS",
        "Unified guest profiles",
        "Single consolidated folio",
        "Shared staff accounts (10)",
        "Email support",
      ],
    },
    {
      id: "professional",
      name: "Professional",
      description: "Full-service properties with multiple outlets.",
      monthly: 429,
      highlight: true,
      features: [
        "Hotel Pro + Restaurant Pro",
        "Everything in Suite Essentials",
        "Multi-outlet dining & room service",
        "Shared inventory & purchasing",
        "Consolidated property reporting",
        "Unlimited staff · role permissions",
        "Audit logs & priority support",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Resorts and hospitality groups at scale.",
      monthly: null,
      features: [
        "Unlimited properties & outlets",
        "Everything in Suite Professional",
        "Group-level analytics",
        "Custom integrations & API access",
        "Dedicated success manager",
        "99.9% uptime SLA",
      ],
    },
  ],
};

export function getTier(pkg: PackageId, tier: TierId): Tier {
  return TIERS[pkg].find((t) => t.id === tier) ?? TIERS[pkg][1];
}

/** Effective monthly price for the selected billing cycle. */
export function priceFor(monthly: number, cycle: BillingCycle): number {
  return cycle === "annual" ? Math.round(monthly * (1 - ANNUAL_DISCOUNT)) : monthly;
}

/** Percentage saved by the suite versus buying both packages separately. */
export function suiteSavings(tier: TierId): number | null {
  const h = getTier("hotel", tier).monthly;
  const r = getTier("restaurant", tier).monthly;
  const s = getTier("suite", tier).monthly;
  if (!h || !r || !s) return null;
  return Math.round((1 - s / (h + r)) * 100);
}

export function isPackageId(v: unknown): v is PackageId {
  return v === "hotel" || v === "restaurant" || v === "suite";
}
export function isTierId(v: unknown): v is TierId {
  return v === "essentials" || v === "professional" || v === "enterprise";
}
export function isBillingCycle(v: unknown): v is BillingCycle {
  return v === "monthly" || v === "annual";
}

export function checkoutHref(pkg: PackageId, tier: TierId, cycle: BillingCycle) {
  return `/home/checkout?package=${pkg}&tier=${tier}&cycle=${cycle}`;
}

export const SALES_EMAIL = "sales@hospitalityos.com";

/* -------------------------------------------------------------------------- */
/* Package comparison (compared at Professional tier)                          */
/* -------------------------------------------------------------------------- */

export type CompareValue = boolean | string;

export interface CompareGroup {
  title: string;
  rows: { label: string; values: Record<PackageId, CompareValue> }[];
}

export const COMPARISON: CompareGroup[] = [
  {
    title: "Hotel operations",
    rows: [
      { label: "Front desk & live room board", values: { hotel: true, restaurant: false, suite: true } },
      { label: "Reservation calendar & timeline", values: { hotel: true, restaurant: false, suite: true } },
      { label: "Guest directory & profiles", values: { hotel: true, restaurant: "Diners only", suite: "Unified" } },
      { label: "Guest folios & itemised billing", values: { hotel: true, restaurant: false, suite: true } },
      { label: "Housekeeping & room status", values: { hotel: true, restaurant: false, suite: true } },
      { label: "Rooms included", values: { hotel: "200", restaurant: "—", suite: "200" } },
    ],
  },
  {
    title: "Restaurant & POS",
    rows: [
      { label: "POS terminal & order taking", values: { hotel: false, restaurant: true, suite: true } },
      { label: "Floor plan & table management", values: { hotel: false, restaurant: true, suite: true } },
      { label: "Kitchen display system (KDS)", values: { hotel: false, restaurant: "Multi-station", suite: "Multi-station" } },
      { label: "Menu builder with modifiers", values: { hotel: false, restaurant: true, suite: true } },
      { label: "Split bills, tips & discounts", values: { hotel: false, restaurant: true, suite: true } },
      { label: "Charge-to-room from any outlet", values: { hotel: false, restaurant: false, suite: true } },
    ],
  },
  {
    title: "Platform",
    rows: [
      { label: "Locations / properties", values: { hotel: "3", restaurant: "3", suite: "3" } },
      { label: "Staff accounts & role permissions", values: { hotel: "Unlimited", restaurant: "Unlimited", suite: "Unlimited" } },
      { label: "Inventory & stock control", values: { hotel: true, restaurant: "Ingredient-level", suite: "Shared" } },
      { label: "Real-time notifications", values: { hotel: true, restaurant: true, suite: true } },
      { label: "Secure card payments", values: { hotel: true, restaurant: true, suite: true } },
      { label: "Audit logs", values: { hotel: true, restaurant: true, suite: true } },
      { label: "Consolidated reporting", values: { hotel: false, restaurant: false, suite: true } },
      { label: "Support", values: { hotel: "Priority", restaurant: "Priority", suite: "Priority" } },
    ],
  },
];
