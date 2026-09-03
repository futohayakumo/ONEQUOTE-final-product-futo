"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Line-by-line reveal driven by ONE requestAnimationFrame loop. No library.
 *
 * The global `prefers-reduced-motion` rule in globals.css stops CSS
 * transitions but NOT a rAF loop, so reduced motion is handled explicitly
 * here: every line renders on the first paint and `done` is true immediately.
 */
export function useLineReveal(
  lines: string[],
  { msPerChar = 4, msPerLine = 70 }: { msPerChar?: number; msPerLine?: number } = {},
) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [partial, setPartial] = useState("");
  const [done, setDone] = useState(false);
  const frame = useRef<number | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- this effect IS the
     animation driver: it synchronises React with a requestAnimationFrame loop,
     which is exactly the external-system case the rule exempts. */
  useEffect(() => {
    if (lines.length === 0) {
      setVisibleCount(0);
      setPartial("");
      setDone(true);
      return;
    }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setVisibleCount(lines.length);
      setPartial("");
      setDone(true);
      return;
    }

    setVisibleCount(0);
    setPartial("");
    setDone(false);

    // Cumulative start time of each line, so the loop is a pure function of
    // elapsed time rather than an accumulator that can drift.
    const starts: number[] = [];
    let acc = 0;
    for (const line of lines) {
      starts.push(acc);
      acc += line.length * msPerChar + msPerLine;
    }
    const totalMs = acc;

    const begin = performance.now();

    const tick = () => {
      const elapsed = performance.now() - begin;

      if (elapsed >= totalMs) {
        setVisibleCount(lines.length);
        setPartial("");
        setDone(true);
        frame.current = null;
        return;
      }

      let index = 0;
      while (index + 1 < starts.length && starts[index + 1] <= elapsed) index += 1;

      const into = elapsed - starts[index];
      const chars = Math.floor(into / msPerChar);

      setVisibleCount(index);
      setPartial(lines[index].slice(0, Math.min(chars, lines[index].length)));

      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [lines, msPerChar, msPerLine]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const revealAll = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setVisibleCount(lines.length);
    setPartial("");
    setDone(true);
  };

  return { visibleCount, partial, done, revealAll };
}
