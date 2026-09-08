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

/**
 * The instant a sailing date falls on.
 *
 * Formatting moved to localeFormat.ts. How a language writes a date — the
 * order of the parts, the month's name — is a translation decision, and a
 * pure pricing model has no business holding one. This returns the moment;
 * the bundle says how to write it.
 */
export function sailingAt(offsetDays: number): number {
  return REFERENCE + offsetDays * DAY;
}


export interface SailingQuoteLine {
  labelKey: string;
  detailKey: string | null;
  detailVars?: Record<string, string | number>;
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
      labelKey: "sailingQuote.ocean",
      detailKey: "sailingQuote.units",
      detailVars: { units: quote.units, container: quote.containerLabel },
      amount: round(quote.oceanFreight * sailing.rateFactor),
    },
    {
      labelKey: "sailingQuote.thc",
      detailKey: "sailingQuote.cbm",
      detailVars: { cbm: quote.cbm },
      amount: quote.terminalHandling,
    },
    {
      labelKey: "sailingQuote.doc",
      detailKey: null,
      amount: quote.documentation,
    },
    {
      labelKey: "sailingQuote.baf",
      detailKey: "sailingQuote.bafBasis",
      detailVars: { pct: 12 },
      amount: round(quote.bunkerAdjustment * sailing.rateFactor),
    },
  ];
  const subtotal = round(lines.reduce((n, l) => n + l.amount, 0));
  const discount = round(subtotal * quote.discountRate);
  return { lines, subtotal, discount, total: round(subtotal - discount) };
}

/**
 * The dates a shipper actually plans against.
 *
 * A route panel that shows only ETD and ETA is missing the part that binds:
 * the cut-offs. Miss the documentation cut-off and the booking rolls to the
 * next sailing regardless of how much transit time was left, which is why
 * these sit beside the ETD rather than in a footnote.
 *
 * Offsets are the ordinary liner pattern, counted back from departure.
 */
export interface CutOff {
  labelKey: string;
  detailKey: string;
  offsetDays: number;
}

export function cutOffsFor(sailing: Sailing): CutOff[] {
  return [
    {
      labelKey: "cutoff.documentation",
      detailKey: "cutoff.documentationDetail",
      offsetDays: sailing.departsInDays - 3,
    },
    {
      labelKey: "cutoff.vgm",
      detailKey: "cutoff.vgmDetail",
      offsetDays: sailing.departsInDays - 2,
    },
    {
      labelKey: "cutoff.cargo",
      detailKey: "cutoff.cargoDetail",
      offsetDays: sailing.departsInDays - 1,
    },
  ];
}

/** Legs, so a transhipment sailing shows where the time actually goes. */
export interface Leg {
  from: string;
  to: string;
  days: number;
}

export function legsFor(sailing: Sailing, pol: string, pod: string): Leg[] {
  if (!sailing.via) return [{ from: pol, to: pod, days: sailing.transitDays }];
  // Transhipment splits roughly two-thirds of the way, plus the days the box
  // spends on the quay waiting for the connecting vessel.
  const first = Math.round(sailing.transitDays * 0.55);
  return [
    { from: pol, to: sailing.via, days: first },
    { from: sailing.via, to: pod, days: sailing.transitDays - first },
  ];
}

/** Voyage number. Deterministic, so the same sailing always reports the same. */
export function voyageOf(sailing: Sailing): string {
  const n = 100 + (hash(sailing.id) % 800);
  return `${n}${sailing.via ? "S" : "E"}`;
}
