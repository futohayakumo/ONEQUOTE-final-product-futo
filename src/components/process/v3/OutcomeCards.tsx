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
    <div className="flex h-3 w-full overflow-hidden bg-mist rounded-full">
      <span
        className="bg-charcoal"
        style={{ width: `${(touch / max) * 100}%` }}
        aria-hidden
      />
      <span
        className="bg-crimson"
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
 */
export function OutcomeCards({
  traditional,
  aiDriven,
}: {
  traditional: Schedule;
  aiDriven: Schedule;
}) {
  const max = traditional.totalDays;

  const cards = [
    {
      title: "Traditional scrum (AI assisted)",
      schedule: traditional,
      tone: "bg-tint",
      split: [
        { label: "Actual work", value: traditional.touchDays, ink: "" },
        {
          label: "Waiting",
          value: traditional.waitDays,
          ink: "text-crimson-ink",
        },
      ],
    },
    {
      title: "AI-driven agile (automated)",
      schedule: aiDriven,
      tone: "bg-canvas",
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
            touch={card.schedule.touchDays}
            wait={card.schedule.waitDays}
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
