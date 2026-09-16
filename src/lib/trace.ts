/**
 * A synthetic trace for whatever route the map is currently showing.
 *
 * The comps draw a fixed six-hop timeline with fixed millisecond figures.
 * Fixed numbers under a diagram that re-routes on every click would be
 * decoration — the timeline would say the same thing about two different
 * paths. So the figures live per node here and everything is computed from the
 * live route.
 *
 * ONE WALK PRODUCES EVERYTHING. An earlier version had `buildTrace`,
 * `buildLog` and `totalMs` each advancing their own clock, and they disagreed:
 * the log's own timestamps spanned 854 ms while the line beneath them printed
 * `duration=250ms`, because the log charged transport between hops and the
 * total did not, and because the total dropped the final hop that the log
 * still waited for. Two formulas for one figure is two figures. Everything
 * below now comes out of `buildTrace` and nothing recomputes it.
 *
 * Nothing here imports a value — labels are passed in — so the node test
 * runner can execute this file directly, the same reason processModel.ts and
 * sailings.ts have no runtime imports either.
 */

/** Time in a service. Keys are NodeIds; typed loosely so this file stays free. */
const SERVICE_MS: Record<string, number> = {
  "web-app": 120,
  "node-gateway": 35,
  "feature-flags": 12,
  translation: 25,
  booking: 420,
  oog: 380,
  premium: 90,
  "osl-plus": 90,
  dnd: 110,
  pudo: 90,
  campaigns: 180,
  coupons: 70,
  "price-alerts": 140,
  "notify-me": 90,
  "missing-route": 120,
  apigee: 60,
  schedule: 310,
  space: 340,
  "rate-engine": 580,
  "opus-booking": 450,
  bigquery: 15,
};

const DEFAULT_MS = 100;
/** Cost of getting from one service to the next. Small, but not free. */
const TRANSPORT_MS = 6;
/** 12:01:23.112 — a plausible wall clock, held constant so it never drifts. */
const BASE_MS = 12 * 3_600_000 + 1 * 60_000 + 23 * 1000 + 112;

export interface TraceHop {
  id: string;
  label: string;
  /** 1-based, as shown. */
  hop: number;
  /** Wall clock at entry, to the millisecond. Truncating to whole seconds
   *  made every hop of a 250 ms request render the same string. */
  at: string;
  /** Time spent inside this service. */
  ms: number;
  /** Entry, as milliseconds from the first entry. The journey track reads
   *  this to run its clock, so it comes from the same walk as everything else
   *  rather than being re-added from `ms` somewhere that forgets transport. */
  offsetMs: number;
}

export interface LogLine {
  at: string;
  message: string;
  detail?: string;
  /** The closing line. The only one that carries Terminal Green. */
  final?: boolean;
}

export interface Trace {
  hops: TraceHop[];
  log: LogLine[];
  /** Entry of the first service to completion of the last. */
  totalMs: number;
}

function clock(ms: number): string {
  const total = Math.floor(ms / 1000);
  const hh = String(Math.floor(total / 3600) % 24).padStart(2, "0");
  const mm = String(Math.floor(total / 60) % 60).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}.${String(Math.floor(ms) % 1000).padStart(3, "0")}`;
}

export function serviceMs(id: string): number {
  return SERVICE_MS[id] ?? DEFAULT_MS;
}

export function buildTrace(
  route: readonly string[],
  labelOf: (id: string) => string,
): Trace {
  const hops: TraceHop[] = [];
  const log: LogLine[] = [];
  let t = BASE_MS;
  const start = t;

  log.push({ at: clock(t), message: "Received request", detail: "requestId=6f3a2b9c" });

  route.forEach((id, i) => {
    if (i > 0) t += TRANSPORT_MS;
    hops.push({
      id,
      label: labelOf(id),
      hop: i + 1,
      at: clock(t),
      ms: serviceMs(id),
      offsetMs: t - start,
    });
    log.push({
      at: clock(t),
      message: `Entering ${labelOf(id)}`,
      detail: i === 0 ? "channel=portal" : undefined,
    });
    t += serviceMs(id);
    log.push({
      at: clock(t),
      message: `${labelOf(id)} responded`,
      detail: `duration=${serviceMs(id)}ms`,
    });
  });

  const totalMs = t - start;
  log.push({
    at: clock(t),
    message: "Request completed",
    detail: `duration=${totalMs}ms  status=200`,
    final: true,
  });

  return { hops, log, totalMs };
}
