export type PortCode = "JPTYO" | "JPYOK" | "SGSIN" | "NLRTM";

/**
 * The four equipment types ONE QUOTE offers, observed on the real form on
 * 2026-09-11: dry and reefer, twenty-foot and forty-foot high cube. No 40'
 * standard, no 45', no open top.
 */
export type EquipmentType = "DRY20" | "DRY40H" | "REEFER20" | "REEFER40H";

export type Commodity =
  | "GENERAL"
  | "MACHINERY"
  | "ELECTRONICS"
  | "APPAREL"
  | "CHILLED_FOOD"
  | "FROZEN_FOOD";

export type LoyaltyTier =
  | "BLUE_WAVE"
  | "SILVER_SAIL"
  | "GOLDEN_SEA"
  | "PLATINUM_TIDE";

/**
 * How far the carrier's responsibility reaches at each end. CY is the
 * container yard at the port; Door is the customer's premises, which adds
 * inland haulage on that side. This is the carrier's term for it — an
 * Incoterm is the seller–buyer contract and is not what a carrier quotes.
 */
export type Scope = "CY" | "DOOR";

/** One line of the container section: a type, how many, how heavy in total. */
export interface ContainerRow {
  equipment: EquipmentType;
  quantity: number;
  /** Gross cargo weight across the row, in kilograms. */
  weightKg: number;
}

export interface QuoteInput {
  pol: PortCode | "";
  pod: PortCode | "";
  containers: ContainerRow[];
  commodity: Commodity | "";
  tier: LoyaltyTier | "";
  originScope: Scope;
  destinationScope: Scope;
  /** Chosen departure, as days from the schedule's reference day; null until picked. */
  etdOffset: number | null;
}

export interface QuoteError {
  key: string;
  vars?: Record<string, string | number>;
}

export interface QuoteErrors {
  pol?: QuoteError;
  pod?: QuoteError;
  containers?: QuoteError;
  commodity?: QuoteError;
  tier?: QuoteError;
  etd?: QuoteError;
}

/** A container row, priced. */
export interface RowResult extends ContainerRow {
  multiplier: number;
  teu: number;
  /** Base ocean freight for the row: lane base × multiplier × quantity. */
  oceanFreight: number;
  /** Average payload per container is above the overweight threshold. */
  overweight: boolean;
  reefer: boolean;
}

export interface QuoteResult {
  quoteId: string;
  pol: PortCode;
  pod: PortCode;
  commodity: Commodity;
  tier: LoyaltyTier;
  originScope: Scope;
  destinationScope: Scope;
  rows: RowResult[];
  /** Containers across all rows. */
  units: number;
  teuAccrued: number;
  laneBase: number;
  /** Base ocean freight across all rows, before surcharges and discount. */
  oceanFreight: number;
  discountRate: number;
  milestoneTeu: number;
  nextMilestoneTeu: number;
  validityHours: number;
}
