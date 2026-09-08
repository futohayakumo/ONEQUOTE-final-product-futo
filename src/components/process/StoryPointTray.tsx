"use client";

import type { StoryPoint } from "@/types/process-scene";
import { useT } from "../shell/LocaleProvider";
import { STORY_POINTS } from "./model/processModel";
import { StoryPointChip } from "./StoryPointChip";

export function StoryPointTray({
  armed,
  onArm,
  onDragStart,
  onDragEnd,
  onPointerDown,
  hint,
}: {
  armed: StoryPoint | null;
  onArm: (sp: StoryPoint) => void;
  onDragStart: (sp: StoryPoint, e: React.DragEvent) => void;
  onDragEnd: () => void;
  onPointerDown: (sp: StoryPoint, e: React.PointerEvent) => void;
  hint: string;
}) {
  const t = useT();
  return (
    <div className="flex flex-col gap-4 border border-border bg-studio p-5 rounded-sharp lg:flex-row lg:items-center lg:gap-8">
      <div className="flex flex-col gap-1.5 lg:w-64 lg:shrink-0">
        <span className="type-label text-crimson">{t("sim.tray.title")}</span>
        <span className="type-caption">{hint}</span>
      </div>
      <div
        className="flex flex-wrap gap-3"
        role="group"
        aria-label={t("sim.tray.group")}
      >
        {STORY_POINTS.map((sp) => (
          <StoryPointChip
            key={sp}
            sp={sp}
            armed={armed === sp}
            onArm={() => onArm(sp)}
            onDragStart={(e) => onDragStart(sp, e)}
            onDragEnd={onDragEnd}
            onPointerDown={(e) => onPointerDown(sp, e)}
          />
        ))}
      </div>
    </div>
  );
}
