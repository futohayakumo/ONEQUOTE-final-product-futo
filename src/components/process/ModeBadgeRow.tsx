"use client";

import cn from "clsx";
import type { ProcessMode } from "@/types/process-scene";
import { CubeOutlineIcon, UserIcon } from "../icons/flow";
import { useT } from "../shell/LocaleProvider";

const BADGES: Record<ProcessMode, { key: string; ai: boolean }[]> = {
  traditional: [
    { key: "sim.badge.humanWork", ai: false },
    { key: "sim.badge.aiLimited", ai: true },
  ],
  "ai-driven": [
    { key: "sim.badge.humanDecision", ai: false },
    { key: "sim.badge.aiAutomation", ai: true },
    { key: "sim.badge.aiAssisted", ai: true },
  ],
};

export function ModeBadgeRow({ mode }: { mode: ProcessMode }) {
  const t = useT();
  return (
    <div className="flex flex-wrap gap-2">
      {BADGES[mode].map((b) => (
        <span
          key={b.key}
          className={cn(
            "inline-flex items-center gap-2 border px-3 py-1.5 type-caption rounded-sharp",
            b.ai
              ? "border-crimson bg-tint text-charcoal"
              : "border-border bg-studio",
          )}
        >
          <span className={b.ai ? "text-crimson" : "text-muted"}>
            {b.ai ? <CubeOutlineIcon size={14} /> : <UserIcon size={14} />}
          </span>
          {t(b.key)}
        </span>
      ))}
    </div>
  );
}
