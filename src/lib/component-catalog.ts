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
    whatKey: "catalog.web-portal.what",
    whenKey: "catalog.web-portal.when",
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
    whatKey: "catalog.routing-gateway.what",
    whenKey: "catalog.routing-gateway.when",
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
    whatKey: "catalog.quotation-service.what",
    whenKey: "catalog.quotation-service.when",
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
    whatKey: "catalog.campaign-service.what",
    whenKey: "catalog.campaign-service.when",
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
    whatKey: "catalog.translation-api.what",
    whenKey: "catalog.translation-api.when",
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
    whatKey: "catalog.data-platform.what",
    whenKey: "catalog.data-platform.when",
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
  titleKey: "platform.title",
  bodyKey: "platform.body",
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
