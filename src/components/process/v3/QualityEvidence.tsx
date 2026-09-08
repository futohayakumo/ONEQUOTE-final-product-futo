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
import { Modal } from "../../ui/Modal";

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
  const [open, setOpen] = useState(false);
  const rows = MODES.map((m) => ({ ...m, ...quality(m.mode) }));
  const maxEscape = Math.max(...rows.map((r) => r.escapedPerKloc));
  const base = rows[0];

  return (
    <section className="border-t border-border bg-studio">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-12 px-6 py-20">
        <div>
          <p className="type-eyebrow">What we measured</p>
          <h2 className="mt-5 type-page">
            Three times the throughput. Five times the defects.
          </h2>
          <p className="mt-3 max-w-[60ch] type-body text-muted">
            Assistance did not make the team a little faster and a little
            sloppier. It roughly tripled what got written and roughly
            quintupled what was wrong with it — and the second number is the
            one that decides whether the first one was worth having.
          </p>
          {/* The attribution is next to the claim, not in a footer. An internal
              measurement is legitimate evidence and weaker evidence than a
              multi-organisation study, and the reader should be able to weigh
              it without going looking. */}
          <p className="mt-4 max-w-[60ch] type-caption">
            {INTERNAL.speed}× and {INTERNAL.defects}× are from the{" "}
            <strong className="type-label">{INTERNAL.label}</strong>.{" "}
            {INTERNAL.note} Published studies put the same two effects at{" "}
            <span className="tnum">{PUBLISHED_SPEED.toFixed(2)}×</span> and{" "}
            <span className="tnum">{PUBLISHED_DEFECT.toFixed(2)}×</span> —{" "}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="type-caption text-crimson-ink underline underline-offset-4 transition-colors duration-150 hover:text-charcoal"
            >
              see what everyone else found
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

        <div className="flex flex-col gap-4 border-l-2 border-crimson pl-6">
          <p className="max-w-[70ch] type-body">
            Automated review does not make the code better — the same{" "}
            <span className="tnum">
              {quality("ai-assisted").defectsPerKloc.toFixed(2)}
            </span>{" "}
            defects per thousand lines are written either way. It changes how
            many get out, catching{" "}
            <span className="tnum">{Math.round(RECOVERY * 100)}%</span> at the
            gate.
          </p>
          <p className="max-w-[70ch] type-body">
            <strong className="type-label">And that is not enough.</strong> At a{" "}
            {DEFECT_FACTOR}× injection rate the gate has to catch{" "}
            <span className="tnum">
              {Math.round(BREAK_EVEN_CATCH * 100)}%
            </span>{" "}
            just to break even with writing the code by hand. The best measured
            AI reviewer catches{" "}
            <span className="tnum">{Math.round(RECOVERY * 100)}%</span>. So
            &ldquo;add AI review&rdquo; is not a conclusion — it is a target
            with a number on it, and we are{" "}
            <span className="tnum">
              {Math.round((BREAK_EVEN_CATCH - RECOVERY) * 100)}
            </span>{" "}
            points short of it.
          </p>
        </div>

      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="What everyone else found"
      >
        <div className="flex flex-col gap-6">
          <p className="max-w-[70ch] type-body">
            No published study reports anything close to our own numbers. The
            internal figure is{" "}
            <span className="tnum">{SPEED_GAP.toFixed(1)}×</span> the published
            median on throughput and{" "}
            <span className="tnum">{DEFECT_GAP.toFixed(1)}×</span> on defects.
            That gap is worth sitting with rather than explaining away: either
            the team is unusual, or the counting is — and the honest position is
            that a figure nobody outside can reproduce is weaker evidence than
            one measured across 84 organisations, however much we trust our own.
          </p>
          <p className="max-w-[70ch] type-caption">{INTERNAL.methodology}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Throughput", INTERNAL.speed, PUBLISHED_SPEED],
              ["Defects", INTERNAL.defects, PUBLISHED_DEFECT],
            ].map(([label, ours, theirs]) => (
              <div
                key={String(label)}
                className="flex items-baseline justify-between gap-4 border border-border p-4 rounded-card"
              >
                <span className="type-caption">{label}</span>
                <span className="type-label tnum">
                  {Number(ours).toFixed(2)}× ours ·{" "}
                  <span className="text-muted">
                    {Number(theirs).toFixed(2)}× published
                  </span>
                </span>
              </div>
            ))}
          </div>

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
      </Modal>
    </section>
  );
}
