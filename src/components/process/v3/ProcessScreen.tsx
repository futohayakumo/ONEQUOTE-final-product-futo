"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { STORY_POINTS, compare } from "../model/processModel";
import type { StoryPoint } from "@/types/process-scene";
import { ArrowRight } from "../../icons/ArrowRight";
import { useT } from "../../shell/LocaleProvider";
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

export function ProcessScreen() {
  const t = useT();
  const [sp, setSp] = useState<StoryPoint>(8);
  const result = useMemo(() => compare(sp), [sp]);

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
            <span className="text-crimson">{t("process.title.flow")}</span>.
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
              className="type-label underline underline-offset-4 transition-colors duration-150 hover:text-crimson"
            >
              {t("process.cta.sim")}
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/scenes/01-team-planning-room.png"
            alt={t("process.outcome.alt")}
            className="w-full rounded-card"
          />
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
            {[
              {
                titleKey: "process.trad.title",
                blurbKey: "process.trad.blurb",
                src: "/assets/scenes/traditional-desks.png",
                alt: "Five desks in a row. A stack of work waits beside each one, and the fourth person is idle.",
                footKey: "process.trad.foot",
              },
              {
                titleKey: "process.ai.title",
                blurbKey: "process.ai.blurb",
                src: "/assets/scenes/ai-conveyor.png",
                alt: "One conveyor carrying work past a single console, with nothing queued beside it.",
                footKey: "process.ai.foot",
              },
            ].map((col) => (
              <div key={col.titleKey} className="flex flex-col gap-5">
                <div>
                  <h3 className="type-section">{t(col.titleKey)}</h3>
                  <p className="mt-1 type-caption">{t(col.blurbKey)}</p>
                </div>
                {/*
                  One box, one scale. The two strips arrived at 3:1 and 1.78:1,
                  so laid out at their natural sizes the desks rendered small
                  and the conveyor large — a comparison whose two halves are
                  not to scale is not a comparison. `object-contain` in a
                  shared box makes the queues on the left and their absence on
                  the right the only difference between them.
                */}
                <div className="flex aspect-[16/7] w-full items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={col.src}
                    alt={col.alt}
                    className="max-h-full w-full object-contain"
                  />
                </div>
                {/* mt-auto so the two captions share a baseline whatever
                    padding each illustration carries inside its own box. */}
                <p className="mt-auto type-caption">{t(col.footKey)}</p>
              </div>
            ))}
          </div>
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
          <ul className="grid gap-8 sm:grid-cols-3">
            {WHY.map((k) => (
              <li
                key={k}
                className="flex flex-col gap-2 border-t border-border pt-5"
              >
                <h3 className="type-label">{t(`process.why.${k}`)}</h3>
                <p className="type-caption">{t(`process.why.${k}Body`)}</p>
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
              <div key={k} className="flex flex-col gap-2">
                <dt className="type-label">{t(`process.protocol.${k}`)}</dt>
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
              <span className="text-crimson">
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
