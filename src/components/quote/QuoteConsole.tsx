"use client";

import { useEffect, useMemo, useRef } from "react";
import { logLineText, type LogLine, type LogTone } from "@/lib/simulate-log";
import { useLineReveal } from "./useLineReveal";

/**
 * Console colour assignment, all inside the token set:
 *   meta    #64748B  3.9:1  — timestamps and offsets, decorative context only
 *   key     #CBD5E1 11.4:1  — field names, service names
 *   value   #FFFFFF 17.9:1  — numbers and quoted values
 *   success #34D399  8.7:1  — the single `status: 200 OK` line
 * Terminal Green appears on exactly one line and nowhere else in the app.
 */
const TONE: Record<LogTone, string> = {
  meta: "text-muted",
  key: "text-border",
  value: "text-studio",
  success: "text-terminal",
};

export function QuoteConsole({ lines }: { lines: LogLine[] }) {
  const plain = useMemo(() => lines.map(logLineText), [lines]);
  const { visibleCount, done, revealAll } = useLineReveal(plain);
  const scroller = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);

  useEffect(() => {
    const el = scroller.current;
    if (el && pinned.current) el.scrollTop = el.scrollHeight;
  }, [visibleCount]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    pinned.current = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
  };

  return (
    <div className="overflow-hidden border border-charcoal rounded-sharp">
      <div className="flex items-center justify-between border-b border-muted bg-console px-4 py-2">
        <span className="type-console text-border">
          Core Quotation Module &rarr; Legacy ERP Engine
        </span>
        {done ? (
          <span className="type-console text-muted">trace complete</span>
        ) : (
          <button
            type="button"
            onClick={revealAll}
            className="type-console text-muted transition-colors duration-150 hover:text-terminal"
          >
            Reveal all
          </button>
        )}
      </div>

      <div
        ref={scroller}
        onScroll={onScroll}
        className="max-h-[26rem] overflow-auto bg-console px-4 py-3"
      >
        <pre className="type-console whitespace-pre-wrap break-words">
          {lines.slice(0, visibleCount).map((line) => (
            <div key={line.id} className="animate-line-in">
              {line.spans.map((span, i) => (
                <span key={i} className={TONE[span.tone]}>
                  {span.text}
                </span>
              ))}
            </div>
          ))}

          {!done ? (
            <span
              className="animate-caret inline-block w-[1ch] bg-crimson align-text-bottom"
              style={{ height: "1em" }}
              aria-hidden
            >
              &nbsp;
            </span>
          ) : null}
        </pre>
      </div>
    </div>
  );
}
