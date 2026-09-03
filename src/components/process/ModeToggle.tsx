"use client";

import cn from "clsx";
import type { ProcessMode } from "@/types/process-scene";

const OPTIONS: { id: ProcessMode; label: string; sub: string }[] = [
  {
    id: "traditional",
    label: "Traditional Agile",
    sub: "Siloed. Hand-offs. Wait times.",
  },
  {
    id: "ai-driven",
    label: "AI-Driven Delivery",
    sub: "Continuous flow. Intelligent orchestration.",
  },
];

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: ProcessMode;
  onChange: (m: ProcessMode) => void;
}) {
  const move = (dir: 1 | -1) => {
    const i = OPTIONS.findIndex((o) => o.id === mode);
    onChange(OPTIONS[(i + dir + OPTIONS.length) % OPTIONS.length].id);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Delivery approach"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          move(1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          move(-1);
        }
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      {OPTIONS.map((o) => {
        const active = mode === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.id)}
            className={cn(
              "flex flex-col items-start gap-1 p-4 text-left rounded-sharp transition-colors duration-150",
              active
                ? "border-2 border-crimson bg-tint"
                : "border border-border bg-studio hover:border-crimson",
            )}
          >
            <span className={cn("type-section", active && "text-crimson")}>
              {o.label}
            </span>
            <span className="type-caption">{o.sub}</span>
          </button>
        );
      })}
    </div>
  );
}
