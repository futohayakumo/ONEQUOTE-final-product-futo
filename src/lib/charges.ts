import type { PortCode, RowResult, Scope } from "@/types/quote";

/**
 * A quotation the way a liner actually issues one.
 *
 * Three geographies, because three different parties invoice them:
 *
 *   ORIGIN        THC, documentation, seal, ISPS — and haulage if the scope
 *                 is Door — the port of loading
 *   OCEAN         O/F, BAF, CAF, and the per-box surcharges — the carrier's leg
 *   DESTINATION   THC, delivery order, ENS/AMS filing — and haulage if Door —
 *                 the port of discharge
 *
 * And four groups laid across them, because that is how ONE QUOTE's "freight
 * view" lets a reader switch lines on and off: basic ocean freight, freight
 * charges, origin charges, destination charges. A line belongs to one
 * section and one group.
 *
 * There is no Incoterm here. An Incoterm is the seller–buyer contract; what
 * a carrier quotes is the transport, whose reach is expressed as CY or Door
 * at each end. The earlier model re-allocated sections between "your
 * account" and "the other party's" by Incoterm, which is a thing the
 * shipper's own paperwork does and the carrier's quotation does not.
 *
 * Nothing here imports a value, so the node test runner executes it directly.
 */

/**
 * The currency each port publishes its tariff in.
 *
 * The real options page has a "tariff" display beside "USD": tariff shows
 * every charge in the currency it is actually levied in — a Japanese THC in
 * yen, a Singapore one in Singapore dollars — and USD converts them all to
 * one. The model's amounts are USD; a line's `currency` says what it would
 * be levied in, and the renderer converts with a fetched rate or, without
 * one, says it cannot.
 */
export type TariffCurrency = "USD" | "JPY" | "SGD" | "EUR" | "KRW";

/**
 * The currency each country's ports publish their tariff in — where the ECB
 * publishes a reference rate for it. Taiwan, Sri Lanka and the Emirates
 * levy in TWD, LKR and AED, none of which the ECB quotes, so their lines
 * stay in USD and the tariff display says why rather than inventing a rate.
 */
const COUNTRY_CURRENCY: Record<string, TariffCurrency> = {
  JP: "JPY",
  KR: "KRW",
  SG: "SGD",
  NL: "EUR",
};

export function portCurrency(port: PortCode): TariffCurrency {
  return COUNTRY_CURRENCY[port.slice(0, 2)] ?? "USD";
}

/**
 * Terminal handling per container, by country. Ports set their own tariff;
 * a country-level figure is the model's resolution, and says so.
 */
const THC_USD: Record<string, number> = {
  JP: 182,
  KR: 150,
  TW: 140,
  SG: 131,
  LK: 120,
  AE: 160,
  NL: 214,
};
const DEFAULT_THC_USD = 160;

/** Inland haulage between the yard and a door, per container, by country. */
const HAULAGE_USD: Record<string, number> = {
  JP: 260,
  KR: 220,
  TW: 200,
  SG: 190,
  LK: 170,
  AE: 210,
  NL: 310,
};
const DEFAULT_HAULAGE_USD = 220;

const thc = (port: PortCode) => THC_USD[port.slice(0, 2)] ?? DEFAULT_THC_USD;
const haulage = (port: PortCode) => HAULAGE_USD[port.slice(0, 2)] ?? DEFAULT_HAULAGE_USD;

/** Per bill of lading, not per container. */
const DOCUMENTATION_USD = 65;
const DELIVERY_ORDER_USD = 55;
const MANIFEST_FILING_USD = 35;
/** Per container. */
const SEAL_USD = 12;
const ISPS_USD = 25;
/** Per reefer container: plug-in, monitoring and pre-trip inspection. */
const REEFER_SURCHARGE_USD = 350;
/** Per overweight container. */
const OVERWEIGHT_SURCHARGE_USD = 120;

/** Ocean surcharges, as a share of the base ocean freight. */
export const BUNKER_RATE = 0.12;
export const CURRENCY_RATE = 0.025;

export type SectionId = "origin" | "ocean" | "destination";

/** The four switches on the real options page. */
export type FreightGroup =
  | "basicOceanFreight"
  | "freightCharge"
  | "originCharge"
  | "destinationCharge";

export const FREIGHT_GROUPS: readonly { id: FreightGroup; labelKey: string }[] = [
  { id: "basicOceanFreight", labelKey: "group.basicOceanFreight" },
  { id: "freightCharge", labelKey: "group.freightCharge" },
  { id: "originCharge", labelKey: "group.originCharge" },
  { id: "destinationCharge", labelKey: "group.destinationCharge" },
];

/**
 * Lines carry KEYS, not prose. A pure pricing model has no business holding
 * display copy; it says what the charge IS and the component says it in
 * whatever language is being read. `code` is the exception and stays
 * literal: THC is THC on a Vietnamese invoice too.
 */
export interface ChargeLine {
  code: string;
  labelKey: string;
  group: FreightGroup;
  /** The currency the tariff is published in. `amount` is always USD. */
  currency: TariffCurrency;
  /** What it is charged on — per container, per B/L, a share of the freight. */
  basisKey: string;
  basisVars?: Record<string, string | number>;
  amount: number;
}

export interface ChargeSection {
  id: SectionId;
  titleKey: string;
  /** The port code the heading names, or absent for the ocean leg. */
  port?: PortCode;
  /** CY or Door at this end; absent for the ocean leg. */
  scope?: Scope;
  lines: ChargeLine[];
  subtotal: number;
}

/*
 * A rate as a percentage, as a NUMBER — the renderer prints it, because only
 * the renderer knows whether the decimal separator is a dot or a comma.
 */
const pct = (rate: number) => Math.round(rate * 1000) / 10;

const money = (x: number) => Math.round(x * 100) / 100;

export function chargeSections(input: {
  pol: PortCode;
  pod: PortCode;
  rows: RowResult[];
  originScope: Scope;
  destinationScope: Scope;
  /** Base ocean freight, already scaled for the chosen sailing. */
  oceanFreight: number;
}): ChargeSection[] {
  const { pol, pod, rows, originScope, destinationScope, oceanFreight } = input;
  const units = rows.reduce((n, r) => n + r.quantity, 0);
  const reeferUnits = rows.filter((r) => r.reefer).reduce((n, r) => n + r.quantity, 0);
  const overweightUnits = rows
    .filter((r) => r.overweight)
    .reduce((n, r) => n + r.quantity, 0);

  const perContainer = { key: "basis.perContainer", vars: { units } };
  const perBl = { key: "basis.perBl" };

  const build = (
    id: SectionId,
    titleKey: string,
    port: PortCode | undefined,
    scope: Scope | undefined,
    lines: ChargeLine[],
  ): ChargeSection => ({
    id,
    titleKey,
    port,
    scope,
    lines,
    subtotal: money(lines.reduce((n, l) => n + l.amount, 0)),
  });

  const originCcy = portCurrency(pol);
  const destCcy = portCurrency(pod);

  const origin: ChargeLine[] = [];
  if (originScope === "DOOR") {
    origin.push({
      code: "OHC",
      labelKey: "charge.haulage",
      group: "originCharge",
      currency: originCcy,
      basisKey: perContainer.key,
      basisVars: perContainer.vars,
      amount: money(haulage(pol) * units),
    });
  }
  origin.push(
    {
      code: "THC",
      labelKey: "charge.thc",
      group: "originCharge",
      currency: originCcy,
      basisKey: perContainer.key,
      basisVars: perContainer.vars,
      amount: money(thc(pol) * units),
    },
    {
      code: "DOC",
      labelKey: "charge.doc",
      group: "originCharge",
      currency: originCcy,
      basisKey: perBl.key,
      amount: DOCUMENTATION_USD,
    },
    {
      code: "SEAL",
      labelKey: "charge.seal",
      group: "originCharge",
      currency: originCcy,
      basisKey: perContainer.key,
      basisVars: perContainer.vars,
      amount: money(SEAL_USD * units),
    },
    {
      code: "ISPS",
      labelKey: "charge.isps",
      group: "originCharge",
      currency: originCcy,
      basisKey: perContainer.key,
      basisVars: perContainer.vars,
      amount: money(ISPS_USD * units),
    },
  );

  const ocean: ChargeLine[] = [
    {
      code: "O/F",
      labelKey: "charge.of",
      group: "basicOceanFreight",
      currency: "USD",
      basisKey: perContainer.key,
      basisVars: perContainer.vars,
      amount: money(oceanFreight),
    },
    {
      code: "BAF",
      labelKey: "charge.baf",
      group: "freightCharge",
      currency: "USD",
      basisKey: "basis.shareOfFreight",
      basisVars: { pct: pct(BUNKER_RATE) },
      amount: money(oceanFreight * BUNKER_RATE),
    },
    {
      code: "CAF",
      labelKey: "charge.caf",
      group: "freightCharge",
      currency: "USD",
      basisKey: "basis.shareOfFreight",
      basisVars: { pct: pct(CURRENCY_RATE) },
      amount: money(oceanFreight * CURRENCY_RATE),
    },
  ];
  if (reeferUnits > 0) {
    ocean.push({
      code: "RFS",
      labelKey: "charge.reefer",
      group: "freightCharge",
      currency: "USD",
      basisKey: "basis.perContainer",
      basisVars: { units: reeferUnits },
      amount: money(REEFER_SURCHARGE_USD * reeferUnits),
    });
  }
  if (overweightUnits > 0) {
    ocean.push({
      code: "OWS",
      labelKey: "charge.overweight",
      group: "freightCharge",
      currency: "USD",
      basisKey: "basis.perContainer",
      basisVars: { units: overweightUnits },
      amount: money(OVERWEIGHT_SURCHARGE_USD * overweightUnits),
    });
  }

  const destination: ChargeLine[] = [
    {
      code: "DTHC",
      labelKey: "charge.thc",
      group: "destinationCharge",
      currency: destCcy,
      basisKey: perContainer.key,
      basisVars: perContainer.vars,
      amount: money(thc(pod) * units),
    },
    {
      code: "D/O",
      labelKey: "charge.do",
      group: "destinationCharge",
      currency: destCcy,
      basisKey: perBl.key,
      amount: DELIVERY_ORDER_USD,
    },
    {
      code: "ENS",
      labelKey: "charge.ens",
      group: "destinationCharge",
      currency: destCcy,
      basisKey: perBl.key,
      amount: MANIFEST_FILING_USD,
    },
  ];
  if (destinationScope === "DOOR") {
    destination.push({
      code: "DHC",
      labelKey: "charge.haulage",
      group: "destinationCharge",
      currency: destCcy,
      basisKey: perContainer.key,
      basisVars: perContainer.vars,
      amount: money(haulage(pod) * units),
    });
  }

  return [
    build("origin", "section.origin", pol, originScope, origin),
    build("ocean", "section.ocean", undefined, undefined, ocean),
    build("destination", "section.destination", pod, destinationScope, destination),
  ];
}

/** The lines in the chosen groups, summed — what the freight view shows. */
export function groupTotal(
  sections: ChargeSection[],
  groups: readonly FreightGroup[],
): number {
  return money(
    sections
      .flatMap((s) => s.lines)
      .filter((l) => groups.includes(l.group))
      .reduce((n, l) => n + l.amount, 0),
  );
}

/** Everything. The all-in figure for the shipment, before discount. */
export function allInTotal(sections: ChargeSection[]): number {
  return money(sections.reduce((n, s) => n + s.subtotal, 0));
}
