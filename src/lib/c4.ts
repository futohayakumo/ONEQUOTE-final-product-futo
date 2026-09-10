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
  customer["Customer<br/>books ocean freight"]
  partner["Partner system<br/>posts rate requests"]
  sales["Sales / operations<br/>quotes, exceptions"]

  subgraph platform ["Quotation platform"]
    aoq["Advanced Quotation<br/>prices a lane, reserves a rate"]
  end

  erp["ERP System<br/>system of record for<br/>rates and bookings"]
  mail["Notification provider<br/>email delivery"]
  bi["Analytics &amp; Reporting<br/>TEU accrual, campaign uptake"]

  customer -->|"requests a rate"| aoq
  partner -->|"HTTPS / JSON"| aoq
  sales -->|"overrides, holds"| aoq
  aoq -->|"reserves rate, confirms booking"| erp
  aoq -->|"sends the quotation"| mail
  aoq -->|"emits events"| bi`,
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

  subgraph platform ["Quotation platform"]
    web["Web Portal<br/>[Next.js / React]"]
    gw["Routing Gateway<br/>[nginx]"]
    quote["Quotation Service<br/>[NestJS / Node.js]"]
    campaign["Campaign Service<br/>[NestJS / Node.js]"]
    notify["Notification Service<br/>[NestJS / Node.js]"]
    db[("Operational store<br/>[PostgreSQL]")]
    lake[("Data Platform<br/>[read replica]")]
  end

  flags["Feature Flag Service<br/>[LaunchDarkly]"]
  i18n["Translation API<br/>[Lokalise]"]
  erp["ERP System<br/>rates, bookings"]

  customer -->|"HTTPS"| web
  web -->|"HTTPS / JSON"| gw
  gw -->|"/quotations"| quote
  gw -->|"/campaigns"| campaign
  quote -->|"reads / writes"| db
  quote -->|"reserves a rate"| erp
  quote -->|"asks for the discount"| campaign
  quote -->|"queues the result"| notify
  quote -.->|"reads a flag"| flags
  web -.->|"pulls copy at build"| i18n
  db -->|"replicates"| lake`,
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
  gw["Routing Gateway<br/>[nginx]"]

  subgraph quote ["Quotation Service [NestJS]"]
    ctrl["QuotationController<br/>validates the request DTO"]
    lanes["LaneResolver<br/>port pair to base rate"]
    plan["ContainerPlanner<br/>CBM to a box count"]
    charges["ChargeCalculator<br/>THC, DOC, BAF, CAF"]
    loyalty["LoyaltyClient<br/>tier discount, TEU accrual"]
    erpc["ErpClient<br/>reserves the rate for 72h"]
  end

  db[("PostgreSQL")]
  erp["ERP System"]

  gw --> ctrl
  ctrl --> lanes
  ctrl --> plan
  lanes --> charges
  plan --> charges
  charges --> loyalty
  loyalty --> erpc
  erpc -->|"booking.rate.reserve"| erp
  lanes -->|"tariff lookup"| db`,
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
