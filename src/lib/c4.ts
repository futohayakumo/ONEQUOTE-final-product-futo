/**
 * The C4 model, for this system.
 *
 * Four levels, three of them drawn. Level 4 (Code) is deliberately not a
 * diagram: C4's own guidance is that class-level detail is better generated
 * from the code than drawn by hand, and a hand-drawn one is out of date the
 * day it is committed. The engineering screen already shows the real thing at
 * that level — the service's actual source.
 *
 * Node labels carry the technology in brackets, which is what makes a
 * container diagram a container diagram rather than a box drawing.
 */
export interface C4Level {
  id: string;
  no: string;
  titleKey: string;
  bodyKey: string;
  /** Undefined for Level 4, which is described rather than drawn. */
  chart?: string;
}

export const C4_LEVELS: readonly C4Level[] = [
  {
    id: "context",
    no: "01",
    titleKey: "c4.context.title",
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
    bodyKey: "c4.code.body",
  },
] as const;
