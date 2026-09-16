import { isPortCode, laneBaseFromNm, portByCode, seaDistanceNm } from "./ports.ts";
import type {
  Commodity,
  ContainerRow,
  EquipmentType,
  LoyaltyTier,
  PortCode,
  QuoteErrors,
  QuoteInput,
  QuoteResult,
  RowResult,
  Scope,
} from "@/types/quote";

/**
 * Pure, synchronous, dependency-free quote math. No Date, no Math.random —
 * identical inputs always produce an identical result, which is what lets the
 * browser and the quotation service agree to the cent.
 *
 * Rebuilt on 2026-09-11 against the real ONE QUOTE form. The earlier model
 * asked for cargo volume in cubic metres and one container type; the product
 * asks for equipment type × quantity × cargo weight, several rows at once, a
 * commodity, and a departure date, and offers exactly four equipment types.
 * The equipment factors and surcharges below are still the portfolio's own
 * model — not a carrier tariff — and every response says so. The lane's base
 * rate is no longer a table either: since 2026-09-16 it is a line in the sea
 * distance between the two ports, and the ports are every seaport UN/LOCODE
 * places in the routed countries (`ports.ts`).
 */

/**
 * The four equipment types, and what each does to the price.
 *
 * `maxPayloadKg` is the structural limit — a row heavier than that per box
 * cannot be shipped and is an error, not a surcharge. `overweightFromKg` is
 * where the overweight surcharge starts: heavy boxes cost the terminal more
 * to lift and the ship more to place, and the tariff says so before the
 * legal limit is reached.
 */
export const EQUIPMENT: Record<
  EquipmentType,
  {
    label: string;
    multiplier: number;
    teu: number;
    reefer: boolean;
    maxPayloadKg: number;
    overweightFromKg: number;
  }
> = {
  DRY20: {
    label: "20' Dry",
    multiplier: 1.0,
    teu: 1,
    reefer: false,
    maxPayloadKg: 28_000,
    overweightFromKg: 24_000,
  },
  DRY40H: {
    label: "40' High Cube Dry",
    multiplier: 1.75,
    teu: 2,
    reefer: false,
    maxPayloadKg: 28_500,
    overweightFromKg: 26_000,
  },
  REEFER20: {
    label: "20' Reefer",
    multiplier: 1.9,
    teu: 1,
    reefer: true,
    maxPayloadKg: 27_000,
    overweightFromKg: 24_000,
  },
  REEFER40H: {
    label: "40' High Cube Reefer",
    multiplier: 2.6,
    teu: 2,
    reefer: true,
    maxPayloadKg: 29_000,
    overweightFromKg: 26_000,
  },
};

export const EQUIPMENT_ORDER: readonly EquipmentType[] = [
  "DRY20",
  "DRY40H",
  "REEFER20",
  "REEFER40H",
] as const;

/**
 * Commodities, as the form offers them. What a commodity changes here is
 * whether it needs a reefer — the tariff class is the same model rate for
 * all of them, which is one of the things the real tariff will differ on.
 */
export const COMMODITIES: Record<Commodity, { labelKey: string; requiresReefer: boolean }> = {
  GENERAL: { labelKey: "commodity.general", requiresReefer: false },
  MACHINERY: { labelKey: "commodity.machinery", requiresReefer: false },
  ELECTRONICS: { labelKey: "commodity.electronics", requiresReefer: false },
  APPAREL: { labelKey: "commodity.apparel", requiresReefer: false },
  CHILLED_FOOD: { labelKey: "commodity.chilledFood", requiresReefer: true },
  FROZEN_FOOD: { labelKey: "commodity.frozenFood", requiresReefer: true },
};

export const COMMODITY_ORDER: readonly Commodity[] = [
  "GENERAL",
  "MACHINERY",
  "ELECTRONICS",
  "APPAREL",
  "CHILLED_FOOD",
  "FROZEN_FOOD",
] as const;

export const SCOPE_ORDER: readonly Scope[] = ["CY", "DOOR"] as const;

/**
 * `Volume Loyalty Framework`. Blue Wave deliberately carries NO rate discount —
 * its entire value is the coupon granted every 5 TEU of accrued volume. The
 * discount applies to the base ocean freight, which is the carrier's own leg.
 */
export const LOYALTY_TIERS: Record<
  LoyaltyTier,
  { label: string; discountRate: number; milestoneTeu: number }
> = {
  BLUE_WAVE: { label: "Blue Wave", discountRate: 0.0, milestoneTeu: 5 },
  SILVER_SAIL: { label: "Silver Sail", discountRate: 0.03, milestoneTeu: 10 },
  GOLDEN_SEA: { label: "Golden Sea", discountRate: 0.06, milestoneTeu: 20 },
  PLATINUM_TIDE: {
    label: "Platinum Tide",
    discountRate: 0.1,
    milestoneTeu: 50,
  },
};

export const TIER_ORDER: readonly LoyaltyTier[] = [
  "BLUE_WAVE",
  "SILVER_SAIL",
  "GOLDEN_SEA",
  "PLATINUM_TIDE",
] as const;

export const RATE_VALIDITY_HOURS = 72;
export const MAX_QUANTITY_PER_ROW = 50;
export const MAX_ROWS = 4;

const money = (x: number) => Math.round(x * 100) / 100;

export function laneKey(a: PortCode, b: PortCode): string {
  return [a, b].sort().join("|");
}

/** Sea distance for the lane, or 0 when either code is not a placed port. */
export function laneDistanceNm(a: PortCode, b: PortCode): number {
  const pa = portByCode(a);
  const pb = portByCode(b);
  return pa && pb ? seaDistanceNm(pa, pb) : 0;
}

/**
 * Base ocean rate for the lane, USD per 20' dry — a line in the sea
 * distance between the two ports (see `ports.ts`), not a table.
 */
export function laneBaseUsd(a: PortCode, b: PortCode): number {
  return laneBaseFromNm(laneDistanceNm(a, b));
}

/** An empty container row, the way the form starts one. */
export function emptyRow(equipment: EquipmentType = "DRY20"): ContainerRow {
  return { equipment, quantity: 1, weightKg: 12_000 };
}

export function validateQuote(input: QuoteInput): QuoteErrors {
  const errors: QuoteErrors = {};

  // Keys, not sentences. The validator is pure and has no locale; the screen
  // that renders the message is the thing that knows which language to say it
  // in. A message carries its bound as a variable so the limit stays stated
  // once, here.
  if (!input.pol) errors.pol = { key: "quote.error.pol" };
  else if (!isPortCode(input.pol)) errors.pol = { key: "quote.error.unknownPort" };
  if (!input.pod) errors.pod = { key: "quote.error.pod" };
  else if (!isPortCode(input.pod)) errors.pod = { key: "quote.error.unknownPort" };
  if (input.pol && input.pod && input.pol === input.pod) {
    errors.pod = { key: "quote.error.samePort" };
  }

  if (input.containers.length === 0) {
    errors.containers = { key: "quote.error.noContainers" };
  } else {
    for (const row of input.containers) {
      const eq = EQUIPMENT[row.equipment];
      if (
        !Number.isInteger(row.quantity) ||
        row.quantity < 1 ||
        row.quantity > MAX_QUANTITY_PER_ROW
      ) {
        errors.containers = {
          key: "quote.error.quantityRange",
          vars: { max: MAX_QUANTITY_PER_ROW },
        };
        break;
      }
      if (!(row.weightKg > 0)) {
        errors.containers = { key: "quote.error.weightMissing" };
        break;
      }
      if (row.weightKg / row.quantity > eq.maxPayloadKg) {
        errors.containers = {
          key: "quote.error.overPayload",
          vars: { equipment: eq.label, max: eq.maxPayloadKg },
        };
        break;
      }
    }
  }

  if (!input.commodity) {
    errors.commodity = { key: "quote.error.commodity" };
  } else if (
    COMMODITIES[input.commodity].requiresReefer &&
    input.containers.some((r) => !EQUIPMENT[r.equipment].reefer)
  ) {
    errors.commodity = { key: "quote.error.needsReefer" };
  }

  if (!input.tier) errors.tier = { key: "quote.error.tier" };
  if (input.etdOffset === null) errors.etd = { key: "quote.error.etd" };

  return errors;
}

/** FNV-1a over the inputs → a stable 6-hex-char quote reference. */
export function quoteRef(seed: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).toUpperCase().padStart(8, "0").slice(-6);
}

export function priceRow(row: ContainerRow, laneBase: number): RowResult {
  const eq = EQUIPMENT[row.equipment];
  return {
    ...row,
    multiplier: eq.multiplier,
    teu: eq.teu * row.quantity,
    oceanFreight: money(laneBase * eq.multiplier * row.quantity),
    overweight: row.weightKg / row.quantity > eq.overweightFromKg,
    reefer: eq.reefer,
  };
}

export function calculateQuote(input: {
  pol: PortCode;
  pod: PortCode;
  containers: ContainerRow[];
  commodity: Commodity;
  tier: LoyaltyTier;
  originScope: Scope;
  destinationScope: Scope;
}): QuoteResult {
  const { pol, pod, containers, commodity, tier, originScope, destinationScope } =
    input;

  const laneNm = laneDistanceNm(pol, pod);
  const laneBase = laneBaseFromNm(laneNm);
  const loyalty = LOYALTY_TIERS[tier];
  const rows = containers.map((r) => priceRow(r, laneBase));

  const units = rows.reduce((n, r) => n + r.quantity, 0);
  const teuAccrued = rows.reduce((n, r) => n + r.teu, 0);
  const oceanFreight = money(rows.reduce((n, r) => n + r.oceanFreight, 0));
  const nextMilestoneTeu =
    Math.ceil((teuAccrued + 1) / loyalty.milestoneTeu) * loyalty.milestoneTeu;

  const seed = [
    pol,
    pod,
    rows.map((r) => `${r.equipment}x${r.quantity}@${r.weightKg}`).join(","),
    commodity,
    tier,
    originScope,
    destinationScope,
  ].join("|");

  return {
    quoteId: `QTN-${quoteRef(seed)}`,
    pol,
    pod,
    commodity,
    tier,
    originScope,
    destinationScope,
    rows,
    units,
    teuAccrued,
    laneNm,
    laneBase,
    oceanFreight,
    discountRate: loyalty.discountRate,
    milestoneTeu: loyalty.milestoneTeu,
    nextMilestoneTeu,
    validityHours: RATE_VALIDITY_HOURS,
  };
}
