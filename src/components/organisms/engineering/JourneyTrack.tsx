"use client";

import { useEffect, useRef, useState } from "react";
import { NODES, ROUTE_BY_NODE } from "@/lib/flow-data";
import { buildTrace } from "@/lib/trace";
import { formatDecimal } from "@/lib/localeFormat";
import type { NodeId } from "@/types/flow";
import { ArrowRight } from "../../atoms/icons/ArrowRight";
import { useLocale, useT } from "../../providers/LocaleProvider";

/**
 * One quotation request, told as a journey.
 *
 * The screen used to open on a wiring diagram of thirteen boxes in English,
 * and the feedback from the people it was meant for was that they could not
 * read it — while the two screens either side of it, which each tell one
 * story, they could. So this one tells its story first: the five services a
 * request passes through, one screen each, left to right, with a photograph,
 * a plain sentence of what happens there and the one thing that matters to
 * the business at that step. The millisecond figure is present but small.
 * The diagram, the code and the log are still on the page, below, behind a
 * button, for the reader who wants them.
 *
 * Horizontal on purpose. A request moving through a system is a thing going
 * somewhere, and a column of cards does not go anywhere. The page scrolls
 * down as always — the track is pinned and slides sideways in step with it,
 * so a mouse wheel works and nothing is hijacked. Under 1024px, or with
 * reduced motion on, the same panels simply stack.
 *
 * Every number is the trace's own. The track reads the same `buildTrace`
 * walk the log does, so the clock along the bottom, the per-step figure and
 * the "1.3 seconds" in the heading cannot disagree with the log below.
 */

/**
 * One drawing per step, each of which says what its panel says: five fields
 * leaving a phone; a ✓ past the gate and an ✕ stopped before it; a switch
 * sending one card down the red track, which widens to three; one red slot
 * on the ship with a tag on it and an hourglass beside. Drawn from the
 * prompts in PROCESS_IMAGE_PROMPTS.md, in the same clay as the process page.
 * A panel with no image sets its text wide instead.
 */
const IMAGE: Record<string, string | undefined> = {
  "new-request": "/assets/scenes/journey-1-request.png",
  "request-intake": "/assets/scenes/journey-2-check.png",
  "routing-gateway": "/assets/scenes/journey-3-route.png",
  "quotation-service": "/assets/scenes/06-dashboard-display.png",
  "erp-system": "/assets/scenes/journey-5-hold.png",
};
const ARRIVAL_IMAGE = "/assets/scenes/journey-6-arrival.png";

/** Scroll distance per panel transition, in viewport heights. Lower is faster. */
const VH_PER_STEP = 80;

/**
 * Where inside a step the panel actually moves.
 *
 * Linear mapping meant the track was mid-slide for the whole of every step —
 * a reader who stopped scrolling stopped on two half-panels with a sentence
 * cut at the screen edge, and one reviewer took that for the page being
 * broken. Now each panel holds still for the first and last 30% of its step
 * and crosses in the middle 40%, eased, so any resting point that is not
 * inside the crossing shows one whole panel.
 */
const DWELL = 0.3;

function eased(f: number): number {
  const u = Math.min(1, Math.max(0, (f - DWELL) / (1 - 2 * DWELL)));
  return u * u * (3 - 2 * u);
}
/** Height of the sticky nav, which the pinned viewport sits beneath. */
const NAV_PX = 64;

interface Panel {
  id: string;
  /** 1-based, as shown. The arrival panel has none. */
  no: number | null;
  image?: string;
  /** Milliseconds from the first entry to this panel's start. */
  offsetMs: number;
  /** Time in this service; the arrival panel has none. */
  ms: number | null;
}

export function JourneyTrack() {
  const t = useT();
  const { locale } = useLocale();

  // The quotation's route, not the spine. The spine is the diagram's rail and
  // skips the pricing service; a story about a quotation that never visits
  // the place the price is worked out would be a story about nothing.
  const trace = buildTrace(
    ROUTE_BY_NODE["quotation-service"],
    (id) => NODES[id as NodeId].label,
  );
  const panels: Panel[] = [
    ...trace.hops.map((h) => ({
      id: h.id,
      no: h.hop,
      image: IMAGE[h.id],
      offsetMs: h.offsetMs,
      ms: h.ms,
    })),
    { id: "arrival", no: null, image: ARRIVAL_IMAGE, offsetMs: trace.totalMs, ms: null },
  ];
  const N = panels.length;
  const seconds = formatDecimal(trace.totalMs / 1000, locale, 1);

  // "track" pins and slides; "stack" is the same content in a column. Decided
  // in an effect so the server HTML and the first client paint agree.
  const [mode, setMode] = useState<"stack" | "track">("stack");
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLSpanElement | null>(null);
  const clockRef = useRef<HTMLSpanElement | null>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const mql = window.matchMedia(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
    );
    const apply = () => setMode(mql.matches ? "track" : "stack");
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (mode !== "track") return;
    let raf = 0;

    // Direct DOM writes, never setState: this runs on every scroll frame and
    // nothing in React needs to know where the track is.
    const update = () => {
      raf = 0;
      const wrap = wrapRef.current;
      const track = trackRef.current;
      if (!wrap || !track) return;
      const r = wrap.getBoundingClientRect();
      const viewport = window.innerHeight - NAV_PX;
      const span = r.height - viewport;
      const p = span <= 0 ? 0 : Math.min(1, Math.max(0, (NAV_PX - r.top) / span));

      const raw = p * (N - 1);
      const i = Math.min(N - 2, Math.floor(raw));
      const f = raw - i;
      const x = i + eased(f);
      track.style.transform = `translate3d(${-x * 100}vw, 0, 0)`;

      // The clock runs between panel start times, so it reads the trace's
      // own entry offsets and lands on the total exactly at the end.
      const ms = Math.round(
        panels[i].offsetMs + (panels[i + 1].offsetMs - panels[i].offsetMs) * f,
      );
      if (clockRef.current) clockRef.current.textContent = String(ms);
      if (fillRef.current) fillRef.current.style.width = `${p * 100}%`;
      dotRefs.current.forEach((dot, j) => {
        if (!dot) return;
        const on = j <= Math.round(x);
        dot.classList.toggle("bg-crimson", on);
        dot.classList.toggle("border-crimson", on);
        dot.classList.toggle("bg-studio", !on);
        dot.classList.toggle("border-control", !on);
      });
    };
    // When scrolling stops inside a crossing, finish it: settle on whichever
    // panel is nearer. Only while the track is pinned, only when the rest
    // point is mid-crossing, and never while the reader is still moving.
    let settle = 0;
    const snap = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      const viewport = window.innerHeight - NAV_PX;
      const span = r.height - viewport;
      if (span <= 0 || r.top > NAV_PX || r.bottom < window.innerHeight) return;
      const p = (NAV_PX - r.top) / span;
      const raw = p * (N - 1);
      const f = raw - Math.floor(raw);
      if (f <= DWELL || f >= 1 - DWELL) return;
      const target = Math.round(raw) / (N - 1);
      const top = window.scrollY + r.top - NAV_PX + target * span;
      window.scrollTo({ top, behavior: "smooth" });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
      clearTimeout(settle);
      settle = window.setTimeout(snap, 160);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearTimeout(settle);
      if (raf) cancelAnimationFrame(raf);
    };
    // panels is rebuilt each render but its values never change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, N]);

  const header = (
    <header className="mx-auto max-w-[86rem] px-6 pt-16 pb-10">
      <p className="type-eyebrow">{t("eng.eyebrow")}</p>
      <h1 className="mt-5 max-w-[24ch] type-page">
        {t("journey.title", { s: seconds })}
      </h1>
      <p className="mt-4 max-w-[62ch] type-body text-muted">{t("journey.lede")}</p>
      {mode === "track" ? (
        <p className="mt-6 inline-flex items-center gap-2 type-caption">
          {t("journey.hint")}
          <ArrowRight size={14} />
        </p>
      ) : null}
    </header>
  );

  const panel = (pn: Panel) => {
    const last = pn.no === null;
    return (
      <article
        key={pn.id}
        className={
          mode === "track"
            ? "flex h-full w-screen shrink-0 items-center"
            : "border-t border-border py-14"
        }
        aria-label={t(`journey.${pn.id}.title`)}
      >
        <div
          className={
            pn.image
              ? "mx-auto grid w-full max-w-[86rem] items-center gap-10 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16"
              : "mx-auto grid w-full max-w-[86rem] items-center gap-10 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16"
          }
        >
          {/* Six drawings in one clay. The ends were photographs for a while
              — a phone, a laptop — and the last one sat on the page like a
              cut from another site after five drawn panels. */}
          {pn.image ? (
            <div className="flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pn.image}
                alt=""
                className={
                  pn.image.endsWith(".jpg")
                    ? "aspect-[4/3] w-full max-w-[34rem] object-cover rounded-card"
                    : "w-full max-w-[34rem] object-contain"
                }
              />
            </div>
          ) : (
            /* The number, large, where the picture will go. */
            <div className="hidden items-center justify-center lg:flex">
              <span className="type-page text-mist" aria-hidden>
                {pn.no}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-5">
            <p className="flex items-center gap-3 type-overline text-muted">
              {pn.no !== null ? (
                <span className="inline-flex h-6 w-6 items-center justify-center bg-crimson type-caption font-semibold text-studio rounded-full">
                  {pn.no}
                </span>
              ) : null}
              {pn.no !== null ? (
                <>
                  {t(`journey.${pn.id}.name`)}
                  {/* The service's own name, small: it is what the map and
                      the log below call it, so the two stay linkable. */}
                  <span className="text-border">·</span>
                  <span className="normal-case tracking-normal type-caption">
                    {NODES[pn.id as NodeId].label}
                  </span>
                </>
              ) : (
                t("journey.arrival.label")
              )}
            </p>
            <h2 className="max-w-[20ch] type-section">
              {t(`journey.${pn.id}.title`)}
            </h2>
            <p className="max-w-[48ch] type-body text-muted">
              {t(`journey.${pn.id}.body`, { ms: pn.ms ?? trace.totalMs })}
            </p>
            {/* The one line for the business, set as a statement, not a
                caption. It is what this panel exists to say. */}
            <p className="max-w-[40ch] border-l-2 border-charcoal pl-5 type-label">
              {t(`journey.${pn.id}.fact`, { s: seconds, ms: trace.totalMs })}
            </p>
            {!last ? (
              <p className="type-caption tnum">
                {t("journey.ms", { ms: pn.ms ?? 0 })}
              </p>
            ) : null}
          </div>
        </div>
      </article>
    );
  };

  if (mode === "stack") {
    return (
      <section>
        {header}
        <div className="mx-auto max-w-[86rem]">{panels.map(panel)}</div>
      </section>
    );
  }

  return (
    <section>
      {header}
      {/* Tall wrapper; pinned viewport inside it. The page scrolls the wrapper's
          height and the track translates by the same fraction. */}
      <div
        ref={wrapRef}
        style={{ height: `calc(100vh - ${NAV_PX}px + ${(N - 1) * VH_PER_STEP}vh)` }}
      >
        <div
          className="sticky overflow-hidden border-t border-border bg-canvas"
          style={{ top: NAV_PX, height: `calc(100vh - ${NAV_PX}px)` }}
        >
          <div
            ref={trackRef}
            className="flex h-full will-change-transform"
            style={{ width: `${N * 100}vw` }}
          >
            {panels.map(panel)}
          </div>

          {/* The rail: the same three-dots-and-a-line figure the sailing rows
              and the loader use, with the request's clock beside it. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-border bg-studio">
            <div className="mx-auto flex max-w-[86rem] items-center gap-8 px-6 py-5">
              <div className="relative flex-1">
                <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-border" />
                <span
                  ref={fillRef}
                  aria-hidden
                  className="absolute left-0 top-1/2 h-px bg-crimson"
                  style={{ width: 0 }}
                />
                <span className="relative flex justify-between">
                  {panels.map((pn, j) => (
                    <span
                      key={pn.id}
                      ref={(el) => {
                        dotRefs.current[j] = el;
                      }}
                      aria-hidden
                      className="h-2.5 w-2.5 border border-control bg-studio rounded-full"
                    />
                  ))}
                </span>
              </div>
              <p className="shrink-0 type-label tnum" aria-live="off">
                <span className="type-caption">{t("journey.clock")} </span>
                <span ref={clockRef}>0</span>
                <span className="type-caption"> / {trace.totalMs} ms</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
