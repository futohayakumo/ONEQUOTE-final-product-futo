"use client";

import { STORY_POINTS, compare } from "../model/processModel";

const W = 460;
const H = 240;
const PAD = { top: 16, right: 20, bottom: 34, left: 42 };

/**
 * Lead time against batch size, both modes on one pair of axes.
 *
 * The claim of this whole screen is not "AI is faster" — it is that the gap
 * WIDENS with batch size, because the traditional queue grows with sp^1.3
 * while the automated path stays close to linear. A bar chart of one story
 * point size cannot show that; this is the only mark that can.
 */
export function GapChart() {
  const rows = STORY_POINTS.map((sp) => {
    const c = compare(sp);
    return {
      sp,
      trad: c.traditional.totalDays,
      ai: c.aiDriven.totalDays,
      ratio: c.ratio,
    };
  });

  const maxY = Math.ceil(Math.max(...rows.map((r) => r.trad)) / 10) * 10;
  const x = (i: number) =>
    PAD.left + (i / (rows.length - 1)) * (W - PAD.left - PAD.right);
  const y = (v: number) =>
    H - PAD.bottom - (v / maxY) * (H - PAD.top - PAD.bottom);
  const path = (key: "trad" | "ai") =>
    rows.map((r, i) => `${i ? "L" : "M"}${x(i)} ${y(r[key])}`).join(" ");

  return (
    <figure className="flex flex-col gap-4">
      <figcaption className="type-label">
        The bigger the batch, the wider the gap.
      </figcaption>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Lead time by story points. Traditional runs from ${rows[0].trad.toFixed(1)} to ${rows[rows.length - 1].trad.toFixed(1)} days; AI-driven from ${rows[0].ai.toFixed(1)} to ${rows[rows.length - 1].ai.toFixed(1)} days.`}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(maxY * f)}
              y2={y(maxY * f)}
              stroke="var(--color-border)"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 8}
              y={y(maxY * f) + 4}
              textAnchor="end"
              fill="var(--color-muted)"
              fontSize="12"
            >
              {Math.round(maxY * f)}
            </text>
          </g>
        ))}

        {/*
          The two series measure 1.04:1 against each other — in greyscale, in
          print, or to a deuteranope they were the same line, and the caption
          underneath restated the failure ("grey is traditional, crimson is
          AI-driven") rather than fixing it. They now differ in dash, in width
          and in marker shape, and each line is labelled where it ends.
        */}
        <path
          d={path("trad")}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth="2.5"
          strokeDasharray="7 4"
        />
        <path
          d={path("ai")}
          fill="none"
          stroke="var(--color-crimson)"
          strokeWidth="2"
        />

        {rows.map((r, i) => (
          <g key={r.sp}>
            {/* Square for traditional, round for AI — shape, not only fill. */}
            <rect
              x={x(i) - 3.5}
              y={y(r.trad) - 3.5}
              width="7"
              height="7"
              fill="var(--color-muted)"
            />
            <circle cx={x(i)} cy={y(r.ai)} r="3.5" fill="var(--color-crimson)" />
            <text
              x={x(i)}
              y={H - PAD.bottom + 16}
              textAnchor="middle"
              fill="var(--color-muted)"
              fontSize="12"
            >
              {r.sp}
            </text>
          </g>
        ))}

        {[0, rows.length - 1].map((i) => (
          <text
            key={i}
            x={x(i)}
            y={y(rows[i].trad) - 10}
            textAnchor={i === 0 ? "start" : "end"}
            fill="var(--color-charcoal)"
            fontSize="13"
            fontWeight="600"
          >
            {rows[i].ratio.toFixed(1)}×
          </text>
        ))}
      </svg>

      <p className="type-caption">
        Story points across the bottom, lead time in days up the side. Grey is
        traditional, crimson is AI-driven.
      </p>
    </figure>
  );
}
