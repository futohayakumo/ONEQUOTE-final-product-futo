import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service.ts";
import { fetchEcbRates, fetchUnlocodePorts } from "./sources.ts";

export interface IngestReport {
  startedAt: string;
  rates: { fetched: number; error?: string };
  ports: { fetched: number; error?: string };
}

/**
 * Pulls the outside data in and stores it; nothing else reads the network.
 *
 * A quotation request never calls an external API. The ingest runs on a
 * schedule (and on demand), writes what it got with a fetched_at, and the
 * quotation reads the table. If ECB is down, the last good rate stays, with
 * its date, and the response says how old it is — which is the honest thing
 * and also the thing that keeps a demo alive when a third party is not.
 */
@Injectable()
export class IngestService {
  private readonly log = new Logger(IngestService.name);

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** ECB publishes around 16:00 CET on working days; 06:00 UTC the next morning is safe. */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async scheduled() {
    await this.run();
  }

  async run(): Promise<IngestReport> {
    const report: IngestReport = {
      startedAt: new Date().toISOString(),
      rates: { fetched: 0 },
      ports: { fetched: 0 },
    };

    try {
      const rates = await fetchEcbRates();
      for (const r of rates) {
        await this.prisma.rate.upsert({
          where: { source_key: { source: r.source, key: r.key } },
          create: { ...r, fetchedAt: new Date() },
          update: { value: r.value, asOf: r.asOf, url: r.url, fetchedAt: new Date() },
        });
      }
      report.rates.fetched = rates.length;
      this.log.log(`ECB: ${rates.length} rates as of ${rates[0]?.asOf.toISOString().slice(0, 10)}`);
    } catch (e) {
      report.rates.error = (e as Error).message;
      this.log.warn(`ECB fetch failed, keeping last good rates: ${report.rates.error}`);
    }

    try {
      const ports = await fetchUnlocodePorts();
      // One transaction, so a half-written list never serves a request.
      await this.prisma.$transaction(
        ports.map((p) =>
          this.prisma.port.upsert({
            where: { unlocode: p.unlocode },
            create: { ...p, fetchedAt: new Date() },
            update: { name: p.name, lat: p.lat, lon: p.lon, url: p.url, fetchedAt: new Date() },
          }),
        ),
      );
      report.ports.fetched = ports.length;
      this.log.log(`UN/LOCODE: ${ports.length} seaports across the routed countries`);
    } catch (e) {
      report.ports.error = (e as Error).message;
      this.log.warn(`UN/LOCODE fetch failed, keeping last good list: ${report.ports.error}`);
    }

    return report;
  }
}
