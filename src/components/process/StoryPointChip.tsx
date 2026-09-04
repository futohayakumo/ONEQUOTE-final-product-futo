"use client";

import cn from "clsx";
import type { StoryPoint } from "@/types/process-scene";

/**
 * Drag source. Also a real <button>, because HTML5 drag and drop does not
 * exist on iOS Safari and is unusable by keyboard — see the pointer and
 * keyboard paths in ProcessComparison.
 */
export function StoryPointChip({
  sp,
  armed,
  onArm,
  onDragStart,
  onDragEnd,
  onPointerDown,
}: {
  sp: StoryPoint;
  armed: boolean;
  onArm: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  return (
    <button
      type="button"
      draggable
      aria-pressed={armed}
      aria-label={`Send ${sp === 8 ? "an" : "a"} ${sp} story point item through the pipeline`}
      onClick={onArm}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onPointerDown={onPointerDown}
      className={cn(
        "flex h-16 w-16 shrink-0 cursor-grab select-none flex-col items-center justify-center rounded-sharp transition-colors duration-150 active:cursor-grabbing",
        armed
          ? "border-2 border-crimson bg-tint"
          : "border border-border bg-studio hover:border-crimson",
      )}
    >
      <span className="type-label tnum leading-none">{sp}</span>
      <span className="type-caption leading-none">SP</span>
    </button>
  );
}
