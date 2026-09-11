/**
 * Value-added services, as the real confirmation page offers them.
 *
 * Observed on ONE QUOTE on 2026-09-11: after accepting an option, the page
 * restates it and offers a premium cargo service and the purchase of extra
 * detention free time at each end, on top of a "ONE QUOTE special" fourteen
 * days already included. The earlier ticket said free time was "not in this
 * quotation", which was the opposite of what the product does.
 *
 * The prices are the portfolio's model. Nothing here imports a value.
 */

/** Per shipment. Priority loading, priority discharge, proactive tracking. */
export const PREMIUM_CARGO_USD = 400;

/** Detention free time every ONE QUOTE booking carries, each end. */
export const FREE_TIME_INCLUDED_DAYS = 14;

/** Extra free time, per container per day, at each end. */
export const EXTRA_FREE_TIME_USD_PER_DAY = { origin: 40, destination: 55 } as const;

export const MAX_EXTRA_FREE_TIME_DAYS = 14;

export interface VasSelection {
  premiumCargo: boolean;
  extraFreeTimeOrigin: number;
  extraFreeTimeDestination: number;
}

export const NO_VAS: VasSelection = {
  premiumCargo: false,
  extraFreeTimeOrigin: 0,
  extraFreeTimeDestination: 0,
};

export interface VasLine {
  id: "premiumCargo" | "freeTimeOrigin" | "freeTimeDestination";
  labelKey: string;
  basisKey: string;
  basisVars?: Record<string, string | number>;
  amount: number;
}

const money = (x: number) => Math.round(x * 100) / 100;

const clampDays = (d: number) =>
  Math.min(MAX_EXTRA_FREE_TIME_DAYS, Math.max(0, Math.round(d)));

/** The lines a selection adds to the ticket. Empty when nothing was chosen. */
export function vasLines(sel: VasSelection, units: number): VasLine[] {
  const lines: VasLine[] = [];
  if (sel.premiumCargo) {
    lines.push({
      id: "premiumCargo",
      labelKey: "vas.premiumCargo",
      basisKey: "basis.perShipment",
      amount: PREMIUM_CARGO_USD,
    });
  }
  const o = clampDays(sel.extraFreeTimeOrigin);
  if (o > 0) {
    lines.push({
      id: "freeTimeOrigin",
      labelKey: "vas.freeTimeOrigin",
      basisKey: "basis.perContainerDay",
      basisVars: { units, days: o },
      amount: money(EXTRA_FREE_TIME_USD_PER_DAY.origin * units * o),
    });
  }
  const d = clampDays(sel.extraFreeTimeDestination);
  if (d > 0) {
    lines.push({
      id: "freeTimeDestination",
      labelKey: "vas.freeTimeDestination",
      basisKey: "basis.perContainerDay",
      basisVars: { units, days: d },
      amount: money(EXTRA_FREE_TIME_USD_PER_DAY.destination * units * d),
    });
  }
  return lines;
}

export function vasTotal(sel: VasSelection, units: number): number {
  return money(vasLines(sel, units).reduce((n, l) => n + l.amount, 0));
}
