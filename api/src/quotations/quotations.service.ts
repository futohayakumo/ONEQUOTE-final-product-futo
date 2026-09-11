import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { allInTotal, chargeSections, type Incoterm } from "../../../src/lib/charges.ts";
import { CONTAINERS, calculateQuote, validateQuote } from "../../../src/lib/pricing.ts";
import { quoteDocument } from "../../../src/lib/quoteDocument.ts";
import { cutOffsFor, sailingAt, sailingsFor } from "../../../src/lib/sailings.ts";
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

/**
 * Prices a shipment with the site's own pure functions, then adds what the
 * browser cannot: the exchange rate the ECB actually published, with its
 * date, and a stored record of the quotation.
 *
 * Deliberately no new arithmetic. The site and the service share
 * `src/lib/pricing.ts` and `src/lib/charges.ts` by import, so a price the
 * browser computes offline and a price this service returns are the same
 * number for the same inputs. What differs is the provenance block.
 */
@Injectable()
export class QuotationsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async quote(req: QuotationRequestDto) {
    const errors = validateQuote({
      pol: req.pol,
      pod: req.pod,
      cbm: req.cbm,
      containerType: req.containerType,
      tier: req.tier,
    });
    if (Object.keys(errors).length) {
      throw new BadRequestException({ message: "The request cannot be priced", errors });
    }

    const incoterm: Incoterm = req.incoterm ?? "FOB";
    const quote = calculateQuote({
      pol: req.pol,
      pod: req.pod,
      cbm: req.cbm,
      containerType: req.containerType,
      tier: req.tier,
    });
    const sailings = sailingsFor(req.pol, req.pod);
    const sailing =
      sailings.find((s) => s.id === req.sailingId) ??
      sailings.find((s) => s.recommended) ??
      sailings[0];

    const priceFor = (rateFactor: number) =>
      chargeSections({
        pol: req.pol,
        pod: req.pod,
        containerType: req.containerType,
        units: quote.units,
        oceanFreight: quote.oceanFreight * rateFactor,
        incoterm,
      });
    const sections = priceFor(sailing.rateFactor);
    const allIn = allInTotal(sections);

    // The one figure that came from outside. Absent, the response says so
    // rather than inventing a rate.
    const fx: Record<string, Sourced<number>> = {};
    for (const ccy of req.alsoIn ?? []) {
      const r = await this.prisma.rate.findUnique({
        where: { source_key: { source: "ecb", key: `USD/${ccy}` } },
      });
      if (r) {
        fx[ccy] = {
          value: Math.round(allIn * r.value * 100) / 100,
          source: r.source,
          asOf: r.asOf.toISOString().slice(0, 10),
          fetchedAt: r.fetchedAt.toISOString(),
          url: r.url,
        };
      }
    }

    const document = quoteDocument({ quote, sailing, sections, incoterm });

    const response = {
      reference: quote.quoteId,
      incoterm,
      currency: "USD",
      validity: { hours: quote.validityHours, basis: "FROM_ISSUE" as const },
      sailings: sailings.map((s) => ({
        id: s.id,
        vessel: s.vessel,
        via: s.via,
        departsAt: new Date(sailingAt(s.departsInDays)).toISOString(),
        transitDays: s.transitDays,
        recommended: s.recommended,
        allIn: allInTotal(priceFor(s.rateFactor)),
      })),
      selected: {
        sailingId: sailing.id,
        container: { type: req.containerType, label: CONTAINERS[req.containerType].label, units: quote.units },
        sections,
        allIn,
        cutOffs: cutOffsFor(sailing).map((c) => ({
          key: c.labelKey,
          at: new Date(sailingAt(c.offsetDays)).toISOString(),
        })),
      },
      alsoIn: fx,
      document,
      provenance: {
        pricing: {
          source: "model",
          note: "Lane base rates, surcharges and tier discounts are the portfolio's own model, not a carrier tariff.",
        },
        exchangeRates: Object.keys(fx).length
          ? { source: "ecb", note: "European Central Bank reference rates via Frankfurter." }
          : { source: "none", note: "No currency conversion was requested." },
      },
    };

    // Prisma's Json input type wants index signatures the interfaces do not
    // declare; the shape is plain data and a round trip through JSON is the
    // exact representation the column stores.
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
