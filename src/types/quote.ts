export type PortCode = "JPTYO" | "JPYOK" | "SGSIN" | "NLRTM";
export type ContainerType = "20GP" | "40HC" | "40RF";
export type LoyaltyTier =
  "BLUE_WAVE" | "SILVER_SAIL" | "GOLDEN_SEA" | "PLATINUM_TIDE";

export interface QuoteInput {
  pol: PortCode | "";
  pod: PortCode | "";
  cbm: number | "";
  containerType: ContainerType | "";
  tier: LoyaltyTier | "";
}

export interface QuoteLine {
  key: string;
  label: string;
  detail?: string;
  amount: number;
}

export interface QuoteResult {
  quoteId: string;
  pol: PortCode;
  pod: PortCode;
  cbm: number;
  containerType: ContainerType;
  tier: LoyaltyTier;
  laneBase: number;
  units: number;
  multiplier: number;
  capacityCbm: number;
  oceanFreight: number;
  terminalHandling: number;
  documentation: number;
  bunkerAdjustment: number;
  subtotal: number;
  discountRate: number;
  loyaltyDiscount: number;
  total: number;
  teuAccrued: number;
  milestoneTeu: number;
  nextMilestoneTeu: number;
  validityHours: number;
}

/** A message the screen still has to translate, plus anything it interpolates. */
export interface QuoteError {
  key: string;
  vars?: Record<string, string | number>;
}

export type QuoteErrors = Partial<Record<keyof QuoteInput, QuoteError>>;
