import type { VasSelection } from "./vas";
import type { Commodity, ContainerRow, LoyaltyTier, PortCode, Scope } from "@/types/quote";

/**
 * The quotation service, when it is there.
 *
 * The site prices every shipment itself, in the browser, with a pure
 * function. The service runs the same function behind HTTP and adds what the
 * browser cannot have: an exchange rate the ECB actually published, with its
 * date, and a stored record. So the call is strictly additive — nothing on
 * the screen waits for it, nothing changes if it fails, and a static export
 * on a host with no API is the same page minus one line.
 *
 * Three seconds, then we stop waiting. The service asks the ECB live for
 * every quotation, and that round trip is most of the wait; the ticket is
 * already on screen, so the wait costs one line arriving late. A portfolio
 * that hangs on a service that is not running is worse than one that says
 * it is not, so the wait is bounded.
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

const TIMEOUT_MS = 3000;

export interface Sourced<T> {
  value: T;
  source: string;
  /** The date the source published the figure, ISO day. */
  asOf: string;
  /** When the service pulled it, ISO instant. */
  fetchedAt: string;
  url: string;
}

/** `live` — the ECB answered for this request. `cached` — the stored rate served, and the response says why. */
export type RateMode = "live" | "cached";

export interface RemoteQuotation {
  reference: string;
  selected: { sailingId: string; allIn: number; payable: number };
  alsoIn: Record<string, Sourced<number>>;
  provenance: {
    pricing: { source: string };
    exchangeRates: { source: string; mode?: RateMode; note?: string };
  };
}

export async function fetchQuotation(
  req: {
    pol: PortCode;
    pod: PortCode;
    containers: ContainerRow[];
    commodity: Commodity;
    tier: LoyaltyTier;
    originScope: Scope;
    destinationScope: Scope;
    etdOffset: number;
    sailingId: string;
    vas: VasSelection;
    alsoIn: string[];
  },
  signal?: AbortSignal,
): Promise<RemoteQuotation | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  signal?.addEventListener("abort", () => ctrl.abort());
  try {
    const res = await fetch(`${API_URL}/v1/quotations`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as RemoteQuotation;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** USD → currency, as the service fetched it from the ECB for this request, with its date. */
export interface FetchedRates {
  /** e.g. { JPY: 154.18, EUR: 0.86088, SGD: 1.2664 } */
  usdTo: Record<string, number>;
  asOf: string;
  source: string;
  mode: RateMode;
  /** When `cached`: the instant the stored rate was fetched. */
  fetchedAt: string;
}

/**
 * The exchange rates the service holds. Used by the options page's tariff
 * display, which shows each charge in the currency its tariff is levied in.
 * Without the service there are no rates and the tariff display is off —
 * the site does not carry a rate of its own.
 */
export async function fetchRates(signal?: AbortSignal): Promise<FetchedRates | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  signal?.addEventListener("abort", () => ctrl.abort());
  try {
    const res = await fetch(`${API_URL}/v1/rates`, { signal: ctrl.signal });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      mode: RateMode;
      rates: { source: string; key: string; value: number; asOf: string; fetchedAt: string }[];
    };
    const usdTo: Record<string, number> = {};
    let asOf = "";
    let source = "";
    let fetchedAt = "";
    for (const r of body.rates) {
      const [base, quote] = r.key.split("/");
      if (base !== "USD") continue;
      usdTo[quote] = r.value;
      asOf = r.asOf.slice(0, 10);
      source = r.source;
      fetchedAt = r.fetchedAt;
    }
    return Object.keys(usdTo).length ? { usdTo, asOf, source, mode: body.mode, fetchedAt } : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
