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
  quality,
  type Evidence,
  type QualityMode,
} from "@/lib/quality";
import { formatDecimal } from "@/lib/localeFormat";
import { useLocale, useT } from "../../shell/LocaleProvider";
import { Modal } from "../../ui/Modal";

const MODES: readonly QualityMode[] = [
  "traditional",
  "ai-assisted",
  "ai-with-qa",
];

function Bar({ value, max, tone }: { value: number; max: number; tone: string }) {
  return (
    <div className="h-2 w-full overflow-hidden bg-mist rounded-sharp">
      <span
        aria-hidden
        className={tone}
        style={{ width: `${(value / max) * 100}%`, display: "block", height: "100%" }}
      />
    </div>
  );
}

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
              className="underline underline-offset-4 hover:text-crimson-ink"
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
 * The trade, with its receipts.
 *
 * The timing model on this page was invented — constants chosen to produce a
 * curve. This section is the answer to that, and it is deliberately not
 * flattering: the measured finding is that AI assistance buys lead time and
 * SELLS defect rate, and only the automated-review path beats the baseline on
 * both axes.
 *
 * Two things are shown rather than smoothed. The sources disagree — the defect
 * penalty runs from 1.09× to 1.68× — so the spread is printed and the headline
 * is the median, which a reader can verify by counting rows. And nothing here
 * claims a threefold speed-up, because nothing measured one; the highest
 * published figure is about 1.8×.
 */
export function QualityEvidence() {
  const t = useT();
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const rows = MODES.map((mode) => quality(mode));
  const maxEscape = Math.max(...rows.map((r) => r.escapedPerKloc));
  const base = rows[0];
  const num = (n: number, digits = 2) => formatDecimal(n, locale, digits);
  const pct = (n: number) => t("quality.pct", { n: Math.round(n * 100) });

  return (
    <section className="border-t border-border bg-studio">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-12 px-6 py-20">
        <div>
          <p className="type-eyebrow">{t("quality.eyebrow")}</p>
          <h2 className="mt-5 type-page">{t("quality.title")}</h2>
          <p className="mt-3 max-w-[60ch] type-body text-muted">
            {t("quality.lede")}
          </p>
          {/* The attribution is next to the claim, not in a footer. An internal
              measurement is legitimate evidence and weaker evidence than a
              multi-organisation study, and the reader should be able to weigh
              it without going looking. */}
          <p className="mt-4 max-w-[60ch] type-caption">
            {t("quality.attr.pre", {
              speed: INTERNAL.speed,
              defects: INTERNAL.defects,
            })}{" "}
            <strong className="type-label">{t(INTERNAL.labelKey)}</strong>
            {t("quality.attr.post", {
              note: t(INTERNAL.noteKey),
              pubSpeed: num(PUBLISHED_SPEED),
              pubDefect: num(PUBLISHED_DEFECT),
            })}{" "}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="type-caption text-crimson-ink underline underline-offset-4 transition-colors duration-150 hover:text-charcoal"
            >
              {t("quality.attr.link")}
            </button>
            .
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {rows.map((row) => {
            const worse = row.escapedPerKloc > base.escapedPerKloc;
            return (
              <div
                key={row.mode}
                className="flex flex-col gap-5 border border-border p-6 rounded-card shadow-card"
              >
                <div>
                  <h3 className="type-label">
                    {t(`quality.mode.${row.mode}.title`)}
                  </h3>
                  <p className="mt-1 type-caption">
                    {t(`quality.mode.${row.mode}.blurb`)}
                  </p>
                </div>

                <dl className="flex flex-col gap-4">
                  <div>
                    <dt className="type-caption">
                      {t("quality.metric.leadTime")}
                    </dt>
                    <dd className="type-section tnum">
                      {t("quality.times", { n: num(row.speed) })}
                    </dd>
                  </div>
                  <div>
                    <dt className="type-caption">
                      {t("quality.metric.written")}
                    </dt>
                    <dd className="type-label tnum">
                      {num(row.defectsPerKloc)}
                    </dd>
                  </div>
                  <div>
                    <dt className="type-caption">
                      {t("quality.metric.escaped")}
                    </dt>
                    <dd
                      className={`type-page tnum ${worse ? "text-crimson-ink" : ""}`}
                    >
                      {num(row.escapedPerKloc)}
                    </dd>
                    <dd className="mt-3">
                      <Bar
                        value={row.escapedPerKloc}
                        max={maxEscape}
                        tone={worse ? "bg-crimson" : "bg-charcoal"}
                      />
                    </dd>
                  </div>
                  {row.caught > 0 ? (
                    <div>
                      <dt className="type-caption">
                        {t("quality.metric.caught")}
                      </dt>
                      <dd className="type-label tnum">{pct(row.caught)}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 border-l-2 border-crimson pl-6">
          <p className="max-w-[70ch] type-body">
            {t("quality.body1", {
              written: num(quality("ai-assisted").defectsPerKloc),
              recovery: Math.round(RECOVERY * 100),
            })}
          </p>
          <p className="max-w-[70ch] type-body">
            <strong className="type-label">{t("quality.body2.strong")}</strong>{" "}
            {t("quality.body2", {
              factor: DEFECT_FACTOR,
              breakEven: Math.round(BREAK_EVEN_CATCH * 100),
              recovery: Math.round(RECOVERY * 100),
              short: Math.round((BREAK_EVEN_CATCH - RECOVERY) * 100),
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
