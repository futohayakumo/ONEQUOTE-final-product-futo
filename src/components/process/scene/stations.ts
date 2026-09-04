import type { ProcessMode, StepId } from "@/types/process-scene";

/**
 * What actually happens at each station, in each room.
 *
 * The screen was previously unreadable because a box simply travelled past
 * five identical desks. These strings are the fix: every station says who does
 * the work, what the work is, and whether AI touches it — rendered as DOM
 * labels anchored to the projected 3D positions, so the typography stays
 * inside the design system.
 */

export type Agency = "human" | "assisted" | "automated";

export interface StationInfo {
  no: number;
  /** Name shown in this room. The AI room renames a couple of steps. */
  name: Record<ProcessMode, string>;
  does: Record<ProcessMode, string>;
  agency: Record<ProcessMode, Agency>;
}

export const AGENCY_LABEL: Record<Agency, string> = {
  human: "Human work",
  assisted: "AI-assisted",
  automated: "AI automation",
};

export const STATIONS: Record<StepId, StationInfo> = {
  intake: {
    no: 1,
    name: { traditional: "Intake", "ai-driven": "Intake & Triage" },
    does: {
      traditional:
        "Reads the request, writes the ticket by hand, and drops it on the next queue.",
      "ai-driven":
        "Drafts the ticket from the request and routes it to the right lane on its own.",
    },
    agency: { traditional: "human", "ai-driven": "automated" },
  },
  analysis: {
    no: 2,
    name: { traditional: "Analysis", "ai-driven": "Analysis" },
    does: {
      traditional:
        "Works out acceptance criteria and sizes the item, then hands it on.",
      "ai-driven":
        "Proposes criteria and a size; a person confirms or overrides it.",
    },
    agency: { traditional: "assisted", "ai-driven": "assisted" },
  },
  dev: {
    no: 3,
    name: { traditional: "Dev", "ai-driven": "Build & Improve" },
    does: {
      traditional:
        "Writes the code, then hand-formats the commit to the [Ticket_ID] tag.",
      "ai-driven":
        "A person sets the intent; generation and commit formatting are automatic.",
    },
    agency: { traditional: "assisted", "ai-driven": "assisted" },
  },
  test: {
    no: 4,
    name: { traditional: "Test", "ai-driven": "Test & Validate" },
    does: {
      traditional:
        "Runs the checks by hand and re-reads the diff line by line.",
      "ai-driven":
        "Runs checks and reviews the diff continuously, in-line, as work arrives.",
    },
    agency: { traditional: "assisted", "ai-driven": "automated" },
  },
  deploy: {
    no: 5,
    name: { traditional: "Deploy", "ai-driven": "Deploy & Monitor" },
    does: {
      traditional:
        "Cuts the release — but only after two reviewers free up to approve it.",
      "ai-driven":
        "Ships and watches the result. There is no approval queue to join.",
    },
    agency: { traditional: "human", "ai-driven": "automated" },
  },
};

/** What the pile between two stations represents. */
export const GAP_REASON: string[] = [
  "Waiting for the analyst to finish the previous item",
  "Waiting for a developer to pick it up",
  "Waiting for a tester to free up",
  "Waiting for two reviewers to approve the Pull Request",
];
