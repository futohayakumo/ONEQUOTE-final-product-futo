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
 * Four hundred milliseconds, then we stop waiting. A portfolio that hangs on
 * a service that is not running is worse than one that says it is not.
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

const TIMEOUT_MS = 400;

export interface Sourced<T> {
  value: T;
  source: string;
  /** The date the source published the figure, ISO day. */
  asOf: string;
  /** When the service pulled it, ISO instant. */
  fetchedAt: string;
  url: string;
}

export interface RemoteQuotation {
  reference: string;
  selected: { sailingId: string; allIn: number; payable: number };
  alsoIn: Record<string, Sourced<number>>;
  provenance: { pricing: { source: string }; exchangeRates: { source: string } };
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
