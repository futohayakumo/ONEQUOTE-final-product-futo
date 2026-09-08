import type { ProcessMode, StepId } from "@/types/process-scene";

/**
 * What actually happens at each station, in each room.
 *
 * The screen was previously unreadable because a box simply travelled past
 * five identical desks. The station copy is the fix: every station says who
 * does the work, what the work is, and whether AI touches it — rendered as DOM
 * labels anchored to the projected 3D positions, so the typography stays
 * inside the design system.
 *
 * The copy itself lives in the locale bundles under `station.<step>.name.<mode>`
 * and `station.<step>.does.<mode>`, because this screen switches language like
 * every other one. What stays here is the part that is structure rather than
 * prose: the ordinal, and which agency each step has in each room — the latter
 * decides a colour in the 3D scene as well as a label.
 */

export type Agency = "human" | "assisted" | "automated";

export interface StationInfo {
  no: number;
  agency: Record<ProcessMode, Agency>;
}

/** The badge each agency carries. Shared with the mode legend above the floor. */
export const AGENCY_KEY: Record<Agency, string> = {
  human: "sim.badge.humanWork",
  assisted: "sim.badge.aiAssisted",
  automated: "sim.badge.aiAutomation",
};

export const STATIONS: Record<StepId, StationInfo> = {
  intake: {
    no: 1,
    agency: { traditional: "human", "ai-driven": "automated" },
  },
  analysis: {
    no: 2,
    agency: { traditional: "assisted", "ai-driven": "assisted" },
  },
  dev: {
    no: 3,
    agency: { traditional: "assisted", "ai-driven": "assisted" },
  },
  test: {
    no: 4,
    agency: { traditional: "assisted", "ai-driven": "automated" },
  },
  deploy: {
    no: 5,
    agency: { traditional: "human", "ai-driven": "automated" },
  },
};

/** What the pile between two stations represents — one key per gap. */
export const GAP_REASON_KEYS: string[] = [
  "sim.gap.0",
  "sim.gap.1",
  "sim.gap.2",
  "sim.gap.3",
];
