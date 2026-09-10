"use client";

import Link from "next/link";
import { ArrowRight } from "../../icons/ArrowRight";
import { useT } from "../../shell/LocaleProvider";
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
            alt={t("process.hero.alt")}
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
          <div>
            <h2 className="type-page">{t("process.two.title")}</h2>
            <p className="mt-3 max-w-[52ch] type-body text-muted">
              {t("process.two.lede")}
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            {[
              {
                titleKey: "process.trad.title",
                blurbKey: "process.trad.blurb",
                src: "/assets/scenes/traditional-desks.png",
                alt: "Five desks in a row. A stack of work waits beside each one, and the fourth person is idle.",
              },
              {
                titleKey: "process.ai.title",
                blurbKey: "process.ai.blurb",
                src: "/assets/scenes/ai-conveyor.png",
                alt: "One conveyor carrying work past a single console, with nothing queued beside it.",
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Measured before modelled. The section below this one is a queueing
          model whose constants were chosen rather than counted; this one is
          the only part of the argument with sources on it, so it goes first
          and the model is read as the mechanism behind it. */}
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
          <ul className="grid gap-10 sm:grid-cols-3">
            {WHY.map((k) => (
              <li key={k} className="flex flex-col gap-4">
                {/*
                  A fixed box with `object-contain`, not a natural size. The
                  three cut-outs came back at three different aspect ratios,
                  and laid out at their own sizes the tallest one pushed its
                  heading half a line below the other two — three cards that
                  are the same card have to start on the same line.
                */}
                <div className="flex aspect-[4/3] w-full items-end justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/assets/scenes/why-${k}.png`}
                    alt={t(`process.why.${k}Alt`)}
                    className="max-h-full w-auto max-w-full object-contain"
                  />
                </div>
                <div className="flex flex-col gap-2 border-t border-border pt-5">
                  <h3 className="type-label">{t(`process.why.${k}`)}</h3>
                  <p className="type-caption">{t(`process.why.${k}Body`)}</p>
                </div>
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/scenes/forward-deciding.png"
            alt={t("process.forward.alt")}
            className="w-52 shrink-0 lg:w-64"
          />

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
