import type { ContainerType, PortCode } from "@/types/quote";

/**
 * A quotation the way a liner actually issues one.
 *
 * The earlier model billed four flat lines, one of which — terminal handling —
 * was charged per cubic metre. THC is charged per container: it pays for lifts,
 * and a lift is a lift whether the box is full or half empty. That was the
 * detail a practitioner would have caught first.
 *
 * Real quotations divide into three geographies, because three different
 * parties invoice them and an Incoterm decides which of them is yours:
 *
 *   ORIGIN        THC, documentation, seal, ISPS — the port of loading
 *   OCEAN         O/F, BAF, CAF — the carrier's own leg
 *   DESTINATION   THC, delivery order, ENS/AMS filing — the port of discharge
 *
 * Nothing here imports a value, so the node test runner executes it directly.
 */

/** Terminal handling, per container, by port. Ports set their own tariff. */
const THC_USD: Record<PortCode, { origin: number; destination: number }> = {
  JPTYO: { origin: 182, destination: 182 },
  JPYOK: { origin: 178, destination: 178 },
  SGSIN: { origin: 131, destination: 131 },
  NLRTM: { origin: 214, destination: 214 },
};

/** Per bill of lading, not per container. */
const DOCUMENTATION_USD = 65;
const DELIVERY_ORDER_USD = 55;
const MANIFEST_FILING_USD = 35;
/** Per container. */
const SEAL_USD = 12;
const ISPS_USD = 25;

/** Ocean surcharges, as a share of the base ocean freight. */
export const BUNKER_RATE = 0.12;
export const CURRENCY_RATE = 0.025;

/**
 * Incoterms decide which sections are on your account.
 *
 * This is the single most consequential field on a quotation and the one most
 * often shown as decoration. A quote under EXW and the same quote under DDP
 * are different numbers for the same shipment.
 */
export type Incoterm = "EXW" | "FOB" | "CFR" | "CIF" | "DAP" | "DDP";

/**
 * The three-letter term is the term. Only the gloss and the note translate —
 * "FOB" is FOB in every language, and localising it would be a mistranslation
 * of a contract.
 */
export const INCOTERMS: Record<
  Incoterm,
  { glossKey: string; noteKey: string; sections: SectionId[] }
> = {
  EXW: { glossKey: "incoterm.exw", noteKey: "incoterm.exw.note", sections: [] },
  FOB: {
    glossKey: "incoterm.fob",
    noteKey: "incoterm.fob.note",
    sections: ["origin"],
  },
  CFR: {
    glossKey: "incoterm.cfr",
    noteKey: "incoterm.cfr.note",
    sections: ["origin", "ocean"],
  },
  CIF: {
    glossKey: "incoterm.cif",
    noteKey: "incoterm.cif.note",
    sections: ["origin", "ocean"],
  },
  DAP: {
    glossKey: "incoterm.dap",
    noteKey: "incoterm.dap.note",
    sections: ["origin", "ocean", "destination"],
  },
  DDP: {
    glossKey: "incoterm.ddp",
    noteKey: "incoterm.ddp.note",
    sections: ["origin", "ocean", "destination"],
  },
};

export const INCOTERM_ORDER: readonly Incoterm[] = [
  "EXW",
  "FOB",
  "CFR",
  "CIF",
  "DAP",
  "DDP",
] as const;

export type SectionId = "origin" | "ocean" | "destination";

/**
 * Lines carry KEYS, not prose.
 *
 * The first version returned English strings from here, so half the ticket
 * translated and half did not — the section headings and every charge label
 * stayed in English behind a Vietnamese total. A pure pricing model has no
 * business holding display copy; it says what the charge IS and the component
 * says it in whatever language is being read.
 *
 * `code` is the exception and stays literal. THC is THC on a Vietnamese
 * invoice too; translating an industry abbreviation would make the line
 * harder to reconcile, not easier.
 */
export interface ChargeLine {
  /** The abbreviation the industry uses, because that is what the invoice says. */
  code: string;
  labelKey: string;
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
  /** True when this Incoterm puts the section on the quoted party's account. */
  onAccount: boolean;
  lines: ChargeLine[];
  subtotal: number;
}

/*
 * A rate as a percentage, as a NUMBER — the renderer prints it, because only
 * the renderer knows whether the decimal separator is a dot or a comma.
 * Rounded on the way out: 0.12 * 100 is 12.000000000000002 in binary floating
 * point, and that lands on the page verbatim.
 */
const pct = (rate: number) => Math.round(rate * 1000) / 10;

const money = (x: number) => Math.round(x * 100) / 100;

export function chargeSections(input: {
  pol: PortCode;
  pod: PortCode;
  containerType: ContainerType;
  units: number;
  oceanFreight: number;
  incoterm: Incoterm;
}): ChargeSection[] {
  const { pol, pod, units, oceanFreight, incoterm } = input;
  const on = INCOTERMS[incoterm].sections;

  const build = (
    id: SectionId,
    titleKey: string,
    port: PortCode | undefined,
    lines: ChargeLine[],
  ): ChargeSection => ({
    id,
    titleKey,
    port,
    onAccount: on.includes(id),
    lines,
    subtotal: money(lines.reduce((n, l) => n + l.amount, 0)),
  });

  const perContainer = { key: "basis.perContainer", vars: { units } };
  const perBl = { key: "basis.perBl" };

  return [
    build("origin", "section.origin", pol, [
      {
        code: "THC",
        labelKey: "charge.thc",
        basisKey: perContainer.key,
        basisVars: perContainer.vars,
        amount: money(THC_USD[pol].origin * units),
      },
      {
        code: "DOC",
        labelKey: "charge.doc",
        basisKey: perBl.key,
        amount: DOCUMENTATION_USD,
      },
      {
        code: "SEAL",
        labelKey: "charge.seal",
        basisKey: perContainer.key,
        basisVars: perContainer.vars,
        amount: money(SEAL_USD * units),
      },
      {
        code: "ISPS",
        labelKey: "charge.isps",
        basisKey: perContainer.key,
        basisVars: perContainer.vars,
        amount: money(ISPS_USD * units),
      },
    ]),
    build("ocean", "section.ocean", undefined, [
      {
        code: "O/F",
        labelKey: "charge.of",
        basisKey: perContainer.key,
        basisVars: perContainer.vars,
        amount: money(oceanFreight),
      },
      {
        code: "BAF",
        labelKey: "charge.baf",
        basisKey: "basis.shareOfFreight",
        basisVars: { pct: pct(BUNKER_RATE) },
        amount: money(oceanFreight * BUNKER_RATE),
      },
      {
        code: "CAF",
        labelKey: "charge.caf",
        basisKey: "basis.shareOfFreight",
        basisVars: { pct: pct(CURRENCY_RATE) },
        amount: money(oceanFreight * CURRENCY_RATE),
      },
    ]),
    build("destination", "section.destination", pod, [
      {
        code: "DTHC",
        labelKey: "charge.thc",
        basisKey: perContainer.key,
        basisVars: perContainer.vars,
        amount: money(THC_USD[pod].destination * units),
      },
      {
        code: "D/O",
        labelKey: "charge.do",
        basisKey: perBl.key,
        amount: DELIVERY_ORDER_USD,
      },
      {
        code: "ENS",
        labelKey: "charge.ens",
        basisKey: perBl.key,
        amount: MANIFEST_FILING_USD,
      },
    ]),
  ];
}

/** Only the sections this Incoterm puts on the quoted party. */
export function accountTotal(sections: ChargeSection[]): number {
  return money(
    sections.filter((s) => s.onAccount).reduce((n, s) => n + s.subtotal, 0),
  );
}

/** Everything, whoever pays it. The all-in figure for the shipment. */
export function allInTotal(sections: ChargeSection[]): number {
  return money(sections.reduce((n, s) => n + s.subtotal, 0));
}
