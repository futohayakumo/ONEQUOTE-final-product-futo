"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { STORY_POINTS, compare } from "../model/processModel";
import type { StoryPoint } from "@/types/process-scene";
import { ArrowRight } from "../../icons/ArrowRight";
import { formatDecimal } from "@/lib/localeFormat";
import { useLocale, useT } from "../../shell/LocaleProvider";
import { FlowLadder } from "./FlowLadder";
import { GapChart } from "./GapChart";
import { OutcomeCards } from "./OutcomeCards";
import { QualityEvidence } from "./QualityEvidence";
import { SimulationPanel } from "./SimulationPanel";

/**
 * The rules the quiz then asks about.
 *
 * Q1 and Q3 of the knowledge check test the commit convention and the approval
 * count. The screen that stated them was dropped in the v3 rewrite, which left
 * the quiz asking about a protocol the site never explains — a quiz whose only
 * honest answer is a guess. These are here because the check downstream is
 * only worth taking if the reader was told.
 */
const PROTOCOL = ["commit", "approvals", "branches"] as const;

const WHY = ["handoffs", "gates", "stages"] as const;

/** The four things a reader has to know before the numbers mean anything. */
const READ = ["sp", "lead", "assume", "source"] as const;

export function ProcessScreen() {
  const t = useT();
  const { locale } = useLocale();
  const [sp, setSp] = useState<StoryPoint>(8);
  const result = useMemo(() => compare(sp), [sp]);
  // One scale for both ladders. Two bars each fitted to their own width would
  // be two charts, and the length difference is the entire finding.
  const scaleDays = Math.max(
    result.traditional.totalDays,
    result.aiDriven.totalDays,
  );

  const trad = result.traditional;
  const d1 = (n: number) => formatDecimal(n, locale, 1);
  const whyCost: Record<string, Record<string, string | number>> = {
    handoffs: {
      gaps: trad.perStep.filter((step) => step.waitDays > 0).length,
      sp,
      days: d1(trad.waitDays),
      total: d1(trad.totalDays),
    },
    // The approval queue is the wait in front of Deploy: two reviewers, two
    // calendars, and the one gap the model prices differently from the rest.
    gates: {
      days: d1(
        trad.perStep.find((step) => step.stepId === "deploy")?.waitDays ?? 0,
      ),
    },
    stages: {
      ratio: d1(trad.touchDays === 0 ? 0 : trad.waitDays / trad.touchDays),
    },
  };

  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="mx-auto grid w-full max-w-[86rem] gap-12 px-6 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:items-center">
        <div>
          <p className="type-eyebrow">{t("process.eyebrow")}</p>
          <h1 className="mt-6 type-display">
            {t("process.title.a")}
            <br />
            {t("process.title.b")}{" "}
            <span className="text-crimson-ink">{t("process.title.flow")}</span>.
          </h1>
          <p className="mt-7 max-w-[40ch] type-body text-muted">
            {t("process.lede")}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-7">
            <Link
              href="/process/quiz"
              className="inline-flex items-center gap-3 border border-crimson bg-crimson px-7 py-3.5 type-label text-studio rounded-card transition-colors duration-150 hover:border-charcoal hover:bg-charcoal"
            >
              {t("process.cta.quiz")}
              <ArrowRight size={18} />
            </Link>
            <Link
              href="#simulation"
              className="type-label underline underline-offset-4 transition-colors duration-150 hover:text-crimson-ink"
            >
              {t("process.cta.sim")}
            </Link>
          </div>
        </div>

        {/*
          The hero used to be a 3D-styled illustration of six people around a
          planning board — the most generated-looking asset on the site, and
          one that said nothing the heading had not already said. The same
          space now carries the finding itself: two bars, one scale, straight
          out of the model the rest of the page runs on.
        */}
        <div className="flex flex-col gap-6 border border-border bg-studio p-6 rounded-card shadow-card">
          {(
            [
              ["traditional", "process.trad.title"],
              ["ai-driven", "process.ai.title"],
            ] as const
          ).map(([mode, key]) => {
            const schedule =
              mode === "traditional" ? result.traditional : result.aiDriven;
            return (
              <div key={mode} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <span className="type-label">{t(key)}</span>
                  <span className="type-label tnum">
                    {t("process.ladder.total", {
                      days: formatDecimal(schedule.totalDays, locale, 1),
                    })}
                  </span>
                </div>
                <div className="flex h-6 w-full overflow-hidden border border-border bg-canvas rounded-sharp">
                  <span
                    className="bg-charcoal"
                    style={{ width: `${(schedule.touchDays / scaleDays) * 100}%` }}
                  />
                  <span
                    className="bg-mist"
                    style={{ width: `${(schedule.waitDays / scaleDays) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4">
            <span className="flex items-center gap-2 type-caption">
              <span aria-hidden className="h-3 w-3 bg-charcoal rounded-sharp" />
              {t("process.outcome.work")}
            </span>
            <span className="flex items-center gap-2 type-caption">
              <span aria-hidden className="h-3 w-3 bg-mist rounded-sharp" />
              {t("process.outcome.waiting")}
            </span>
            <span className="ml-auto type-caption">
              {t("process.ladder.scale", { sp })}
            </span>
          </div>

          <p className="border-l-2 border-charcoal pl-5 type-label">
            {t("process.hero.note")}
          </p>
        </div>
      </section>

      {/* ── Two ways ─────────────────────────────────────────── */}
      <section className="border-t border-border bg-studio">
        <div className="mx-auto flex max-w-[86rem] flex-col gap-10 px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="type-eyebrow">{t("process.two.eyebrow")}</p>
              <h2 className="mt-5 type-page">{t("process.two.title")}</h2>
              <p className="mt-3 max-w-[52ch] type-body text-muted">
                {t("process.two.lede")}
              </p>
            </div>

            <label className="flex shrink-0 flex-col gap-2 border-l border-border pl-6">
              <span className="type-overline text-muted">{t("process.storyPoints")}</span>
              <select
                value={sp}
                onChange={(e) =>
                  setSp(Number(e.target.value) as StoryPoint)
                }
                className="w-28 border border-control bg-studio px-4 py-2.5 type-label tnum rounded-card shadow-card"
              >
                {STORY_POINTS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <FlowLadder
              mode="traditional"
              sp={sp}
              scaleDays={scaleDays}
              titleKey="process.trad.title"
              blurbKey="process.trad.blurb"
              footKey="process.trad.foot"
            />
            <FlowLadder
              mode="ai-driven"
              sp={sp}
              scaleDays={scaleDays}
              titleKey="process.ai.title"
              blurbKey="process.ai.blurb"
              footKey="process.ai.foot"
            />
          </div>

          <p className="type-caption">{t("process.ladder.scale", { sp })}</p>
        </div>
      </section>

      {/* ── Outcome ──────────────────────────────────────────── */}
      <section id="outcome" className="border-t border-border">
        <div className="mx-auto flex max-w-[86rem] flex-col gap-10 px-6 py-20">
          <div>
            <p className="type-eyebrow">{t("process.outcome.eyebrow")}</p>
            <h2 className="mt-5 type-page">
              {t("process.outcome.title")}
            </h2>
            <p className="mt-3 max-w-[56ch] type-body text-muted">
              {t("process.outcome.lede", {
                sp,
                ratio: result.ratio.toFixed(1),
              })}
            </p>
            {/* Said here rather than in a footnote. The queueing model is a
                model; the measurements are in the section below it, and the
                reader should know which they are looking at. */}
            <p className="mt-3 max-w-[56ch] type-caption">
              {t("process.outcome.caveat")}
            </p>
          </div>

          {/* A number with no stated unit, window or assumption is a
              decoration. These four are what the cards below actually mean. */}
          <dl className="grid gap-x-10 gap-y-6 border-y border-border py-8 sm:grid-cols-2 lg:grid-cols-4">
            {READ.map((k) => (
              <div key={k}>
                <dt className="type-label">{t(`process.read.${k}`)}</dt>
                <dd className="mt-2 type-caption">{t(`process.read.${k}Body`)}</dd>
              </div>
            ))}
          </dl>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
            <OutcomeCards
              traditional={result.traditional}
              aiDriven={result.aiDriven}
            />
            <GapChart />
          </div>
        </div>
      </section>

      <QualityEvidence />

      <SimulationPanel />

      {/* ── Why waiting happens ──────────────────────────────── */}
      <section className="border-t border-border bg-studio">
        <div className="mx-auto flex max-w-[86rem] flex-col gap-10 px-6 py-20">
          <div>
            <p className="type-eyebrow">{t("process.why.eyebrow")}</p>
            <h2 className="mt-5 type-page">
              {t("process.why.title")}
            </h2>
          </div>
          {/* Each reason ends in what it costs, taken from the same schedule
              the bars above are drawn from. "A queue forms at every boundary"
              is a claim; "four boundaries hold the work for 21.8 of its 35.5
              days" is the same claim with the receipt attached. */}
          <ul className="grid gap-8 sm:grid-cols-3">
            {WHY.map((k) => (
              <li
                key={k}
                className="flex flex-col gap-2 border-t border-border pt-5"
              >
                <h3 className="type-label">{t(`process.why.${k}`)}</h3>
                <p className="type-caption">{t(`process.why.${k}Body`)}</p>
                <p className="mt-auto pt-2 type-caption tnum text-charcoal">
                  {t(`process.why.${k}Cost`, whyCost[k])}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── The protocol ─────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto flex max-w-[86rem] flex-col gap-10 px-6 py-20">
          <div>
            <p className="type-eyebrow">{t("process.protocol.eyebrow")}</p>
            <h2 className="mt-5 type-page">
              {t("process.protocol.title")}
            </h2>
            <p className="mt-3 max-w-[56ch] type-body text-muted">
              {t("process.protocol.lede")}
            </p>
          </div>
          <dl className="grid gap-8 sm:grid-cols-3">
            {PROTOCOL.map((k) => (
              <div
                key={k}
                className="flex flex-col gap-2 border border-border bg-studio p-5 rounded-card shadow-card"
              >
                <dt className="type-label">{t(`process.protocol.${k}`)}</dt>
                {/* The rule as tooling sees it. A paragraph describing a
                    convention is advice; the string a hook matches on is the
                    convention, and it is what the quiz asks about. */}
                <dd className="bg-console px-3 py-2 type-console text-border rounded-sharp">
                  {t(`process.protocol.${k}Rule`)}
                </dd>
                <dd className="type-caption">{t(`process.protocol.${k}Body`)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Forward ──────────────────────────────────────────── */}
      <section className="border-t border-border bg-tint">
        <div className="mx-auto flex max-w-[86rem] flex-wrap items-center gap-8 px-6 py-20">
          <div className="min-w-0 flex-1">
            <p className="type-eyebrow">{t("process.forward.eyebrow")}</p>
            <h2 className="mt-5 type-page">
              {t("process.forward.title.a")}{" "}
              <span className="text-crimson-ink">
                {t("process.forward.title.b")}
              </span>
              .
            </h2>
            <p className="mt-3 max-w-[52ch] type-body text-muted">
              {t("process.forward.lede")}
            </p>
          </div>
          <Link
            href="/process/quiz"
            className="inline-flex items-center gap-3 border border-charcoal bg-charcoal px-7 py-3.5 type-label text-studio rounded-card transition-colors duration-150 hover:border-crimson hover:bg-crimson"
          >
            {t("process.forward.cta")}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
