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
  /** A proof-of-concept benchmark, or a published study anyone can go and read. */
  origin: "poc" | "published";
  /**
   * Bundle keys, not prose. This screen switches language like every other
   * one, and a citation whose metric and sample stay English while the
   * paragraph around them translates reads as a broken translation rather
   * than a quotation. The source name and the URL are NOT keyed: those are
   * the publication's own name and address, and translating either would
   * break the citation.
   *
   * Both resolve to `ev.<id>.metric` and `ev.<id>.sample`.
   */
  metricKey: string;
  /** The measured multiplier against a non-AI baseline. 1.0 = no change. */
  factor: number;
  /**
   * How it was reported, in the source's own units — keyed, because the
   * numeral is the source's and the sentence around it ("no significant
   * change") is not, and a decimal comma is not optional in Vietnamese.
   */
  reportedKey: string;
  sampleKey: string;
  source: string;
  url: string;
}

/**
 * The headline this screen reports, and where it is from.
 *
 * ×3 throughput and ×5 defect DETECTION are the figures the team adopted
 * with AI-DLC. Until 2026-09-16 this site called them the team's own
 * measurement; the technical lead corrected that: they originate from
 * external proof-of-concept benchmarks, and the team's own numbers — every
 * defect, task, assignee and resolution time, in Jira, reported every two
 * weeks — have not yet been reported as a multiplier. So the label says
 * "POC benchmark", the note says it is not this team's record, and the gap
 * block says what the team's own record would need to show.
 *
 * Two things follow. The ×5 is detection, not injection: five times the
 * defects FOUND, which is the case for the automated gate rather than a
 * charge against the assistant. And a POC is weaker evidence than a
 * multi-organisation study, which is why the published medians sit beside
 * it in the modal rather than being replaced by it.
 */
export const POC: {
  labelKey: string;
  speed: number;
  defects: number;
  noteKey: string;
  methodologyKey: string;
} = {
  labelKey: "quality.poc.label",
  speed: 3,
  defects: 5,
  noteKey: "quality.poc.note",
  methodologyKey: "quality.poc.methodology",
};

/** Lead time. Every published source agrees it improves; none says threefold. */
export const SPEED_EVIDENCE: readonly Evidence[] = [
  {
    id: "codeninety-lead-time",
    origin: "published",
    metricKey: "ev.codeninety-lead-time.metric",
    factor: 1 / (1 - 0.324),
    reportedKey: "ev.codeninety-lead-time.reported",
    sampleKey: "ev.codeninety-lead-time.sample",
    source: "Code Ninety, AI Coding Assistant Benchmarks 2026",
    url: "https://codeninety.com/research/developer-productivity-and-ai-tech-debt-2026",
  },
  {
    id: "codeninety-guardrails",
    origin: "published",
    metricKey: "ev.codeninety-guardrails.metric",
    factor: 1 / (1 - 0.45),
    reportedKey: "ev.codeninety-guardrails.reported",
    sampleKey: "ev.codeninety-guardrails.sample",
    source: "Code Ninety, AI Coding Assistant Benchmarks 2026",
    url: "https://codeninety.com/research/developer-productivity-and-ai-tech-debt-2026",
  },
  {
    id: "uplevel-throughput",
    origin: "published",
    metricKey: "ev.uplevel-throughput.metric",
    factor: 1.0,
    reportedKey: "ev.uplevel-throughput.reported",
    sampleKey: "ev.uplevel-throughput.sample",
    source: "Uplevel Data Labs, Gen AI for Coding",
    url: "https://uplevelteam.com/blog/ai-for-developer-productivity",
  },
] as const;

/** Defect rate. Every source agrees it worsens; the spread is 1.09 to 1.68. */
export const DEFECT_EVIDENCE: readonly Evidence[] = [
  {
    id: "codeninety-defects",
    origin: "published",
    metricKey: "ev.codeninety-defects.metric",
    factor: 4.8 / 3.2,
    reportedKey: "ev.codeninety-defects.reported",
    sampleKey: "ev.codeninety-defects.sample",
    source: "Code Ninety, AI Coding Assistant Benchmarks 2026",
    url: "https://codeninety.com/research/developer-productivity-and-ai-tech-debt-2026",
  },
  {
    id: "coderabbit-issues",
    origin: "published",
    metricKey: "ev.coderabbit-issues.metric",
    factor: 10.83 / 6.45,
    reportedKey: "ev.coderabbit-issues.reported",
    sampleKey: "ev.coderabbit-issues.sample",
    source: "CodeRabbit, State of AI vs Human Code Generation",
    url: "https://www.coderabbit.ai/blog/tackling-a-legacy-codebase-and-high-defect-rate-after-an-acquisition",
  },
  {
    id: "uplevel-bugs",
    origin: "published",
    metricKey: "ev.uplevel-bugs.metric",
    factor: 1.41,
    reportedKey: "ev.uplevel-bugs.reported",
    sampleKey: "ev.uplevel-bugs.sample",
    source: "Uplevel Data Labs, Gen AI for Coding",
    url: "https://uplevelteam.com/blog/ai-for-developer-productivity",
  },
  {
    id: "sonar-bugs",
    origin: "published",
    metricKey: "ev.sonar-bugs.metric",
    factor: 1.09,
    reportedKey: "ev.sonar-bugs.reported",
    sampleKey: "ev.sonar-bugs.sample",
    url: "https://www.softwareseni.com/what-the-research-actually-shows-about-ai-coding-assistant-productivity/",
    source: "SonarSource, via SoftwareSeni",
  },
] as const;

/** What automated review recovers of the defect penalty. */
export const RECOVERY_EVIDENCE: readonly Evidence[] = [
  {
    id: "codeninety-guardrails-recovery",
    origin: "published",
    metricKey: "ev.codeninety-guardrails-recovery.metric",
    factor: 0.8,
    reportedKey: "ev.codeninety-guardrails-recovery.reported",
    sampleKey: "ev.codeninety-guardrails-recovery.sample",
    source: "Code Ninety, AI Coding Assistant Benchmarks 2026",
    url: "https://codeninety.com/research/developer-productivity-and-ai-tech-debt-2026",
  },
  {
    id: "coderabbit-catch",
    origin: "published",
    metricKey: "ev.coderabbit-catch.metric",
    factor: 15 / 23,
    reportedKey: "ev.coderabbit-catch.reported",
    sampleKey: "ev.coderabbit-catch.sample",
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
 * The figures this screen reports are the POC ones. The published medians
 * stay exported beside them, because the comparison is the point and a
 * number that only appears inside a modal is a number nobody reads.
 */
export const SPEED_FACTOR = POC.speed;
export const DEFECT_FACTOR = POC.defects;

/** How far the POC figure sits above the published spread. */
export const SPEED_GAP = POC.speed / PUBLISHED_SPEED;
export const DEFECT_GAP = POC.defects / PUBLISHED_DEFECT;

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
 * This falls straight out of the POC figure and is the most useful thing
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
