import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Rate } from "@prisma/client";
import { ECB_SOURCE, fetchEcbRates, type FetchedRate } from "../ingest/sources.ts";
import { PrismaService } from "../prisma/prisma.service.ts";

/**
 * How long a quotation waits for the ECB before it falls back to the table.
 * A live round trip measures 200–800 ms from here; a carrier's quotation is
 * not a millisecond product, so the wait is affordable — but it is bounded,
 * because a quotation that hangs on a third party is not a quotation.
 */
export const LIVE_TIMEOUT_MS = 2500;

export type RateMode = "live" | "cached";

export interface CurrentRates {
  /** `live` — fetched for this request. `cached` — the table, with why. */
  mode: RateMode;
  /** When the live fetch did not happen, its reason, verbatim. */
  reason?: string;
  rates: Rate[];
}

/**
 * The exchange rate at the moment of quoting.
 *
 * A real quotation freezes its rate at issue and carries the date, so the
 * honest thing is to fetch at issue: every quotation asks the ECB, stores
 * what it got, and prints the date the ECB published it. When the ECB does
 * not answer inside the time-box, the last stored rate serves instead — and
 * the response says so, with the time it was stored, rather than passing a
 * three-day-old figure off as today's.
 *
 * The daily ingest still runs. It keeps the cache warm for the day the
 * network is not there; it is no longer what a quotation reads first.
 */
@Injectable()
export class RatesService {
  private readonly log = new Logger(RatesService.name);

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async current(): Promise<CurrentRates> {
    try {
      const fetched = await fetchEcbRates((url) =>
        fetch(url, { signal: AbortSignal.timeout(LIVE_TIMEOUT_MS) }),
      );
      const rates = await this.store(fetched);
      return { mode: "live", rates };
    } catch (e) {
      const reason = (e as Error).message;
      this.log.warn(`ECB live fetch failed, serving the stored rates: ${reason}`);
      const rates = await this.prisma.rate.findMany({
        where: { source: ECB_SOURCE },
        orderBy: { key: "asc" },
      });
      return { mode: "cached", reason, rates };
    }
  }

  /** Upsert what was fetched; the table always holds the last good answer. */
  async store(fetched: FetchedRate[]): Promise<Rate[]> {
    const fetchedAt = new Date();
    const rows: Rate[] = [];
    for (const r of fetched) {
      rows.push(
        await this.prisma.rate.upsert({
          where: { source_key: { source: r.source, key: r.key } },
          create: { ...r, fetchedAt },
          update: { value: r.value, asOf: r.asOf, url: r.url, fetchedAt },
        }),
      );
    }
    return rows.sort((a, b) => a.key.localeCompare(b.key));
  }
}
