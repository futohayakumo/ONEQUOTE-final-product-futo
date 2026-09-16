/**
 * The C4 model, for this system.
 *
 * Four levels, three of them drawn. The scope, audience and definition of each
 * are quoted from c4model.com rather than paraphrased — a shared notation is
 * only worth having if everyone is using the same one, and a paraphrase is a
 * second, slightly different notation.
 *
 * Level 4 is not drawn because the source says not to: "This level of detail is
 * not recommended for anything but the most important or complex components …
 * particularly for long-lived documentation, because most IDEs can generate
 * this level of detail on demand."
 *
 * Node labels carry the technology in brackets, which is what makes a
 * container diagram a container diagram rather than a box drawing.
 */
export interface C4Level {
  id: string;
  no: string;
  titleKey: string;
  /** Verbatim from c4model.com. Rendered as a quotation, with attribution. */
  quoteKey: string;
  scopeKey: string;
  audienceKey: string;
  bodyKey: string;
  /** Undefined for Level 4, which the source says to generate, not to draw. */
  chart?: string;
}

/** Every quotation on this screen comes from here. */
export const C4_SOURCE = "https://c4model.com/";

export const C4_LEVELS: readonly C4Level[] = [
  {
    id: "context",
    no: "01",
    titleKey: "c4.context.title",
    quoteKey: "c4.context.quote",
    scopeKey: "c4.context.scope",
    audienceKey: "c4.context.audience",
    bodyKey: "c4.context.body",
    chart: `flowchart TB
  customer["Customer<br/>quotes and books ocean freight"]
  subgraph oq ["ONE QUOTE — e-commerce quotation and booking"]
    app["ONE QUOTE<br/>booking, OOG, value-added services,<br/>campaigns and alerts"]
  end
  subgraph ent ["Enterprise systems"]
    sched["Schedule Management"]
    space["Vessel Space Allocation"]
    rates["Rate Engine"]
    opus["OPUS<br/>booking intake"]
  end
  bq["BigQuery warehouse<br/>reporting, isolated"]
  customer -->|"searches, accepts"| app
  app -->|"via Apigee"| sched
  app -->|"via Apigee"| space
  app -->|"via Apigee"| rates
  app -->|"via Apigee"| opus
  app -.->|"logs, GA, HEAP → Pub/Sub"| bq`
  },
  {
    id: "container",
    no: "02",
    titleKey: "c4.container.title",
    quoteKey: "c4.container.quote",
    scopeKey: "c4.container.scope",
    audienceKey: "c4.container.audience",
    bodyKey: "c4.container.body",
    chart: `flowchart TB
  customer["Customer"]
  subgraph oq ["ONE QUOTE"]
    web["Web app<br/>[browser]"]
    gw["API Gateway<br/>[Node.js · REST + gRPC]"]
    core["Booking · OOG<br/>[services]"]
    vas["Premium · OSL+ · D&amp;D · PUDO<br/>[value-added services]"]
    sales["Campaigns · Coupons · Price Alerts<br/>NotifyMe · Missing Route<br/>[support and sales]"]
    infra["Translation · Feature Flags<br/>[infrastructure]"]
    db[("Operational store<br/>[PostgreSQL — per the team memo]")]
  end
  apigee["Apigee<br/>[Google API gateway]"]
  ent["Schedule · Space · Rate Engine · OPUS<br/>[enterprise systems]"]
  pubsub["Pub/Sub<br/>[GCP]"]
  bq[("BigQuery<br/>[GCP warehouse]")]
  customer -->|"HTTPS"| web
  web -->|"REST"| gw
  gw -->|"gRPC"| core
  gw -->|"gRPC"| vas
  gw -->|"gRPC"| sales
  gw -.->|"flags, copy"| infra
  core -->|"reads / writes"| db
  core -->|"rates, sailings, space, booking"| apigee
  apigee --> ent
  web -.->|"GA, HEAP"| pubsub
  gw -.->|"logs"| pubsub
  pubsub --> bq`
  },
  {
    id: "component",
    no: "03",
    titleKey: "c4.component.title",
    quoteKey: "c4.component.quote",
    scopeKey: "c4.component.scope",
    audienceKey: "c4.component.audience",
    bodyKey: "c4.component.body",
    chart: `flowchart TB
  gw["API Gateway<br/>[Node.js]"]
  subgraph booking ["ONE Quote Booking — components inferred, not confirmed"]
    ctrl["BookingController<br/>validates the request DTO"]
    sched["ScheduleClient<br/>sailings for a lane and date"]
    rates["RateClient<br/>charges per sailing, by freight group"]
    vas["VasAttacher<br/>premium, free time, PUDO"]
    offers["OfferApplier<br/>campaigns and coupons at display"]
    opus["OpusClient<br/>hands an accepted booking over"]
  end
  apigee["Apigee"]
  gw -->|"gRPC"| ctrl
  ctrl --> sched
  ctrl --> rates
  sched --> vas
  rates --> vas
  vas --> offers
  offers --> opus
  sched -->|"schedule management"| apigee
  rates -->|"rate engine"| apigee
  opus -->|"OPUS intake"| apigee`
  },
  {
    id: "code",
    no: "04",
    titleKey: "c4.code.title",
    quoteKey: "c4.code.quote",
    scopeKey: "c4.code.scope",
    audienceKey: "c4.code.audience",
    bodyKey: "c4.code.body",
  },
] as const;
