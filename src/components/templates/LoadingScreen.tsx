"use client";

import { useEffect, useState } from "react";
import { useT } from "../providers/LocaleProvider";

/**
 * A vessel crossing three points, shown while the page comes up.
 *
 * It replaces the route-change animation, which slid every screen sideways on
 * arrival — motion that cost a frame budget on every navigation and told the
 * reader nothing. This runs once, at load, and says what the site is about
 * before a word of it has rendered.
 *
 * It plays two full laps even when there is nothing to wait for. A loader that
 * flashes for 80ms and vanishes reads as a glitch; one that completes reads as
 * an intro. `MIN_MS` is that floor, and the fade is 400ms on top of it.
 *
 * It cuts between frames rather than gliding. Three drawings of a ship at
 * three points is a kamishibai, and a kamishibai that tweens is neither a
 * kamishibai nor an animation — the frames are the unit, so nothing here has a
 * transition on its position.
 *
 * `sessionStorage`, not `localStorage`: it should not greet a reader who is
 * moving between screens, but it should be there again tomorrow.
 */
const STEPS = ["loading.depart", "loading.transit", "loading.arrive"] as const;
const LAPS = 2;
const FRAMES = STEPS.length * LAPS;
const STEP_MS = 310;
const MIN_MS = STEP_MS * FRAMES;
const FADE_MS = 400;
const KEY = "portfolio.intro.v1";

/*
 * Decided once per page load, at module scope.
 *
 * React runs mount effects twice in development, and the first run writes the
 * flag the second run then reads — so the loader marked itself as already seen
 * and never rendered at all. A ref inside the component does not help: the
 * second invocation is on the same instance but AFTER the first has already
 * written to storage. The question "has this tab seen the intro" belongs to the
 * page load, not to a component instance, so it is answered here.
 */
let decided: "show" | "skip" | null = null;

function decide(): "show" | "skip" {
  if (decided) return decided;
  let seen = false;
  try {
    seen = window.sessionStorage.getItem(KEY) === "1";
    if (!seen) window.sessionStorage.setItem(KEY, "1");
  } catch {
    /* private mode — show it, which is the harmless direction to fail */
  }
  decided = seen ? "skip" : "show";
  return decided;
}

export function LoadingScreen() {
  const t = useT();
  const [state, setState] = useState<"idle" | "running" | "leaving" | "done">(
    "idle",
  );
  // Frame index across both laps; the position on the line is `frame % 3`.
  const [frame, setFrame] = useState(0);
  const step = frame % STEPS.length;

  useEffect(() => {
    // In an effect, never during render: this wraps every route, and reading
    // storage while rendering is a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(decide() === "show" ? "running" : "done");
  }, []);

  useEffect(() => {
    if (state !== "running") return;
    const ticks = Array.from({ length: FRAMES }, (_, i) =>
      setTimeout(() => setFrame(i), i * STEP_MS),
    );
    const out = setTimeout(() => setState("leaving"), MIN_MS);
    const gone = setTimeout(() => setState("done"), MIN_MS + FADE_MS);
    return () => {
      ticks.forEach(clearTimeout);
      clearTimeout(out);
      clearTimeout(gone);
    };
  }, [state]);

  if (state === "done" || state === "idle") return null;

  return (
    <div
      role="status"
      aria-label={t("loading.label")}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-studio transition-opacity ease-out ${
        state === "leaving" ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <div className="relative w-[min(30rem,74vw)]">
        {/* The three calls, and the run between them — the same figure the
            sailing rows use, so the loader is not a separate idea. */}
        <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-border" />
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-px bg-crimson"
          style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
        />

        <span className="relative flex justify-between">
          {STEPS.map((key, i) => (
            <span
              key={key}
              aria-hidden
              className={`h-2.5 w-2.5 rounded-full ${
                i <= step ? "bg-crimson" : "border border-control bg-studio"
              }`}
            />
          ))}
        </span>

        {/* The vessel sits on the current point. `left` in percent plus a
            half-width pull-back keeps it centred on each point at any width;
            it jumps there, it does not sail there. */}
        <span
          aria-hidden
          className="absolute top-1/2 w-24 -translate-x-1/2 -translate-y-[85%]"
          style={{ left: `${(step / (STEPS.length - 1)) * 100}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/spot/18-vessel-mark.png" alt="" className="w-full" />
        </span>
      </div>

      <p className="mt-10 type-overline text-muted">{t(STEPS[step])}</p>
    </div>
  );
}
