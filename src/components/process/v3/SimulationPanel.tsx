"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ArrowRight } from "../../icons/ArrowRight";

/**
 * The 3D comparison, behind a click.
 *
 * The chunk is ~250 kB of three.js, and most readers of this page want the
 * argument rather than the toy. Loading it on arrival taxes everyone for the
 * few who will drag a story point onto a desk. Loading it on demand means the
 * page opens fast AND the demonstration is still there — which is the whole
 * reason it was written.
 *
 * It was briefly reachable from nothing at all: the v3 rewrite replaced the
 * screen that imported it, and eleven files and 2,225 lines quietly left the
 * bundle while the hero still promised "see the process in one minute".
 */
const ProcessComparison = dynamic(
  () => import("../ProcessComparison").then((m) => m.ProcessComparison),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center border border-border bg-studio rounded-card">
        <p className="type-caption">Loading the simulation…</p>
      </div>
    ),
  },
);

export function SimulationPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section id="simulation" className="border-t border-border bg-studio">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-8 px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="type-eyebrow">Run it yourself</p>
            <h2 className="mt-5 type-page">Drop work into either room.</h2>
            <p className="mt-3 max-w-[56ch] type-body text-muted">
              The same five steps, laid out twice. Drag a story point onto a
              desk and watch where it stops — the queues are the argument, and
              they are there before you touch anything.
            </p>
          </div>

          {!open ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex shrink-0 items-center gap-3 border border-crimson bg-crimson px-7 py-3.5 type-label text-studio rounded-card transition-colors duration-150 hover:border-charcoal hover:bg-charcoal"
            >
              Start the simulation
              <ArrowRight size={18} />
            </button>
          ) : null}
        </div>

        {open ? (
          <ProcessComparison />
        ) : (
          <p className="type-caption">
            Loads about 250 kB of 3D on demand, so the rest of this page does
            not pay for it.
          </p>
        )}
      </div>
    </section>
  );
}
