"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reveals log lines one WHOLE MESSAGE at a time.
 *
 * An earlier version typed character by character. That reads as a movie
 * terminal, not a real one: a real console prints a line the instant the line
 * exists. So each message now appears complete, and the only thing that is
 * staggered is the gap between messages — which is what actually carries the
 * sense of a sequence arriving over the wire.
 */
export function useLineReveal(
  lines: string[],
  { msPerLine = 90 }: { msPerLine?: number } = {},
) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [done, setDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* eslint-disable react-hooks/set-state-in-effect -- this effect IS the
     playback driver: it synchronises React with a timer sequence, the
     external-system case the rule exempts. */
  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    if (lines.length === 0) {
      setVisibleCount(0);
      setDone(true);
      return;
    }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setVisibleCount(lines.length);
      setDone(true);
      return;
    }

    setVisibleCount(0);
    setDone(false);

    for (let i = 0; i < lines.length; i += 1) {
      timers.current.push(
        setTimeout(
          () => {
            setVisibleCount(i + 1);
            if (i === lines.length - 1) setDone(true);
          },
          msPerLine * (i + 1),
        ),
      );
    }

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [lines, msPerLine]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const revealAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setVisibleCount(lines.length);
    setDone(true);
  };

  return { visibleCount, done, revealAll };
}
