import { PORT_ROWS, PORTS_META } from "../data/ports.ts";

/**
 * The ports, and the sea between them.
 *
 * Until 2026-09-16 the site quoted four ports from a hand-written table of
 * six lanes. The API had been ingesting UN/LOCODE since the 11th — 2,272
 * seaports across the seven countries the site routes through — and using
 * none of it on screen. This module is where that data earns its keep: every
 * port that UN/LOCODE can place is selectable, and the lane figures the
 * pricing model needs (a distance, and from it a base rate and a transit
 * time) are derived from the coordinates rather than typed in.
 *
 * What is real: the ports, their names and their coordinates. What is a
 * model, and labelled so on the page: the route between them. A great circle
 * is the wrong sea distance — Tokyo to Rotterdam is about 5,000 nm as the
 * crow flies and about 11,000 nm as a ship goes — so the distance is summed
 * over the standard chokepoints between two regions (Singapore Strait, south
 * of Sri Lanka, Bab el-Mandeb, Suez, Gibraltar, the Channel), each leg a great
 * circle. That is a shipping-desk approximation, not a nautical routing, and
 * the copy says so.
 *
 * Nothing here imports a value except the generated snapshot, so the node
 * test runner executes it directly.
 */

export interface Port {
  code: string;
  country: string;
  name: string;
  lat: number;
  lon: number;
}

export { PORTS_META };

export const PORTS: readonly Port[] = PORT_ROWS.map(([code, name, lat, lon]) => ({
  code,
  country: code.slice(0, 2),
  name,
  lat,
  lon,
}));

const BY_CODE: ReadonlyMap<string, Port> = new Map(PORTS.map((p) => [p.code, p]));

export function portByCode(code: string): Port | undefined {
  return BY_CODE.get(code);
}

/** The port's name, or the code itself for one the snapshot does not know. */
export function portName(code: string): string {
  return BY_CODE.get(code)?.name ?? code;
}

export function isPortCode(code: string): boolean {
  return BY_CODE.has(code);
}

/** The countries in the snapshot, in the order the form lists them. */
export const COUNTRY_ORDER = ["JP", "KR", "TW", "SG", "LK", "AE", "NL"] as const;
export type Country = (typeof COUNTRY_ORDER)[number];

/**
 * The port the form lands on when a country is chosen: the country's main
 * container port where the snapshot places it, otherwise the first by name.
 * Taiwan's two big ones — Kaohsiung and Keelung — carry no coordinates in
 * the list, so Taiwan opens on Taipei.
 */
const FLAGSHIP: Record<string, string> = {
  JP: "JPTYO",
  KR: "KRPUS",
  TW: "TWTPE",
  SG: "SGSIN",
  LK: "LKCMB",
  AE: "AEAUH",
  NL: "NLRTM",
};

export function defaultPortIn(country: string): Port | undefined {
  return portByCode(FLAGSHIP[country] ?? "") ?? portsIn(country)[0];
}

export function portsIn(country: string): Port[] {
  return PORTS.filter((p) => p.country === country).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

// ── Sea distance ──────────────────────────────────────────────────────

const EARTH_RADIUS_NM = 3440.065;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in nautical miles, haversine. */
export function greatCircleNm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_NM * Math.asin(Math.sqrt(h));
}

/**
 * Sea regions, by country, and the chokepoints a ship passes between them.
 *
 * Seven countries fall into five regions. The waypoints are the places a
 * container ship actually has to pass — a strait, a canal, a cape — and
 * between consecutive waypoints the leg is a great circle, which at sea is
 * close enough. Two ports in the same region are joined directly.
 */
type Region = "eastAsia" | "seAsia" | "southAsia" | "gulf" | "europe";

const REGION: Record<string, Region> = {
  JP: "eastAsia",
  KR: "eastAsia",
  TW: "eastAsia",
  SG: "seAsia",
  LK: "southAsia",
  AE: "gulf",
  NL: "europe",
};

const WP = {
  singaporeStrait: { lat: 1.2, lon: 103.9 },
  dondraHead: { lat: 5.7, lon: 80.6 },
  hormuz: { lat: 26.5, lon: 56.5 },
  babElMandeb: { lat: 12.6, lon: 43.4 },
  suezSouth: { lat: 29.9, lon: 32.5 },
  portSaid: { lat: 31.3, lon: 32.3 },
  gibraltar: { lat: 36.0, lon: -5.6 },
  ushant: { lat: 48.5, lon: -5.5 },
  dover: { lat: 51.0, lon: 1.5 },
} as const;

type Waypoint = (typeof WP)[keyof typeof WP];

/** The Indian Ocean crossing and the run up to the North Sea, west-bound. */
const INDIAN_TO_EUROPE: readonly Waypoint[] = [
  WP.babElMandeb,
  WP.suezSouth,
  WP.portSaid,
  WP.gibraltar,
  WP.ushant,
  WP.dover,
];

/**
 * Waypoints from region A to region B, eastern region first. The table is
 * written one way and read both ways; a ship's route is the same in reverse.
 */
const ROUTE_WAYPOINTS: Partial<Record<`${Region}>${Region}`, readonly Waypoint[]>> = {
  "eastAsia>seAsia": [],
  "eastAsia>southAsia": [WP.singaporeStrait],
  "eastAsia>gulf": [WP.singaporeStrait, WP.dondraHead, WP.hormuz],
  "eastAsia>europe": [WP.singaporeStrait, WP.dondraHead, ...INDIAN_TO_EUROPE],
  "seAsia>southAsia": [],
  "seAsia>gulf": [WP.dondraHead, WP.hormuz],
  "seAsia>europe": [WP.dondraHead, ...INDIAN_TO_EUROPE],
  "southAsia>gulf": [WP.hormuz],
  "southAsia>europe": INDIAN_TO_EUROPE,
  "gulf>europe": [WP.hormuz, ...INDIAN_TO_EUROPE],
};

const REGION_ORDER: readonly Region[] = ["eastAsia", "seAsia", "southAsia", "gulf", "europe"];

function waypointsBetween(a: Region, b: Region): readonly Waypoint[] {
  if (a === b) return [];
  const forward = REGION_ORDER.indexOf(a) < REGION_ORDER.indexOf(b);
  const key = forward ? (`${a}>${b}` as const) : (`${b}>${a}` as const);
  const wps = ROUTE_WAYPOINTS[key] ?? [];
  return forward ? wps : [...wps].reverse();
}

/**
 * Sea distance in nautical miles between two ports, via the chokepoints
 * between their regions. Symmetric, and zero for a port against itself.
 */
export function seaDistanceNm(a: Port, b: Port): number {
  const legs = [a, ...waypointsBetween(REGION[a.country], REGION[b.country]), b];
  let nm = 0;
  for (let i = 1; i < legs.length; i++) nm += greatCircleNm(legs[i - 1], legs[i]);
  return Math.round(nm);
}

// ── What a lane derives from its distance ─────────────────────────────

/**
 * The base ocean rate, USD per 20' dry, as a line in the distance.
 *
 * Fitted to the six lanes the site used to carry by hand — Tokyo–Rotterdam
 * $2,480 over ~11,200 nm, Tokyo–Singapore $1,150 over ~2,900 — so the
 * numbers a reader saw last week are the numbers they see this week on
 * those lanes, and every other lane now has one too. Still a model: a
 * carrier's tariff is not a straight line, and the page says so.
 */
export const RATE_FIXED_USD = 686;
export const RATE_PER_NM_USD = 0.16;

export function laneBaseFromNm(nm: number): number {
  return Math.round(RATE_FIXED_USD + RATE_PER_NM_USD * nm);
}

/**
 * Transit in days: the distance at a service speed, plus a day in port.
 * Fifteen knots is a slow-steaming liner service, which is what the trade
 * has run at since fuel got expensive.
 */
export const SERVICE_SPEED_KNOTS = 15;

export function transitDaysFromNm(nm: number): number {
  return Math.ceil(nm / (SERVICE_SPEED_KNOTS * 24)) + 1;
}
