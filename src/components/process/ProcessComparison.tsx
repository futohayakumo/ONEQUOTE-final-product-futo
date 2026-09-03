"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import type {
  ProcessMode,
  ProcessSceneHandle,
  StepId,
  StoryPoint,
  WorkItemResult,
} from "@/types/process-scene";
import { detectWebGL, useBrowserValue } from "@/lib/useBrowserValue";
import { ArrowRight } from "../icons/ArrowRight";
import { DropOverlay } from "./DropOverlay";
import { ModeBadgeRow } from "./ModeBadgeRow";
import { ModeToggle } from "./ModeToggle";
import { ProcessSceneFallback } from "./ProcessSceneFallback";
import { RunReadout, type RunRow } from "./RunReadout";
import { StoryPointTray } from "./StoryPointTray";
import { STEP_LABEL, compare } from "./model/processModel";

/**
 * `ssr: false` is only legal from a client component in the App Router, which
 * is why this file carries "use client". This dynamic() call is also the chunk
 * boundary: three.js is loaded here and nowhere else in the app.
 */
const ProcessScene = dynamic(() => import("./scene/ProcessScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <span className="type-caption">Preparing the floor plan…</span>
    </div>
  ),
});

const DND_TYPE = "application/x-story-point";

export function ProcessComparison() {
  const [mode, setMode] = useState<ProcessMode>("traditional");
  const [armed, setArmed] = useState<StoryPoint | null>(null);
  const [hovered, setHovered] = useState<StepId | null>(null);
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [announcement, setAnnouncement] = useState("");
  // null until hydration, so the server HTML and the first client paint agree.
  const detected = useBrowserValue(detectWebGL);
  const [forcedFallback, setForcedFallback] = useState(false);
  const use3d = forcedFallback ? false : detected;

  const sceneRef = useRef<ProcessSceneHandle | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const pointerDrag = useRef<StoryPoint | null>(null);

  const record = useCallback((sp: StoryPoint, startStep: StepId, itemId: string) => {
    setRuns((prev) => [{ itemId, sp, startStep }, ...prev].slice(0, 8));
    const c = compare(sp, startStep);
    setAnnouncement(
      `${sp} story point item entered at ${STEP_LABEL[startStep]}. Traditional Agile ${c.traditional.totalDays.toFixed(1)} days, AI-driven delivery ${c.aiDriven.totalDays.toFixed(1)} days. ${c.ratio.toFixed(1)} times faster.`,
    );
  }, []);

  const place = useCallback(
    (sp: StoryPoint, step: StepId, clientPoint?: { x: number; y: number }) => {
      sceneRef.current?.setHoveredStep(step);
      const itemId = sceneRef.current?.dropItem(sp, clientPoint) ?? `wi-${Date.now()}`;
      record(sp, step, itemId);
      setArmed(null);
      setHovered(null);
      sceneRef.current?.setHoveredStep(null);
    },
    [record],
  );

  const onDrop = useCallback(
    (step: StepId, e: React.DragEvent) => {
      const raw = e.dataTransfer.getData(DND_TYPE);
      const sp = Number(raw) as StoryPoint;
      if (!raw || Number.isNaN(sp)) return;
      place(sp, step, { x: e.clientX, y: e.clientY });
    },
    [place],
  );

  // Pointer path for touch. HTML5 drag and drop simply does not exist on iOS,
  // and this is a portfolio — it will be opened on a phone.
  const onPointerDown = useCallback(
    (sp: StoryPoint, e: React.PointerEvent) => {
      if (e.pointerType === "mouse") return;
      pointerDrag.current = sp;
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const move = (ev: PointerEvent) => {
        const ghost = ghostRef.current;
        if (ghost) {
          ghost.style.transform = `translate(${ev.clientX - 28}px, ${ev.clientY - 28}px)`;
          ghost.style.opacity = "1";
        }
      };

      const up = (ev: PointerEvent) => {
        target.removeEventListener("pointermove", move);
        target.removeEventListener("pointerup", up);
        if (ghostRef.current) ghostRef.current.style.opacity = "0";
        const held = pointerDrag.current;
        pointerDrag.current = null;
        if (held === null) return;
        const rect = surfaceRef.current?.getBoundingClientRect();
        if (!rect) return;
        const inside =
          ev.clientX >= rect.left &&
          ev.clientX <= rect.right &&
          ev.clientY >= rect.top &&
          ev.clientY <= rect.bottom;
        if (!inside) return;
        const step =
          sceneRef.current?.hitTest({ x: ev.clientX, y: ev.clientY }) ?? "intake";
        place(held, step, { x: ev.clientX, y: ev.clientY });
      };

      target.addEventListener("pointermove", move);
      target.addEventListener("pointerup", up);
    },
    [place],
  );

  const hint = useMemo(
    () =>
      mode === "traditional"
        ? "Place a box on any step to watch it move — and wait — through each hand-off. Keyboard: select a size, then choose a step."
        : "Place a box anywhere. There is no queue to choose and no hand-off to aim at.",
    [mode],
  );

  const SceneImpl = use3d ? ProcessScene : ProcessSceneFallback;

  return (
    <div className="flex flex-col gap-8">
      <ModeToggle mode={mode} onChange={setMode} />

      <ModeBadgeRow mode={mode} />

      <div
        ref={surfaceRef}
        className="relative aspect-[16/9] w-full overflow-hidden border border-border bg-studio rounded-sharp"
        onDragOver={(e) => e.preventDefault()}
      >
        {use3d === null ? (
          <div className="flex h-full items-center justify-center">
            <span className="type-caption">Preparing the floor plan…</span>
          </div>
        ) : (
          <SceneImpl
            ref={sceneRef}
            mode={mode}
            onItemComplete={(r: WorkItemResult) =>
              setAnnouncement(
                `${r.sp} story point item completed in ${r.totalDays.toFixed(1)} simulated days.`,
              )
            }
            onUnavailable={() => setForcedFallback(true)}
            ariaLabel={
              mode === "traditional"
                ? "Traditional Agile floor: five workstations in a row with cardboard boxes queued between every hand-off."
                : "AI-driven floor: a continuous conveyor loop past automated checkpoints, with no queues."
            }
          />
        )}

        <DropOverlay
          mode={mode}
          hovered={hovered}
          armed={armed !== null}
          onHover={(step) => {
            setHovered(step);
            sceneRef.current?.setHoveredStep(step);
          }}
          onDrop={onDrop}
        />
      </div>

      <StoryPointTray
        armed={armed}
        hint={hint}
        onArm={(sp) => {
          // Keyboard / click path: arming then choosing a step, so the screen
          // is fully usable without ever performing a drag (WCAG 2.5.7).
          if (armed === sp) {
            place(sp, "intake");
          } else {
            setArmed(sp);
            setAnnouncement(
              `${sp} story point selected. Choose a step below, or press Enter again to enter at Intake.`,
            );
          }
        }}
        onDragStart={(sp, e) => {
          e.dataTransfer.setData(DND_TYPE, String(sp));
          // Safari refuses to start a drag without text/plain.
          e.dataTransfer.setData("text/plain", `${sp} SP`);
          e.dataTransfer.effectAllowed = "copy";
          setArmed(sp);
        }}
        onDragEnd={() => {
          setArmed(null);
          setHovered(null);
          sceneRef.current?.setHoveredStep(null);
        }}
        onPointerDown={onPointerDown}
      />

      {armed !== null ? (
        <div className="flex flex-wrap items-center gap-3 border-2 border-crimson bg-tint p-4 rounded-sharp">
          <span className="type-label">Place {armed} SP at</span>
          {(mode === "traditional"
            ? (["intake", "analysis", "dev", "test", "deploy"] as StepId[])
            : (["intake"] as StepId[])
          ).map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => place(armed, step)}
              className="border border-border bg-studio px-3 py-2 type-caption rounded-sharp transition-colors duration-150 hover:border-crimson hover:text-crimson"
            >
              {mode === "traditional" ? STEP_LABEL[step] : "The belt"}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setArmed(null)}
            className="ml-auto type-caption text-muted transition-colors duration-150 hover:text-crimson"
          >
            Cancel
          </button>
        </div>
      ) : null}

      <RunReadout runs={runs} />

      <div>
        <Link
          href="/journeys/process/quiz"
          className="inline-flex items-center gap-3 border border-crimson bg-crimson px-6 py-3 type-label text-studio rounded-sharp transition-colors duration-150 hover:border-charcoal hover:bg-charcoal"
        >
          Take Quiz
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* Touch drag ghost. */}
      <div
        ref={ghostRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-50 flex h-14 w-14 items-center justify-center border-2 border-crimson bg-studio opacity-0 rounded-sharp"
      >
        <span className="type-label tnum">{armed ?? ""}</span>
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
