import { NODES } from "@/lib/flow-data";
import type { NodeId } from "@/types/flow";

/**
 * A synthetic trace for whatever route the map is currently showing.
 *
 * The comps draw a fixed six-hop timeline with fixed millisecond figures. Fixed
 * numbers under a diagram that re-routes on every click would be decoration —
 * the timeline would say the same thing about two different paths. So the
 * figures live per node here and the timeline is computed from the live route.
 *
 * Everything is pure and deterministic. No Date.now(), because these render on
 * the server too and a clock read during render is a hydration mismatch.
 */
const SERVICE_MS: Partial<Record<NodeId, number>> = {
  "new-request": 120,
  email: 240,
  "api-integration": 60,
  "request-intake": 95,
  validation: 40,
  "request-tracker": 55,
  "routing-gateway": 35,
  "quotation-service": 420,
  "campaign-service": 180,
  "notification-service": 90,
  "feature-flags": 12,
  "translation-api": 25,
  "erp-system": 580,
  "data-platform": 310,
  analytics: 140,
};

const DEFAULT_MS = 100;
/** 12:01:23.112 — a plausible wall clock, held constant so it never drifts. */
const BASE_MS = 12 * 3_600_000 + 1 * 60_000 + 23 * 1000 + 112;

export interface TraceHop {
  id: NodeId;
  label: string;
  /** 1-based, as shown. */
  hop: number;
  /** Wall clock at entry, hh:mm:ss. */
  at: string;
  /** Time spent in this service. Null on the final hop — nothing follows it. */
  ms: number | null;
}

function clock(msSinceMidnight: number, withMillis = false): string {
  const total = Math.floor(msSinceMidnight / 1000);
  const hh = String(Math.floor(total / 3600) % 24).padStart(2, "0");
  const mm = String(Math.floor(total / 60) % 60).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  if (!withMillis) return `${hh}:${mm}:${ss}`;
  return `${hh}:${mm}:${ss}.${String(Math.floor(msSinceMidnight) % 1000).padStart(3, "0")}`;
}

export function buildTrace(route: readonly NodeId[]): TraceHop[] {
  let t = BASE_MS;
  return route.map((id, i) => {
    const ms = SERVICE_MS[id] ?? DEFAULT_MS;
    const hop: TraceHop = {
      id,
      label: NODES[id].label,
      hop: i + 1,
      at: clock(t),
      ms: i === route.length - 1 ? null : ms,
    };
    t += ms;
    return hop;
  });
}

export function totalMs(route: readonly NodeId[]): number {
  return route
    .slice(0, -1)
    .reduce((n, id) => n + (SERVICE_MS[id] ?? DEFAULT_MS), 0);
}

export interface LogLine {
  at: string;
  level: "INFO" | "WARN";
  message: string;
  detail?: string;
}

/** The request log for one route, in the order the services actually ran. */
export function buildLog(route: readonly NodeId[]): LogLine[] {
  const lines: LogLine[] = [];
  let t = BASE_MS;
  const push = (message: string, detail?: string) => {
    lines.push({ at: clock(t, true), level: "INFO", message, detail });
  };

  push("Received quotation request", "requestId=6f3a2b9c");
  route.forEach((id, i) => {
    const ms = SERVICE_MS[id] ?? DEFAULT_MS;
    t += 6;
    push(`Entering ${NODES[id].label}`, i === 0 ? "channel=portal" : undefined);
    t += ms;
    if (i < route.length - 1) {
      push(`${NODES[id].label} responded`, `duration=${ms}ms`);
    }
  });
  push("Request completed", `duration=${totalMs(route)}ms  status=200`);
  return lines;
}
