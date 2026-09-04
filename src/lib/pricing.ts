import type {
  ContainerType,
  LoyaltyTier,
  PortCode,
  QuoteErrors,
  QuoteInput,
  QuoteResult,
} from "@/types/quote";

/**
 * Pure, synchronous, dependency-free quote math for the `Core Quotation Module`
 * simulation. No Date, no Math.random — identical inputs always produce an
 * identical result, which is what lets the console replay be reproducible.
 */

export const PORTS: Record<
  PortCode,
  { code: PortCode; city: string; country: string }
> = {
  JPTYO: { code: "JPTYO", city: "Tokyo", country: "JP" },
  JPYOK: { code: "JPYOK", city: "Yokohama", country: "JP" },
  SGSIN: { code: "SGSIN", city: "Singapore", country: "SG" },
  NLRTM: { code: "NLRTM", city: "Rotterdam", country: "NL" },
};

export const PORT_ORDER: readonly PortCode[] = [
  "JPTYO",
  "JPYOK",
  "SGSIN",
  "NLRTM",
] as const;

/** Base ocean rate in USD per container unit. Symmetric: the key is sorted. */
export const LANE_BASE_USD: Record<string, number> = {
  "JPTYO|JPYOK": 320, // domestic feeder
  "JPTYO|SGSIN": 1150,
  "JPTYO|NLRTM": 2480,
  "JPYOK|SGSIN": 1090,
  "JPYOK|NLRTM": 2420,
  "NLRTM|SGSIN": 1980,
};

export const CONTAINERS: Record<
  ContainerType,
  { label: string; capacityCbm: number; multiplier: number; teu: number }
> = {
  "20GP": {
    label: "20' Standard GP",
    capacityCbm: 33,
    multiplier: 1.0,
    teu: 1,
  },
  "40HC": {
    label: "40' High Cube HC",
    capacityCbm: 76,
    multiplier: 1.75,
    teu: 2,
  },
  "40RF": { label: "40' Reefer RF", capacityCbm: 67, multiplier: 2.6, teu: 2 },
};

export const CONTAINER_ORDER: readonly ContainerType[] = [
  "20GP",
  "40HC",
  "40RF",
] as const;

/**
 * `Volume Loyalty Framework`. Blue Wave deliberately carries NO rate discount —
 * its entire value is the coupon granted every 5 TEU of accrued volume.
 */
export const LOYALTY_TIERS: Record<
  LoyaltyTier,
  { label: string; discountRate: number; milestoneTeu: number }
> = {
  BLUE_WAVE: { label: "Blue Wave", discountRate: 0.0, milestoneTeu: 5 },
  SILVER_SAIL: { label: "Silver Sail", discountRate: 0.03, milestoneTeu: 10 },
  GOLDEN_SEA: { label: "Golden Sea", discountRate: 0.06, milestoneTeu: 20 },
  MILLION_MAGENTA: {
    label: "Million Magenta",
    discountRate: 0.1,
    milestoneTeu: 50,
  },
};

export const TIER_ORDER: readonly LoyaltyTier[] = [
  "BLUE_WAVE",
  "SILVER_SAIL",
  "GOLDEN_SEA",
  "MILLION_MAGENTA",
] as const;

export const CBM_TERMINAL_HANDLING_USD_PER_CBM = 4.5;
export const DOCUMENTATION_FEE_USD = 65.0;
export const BUNKER_ADJUSTMENT_RATE = 0.12;
export const RATE_VALIDITY_HOURS = 72;
export const MAX_CBM = 2000;

const money = (x: number) => Math.round(x * 100) / 100;

export function laneKey(a: PortCode, b: PortCode): string {
  return [a, b].sort().join("|");
}

export function laneBaseUsd(a: PortCode, b: PortCode): number {
  return LANE_BASE_USD[laneKey(a, b)] ?? 0;
}

export function validateQuote(input: QuoteInput): QuoteErrors {
  const errors: QuoteErrors = {};

  if (!input.pol) errors.pol = "Select a port of loading.";
  if (!input.pod) errors.pod = "Select a port of discharge.";
  if (input.pol && input.pod && input.pol === input.pod) {
    errors.pod = "Port of loading and discharge must differ.";
  }
  if (input.cbm === "" || Number.isNaN(Number(input.cbm))) {
    errors.cbm = "Enter a cargo volume.";
  } else {
    const v = Number(input.cbm);
    if (v <= 0 || v > MAX_CBM) {
      errors.cbm = `Cargo volume must be between 1 and ${MAX_CBM} CBM.`;
    }
  }
  if (!input.containerType) errors.containerType = "Select a container type.";
  if (!input.tier) errors.tier = "Select a loyalty tier.";

  return errors;
}

/** FNV-1a over the five inputs → a stable 6-hex-char quote reference. */
export function quoteRef(
  pol: PortCode,
  pod: PortCode,
  cbm: number,
  containerType: ContainerType,
  tier: LoyaltyTier,
): string {
  const seed = `${pol}|${pod}|${cbm}|${containerType}|${tier}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).toUpperCase().padStart(8, "0").slice(-6);
}

export function calculateQuote(input: {
  pol: PortCode;
  pod: PortCode;
  cbm: number;
  containerType: ContainerType;
  tier: LoyaltyTier;
}): QuoteResult {
  const { pol, pod, cbm, containerType, tier } = input;

  const laneBase = laneBaseUsd(pol, pod);
  const container = CONTAINERS[containerType];
  const loyalty = LOYALTY_TIERS[tier];

  const units = Math.max(1, Math.ceil(cbm / container.capacityCbm));

  const oceanFreight = money(laneBase * container.multiplier * units);
  const terminalHandling = money(cbm * CBM_TERMINAL_HANDLING_USD_PER_CBM);
  const documentation = DOCUMENTATION_FEE_USD;
  const bunkerAdjustment = money(oceanFreight * BUNKER_ADJUSTMENT_RATE);

  const subtotal = money(
    oceanFreight + terminalHandling + documentation + bunkerAdjustment,
  );
  const loyaltyDiscount = money(subtotal * loyalty.discountRate);
  const total = money(subtotal - loyaltyDiscount);

  const teuAccrued = units * container.teu;
  const nextMilestoneTeu =
    Math.ceil((teuAccrued + 1) / loyalty.milestoneTeu) * loyalty.milestoneTeu;

  return {
    quoteId: `QTN-${quoteRef(pol, pod, cbm, containerType, tier)}`,
    pol,
    pod,
    cbm,
    containerType,
    tier,
    laneBase,
    units,
    multiplier: container.multiplier,
    capacityCbm: container.capacityCbm,
    oceanFreight,
    terminalHandling,
    documentation,
    bunkerAdjustment,
    subtotal,
    discountRate: loyalty.discountRate,
    loyaltyDiscount,
    total,
    teuAccrued,
    milestoneTeu: loyalty.milestoneTeu,
    nextMilestoneTeu,
    validityHours: RATE_VALIDITY_HOURS,
  };
}
