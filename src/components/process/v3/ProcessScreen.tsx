"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { STORY_POINTS, compare } from "../model/processModel";
import type { StoryPoint } from "@/types/process-scene";
import { ArrowRight } from "../../icons/ArrowRight";
import { GapChart } from "./GapChart";
import { OutcomeCards } from "./OutcomeCards";
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
const PROTOCOL = [
  {
    rule: "[Ticket_ID] Commit Message",
    body: "Every commit opens with its ticket id. Release notes and the audit trail are generated from that tag, and a pre-receive hook rejects any subject line without one — the convention is enforced by the repository, not by reviewer goodwill.",
  },
  {
    rule: "Two approvals to merge",
    body: "A pull request needs at least two independent approvals. One reviewer is both a bottleneck and a single point of failure; branch protection enforces the count, and a green build alone never unlocks the merge.",
  },
  {
    rule: "Prefixed branches",
    body: "Branch names carry their type and ticket, so the board and the repository can be reconciled without anybody maintaining a mapping by hand.",
  },
] as const;

const WHY = [
  {
    title: "Handoffs between roles",
    body: "Work is passed from one person to the next, and a queue forms at every boundary.",
  },
  {
    title: "Approval gates",
    body: "A pull request needs two independent approvals, so it waits on two calendars rather than one.",
  },
  {
    title: "Exclusive stages",
    body: "Each stage handles one item at a time, so a second item cannot flow in parallel — it queues.",
  },
] as const;

export function ProcessScreen() {
  const [sp, setSp] = useState<StoryPoint>(8);
  const result = useMemo(() => compare(sp), [sp]);

  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="mx-auto grid w-full max-w-[86rem] gap-12 px-6 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:items-center">
        <div>
          <p className="type-eyebrow">Process</p>
          <h1 className="mt-6 type-display">
            Same agile.
            <br />A different <span className="text-crimson-ink">flow</span>.
          </h1>
          <p className="mt-7 max-w-[40ch] type-body text-muted">
            The work is not slow. What differs between these two teams is how
            long the work spends waiting, not how fast anybody types.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-7">
            <Link
              href="/process/quiz"
              className="inline-flex items-center gap-3 border border-crimson bg-crimson px-7 py-3.5 type-label text-studio rounded-card transition-colors duration-150 hover:border-charcoal hover:bg-charcoal"
            >
              Take the knowledge check
              <ArrowRight size={18} />
            </Link>
            <Link
              href="#simulation"
              className="type-label underline underline-offset-4 transition-colors duration-150 hover:text-crimson-ink"
            >
              Or run the simulation
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/scenes/01-team-planning-room.png"
            alt="A team at a planning board, work on the wall behind them."
            className="w-full rounded-card"
          />
          <p className="border-l-2 border-charcoal pl-5 type-label">
            Same work. Less waiting.
          </p>
        </div>
      </section>

      {/* ── Two ways ─────────────────────────────────────────── */}
      <section className="border-t border-border bg-studio">
        <div className="mx-auto flex max-w-[86rem] flex-col gap-10 px-6 py-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="type-eyebrow">Two ways to do the same work</p>
              <h2 className="mt-5 type-page">Same work. Different flow.</h2>
              <p className="mt-3 max-w-[52ch] type-body text-muted">
                People build in both. The difference is how the work moves
                between them.
              </p>
            </div>

            <label className="flex shrink-0 flex-col gap-2 border-l border-border pl-6">
              <span className="type-overline text-muted">Story points</span>
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
                title: "Traditional scrum (AI assisted)",
                blurb: "People build. Work waits between steps.",
                src: "/assets/scenes/traditional-desks.png",
                alt: "Five desks in a row. A stack of work waits beside each one, and the fourth person is idle.",
                foot: "Multiple handoffs. Queues between roles. Delays add up.",
              },
              {
                title: "AI-driven agile (automated)",
                blurb: "One agent, end to end. People decide.",
                src: "/assets/scenes/ai-conveyor.png",
                alt: "One conveyor carrying work past a single console, with nothing queued beside it.",
                foot: "No handoffs. No queue. No approval gate.",
              },
            ].map((col) => (
              <div key={col.title} className="flex flex-col gap-5">
                <div>
                  <h3 className="type-section">{col.title}</h3>
                  <p className="mt-1 type-caption">{col.blurb}</p>
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
                <p className="mt-auto type-caption">{col.foot}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Outcome ──────────────────────────────────────────── */}
      <section id="outcome" className="border-t border-border">
        <div className="mx-auto flex max-w-[86rem] flex-col gap-10 px-6 py-20">
          <div>
            <p className="type-eyebrow">A clearly different outcome</p>
            <h2 className="mt-5 type-page">
              Same work. A very different outcome.
            </h2>
            <p className="mt-3 max-w-[56ch] type-body text-muted">
              At {sp} story points the difference comes from waiting, not from
              typing — and the ratio is {result.ratio.toFixed(1)}×.
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

      <SimulationPanel />

      {/* ── Why waiting happens ──────────────────────────────── */}
      <section className="border-t border-border bg-studio">
        <div className="mx-auto flex max-w-[86rem] flex-col gap-10 px-6 py-20">
          <div>
            <p className="type-eyebrow">Why waiting happens</p>
            <h2 className="mt-5 type-page">
              Work waits because of the process, not the people.
            </h2>
          </div>
          <ul className="grid gap-8 sm:grid-cols-3">
            {WHY.map((item) => (
              <li
                key={item.title}
                className="flex flex-col gap-2 border-t border-border pt-5"
              >
                <h3 className="type-label">{item.title}</h3>
                <p className="type-caption">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── The protocol ─────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto flex max-w-[86rem] flex-col gap-10 px-6 py-20">
          <div>
            <p className="type-eyebrow">The agile delivery protocol</p>
            <h2 className="mt-5 type-page">
              Three rules, enforced by tooling.
            </h2>
            <p className="mt-3 max-w-[56ch] type-body text-muted">
              None of these depend on anybody remembering them, which is the
              only reason they hold under load.
            </p>
          </div>
          <dl className="grid gap-8 sm:grid-cols-3">
            {PROTOCOL.map((item) => (
              <div key={item.rule} className="flex flex-col gap-2">
                <dt className="type-label">{item.rule}</dt>
                <dd className="type-caption">{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Forward ──────────────────────────────────────────── */}
      <section className="border-t border-border bg-tint">
        <div className="mx-auto flex max-w-[86rem] flex-wrap items-center gap-8 px-6 py-20">
          <div className="min-w-0 flex-1">
            <p className="type-eyebrow">A new way forward</p>
            <h2 className="mt-5 type-page">
              People move from building to{" "}
              <span className="text-crimson-ink">deciding</span>.
            </h2>
            <p className="mt-3 max-w-[52ch] type-body text-muted">
              The same agile principles, with the queues taken out. The one
              human step that remains is the judgement call.
            </p>
          </div>
          <Link
            href="/process/quiz"
            className="inline-flex items-center gap-3 border border-charcoal bg-charcoal px-7 py-3.5 type-label text-studio rounded-card transition-colors duration-150 hover:border-crimson hover:bg-crimson"
          >
            Knowledge check
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
