"use client";

import type { Schedule } from "../model/processModel";

function Bar({
  touch,
  wait,
  max,
}: {
  touch: number;
  wait: number;
  max: number;
}) {
  return (
    <div className="flex h-3 w-full overflow-hidden bg-mist rounded-sharp">
      <span
        className="bg-charcoal"
        style={{ width: `${(touch / max) * 100}%` }}
        aria-hidden
      />
      <span
        className="bg-muted"
        style={{ width: `${(wait / max) * 100}%` }}
        aria-hidden
      />
    </div>
  );
}

/**
 * Both cards are drawn against the SAME maximum, so the two bars are directly
 * comparable by length. Scaling each card to its own total is the standard way
 * to make a fourteen-fold difference look like a small one.
 *
 * Nothing here is crimson. The chart beside it uses crimson for the AI-driven
 * series — the thing the page argues FOR — and these cards previously used it
 * for waiting, the thing the page argues against. Two correct legends, forty
 * pixels apart, meaning opposite things: a reader who trusts the colour reads
 * the chart backwards. Waiting is now plain muted, and the losing card no
 * longer wears `tint`, which is this system's active/selected fill and made
 * the worse outcome look like the chosen one.
 */
export function OutcomeCards({
  traditional,
  aiDriven,
}: {
  traditional: Schedule;
  aiDriven: Schedule;
}) {
  const max = traditional.totalDays;

  // The model rounds touch, wait and total independently, so at 0.5 SP the
  // two figures printed beneath the headline sum to 3.79 under a headline of
  // 3.78. The headline is the number the reader trusts, so the split is
  // derived from it rather than reported alongside it.
  const split = (s: Schedule) => {
    const wait = Math.round((s.totalDays - s.touchDays) * 100) / 100;
    return { touch: s.touchDays, wait };
  };

  const cards = [
    {
      title: "Traditional scrum (AI assisted)",
      schedule: traditional,
      tone: "bg-studio",
      split: [
        { label: "Actual work", value: split(traditional).touch, ink: "" },
        { label: "Waiting", value: split(traditional).wait, ink: "text-muted" },
      ],
    },
    {
      title: "AI-driven agile (automated)",
      schedule: aiDriven,
      tone: "bg-tint",
      split: [
        {
          label: "Work and decision",
          value: aiDriven.touchDays + aiDriven.waitDays,
          ink: "",
        },
      ],
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`flex flex-col gap-5 border border-border p-6 rounded-card shadow-card ${card.tone}`}
        >
          <h3 className="type-label">{card.title}</h3>
          <p className="type-page tnum">
            {card.schedule.totalDays.toFixed(2)}{" "}
            <span className="type-body text-muted">days</span>
          </p>

          <Bar
            touch={split(card.schedule).touch}
            wait={split(card.schedule).wait}
            max={max}
          />

          <dl className="flex flex-wrap gap-x-10 gap-y-3">
            {card.split.map((s) => (
              <div key={s.label}>
                <dt className={`type-label tnum ${s.ink}`}>
                  {s.value.toFixed(2)} d
                </dt>
                <dd className="type-caption">{s.label}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-auto border-t border-border pt-4 type-label tnum">
            ≈ {Math.round(card.schedule.flowEfficiency * 100)}%
            <span className="type-caption"> flow efficiency</span>
          </p>
        </div>
      ))}
    </div>
  );
}
