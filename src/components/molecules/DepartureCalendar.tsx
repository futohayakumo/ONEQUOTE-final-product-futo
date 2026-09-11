"use client";

import { useMemo, useState } from "react";
import { REFERENCE, SCHEDULE_DAYS, availableEtdOffsets, sailingAt } from "@/lib/sailings";
import type { PortCode } from "@/types/quote";
import { useLocale, useT } from "../providers/LocaleProvider";

/**
 * The departure calendar from the real form: a month grid on which only days
 * with a sailing can be pressed, each carrying the cheapest price for that
 * day. Days with nothing sailing are drawn but inert, so the shape of the
 * schedule — weekly, with a fortnightly express — is visible before anything
 * is chosen.
 *
 * Every date is a day offset from the schedule's fixed reference, never
 * `new Date()`, so the server and the browser draw the same grid.
 */

const DAY = 86_400_000;

/** Days from the reference to the first of a month, k months on from it. */
function monthStart(k: number): number {
  const ref = new Date(REFERENCE);
  const first = Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() + k, 1);
  return Math.round((first - REFERENCE) / DAY);
}

function daysInMonth(k: number): number {
  const ref = new Date(REFERENCE);
  return new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() + k + 1, 0)).getUTCDate();
}

export function DepartureCalendar({
  pol,
  pod,
  selected,
  onSelect,
  priceForDay,
}: {
  pol: PortCode;
  pod: PortCode;
  selected: number | null;
  onSelect: (etdOffset: number) => void;
  priceForDay: (etdOffset: number) => number | null;
}) {
  const t = useT();
  const { locale } = useLocale();
  const [month, setMonth] = useState(0);
  const available = useMemo(() => new Set(availableEtdOffsets(pol, pod)), [pol, pod]);

  const start = monthStart(month);
  const count = daysInMonth(month);
  // Weekday of the first, Monday = 0.
  const firstWeekday = (new Date(sailingAt(start)).getUTCDay() + 6) % 7;
  const monthLabel = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(sailingAt(start));
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(
      sailingAt(start - firstWeekday + i),
    ),
  );

  // Two months cover the window; nothing sails beyond it, so the arrows stop.
  const lastMonth = Math.ceil(SCHEDULE_DAYS / 28);
  const chip = (usd: number) =>
    usd >= 10_000
      ? `$${(usd / 1000).toFixed(1)}k`
      : `$${(usd / 1000).toFixed(1)}k`;

  return (
    <div className="border border-border bg-studio p-4 rounded-card">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth((m) => Math.max(0, m - 1))}
          disabled={month === 0}
          aria-label={t("calendar.prev")}
          className="h-9 w-9 border border-control bg-studio type-label rounded-card disabled:opacity-40"
        >
          ‹
        </button>
        <span className="type-label">{monthLabel}</span>
        <button
          type="button"
          onClick={() => setMonth((m) => Math.min(lastMonth, m + 1))}
          disabled={month >= lastMonth}
          aria-label={t("calendar.next")}
          className="h-9 w-9 border border-control bg-studio type-label rounded-card disabled:opacity-40"
        >
          ›
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {weekdays.map((w) => (
          <span key={w} className="py-1 text-center type-caption">
            {w}
          </span>
        ))}
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {Array.from({ length: count }, (_, i) => {
          const offset = start + i;
          const sails = available.has(offset);
          const price = sails ? priceForDay(offset) : null;
          const isSelected = selected === offset;
          const past = offset < 0;
          return (
            <button
              key={offset}
              type="button"
              disabled={!sails || past}
              onClick={() => onSelect(offset)}
              aria-pressed={isSelected}
              className={[
                "flex min-h-14 flex-col items-center justify-center gap-0.5 border px-1 py-1.5 rounded-card transition-colors duration-150",
                isSelected
                  ? "border-crimson bg-tint"
                  : sails && !past
                    ? "border-control bg-studio hover:border-charcoal"
                    : "border-transparent bg-canvas",
                !sails || past ? "text-muted" : "text-charcoal",
              ].join(" ")}
            >
              <span className="type-label tnum">{i + 1}</span>
              {price !== null ? (
                <span className={`type-caption tnum ${isSelected ? "text-crimson" : ""}`}>
                  {chip(price)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <p className="mt-3 type-caption">{t("calendar.legend")}</p>
    </div>
  );
}
