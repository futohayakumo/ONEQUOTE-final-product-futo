import type { CatalogEntry, ComponentId } from "@/types/flow";

/**
 * WHAT / WHEN / HOW for each inspectable component.
 *
 * The components are the ones the technical lead named (2026-09-16). The
 * prose says what each is for; the snippets are illustrative — how such a
 * piece is typically written, in the stack the team's own memo names
 * (Node.js, NestJS, PostgreSQL, GCP) — and not this company's source, which
 * this site has not seen. Where a snippet leans on an assumption, the
 * comment inside it says so.
 */

export const COMPONENT_ORDER: readonly ComponentId[] = [
  "web-app",
  "node-gateway",
  "booking",
  "oog",
  "campaigns",
  "feature-flags",
  "translation",
  "apigee",
  "bigquery",
] as const;

export const COMPONENT_CATALOG: Record<ComponentId, CatalogEntry> = {
  "web-app": {
    id: "web-app",
    label: "ONE QUOTE web",
    nodeId: "web-app",
    stage: "client",
    whatKey: "catalog.web-app.what",
    whenKey: "catalog.web-app.when",
    how: {
      lang: "typescript — the browser asks, never prices",
      code: `// The web app renders the three pages of the flow and holds no tariff.
// Every price on screen came back from the gateway on this call.
export async function searchOptions(input: QuoteInput, signal: AbortSignal) {
  const res = await fetch(\`\${GATEWAY_URL}/v1/quotes/options\`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-trace-id": traceId() },
    body: JSON.stringify(input),
    signal,
  });
  if (!res.ok) throw new QuoteError(await res.json());
  return (await res.json()) as OptionsPage;   // sailings, all-in, freight groups
}`,
    },
  },

  "node-gateway": {
    id: "node-gateway",
    label: "Node.js API Gateway",
    nodeId: "node-gateway",
    stage: "platform",
    whatKey: "catalog.node-gateway.what",
    whenKey: "catalog.node-gateway.when",
    how: {
      lang: "typescript — REST in, gRPC out",
      code: `// One edge for every client interface. The browser speaks REST to it;
// it speaks gRPC to the services behind it, so the wire format inside the
// platform is typed and the one outside stays plain.
app.post("/v1/quotes/options", rateLimit({ windowMs: 1_000, max: 20 }), async (req, res) => {
  const meta = new grpc.Metadata();
  meta.set("x-trace-id", req.header("x-trace-id") ?? randomUUID());

  const call = promisify(bookingClient.searchOptions.bind(bookingClient));
  const page = await call(SearchOptionsRequest.fromObject(req.body), meta, {
    deadline: Date.now() + 5_000,
  });

  res.json(page.toObject());
});`,
    },
  },

  booking: {
    id: "booking",
    label: "ONE Quote Booking",
    nodeId: "booking",
    stage: "service",
    whatKey: "catalog.booking.what",
    whenKey: "catalog.booking.when",
    how: {
      lang: "typescript — a quotation, assembled",
      code: `@Injectable()
export class BookingService {
  async options(dto: SearchOptionsDto): Promise<OptionsPage> {
    // Everything the enterprise owns is asked for through Apigee.
    const [sailings, rates] = await Promise.all([
      this.apigee.schedule.sailings(dto.pol, dto.pod, dto.etd),
      this.apigee.rateEngine.rates(dto.pol, dto.pod, dto.containers),
    ]);

    // The service composes; it does not invent a rate of its own.
    return sailings.map((s) => ({
      sailing: s,
      charges: groupByFreightView(rates.for(s)),   // O/F, surcharges, origin, destination
      allIn: rates.for(s).total(),
    }));
  }

  async accept(dto: AcceptDto): Promise<Booking> {
    // A confirmed booking is handed to OPUS, the booking system of record.
    return this.apigee.opus.intake(dto);
  }
}`,
    },
  },

  oog: {
    id: "oog",
    label: "OOG",
    nodeId: "oog",
    stage: "service",
    whatKey: "catalog.oog.what",
    whenKey: "catalog.oog.when",
    how: {
      lang: "typescript — when a box is not a box",
      code: `// Out-of-gauge cargo does not fit a standard container. Flat racks and
// open tops are the equipment; the dimensions decide the surcharge and
// whether adjacent slots are lost.
export function classify(cargo: CargoDims): OogClass {
  const over = {
    height: Math.max(0, cargo.heightCm - OPEN_TOP_MAX_HEIGHT_CM),
    width: Math.max(0, cargo.widthCm - FLAT_RACK_INTERNAL_WIDTH_CM),
    length: Math.max(0, cargo.lengthCm - FLAT_RACK_INTERNAL_LENGTH_CM),
  };
  const lostSlots =
    (over.width > 0 ? 1 : 0) + (over.length > 0 ? 1 : 0); // neighbours you cannot sell
  return { equipment: over.height > 0 ? "OPEN_TOP" : "FLAT_RACK", over, lostSlots };
}`,
    },
  },

  campaigns: {
    id: "campaigns",
    label: "Campaigns",
    nodeId: "campaigns",
    stage: "service",
    whatKey: "catalog.campaigns.what",
    whenKey: "catalog.campaigns.when",
    how: {
      lang: "typescript — a campaign is a rule, not a discount",
      code: `// A campaign says WHO sees WHAT offer on WHICH lanes, and when it ends.
// It is applied to a quotation at display time; the rate underneath is
// untouched, so the offer can be withdrawn without re-pricing anything.
export const AUTUMN_TRANSPACIFIC = defineCampaign({
  key: "autumn-tp-2026",
  window: { from: "2026-09-01", to: "2026-10-31" },
  lanes: [{ pol: "JP*", pod: "US*" }],
  audience: { bookedLastQuarter: false, tier: ["SILVER_SAIL", "GOLDEN_SEA"] },
  offer: { kind: "percent-off-basic-ocean-freight", value: 5 },
  stackableWithCoupons: false,
});`,
    },
  },

  "feature-flags": {
    id: "feature-flags",
    label: "Feature Flags",
    nodeId: "feature-flags",
    stage: "platform",
    whatKey: "catalog.feature-flags.what",
    whenKey: "catalog.feature-flags.when",
    how: {
      lang: "typescript — guarded rollout",
      code: `const context = {
  kind: "user",
  key: customerRef,
  tier: loyaltyTier,          // BLUE_WAVE | SILVER_SAIL | GOLDEN_SEA | ...
  region: pol.slice(0, 2),    // targeting by origin country
};

// Default is FALSE. If evaluation fails or times out, we take the old path.
if (await this.flags.boolVariation("oog.self-service", context, false)) {
  return this.oog.quote(dto);
}

return this.oog.requestManualQuote(dto);`,
    },
  },

  translation: {
    id: "translation",
    label: "Translation",
    nodeId: "translation",
    stage: "platform",
    whatKey: "catalog.translation.what",
    whenKey: "catalog.translation.when",
    how: {
      lang: "typescript — locale bundle load",
      code: `// Pulled at build time and committed to the artefact, so a runtime
// outage in the localisation platform can never break the web app.
export async function loadMessages(locale: Locale) {
  const bundle = await translations.download({
    locale,
    format: "json",
    fallbackLocale: "en",
    // Untranslated keys fall back rather than rendering an empty string.
    replaceBreaks: false,
  });

  return { ...BASE_MESSAGES, ...bundle };
}`,
    },
  },

  apigee: {
    id: "apigee",
    label: "Apigee Gateway",
    nodeId: "apigee",
    stage: "enterprise",
    whatKey: "catalog.apigee.what",
    whenKey: "catalog.apigee.when",
    how: {
      lang: "xml — an Apigee proxy in front of the rate engine",
      code: `<!-- ONE QUOTE never holds enterprise credentials. Apigee holds them,
     enforces the quota the rate engine was sized for, and smooths bursts. -->
<ProxyEndpoint name="rate-engine">
  <PreFlow>
    <Request>
      <Step><Name>Verify-API-Key</Name></Step>
      <Step><Name>Quota-RateEngine-1000-per-minute</Name></Step>
      <Step><Name>SpikeArrest-50ps</Name></Step>
      <Step><Name>Assign-Trace-Header</Name></Step>
    </Request>
  </PreFlow>
  <HTTPProxyConnection><BasePath>/rates/v1</BasePath></HTTPProxyConnection>
  <RouteRule name="default"><TargetEndpoint>rate-engine-prod</TargetEndpoint></RouteRule>
</ProxyEndpoint>`,
    },
  },

  bigquery: {
    id: "bigquery",
    label: "BigQuery Warehouse",
    nodeId: "bigquery",
    stage: "enterprise",
    whatKey: "catalog.bigquery.what",
    whenKey: "catalog.bigquery.when",
    how: {
      lang: "sql — a scheduled query over the warehouse",
      code: `-- Runs on a schedule inside BigQuery. Reads events that arrived through
-- Pub/Sub from logs and analytics; never touches the transactional store.
SELECT
  DATE(event_ts)                                   AS day,
  JSON_VALUE(payload, '$.pol')                     AS pol,
  JSON_VALUE(payload, '$.pod')                     AS pod,
  COUNTIF(event = 'quote.options.viewed')          AS searches,
  COUNTIF(event = 'quote.accepted')                AS accepted,
  SAFE_DIVIDE(COUNTIF(event = 'quote.accepted'),
              COUNTIF(event = 'quote.options.viewed')) AS conversion
FROM \`one-quote-analytics.events.web\`
WHERE event_ts >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 14 DAY)
GROUP BY day, pol, pod
ORDER BY day DESC, searches DESC;`,
    },
  },
};

export const PLATFORM_NOTE = {
  titleKey: "platform.title",
  bodyKey: "platform.body",
  code: {
    lang: "text — the two gateways, and what sits behind each",
    code: `browser ──REST──▶ Node.js API Gateway ──gRPC──▶ ONE QUOTE services
                                                    │
                                                    ▼ (anything the enterprise owns)
                                            Apigee (Google)
                                                    ├──▶ Schedule Management
                                                    ├──▶ Vessel Space Allocation
                                                    ├──▶ Rate Engine
                                                    └──▶ OPUS  (booking intake)

logs · Google Analytics · HEAP ──Pub/Sub──▶ BigQuery ──scheduled queries──▶ reports
                                            (never reads the transactional DB)`,
  },
} as const;
