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

export const INCOTERMS: Record<
  Incoterm,
  { label: string; note: string; sections: SectionId[] }
> = {
  EXW: {
    label: "EXW — Ex Works",
    note: "The buyer carries everything from the seller's door. Nothing on this quotation is the seller's cost.",
    sections: [],
  },
  FOB: {
    label: "FOB — Free On Board",
    note: "The seller pays to get the box loaded. Ocean and destination sit with the buyer.",
    sections: ["origin"],
  },
  CFR: {
    label: "CFR — Cost and Freight",
    note: "The seller pays origin and the sea leg. Destination charges sit with the buyer.",
    sections: ["origin", "ocean"],
  },
  CIF: {
    label: "CIF — Cost, Insurance and Freight",
    note: "As CFR, with marine insurance added. Destination charges still sit with the buyer.",
    sections: ["origin", "ocean"],
  },
  DAP: {
    label: "DAP — Delivered At Place",
    note: "The seller carries it to the named place. Import duty and clearance remain the buyer's.",
    sections: ["origin", "ocean", "destination"],
  },
  DDP: {
    label: "DDP — Delivered Duty Paid",
    note: "The seller carries everything, duty included.",
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

export interface ChargeLine {
  /** The abbreviation the industry uses, because that is what the invoice says. */
  code: string;
  label: string;
  /** What it is charged on — per container, per B/L, a share of the freight. */
  basis: string;
  amount: number;
}

export interface ChargeSection {
  id: SectionId;
  title: string;
  /** True when this Incoterm puts the section on the quoted party's account. */
  onAccount: boolean;
  lines: ChargeLine[];
  subtotal: number;
}

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
    title: string,
    lines: ChargeLine[],
  ): ChargeSection => ({
    id,
    title,
    onAccount: on.includes(id),
    lines,
    subtotal: money(lines.reduce((n, l) => n + l.amount, 0)),
  });

  return [
    build("origin", `Origin — ${pol}`, [
      {
        code: "THC",
        label: "Terminal handling",
        basis: `per container × ${units}`,
        amount: money(THC_USD[pol].origin * units),
      },
      {
        code: "DOC",
        label: "Documentation",
        basis: "per bill of lading",
        amount: DOCUMENTATION_USD,
      },
      {
        code: "SEAL",
        label: "Security seal",
        basis: `per container × ${units}`,
        amount: money(SEAL_USD * units),
      },
      {
        code: "ISPS",
        label: "Port security",
        basis: `per container × ${units}`,
        amount: money(ISPS_USD * units),
      },
    ]),
    build("ocean", "Ocean freight", [
      {
        code: "O/F",
        label: "Base ocean freight",
        basis: `per container × ${units}`,
        amount: money(oceanFreight),
      },
      {
        code: "BAF",
        label: "Bunker adjustment",
        basis: `${(BUNKER_RATE * 100).toFixed(1)}% of O/F`,
        amount: money(oceanFreight * BUNKER_RATE),
      },
      {
        code: "CAF",
        label: "Currency adjustment",
        basis: `${(CURRENCY_RATE * 100).toFixed(1)}% of O/F`,
        amount: money(oceanFreight * CURRENCY_RATE),
      },
    ]),
    build("destination", `Destination — ${pod}`, [
      {
        code: "DTHC",
        label: "Terminal handling",
        basis: `per container × ${units}`,
        amount: money(THC_USD[pod].destination * units),
      },
      {
        code: "D/O",
        label: "Delivery order",
        basis: "per bill of lading",
        amount: DELIVERY_ORDER_USD,
      },
      {
        code: "ENS",
        label: "Manifest filing",
        basis: "per bill of lading",
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
