"use client";

import cn from "clsx";
import type { ProcessMode } from "@/types/process-scene";
import { useT } from "../shell/LocaleProvider";

const OPTIONS: { id: ProcessMode; labelKey: string; subKey: string }[] = [
  {
    id: "traditional",
    labelKey: "sim.mode.traditional",
    subKey: "sim.mode.traditionalSub",
  },
  {
    id: "ai-dlc",
    labelKey: "sim.mode.ai",
    subKey: "sim.mode.aiSub",
  },
];

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: ProcessMode;
  onChange: (m: ProcessMode) => void;
}) {
  const t = useT();
  const move = (dir: 1 | -1) => {
    const i = OPTIONS.findIndex((o) => o.id === mode);
    onChange(OPTIONS[(i + dir + OPTIONS.length) % OPTIONS.length].id);
  };

  return (
    <div
      role="radiogroup"
      aria-label={t("sim.mode.legend")}
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
              {t(o.labelKey)}
            </span>
            <span className="type-caption">{t(o.subKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
