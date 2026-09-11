import type { PortCode } from "@/types/quote";

/**
 * The schedule for a lane: eight weeks of sailings, three services.
 *
 * Deterministic and derived from the lane rather than stored per lane. The
 * real ONE QUOTE form opens a calendar on which only vessel-available dates
 * are selectable, each with a price; the options page then lists what sails
 * from the chosen date. That needs a schedule, not three hand-written rows,
 * so every lane gets a weekly direct service, a weekly service via a hub,
 * and a fortnightly express, laid out over a fixed window.
 *
 * Vessel names, service lanes and voyage numbers are invented and generic on
 * purpose. A real vessel name is a real name.
 *
 * Nothing here imports a value. Type-only imports are erased by
 * --experimental-strip-types, so the node test runner can execute this file
 * directly. That is why the lane key is spelled out below rather than pulled
 * in from pricing.ts.
 */
function laneKey(a: PortCode, b: PortCode): string {
  return [a, b].sort().join("|");
}

export type SailingStatus = "available" | "waitlist";

export interface Sailing {
  id: string;
  /** Which of the three services it belongs to. */
  serviceId: "direct" | "transship" | "express";
  /** The service lane code as a carrier prints it, e.g. "JSX". */
  serviceLane: string;
  serviceKey: string;
  vessel: string;
  voyage: string;
  /** Days at sea, port to port. */
  transitDays: number;
  /** Departure, as days from the schedule's reference day. */
  etdOffset: number;
  via: string | null;
  /** Multiplier applied to the base ocean freight for this option. */
  rateFactor: number;
  status: SailingStatus;
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

/** Days the schedule covers, from the reference day. */
export const SCHEDULE_DAYS = 56;

/**
 * The full schedule for a lane, sorted by departure.
 *
 * Three services, each on its own cadence. A fortnightly express that sails
 * on the day a customer wants is worth more than a direct that sails three
 * days later, and the list has to be able to show that.
 */
export function scheduleFor(pol: PortCode, pod: PortCode): Sailing[] {
  const key = laneKey(pol, pod);
  const base = BASE_TRANSIT[key] ?? 14;
  const seed = hash(key);
  const lane = `${pol.slice(2, 3)}${pod.slice(2, 3)}`;

  const out: Sailing[] = [];
  const push = (
    serviceId: Sailing["serviceId"],
    etdOffset: number,
    n: number,
  ) => {
    const spec = {
      direct: {
        lane: `${lane}X`,
        serviceKey: "service.weekly",
        vessel: `${NAMES[0]} ${101 + (seed % 40)}`,
        transit: base,
        via: null,
        factor: 1,
      },
      transship: {
        lane: `${lane}T`,
        serviceKey: "service.weekly",
        vessel: `${NAMES[1]} ${201 + ((seed >> 5) % 40)}`,
        transit: base + 3,
        via: HUBS[seed % HUBS.length],
        factor: 0.88,
      },
      express: {
        lane: `${lane}E`,
        serviceKey: "service.fortnightlyExpress",
        vessel: `${NAMES[2]} ${301 + ((seed >> 11) % 40)}`,
        transit: Math.max(1, base - 2),
        via: null,
        factor: 1.12,
      },
    }[serviceId];
    const id = `${key}-${serviceId}-${etdOffset}`;
    out.push({
      id,
      serviceId,
      serviceLane: spec.lane,
      serviceKey: spec.serviceKey,
      vessel: spec.vessel,
      voyage: `${100 + (hash(id) % 800)}${spec.via ? "S" : "E"}`,
      transitDays: spec.transit,
      etdOffset,
      via: spec.via,
      rateFactor: spec.factor,
      // Every fifth departure is oversubscribed. The real page shows a
      // status per option; a list on which everything is available would
      // hide that the field exists.
      status: n % 5 === 4 ? "waitlist" : "available",
      recommended: false,
    });
  };

  for (let d = 0, n = 0; d < SCHEDULE_DAYS; d += 7, n += 1) push("direct", d, n);
  for (let d = 3, n = 0; d < SCHEDULE_DAYS; d += 7, n += 1) push("transship", d, n);
  for (let d = 7, n = 0; d < SCHEDULE_DAYS; d += 14, n += 1) push("express", d, n);

  out.sort((a, b) => a.etdOffset - b.etdOffset || a.transitDays - b.transitDays);
  return out;
}

/** The departure days a customer can pick — what the calendar marks. */
export function availableEtdOffsets(pol: PortCode, pod: PortCode): number[] {
  return [...new Set(scheduleFor(pol, pod).map((s) => s.etdOffset))].sort(
    (a, b) => a - b,
  );
}

/**
 * The options page for a chosen departure: everything sailing within two
 * weeks from that day, the cheapest available direct marked as recommended.
 */
export function optionsFrom(
  pol: PortCode,
  pod: PortCode,
  etdOffset: number,
): Sailing[] {
  const list = scheduleFor(pol, pod).filter(
    (s) => s.etdOffset >= etdOffset && s.etdOffset < etdOffset + 14,
  );
  const rec =
    list.find((s) => s.status === "available" && s.serviceId === "direct") ??
    list.find((s) => s.status === "available") ??
    list[0];
  return list.map((s) => (s === rec ? { ...s, recommended: true } : s));
}

/**
 * Dates are formatted from a fixed reference day, not from today. `new Date()`
 * during render is a hydration mismatch, and a portfolio whose sailing dates
 * quietly slide into the past reads as broken rather than as live.
 */
export const REFERENCE = Date.UTC(2026, 8, 18);
const DAY = 86_400_000;

/** The instant a schedule day falls on. */
export function sailingAt(offsetDays: number): number {
  return REFERENCE + offsetDays * DAY;
}

/**
 * Cut-offs, counted back from departure, in the order the real detail panel
 * lists them: documentation, then the port's container-yard gate, then VGM.
 */
export interface CutOff {
  id: "documentation" | "cy" | "vgm";
  labelKey: string;
  detailKey: string;
  offsetDays: number;
}

export function cutOffsFor(sailing: Sailing): CutOff[] {
  return [
    {
      id: "documentation",
      labelKey: "cutoff.documentation",
      detailKey: "cutoff.documentationDetail",
      offsetDays: sailing.etdOffset - 3,
    },
    {
      id: "cy",
      labelKey: "cutoff.cy",
      detailKey: "cutoff.cyDetail",
      offsetDays: sailing.etdOffset - 2,
    },
    {
      id: "vgm",
      labelKey: "cutoff.vgm",
      detailKey: "cutoff.vgmDetail",
      offsetDays: sailing.etdOffset - 1,
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
  const first = Math.round(sailing.transitDays * 0.55);
  return [
    { from: pol, to: sailing.via, days: first },
    { from: sailing.via, to: pod, days: sailing.transitDays - first },
  ];
}

/**
 * The timeline the detail toggle shows: the three cut-offs, departure, the
 * transhipment call if any, and arrival — each as a day on the schedule.
 */
export interface TimelineEvent {
  id: string;
  labelKey: string;
  /** A port or hub name to print beside the label, where one applies. */
  place?: string;
  offsetDays: number;
}

export function timelineFor(
  sailing: Sailing,
  pol: string,
  pod: string,
): TimelineEvent[] {
  const events: TimelineEvent[] = cutOffsFor(sailing).map((c) => ({
    id: `cutoff-${c.id}`,
    labelKey: c.labelKey,
    offsetDays: c.offsetDays,
  }));
  events.push({
    id: "departure",
    labelKey: "timeline.departure",
    place: pol,
    offsetDays: sailing.etdOffset,
  });
  const legs = legsFor(sailing, pol, pod);
  if (sailing.via) {
    events.push({
      id: "transhipment",
      labelKey: "timeline.transhipment",
      place: sailing.via,
      offsetDays: sailing.etdOffset + legs[0].days,
    });
  }
  events.push({
    id: "arrival",
    labelKey: "timeline.arrival",
    place: pod,
    offsetDays: sailing.etdOffset + sailing.transitDays,
  });
  return events;
}

/** "154E" — the voyage as the schedule prints it. */
export function voyageLabel(sailing: Sailing): string {
  return sailing.voyage;
}
