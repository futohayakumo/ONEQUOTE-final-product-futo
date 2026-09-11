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
  mode: ProcessMode;
  agency: Agency;
}

/** The badge each agency carries. Shared with the mode legend above the floor. */
export const AGENCY_KEY: Record<Agency, string> = {
  human: "sim.badge.humanWork",
  assisted: "sim.badge.aiAssisted",
  automated: "sim.badge.aiAutomation",
};

/**
 * Five roles, not five stages — a queue forms in front of a person.
 *
 * The reviewers are the correction worth noting. This row used to be "deploy",
 * automated in the AI room, which quietly said the approval rule goes away.
 * It does not: the protocol requires two independent approvals in both rooms
 * and the section further down this page says so. What the AI room changes is
 * what the two reviewers are handed, not whether they are asked.
 */
/**
 * Which room a station belongs to, its ordinal in that room, and how much of
 * it a person does.
 *
 * `agency` used to be a record keyed by mode, because both rooms rendered the
 * same five stations. They no longer do — a station exists in exactly one room
 * — so it is a single value and the mode is a property of the station rather
 * than an axis across it.
 *
 * The reviewers are the correction worth noting. That row used to appear in
 * both rooms and go `automated` in the AI one, which quietly said the
 * two-approval rule evaporates. It does not evaporate; it is replaced. Under
 * AI-DLC the pull-request gate is not a shorter queue in front of two people,
 * it is Verification — a bot suite that runs the moment the code exists. So
 * the reviewers belong to the traditional room only, and what stands in their
 * place has its own name.
 */
export const STATIONS: Record<StepId, StationInfo> = {
  // Traditional scrum: five roles, and a hand-off between each pair.
  po: { no: 1, mode: "traditional", agency: "human" },
  design: { no: 2, mode: "traditional", agency: "assisted" },
  dev: { no: 3, mode: "traditional", agency: "assisted" },
  qa: { no: 4, mode: "traditional", agency: "human" },
  review: { no: 5, mode: "traditional", agency: "human" },

  // AI-DLC: one Bolt, four phases, and the two that keep a person are the two
  // where something is decided rather than produced.
  inception: { no: 1, mode: "ai-dlc", agency: "assisted" },
  construct: { no: 2, mode: "ai-dlc", agency: "assisted" },
  verification: { no: 3, mode: "ai-dlc", agency: "automated" },
  bolt: { no: 4, mode: "ai-dlc", agency: "automated" },
};

/** What the pile between two stations represents — one key per gap. There are
 *  no gaps in the AI-DLC room, so these are traditional-only. */
export const GAP_REASON_KEYS: string[] = [
  "sim.gap.0",
  "sim.gap.1",
  "sim.gap.2",
  "sim.gap.3",
];
