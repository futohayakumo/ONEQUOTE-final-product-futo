import type { PortCode } from "@/types/quote";

/**
 * Candidate sailings for a lane.
 *
 * Deterministic, and derived from the lane rather than stored per lane: three
 * hand-written options per lane would be six lanes' worth of fiction to keep
 * consistent, and the moment one drifts the screen is lying about its own
 * pricing. Everything here is a function of the lane key and the base rate, so
 * a direct sailing is always the mid option and the fast one always costs more.
 *
 * Vessel names are invented and generic on purpose. A real vessel name is a
 * real name.
 *
 * Nothing here imports a value. Type-only imports are erased by
 * --experimental-strip-types, so the node test runner can execute this file
 * directly -- the same reason processModel.ts has no runtime imports either.
 * That is why the lane key is spelled out below rather than pulled in from
 * pricing.ts.
 */
function laneKey(a: PortCode, b: PortCode): string {
  return [a, b].sort().join("|");
}

export interface Sailing {
  id: string;
  vessel: string;
  service: string;
  /** Days at sea, door to door. */
  transitDays: number;
  /** Departure offset in days from the cargo-ready date. */
  departsInDays: number;
  via: string | null;
  /** Multiplier applied to the ocean freight for this option. */
  rateFactor: number;
  recommended: boolean;
}

const NAMES = ["Ocean Link", "TransGlobal", "Pacific Star"] as const;

/** FNV-1a. Stable across runs, so the same lane always yields the same list. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

const BASE_TRANSIT: Record<string, number> = {
  "JPTYO|JPYOK": 1,
  "JPTYO|SGSIN": 12,
  "JPTYO|NLRTM": 32,
  "JPYOK|SGSIN": 12,
  "JPYOK|NLRTM": 31,
  "NLRTM|SGSIN": 24,
};

const HUBS = ["Busan", "Kaohsiung", "Colombo", "Jebel Ali"];

export function sailingsFor(pol: PortCode, pod: PortCode): Sailing[] {
  const key = laneKey(pol, pod);
  const base = BASE_TRANSIT[key] ?? 14;
  const seed = hash(key);

  return [
    {
      id: `${key}-direct`,
      vessel: `${NAMES[0]} ${101 + (seed % 40)}`,
      service: "Weekly service",
      transitDays: base,
      departsInDays: 0,
      via: null,
      rateFactor: 1,
      recommended: true,
    },
    {
      id: `${key}-transship`,
      vessel: `${NAMES[1]} ${201 + ((seed >> 5) % 40)}`,
      service: "Weekly service",
      transitDays: base + 3,
      departsInDays: 3,
      via: HUBS[seed % HUBS.length],
      rateFactor: 0.88,
      recommended: false,
    },
    {
      id: `${key}-express`,
      vessel: `${NAMES[2]} ${301 + ((seed >> 11) % 40)}`,
      service: "Fortnightly express",
      transitDays: Math.max(1, base - 2),
      departsInDays: 7,
      via: null,
      rateFactor: 1.12,
      recommended: false,
    },
  ];
}

/**
 * Dates are formatted from a fixed reference day, not from today. `new Date()`
 * during render is a hydration mismatch, and a portfolio whose sailing dates
 * quietly slide into the past reads as broken rather than as live.
 */
const REFERENCE = Date.UTC(2026, 8, 18);
const DAY = 86_400_000;

/*
 * Formatted from tables, not from toLocaleDateString.
 *
 * These strings render on the server and again in the browser. Node built
 * without full ICU falls back to a different set of month and weekday
 * abbreviations than Chrome ships, which is a hydration mismatch on every
 * sailing row — silent in development, and dependent on how the deploy
 * image was compiled. Three lines of table remove the dependency entirely.
 */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function sailingDate(offsetDays: number): string {
  const d = new Date(REFERENCE + offsetDays * DAY);
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${day} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function sailingWeekday(offsetDays: number): string {
  return WEEKDAYS[new Date(REFERENCE + offsetDays * DAY).getUTCDay()];
}

export interface SailingQuoteLine {
  label: string;
  detail: string | null;
  amount: number;
}

export interface SailingQuote {
  lines: SailingQuoteLine[];
  subtotal: number;
  discount: number;
  total: number;
}

/**
 * The invoice for one sailing.
 *
 * This exists because the list and the breakdown were computing the same total
 * two different ways, which is a defect waiting to be noticed by whoever adds
 * the third surcharge: the row would say one number and the panel below it
 * another. One function, two callers.
 */
export function quoteForSailing(
  quote: {
    oceanFreight: number;
    terminalHandling: number;
    documentation: number;
    bunkerAdjustment: number;
    discountRate: number;
    cbm: number;
    units: number;
    containerLabel: string;
  },
  sailing: Sailing,
): SailingQuote {
  const round = (x: number) => Math.round(x * 100) / 100;
  const lines: SailingQuoteLine[] = [
    {
      label: "Ocean freight",
      detail: `${quote.units} × ${quote.containerLabel}`,
      amount: round(quote.oceanFreight * sailing.rateFactor),
    },
    {
      label: "Terminal handling",
      detail: `${quote.cbm} CBM`,
      amount: quote.terminalHandling,
    },
    { label: "Documentation", detail: null, amount: quote.documentation },
    {
      label: "Bunker adjustment",
      detail: "12% of ocean freight",
      amount: round(quote.bunkerAdjustment * sailing.rateFactor),
    },
  ];
  const subtotal = round(lines.reduce((n, l) => n + l.amount, 0));
  const discount = round(subtotal * quote.discountRate);
  return { lines, subtotal, discount, total: round(subtotal - discount) };
}
