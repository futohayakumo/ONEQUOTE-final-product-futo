import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service.ts";
import { RatesService } from "../rates/rates.service.ts";
import { fetchEcbRates, fetchUnlocodePorts } from "./sources.ts";

export interface IngestReport {
  startedAt: string;
  rates: { fetched: number; error?: string };
  ports: { fetched: number; error?: string };
}

/**
 * Pulls the outside data in on a schedule and stores it.
 *
 * Two sources, two cadences. UN/LOCODE changes twice a year, so a daily pull
 * is already generous and nothing reads it live. The ECB publishes once a
 * working day, and a quotation fetches it live at issue (RatesService); this
 * pull only keeps the table warm, so that the day the ECB does not answer
 * the quotation still has a rate to fall back on — dated, and labelled as
 * the fallback.
 */
@Injectable()
export class IngestService {
  private readonly log = new Logger(IngestService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RatesService) private readonly rates: RatesService,
  ) {}

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
      await this.rates.store(rates);
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
