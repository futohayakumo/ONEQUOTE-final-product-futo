import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { allInTotal, chargeSections } from "../../../src/lib/charges.ts";
import { calculateQuote, validateQuote } from "../../../src/lib/pricing.ts";
import { quoteDocument } from "../../../src/lib/quoteDocument.ts";
import { availableEtdOffsets, cutOffsFor, optionsFrom, sailingAt, timelineFor } from "../../../src/lib/sailings.ts";
import { NO_VAS, vasLines, vasTotal, type VasSelection } from "../../../src/lib/vas.ts";
import { PrismaService } from "../prisma/prisma.service.ts";
import type { QuotationRequestDto } from "./quotation.dto.ts";

/** A figure with its provenance attached — the shape everything from outside takes. */
export interface Sourced<T> {
  value: T;
  source: string;
  asOf: string;
  fetchedAt: string;
  url: string;
}

const money = (x: number) => Math.round(x * 100) / 100;

/**
 * Prices a shipment with the site's own pure functions, then adds what the
 * browser cannot: the exchange rate the ECB actually published, with its
 * date, and a stored record of the quotation.
 *
 * Deliberately no new arithmetic. The site and the service share the pricing
 * modules by import, so a price the browser computes offline and a price this
 * service returns are the same number for the same inputs.
 */
@Injectable()
export class QuotationsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async quote(req: QuotationRequestDto) {
    const input = {
      pol: req.pol,
      pod: req.pod,
      containers: req.containers,
      commodity: req.commodity,
      tier: req.tier,
      originScope: req.originScope ?? ("CY" as const),
      destinationScope: req.destinationScope ?? ("CY" as const),
      etdOffset: req.etdOffset,
    };
    const errors = validateQuote(input);
    if (!availableEtdOffsets(req.pol, req.pod).includes(req.etdOffset)) {
      errors.etd = { key: "quote.error.etd" };
    }
    if (Object.keys(errors).length) {
      throw new BadRequestException({ message: "The request cannot be priced", errors });
    }

    const quote = calculateQuote(input);
    const options = optionsFrom(req.pol, req.pod, req.etdOffset);
    const sailing =
      options.find((s) => s.id === req.sailingId) ??
      options.find((s) => s.recommended) ??
      options[0];
    const vas: VasSelection = {
      premiumCargo: req.vas?.premiumCargo ?? false,
      extraFreeTimeOrigin: req.vas?.extraFreeTimeOrigin ?? 0,
      extraFreeTimeDestination: req.vas?.extraFreeTimeDestination ?? 0,
    };

    const sectionsFor = (rateFactor: number) =>
      chargeSections({
        pol: quote.pol,
        pod: quote.pod,
        rows: quote.rows,
        originScope: quote.originScope,
        destinationScope: quote.destinationScope,
        oceanFreight: quote.oceanFreight * rateFactor,
      });
    const sections = sectionsFor(sailing.rateFactor);
    const allIn = allInTotal(sections);
    const discount = money(quote.oceanFreight * sailing.rateFactor * quote.discountRate);
    const extras = vasTotal(vas, quote.units);
    const payable = money(allIn - discount + extras);

    // The one figure that came from outside. Absent, the response says so
    // rather than inventing a rate.
    const fx: Record<string, Sourced<number>> = {};
    for (const ccy of req.alsoIn ?? []) {
      const r = await this.prisma.rate.findUnique({
        where: { source_key: { source: "ecb", key: `USD/${ccy}` } },
      });
      if (r) {
        fx[ccy] = {
          value: money(payable * r.value),
          source: r.source,
          asOf: r.asOf.toISOString().slice(0, 10),
          fetchedAt: r.fetchedAt.toISOString(),
          url: r.url,
        };
      }
    }

    const iso = (offset: number) => new Date(sailingAt(offset)).toISOString();

    const response = {
      reference: quote.quoteId,
      currency: "USD",
      validity: { hours: quote.validityHours, basis: "FROM_ISSUE" as const },
      scope: { origin: quote.originScope, destination: quote.destinationScope },
      options: options.map((s) => ({
        id: s.id,
        serviceLane: s.serviceLane,
        vessel: s.vessel,
        voyage: s.voyage,
        via: s.via,
        status: s.status,
        etd: iso(s.etdOffset),
        eta: iso(s.etdOffset + s.transitDays),
        transitDays: s.transitDays,
        recommended: s.recommended,
        allIn: allInTotal(sectionsFor(s.rateFactor)),
      })),
      selected: {
        sailingId: sailing.id,
        containers: quote.rows,
        sections,
        allIn,
        loyaltyDiscount: discount,
        valueAddedServices: { lines: vasLines(vas, quote.units), subtotal: extras },
        payable,
        cutOffs: cutOffsFor(sailing).map((c) => ({ id: c.id, at: iso(c.offsetDays) })),
        timeline: timelineFor(sailing, quote.pol, quote.pod).map((e) => ({
          id: e.id,
          place: e.place ?? null,
          at: iso(e.offsetDays),
        })),
      },
      alsoIn: fx,
      document: quoteDocument({ quote, sailing, sections, vas }),
      provenance: {
        pricing: {
          source: "model",
          note: "Lane base rates, surcharges, tier discounts and value-added service prices are the portfolio's own model, not a carrier tariff.",
        },
        exchangeRates: Object.keys(fx).length
          ? { source: "ecb", note: "European Central Bank reference rates via Frankfurter." }
          : { source: "none", note: "No currency conversion was requested." },
      },
    };

    const asJson = (v: unknown) => JSON.parse(JSON.stringify(v));
    await this.prisma.quotation.upsert({
      where: { id: quote.quoteId },
      create: { id: quote.quoteId, request: asJson(req), response: asJson(response) },
      update: { request: asJson(req), response: asJson(response) },
    });

    return response;
  }

  async byReference(id: string) {
    const row = await this.prisma.quotation.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`No quotation ${id}`);
    return { ...(row.response as object), createdAt: row.createdAt.toISOString() };
  }
}
