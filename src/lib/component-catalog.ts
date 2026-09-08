import type { CatalogEntry, ComponentId } from "@/types/flow";

/**
 * WHAT / WHEN / HOW for each inspectable component.
 *
 * Zero-leakage: no vendor, client, vessel or internal project name appears
 * here — not in the copy, and not in the snippets. Every proper noun is one of
 * the mapped virtual names.
 */

export const COMPONENT_ORDER: readonly ComponentId[] = [
  "web-portal",
  "routing-gateway",
  "quotation-service",
  "campaign-service",
  "feature-flags",
  "translation-api",
  "data-platform",
] as const;

export const COMPONENT_CATALOG: Record<ComponentId, CatalogEntry> = {
  "web-portal": {
    id: "web-portal",
    // Named for the node it is anchored to, so the index, the map and the card
    // all say the same thing.
    label: "Request Intake",
    nodeId: "request-intake",
    stage: "portal",
    what: "The customer-facing application. It renders quotation forms and rate comparisons on the server, hydrates only the interactive parts, and holds no business rules of its own — pricing and eligibility always come from the service layer so a browser can never be the source of truth.",
    when: "A customer opens a rate search from a slow mobile connection in a port city. Server rendering means the first meaningful paint carries real lane data rather than a spinner, and the interactive quote form hydrates afterwards without blocking the read.",
    how: {
      lang: "typescript — server-side rate fetch",
      code: `// Rendered on the server. The portal never prices anything itself.
export default async function LanePage({ params }: { params: { lane: string } }) {
  const rates = await fetch(
    \`\${process.env.SERVICE_GATEWAY_URL}/v1/lanes/\${params.lane}/rates\`,
    {
      headers: { "x-trace-id": crypto.randomUUID() },
      // Rates are volatile; never serve a stale price from the CDN.
      cache: "no-store",
    },
  ).then((r) => r.json());

  return <LaneRateTable rates={rates} />;
}`,
    },
  },

  "routing-gateway": {
    id: "routing-gateway",
    label: "Routing Gateway",
    nodeId: "routing-gateway",
    stage: "service",
    what: "A layer-7 reverse proxy sitting in front of every service. It terminates TLS, enforces per-client rate limits, routes by path prefix, injects a trace header so one request can be followed end to end, and load-balances across replicas. It is also the cluster ingress.",
    when: "The Campaign Cohort Hub launches a promotion and quote traffic spikes roughly eightfold within a minute. The gateway absorbs the burst, throttles the clients that are hammering the endpoint, and shifts traffic across healthy replicas — with no service redeploy and no code change.",
    how: {
      lang: "nginx.conf",
      code: `upstream quotation_service {
  least_conn;
  server quotation-svc-a:3000 max_fails=3 fail_timeout=10s;
  server quotation-svc-b:3000 max_fails=3 fail_timeout=10s;
}

limit_req_zone $binary_remote_addr zone=quote_rl:10m rate=20r/s;

server {
  listen 443 ssl http2;

  location /v1/quotations/ {
    limit_req      zone=quote_rl burst=40 nodelay;
    proxy_set_header X-Trace-Id  $request_id;
    proxy_set_header X-Real-IP   $remote_addr;
    proxy_read_timeout 15s;
    proxy_next_upstream error timeout http_502;
    proxy_pass http://quotation_service;
  }
}`,
    },
  },

  "quotation-service": {
    id: "quotation-service",
    label: "Quotation Service",
    nodeId: "quotation-service",
    stage: "service",
    what: "The Core Quotation Module. It resolves a lane to a base rate, converts cargo volume into container units, applies the type multiplier and surcharges, asks the Volume Loyalty Framework for the customer's discount, and reserves the resulting rate against the Legacy ERP Engine for a fixed validity window.",
    when: "A customer requests a rate at 02:00 local time, outside any human desk's hours. The service prices the lane, holds it for 72 hours through the Quotation Flex Cart, and the customer books the next morning at the same number — no re-quote, no negotiation, no staff involved.",
    how: {
      lang: "typescript — pricing orchestration",
      code: `@Injectable()
export class QuotationService {
  async quote(dto: QuoteRequestDto): Promise<Quotation> {
    const lane = await this.lanes.resolve(dto.pol, dto.pod);
    const plan = this.containers.plan(dto.cargoVolumeCbm, dto.containerType);

    const oceanFreight = lane.baseRate * plan.multiplier * plan.units;
    const subtotal =
      oceanFreight +
      dto.cargoVolumeCbm * THC_PER_CBM +
      DOCUMENTATION_FEE +
      oceanFreight * BAF_RATE;

    // Discount is owned by the loyalty domain, never inlined here.
    const { rate } = await this.loyalty.discountFor(dto.customerRef);

    // Reserving in the ERP is what makes the quote bookable, not just shown.
    return this.erp.reserveRate({
      total: round2(subtotal * (1 - rate)),
      ttlHours: RATE_VALIDITY_HOURS,
    });
  }
}`,
    },
  },

  "campaign-service": {
    id: "campaign-service",
    label: "Campaign Service",
    nodeId: "campaign-service",
    stage: "service",
    what: "The Campaign Cohort Hub. It segments customers into cohorts from booking history and accrued TEU, decides which offer each cohort should see, and emits targeting events. It reads from the Data Platform rather than the transactional store, so audience work can never slow down booking.",
    when: "A lane is running under capacity for the next sailing window. The hub identifies customers who shipped that corridor in the last two quarters but not this one, and targets a time-boxed incentive at exactly that cohort instead of discounting the lane for everyone.",
    how: {
      lang: "typescript — cohort definition",
      code: `// Cohorts are declarative and versioned, so a campaign can be replayed
// and audited long after it ran.
export const LAPSED_CORRIDOR_SHIPPER = defineCohort({
  key: "lapsed-corridor-shipper",
  version: 3,
  where: {
    lastBookedCorridor: { within: "P180D" },
    bookedThisQuarter: false,
    teuAccruedLifetime: { gte: 20 },
  },
  // Never target an account with an unresolved billing hold.
  exclude: { billingHold: true },
});`,
    },
  },

  "feature-flags": {
    id: "feature-flags",
    label: "Feature Flag Service",
    nodeId: "feature-flags",
    stage: "service",
    what: "A managed flag evaluation service. It decouples deploying code from releasing behaviour: a change ships dark, is switched on for a named slice of traffic, and can be switched off in seconds without a rollback, a redeploy, or a release window.",
    when: "Rolling the Quotation Flex Cart multi-port hold out to the first 5% of Silver Sail customers. If rate-reservation latency against the Legacy ERP Engine degrades under the added load, the flag is killed immediately — the code stays deployed and nobody has to page a release engineer.",
    how: {
      lang: "typescript — guarded rollout",
      code: `const context = {
  kind: "user",
  key: customerRef,
  tier: loyaltyTier,          // BLUE_WAVE | SILVER_SAIL | GOLDEN_SEA | ...
  region: pol.slice(0, 2),    // targeting by origin country
};

// Default is FALSE. If evaluation fails or times out, we take the old path.
if (await this.flags.boolVariation("flex-cart.multi-port", context, false)) {
  return this.flexCart.holdMultiPort(dto);
}

return this.flexCart.holdSinglePort(dto);`,
    },
  },

  "translation-api": {
    id: "translation-api",
    label: "Lokalise",
    nodeId: "translation-api",
    stage: "service",
    what: "Lokalise, the managed localisation platform this site actually runs on. Translation keys live outside the application build, so copy is corrected in any locale without shipping a release. `scripts/pull-locales.mjs` writes the bundles before the build and the app imports them, so the running site has no runtime token and no network dependency on a translation vendor. Any key missing from a locale falls back to the base rather than rendering blank.",
    when: "A surcharge label reads ambiguously in one market and the local team wants it reworded before the next sailing. They edit the string in the platform, the next build picks it up, and no engineer touches the repository.",
    how: {
      lang: "typescript — locale bundle load",
      code: `// Pulled at build time and committed to the artefact, so a runtime
// outage in the localisation platform can never break the portal.
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

  "data-platform": {
    id: "data-platform",
    label: "Data Platform",
    nodeId: "data-platform",
    stage: "platform",
    what: "The relational analytics store. Booking and quotation events land here from the Legacy ERP Engine on a read replica, separated from the transactional primary so reporting load can never contend with booking writes.",
    when: "The Lead Product Owner (LPO) needs monthly TEU accrual per customer to check that Volume Loyalty Framework milestones are firing correctly. That query scans a quarter of history — running it against the transactional primary would put booking latency at risk, so it runs here instead.",
    how: {
      lang: "sql — read replica",
      code: `-- TEU accrual this month, with the next Blue Wave milestone.
-- Blue Wave has no rate discount, so the 5-TEU coupon is its whole value.
SELECT c.customer_ref,
       c.loyalty_tier,
       SUM(b.teu)                        AS teu_accrued,
       CEIL((SUM(b.teu) + 1) / 5.0) * 5  AS next_milestone_teu
FROM   bookings  b
JOIN   customers c ON c.id = b.customer_id
WHERE  b.booked_at >= date_trunc('month', now())
  AND  c.loyalty_tier = 'BLUE_WAVE'
GROUP  BY c.customer_ref, c.loyalty_tier
ORDER  BY teu_accrued DESC;`,
    },
  },
};

export const PLATFORM_NOTE = {
  title: "Everything above runs on a managed cluster",
  body: "Every service in stages 03 and 04 is a Deployment on a managed container platform. The Routing Gateway is the cluster ingress. The Quotation Service scales horizontally on p95 latency rather than CPU, because a slow rate reservation against the Legacy ERP Engine shows up as latency long before it shows up as load.",
  code: {
    lang: "yaml — horizontal scaling policy",
    code: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: quotation-service
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: quotation-service
  minReplicas: 3
  maxReplicas: 24
  metrics:
    - type: Pods
      pods:
        metric: { name: http_request_duration_p95_seconds }
        target: { type: AverageValue, averageValue: "0.45" }
  behavior:
    scaleDown:
      # Never shed capacity faster than traffic actually falls.
      stabilizationWindowSeconds: 300`,
  },
};
