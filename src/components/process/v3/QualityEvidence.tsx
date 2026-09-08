"use client";

import {
  DEFECT_EVIDENCE,
  DEFECT_FACTOR,
  RECOVERY,
  RECOVERY_EVIDENCE,
  SPEED_EVIDENCE,
  SPEED_FACTOR,
  quality,
  type Evidence,
  type QualityMode,
} from "@/lib/quality";

const MODES: { mode: QualityMode; title: string; blurb: string }[] = [
  {
    mode: "traditional",
    title: "No assistant",
    blurb: "The baseline every figure below is measured against.",
  },
  {
    mode: "ai-assisted",
    title: "AI assistance only",
    blurb: "Faster to write. More defects reaching production.",
  },
  {
    mode: "ai-with-qa",
    title: "AI assistance with automated review",
    blurb: "Same code, same speed. Most of the defects stopped at the gate.",
  },
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
  return (
    <tbody>
      {rows.map((e) => (
        <tr key={e.id} className="border-b border-border align-top">
          <th scope="row" className="py-3 pr-6 text-left type-body font-normal">
            {e.metric}
          </th>
          <td className="py-3 pr-6 type-label tnum whitespace-nowrap">
            {e.reported}
          </td>
          <td className="py-3 pr-6 type-caption">{e.sample}</td>
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
  const rows = MODES.map((m) => ({ ...m, ...quality(m.mode) }));
  const maxEscape = Math.max(...rows.map((r) => r.escapedPerKloc));
  const base = rows[0];

  return (
    <section className="border-t border-border bg-studio">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-12 px-6 py-20">
        <div>
          <p className="type-eyebrow">What the measurements say</p>
          <h2 className="mt-5 type-page">
            Assistance buys speed and sells quality.
          </h2>
          <p className="mt-3 max-w-[60ch] type-body text-muted">
            Every figure on this screen is a published measurement with its
            sample attached. The headline numbers are the median of the sources
            below, not an average — one outlier should not be able to move a
            claim, and a median is something you can check by counting.
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
                  <h3 className="type-label">{row.title}</h3>
                  <p className="mt-1 type-caption">{row.blurb}</p>
                </div>

                <dl className="flex flex-col gap-4">
                  <div>
                    <dt className="type-caption">Lead time</dt>
                    <dd className="type-section tnum">
                      {row.speed.toFixed(2)}×
                    </dd>
                  </div>
                  <div>
                    <dt className="type-caption">
                      Defects written, per 1,000 lines
                    </dt>
                    <dd className="type-label tnum">
                      {row.defectsPerKloc.toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="type-caption">
                      Defects reaching production
                    </dt>
                    <dd
                      className={`type-page tnum ${worse ? "text-crimson-ink" : ""}`}
                    >
                      {row.escapedPerKloc.toFixed(2)}
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
                      <dt className="type-caption">Caught before merge</dt>
                      <dd className="type-label tnum">
                        {Math.round(row.caught * 100)}%
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            );
          })}
        </div>

        <p className="max-w-[70ch] type-body">
          Assistance alone is the one column that is worse than doing nothing:{" "}
          <span className="tnum">
            {(SPEED_FACTOR).toFixed(2)}× the lead time,{" "}
            {(DEFECT_FACTOR).toFixed(2)}× the defects
          </span>
          . Automated review does not make the code better — the same number of
          defects is written either way — it changes how many get out, catching{" "}
          <span className="tnum">{Math.round(RECOVERY * 100)}%</span> of them at
          the gate. That is the only configuration on this page that beats the
          baseline on both axes.
        </p>

        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Evidence table, scrollable">
          <table className="w-full min-w-[46rem]">
            <caption className="pb-4 text-left type-label">
              The measurements these figures come from
            </caption>
            <thead>
              <tr className="border-b border-charcoal text-left">
                <th scope="col" className="pb-2 pr-6 type-caption">Metric</th>
                <th scope="col" className="pb-2 pr-6 type-caption">Reported</th>
                <th scope="col" className="pb-2 pr-6 type-caption">Sample</th>
                <th scope="col" className="pb-2 type-caption">Source</th>
              </tr>
            </thead>
            <Sources rows={SPEED_EVIDENCE} />
            <Sources rows={DEFECT_EVIDENCE} />
            <Sources rows={RECOVERY_EVIDENCE} />
          </table>
        </div>
      </div>
    </section>
  );
}
