"use client";

import { useState } from "react";
import {
  BREAK_EVEN_CATCH,
  DEFECT_EVIDENCE,
  DEFECT_FACTOR,
  DEFECT_GAP,
  INTERNAL,
  PUBLISHED_DEFECT,
  PUBLISHED_SPEED,
  RECOVERY,
  RECOVERY_EVIDENCE,
  SPEED_EVIDENCE,
  SPEED_GAP,
  type Evidence,
} from "@/lib/quality";
import { formatDecimal } from "@/lib/localeFormat";
import { useLocale, useT } from "../../shell/LocaleProvider";
import { Modal } from "../../ui/Modal";

function Sources({ rows }: { rows: readonly Evidence[] }) {
  const t = useT();
  return (
    <tbody>
      {rows.map((e) => (
        <tr key={e.id} className="border-b border-border align-top">
          <th scope="row" className="py-3 pr-6 text-left type-body font-normal">
            {t(e.metricKey)}
          </th>
          <td className="py-3 pr-6 type-label tnum whitespace-nowrap">
            {t(e.reportedKey)}
          </td>
          <td className="py-3 pr-6 type-caption">{t(e.sampleKey)}</td>
          <td className="py-3 type-caption">
            <a
              href={e.url}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-crimson"
            >
              {e.source}
            </a>
          </td>
        </tr>
      ))}
    </tbody>
  );
}

/**
 * The trade, from one source only.
 *
 * This band had three cards on it — no assistant, assisted, assisted with an
 * automated gate — reporting defects per thousand lines and a share caught
 * before merge. Two of those columns were not ours. The per-kloc baseline came
 * from a published benchmark and the catch rate from a review-tool evaluation,
 * multiplied by our own factor, and the result was printed at the same size
 * and in the same typeface as the two figures we actually measured. A reader
 * had no way to tell which was which, and the honest answer to "where did
 * 4.38 defects per thousand lines come from" is arithmetic, not a measurement.
 *
 * So the band now carries the internal report and nothing else: two measured
 * multipliers, one figure derived from them by division, and a statement of
 * what was never counted. Everything anybody else published — including the
 * catch rates, which are genuinely interesting — sits behind the modal, where
 * it is labelled as theirs.
 */
export function QualityEvidence() {
  const t = useT();
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const num = (n: number, digits = 2) => formatDecimal(n, locale, digits);

  /*
   * All three are the internal figure or a consequence of it.
   *
   * The break-even catch rate is 1 - 1/5: if five times as many defects are
   * written, a gate has to stop four of every five just to return the release
   * to where it was without an assistant. No outside number enters that, which
   * is why it can stand in this band — and it is a target, not an achievement.
   */
  const CARDS = [
    {
      key: "leadTime",
      value: t("quality.times", { n: num(INTERNAL.speed) }),
      params: {},
    },
    {
      key: "defects",
      value: t("quality.times", { n: num(INTERNAL.defects) }),
      params: {},
    },
    {
      key: "breakEven",
      value: t("quality.pct", { n: Math.round(BREAK_EVEN_CATCH * 100) }),
      params: { n: DEFECT_FACTOR },
    },
  ] as const;

  return (
    <section className="border-t border-border bg-studio">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-12 px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-center">
          <div>
            <p className="type-eyebrow">{t("quality.eyebrow")}</p>
            <h2 className="mt-5 type-page">{t("quality.title")}</h2>
            <p className="mt-3 max-w-[60ch] type-body text-muted">
              {t("quality.lede")}
            </p>
            {/* The attribution is next to the claim, not in a footer. One
                source is named, and the fact that it is the ONLY source in
                this band is part of the claim. */}
            <p className="mt-4 max-w-[60ch] type-caption">
              {t("quality.attr.pre", {
                speed: INTERNAL.speed,
                defects: INTERNAL.defects,
              })}{" "}
              <strong className="type-label">{t(INTERNAL.labelKey)}</strong>
              {t("quality.attr.post", { note: t(INTERNAL.noteKey) })}{" "}
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="type-caption text-crimson underline underline-offset-4 transition-colors duration-150 hover:text-charcoal"
              >
                {t("quality.attr.link")}
              </button>
            </p>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/scenes/quality-output-and-defect.png"
            alt={t("quality.alt")}
            className="w-full"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.key}
              className="flex flex-col gap-3 border border-border p-6 rounded-card shadow-card"
            >
              <h3 className="type-label">
                {t(`quality.card.${card.key}.title`)}
              </h3>
              <p className="type-page tnum">{card.value}</p>
              <p className="type-caption">
                {t(`quality.card.${card.key}.body`, card.params)}
              </p>
            </div>
          ))}
        </div>

        {/*
          The hole in the argument, printed at the same size as the argument.

          Two things were measured on this team and a third never was: what the
          automated gate actually stopped on our own delivery. Without it the
          80% above is a target with nothing standing next to it, and saying so
          here is cheaper than having a reader work it out.
        */}
        <div className="flex flex-col gap-4 border border-charcoal p-6 rounded-card">
          <h3 className="type-section">{t("quality.gap.title")}</h3>
          <p className="max-w-[70ch] type-body">
            {t("quality.gap.body", {
              speed: INTERNAL.speed,
              defects: INTERNAL.defects,
              breakEven: Math.round(BREAK_EVEN_CATCH * 100),
            })}
          </p>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("quality.modal.title")}
      >
        <div className="flex flex-col gap-6">
          <p className="max-w-[70ch] type-body">
            {t("quality.modal.lede", {
              speedGap: num(SPEED_GAP, 1),
              defectGap: num(DEFECT_GAP, 1),
            })}
          </p>
          <p className="max-w-[70ch] type-caption">
            {t(INTERNAL.methodologyKey)}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["quality.modal.throughput", INTERNAL.speed, PUBLISHED_SPEED],
                ["quality.modal.defects", INTERNAL.defects, PUBLISHED_DEFECT],
              ] as const
            ).map(([labelKey, ours, theirs]) => (
              <div
                key={labelKey}
                className="flex items-baseline justify-between gap-4 border border-border p-4 rounded-card"
              >
                <span className="type-caption">{t(labelKey)}</span>
                <span className="type-label tnum">
                  {t("quality.modal.ours", { n: num(ours) })} ·{" "}
                  <span className="text-muted">
                    {t("quality.modal.published", { n: num(theirs) })}
                  </span>
                </span>
              </div>
            ))}
          </div>

          {/*
            The catch-rate arithmetic lives in here rather than in the band,
            because the catch rate is somebody else's measurement. It is stated
            as a ratio so no invented per-thousand-line baseline is needed: at
            a 5x injection rate a gate catching 73% still ships 1.37x what
            writing the code by hand would have.
          */}
          <div className="flex flex-col gap-3 border-l-2 border-crimson pl-6">
            <p className="max-w-[70ch] type-body">
              <strong className="type-label">
                {t("quality.modal.gate.strong")}
              </strong>{" "}
              {t("quality.modal.gate.body", {
                factor: DEFECT_FACTOR,
                breakEven: Math.round(BREAK_EVEN_CATCH * 100),
                recovery: Math.round(RECOVERY * 100),
                escape: num(DEFECT_FACTOR * (1 - RECOVERY)),
              })}
            </p>
          </div>

          <div
            className="overflow-x-auto"
            tabIndex={0}
            role="region"
            aria-label={t("quality.modal.tableAria")}
          >
            <table className="w-full min-w-[46rem]">
              <caption className="pb-4 text-left type-label">
                {t("quality.modal.caption")}
              </caption>
              <thead>
                <tr className="border-b border-charcoal text-left">
                  <th scope="col" className="pb-2 pr-6 type-caption">
                    {t("quality.modal.col.metric")}
                  </th>
                  <th scope="col" className="pb-2 pr-6 type-caption">
                    {t("quality.modal.col.reported")}
                  </th>
                  <th scope="col" className="pb-2 pr-6 type-caption">
                    {t("quality.modal.col.sample")}
                  </th>
                  <th scope="col" className="pb-2 type-caption">
                    {t("quality.modal.col.source")}
                  </th>
                </tr>
              </thead>
              <Sources rows={SPEED_EVIDENCE} />
              <Sources rows={DEFECT_EVIDENCE} />
              <Sources rows={RECOVERY_EVIDENCE} />
            </table>
          </div>
        </div>
      </Modal>
    </section>
  );
}
