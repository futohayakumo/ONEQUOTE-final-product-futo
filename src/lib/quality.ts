/**
 * What AI assistance does to defect rate, and what it takes to get it back.
 *
 * The timing model next door was invented — the constants were chosen to make
 * a curve, and nothing in it cited anything. That is a fair complaint about
 * the strongest claim on the site, so the quality dimension is built the other
 * way round: every constant here is a published measurement with its sample
 * attached, and where the sources disagree the spread is shown rather than
 * averaged away.
 *
 * The finding this model exists to carry is not "AI is faster". It is that AI
 * assistance buys lead time and SELLS defect rate, and the trade is only worth
 * taking if the review that would have caught those defects is automated too.
 *
 * Nothing here imports a value, so the node test runner executes it directly.
 */

export interface Evidence {
  id: string;
  /** Internal telemetry, or a published study anyone can go and read. */
  origin: "internal" | "published";
  /** What was measured. */
  metric: string;
  /** The measured multiplier against a non-AI baseline. 1.0 = no change. */
  factor: number;
  /** How it was reported, in the source's own units. */
  reported: string;
  sample: string;
  source: string;
  url: string;
}

/**
 * The team's own measurement, and the headline this screen reports.
 *
 * It is larger than anything published — three times the throughput against a
 * best published figure of about 1.5, and five times the defects against a
 * published spread of 1.09 to 1.68. That gap is not hidden; it is the most
 * interesting thing on the page, and the modal exists to show it.
 *
 * Internal telemetry is legitimate evidence and weaker evidence than a
 * multi-organisation study: nobody outside can reproduce it. It is labelled
 * so a reader can weigh it accordingly, and `methodology` is a field rather
 * than a comment because the first question a sceptic asks is how it was
 * counted.
 */
export const INTERNAL: {
  label: string;
  speed: number;
  defects: number;
  note: string;
  methodology: string;
} = {
  label: "OTSV internal report",
  speed: 3,
  defects: 5,
  note: "Measured on our own delivery, not published.",
  methodology:
    "Throughput and defect counts taken from the team's own delivery record. Sample size and counting method are not published, so this figure cannot be reproduced from outside — which is exactly why the published studies sit beside it.",
};

/** Lead time. Every published source agrees it improves; none says threefold. */
export const SPEED_EVIDENCE: readonly Evidence[] = [
  {
    id: "codeninety-lead-time",
    origin: "published",
    metric: "PR lead time, draft to review",
    factor: 1 / (1 - 0.324),
    reported: "−32.4%",
    sample: "84 organisations, 14,200+ developers, 12 months",
    source: "Code Ninety, AI Coding Assistant Benchmarks 2026",
    url: "https://codeninety.com/research/developer-productivity-and-ai-tech-debt-2026",
  },
  {
    id: "codeninety-guardrails",
    origin: "published",
    metric: "PR lead time, organisations with review guardrails",
    factor: 1 / (1 - 0.45),
    reported: "−45.0%",
    sample: "the high-maturity subset of the same cohort",
    source: "Code Ninety, AI Coding Assistant Benchmarks 2026",
    url: "https://codeninety.com/research/developer-productivity-and-ai-tech-debt-2026",
  },
  {
    id: "uplevel-throughput",
    origin: "published",
    metric: "PR throughput and cycle time",
    factor: 1.0,
    reported: "no significant change",
    sample: "~800 developers, 3 months with and without Copilot",
    source: "Uplevel Data Labs, Gen AI for Coding",
    url: "https://uplevelteam.com/blog/ai-for-developer-productivity",
  },
] as const;

/** Defect rate. Every source agrees it worsens; the spread is 1.09 to 1.68. */
export const DEFECT_EVIDENCE: readonly Evidence[] = [
  {
    id: "codeninety-defects",
    origin: "published",
    metric: "Defect injection rate",
    factor: 4.8 / 3.2,
    reported: "+50.0% — 3.2 to 4.8 bugs per 1,000 lines",
    sample: "84 organisations, 14,200+ developers, 12 months",
    source: "Code Ninety, AI Coding Assistant Benchmarks 2026",
    url: "https://codeninety.com/research/developer-productivity-and-ai-tech-debt-2026",
  },
  {
    id: "coderabbit-issues",
    origin: "published",
    metric: "Issues raised per pull request",
    factor: 10.83 / 6.45,
    reported: "10.83 against 6.45 for human-only",
    sample: "470 open-source pull requests",
    source: "CodeRabbit, State of AI vs Human Code Generation",
    url: "https://www.coderabbit.ai/blog/tackling-a-legacy-codebase-and-high-defect-rate-after-an-acquisition",
  },
  {
    id: "uplevel-bugs",
    origin: "published",
    metric: "Bugs introduced",
    factor: 1.41,
    reported: "+41%",
    sample: "~800 developers, 3 months with and without Copilot",
    source: "Uplevel Data Labs, Gen AI for Coding",
    url: "https://uplevelteam.com/blog/ai-for-developer-productivity",
  },
  {
    id: "sonar-bugs",
    origin: "published",
    metric: "Bugs in AI-accelerated codebases",
    factor: 1.09,
    reported: "+9%, with pull requests 154% larger",
    sample: "SonarSource telemetry",
    url: "https://www.softwareseni.com/what-the-research-actually-shows-about-ai-coding-assistant-productivity/",
    source: "SonarSource, via SoftwareSeni",
  },
] as const;

/** What automated review recovers of the defect penalty. */
export const RECOVERY_EVIDENCE: readonly Evidence[] = [
  {
    id: "codeninety-guardrails-recovery",
    origin: "published",
    metric: "Defect and security penalty mitigated",
    factor: 0.8,
    reported: "80%+ mitigated, while still gaining 45% lead time",
    sample: "the high-maturity subset of 84 organisations",
    source: "Code Ninety, AI Coding Assistant Benchmarks 2026",
    url: "https://codeninety.com/research/developer-productivity-and-ai-tech-debt-2026",
  },
  {
    id: "coderabbit-catch",
    origin: "published",
    metric: "Seeded defects caught before merge",
    factor: 15 / 23,
    reported: "15 of 23, with 6 false positives",
    sample: "independent benchmark, 23 seeded bugs",
    source: "CodeRabbit, independent evaluation",
    url: "https://www.greptile.com/content-library/best-ai-code-review-tools",
  },
] as const;

const mid = (xs: readonly Evidence[]) => {
  const f = xs.map((e) => e.factor).sort((a, b) => a - b);
  const m = Math.floor(f.length / 2);
  return f.length % 2 ? f[m] : (f[m - 1] + f[m]) / 2;
};

/**
 * The median of the published factors, not the mean.
 *
 * The mean would let one outlier move the headline; the median is the figure
 * a sceptic can check by reading the table and counting.
 */
export const PUBLISHED_SPEED = mid(SPEED_EVIDENCE);
export const PUBLISHED_DEFECT = mid(DEFECT_EVIDENCE);
export const RECOVERY = mid(RECOVERY_EVIDENCE);

/**
 * The figures this screen reports are the internal ones. The published
 * medians stay exported beside them, because the comparison is the point and
 * a number that only appears inside a modal is a number nobody reads.
 */
export const SPEED_FACTOR = INTERNAL.speed;
export const DEFECT_FACTOR = INTERNAL.defects;

/** How far the internal figure sits above the published spread. */
export const SPEED_GAP = INTERNAL.speed / PUBLISHED_SPEED;
export const DEFECT_GAP = INTERNAL.defects / PUBLISHED_DEFECT;

/** Defects per thousand lines, without AI. Code Ninety's measured baseline. */
export const BASELINE_DEFECTS_PER_KLOC = 3.2;

export type QualityMode = "traditional" | "ai-assisted" | "ai-with-qa";

export interface QualityOutcome {
  mode: QualityMode;
  /** Lead-time multiplier against the traditional baseline. Higher is faster. */
  speed: number;
  defectsPerKloc: number;
  /** Share of injected defects caught before merge. */
  caught: number;
  /** What actually reaches production. */
  escapedPerKloc: number;
}

export function quality(mode: QualityMode): QualityOutcome {
  if (mode === "traditional") {
    return {
      mode,
      speed: 1,
      defectsPerKloc: BASELINE_DEFECTS_PER_KLOC,
      caught: 0,
      escapedPerKloc: BASELINE_DEFECTS_PER_KLOC,
    };
  }

  const injected = BASELINE_DEFECTS_PER_KLOC * DEFECT_FACTOR;

  if (mode === "ai-assisted") {
    return {
      mode,
      speed: SPEED_FACTOR,
      defectsPerKloc: injected,
      caught: 0,
      escapedPerKloc: injected,
    };
  }

  // Automated review does not reduce what is written; it reduces what escapes.
  // The distinction matters: the code is no better, the pipeline is.
  return {
    mode,
    speed: SPEED_FACTOR,
    defectsPerKloc: injected,
    caught: RECOVERY,
    escapedPerKloc: injected * (1 - RECOVERY),
  };
}

/**
 * The catch rate at which the assisted path stops being worse than doing
 * nothing.
 *
 * This falls straight out of the internal figure and is the most useful thing
 * on the page. At a 5x injection rate, automated review at the published 73%
 * catch rate still lets more defects through than writing the code by hand.
 * The gate has to reach 80% before the trade is even neutral — so "add AI
 * review" is not a conclusion, it is a target with a number on it.
 */
export const BREAK_EVEN_CATCH = 1 - 1 / DEFECT_FACTOR;

/** True when the current recovery is enough to make the trade worth taking. */
export const RECOVERY_IS_ENOUGH = RECOVERY >= BREAK_EVEN_CATCH;

export const QUALITY_MODES: readonly QualityMode[] = [
  "traditional",
  "ai-assisted",
  "ai-with-qa",
] as const;
