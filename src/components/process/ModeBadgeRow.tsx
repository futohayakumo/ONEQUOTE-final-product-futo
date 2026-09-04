import cn from "clsx";
import type { ProcessMode } from "@/types/process-scene";
import { CubeOutlineIcon, UserIcon } from "../icons/flow";

const BADGES: Record<ProcessMode, { label: string; ai: boolean }[]> = {
  traditional: [
    { label: "Human work", ai: false },
    { label: "AI-assisted (limited)", ai: true },
  ],
  "ai-driven": [
    { label: "Human decision", ai: false },
    { label: "AI automation", ai: true },
    { label: "AI-assisted", ai: true },
  ],
};

export function ModeBadgeRow({ mode }: { mode: ProcessMode }) {
  return (
    <div className="flex flex-wrap gap-2">
      {BADGES[mode].map((b) => (
        <span
          key={b.label}
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
          {b.label}
        </span>
      ))}
    </div>
  );
}
