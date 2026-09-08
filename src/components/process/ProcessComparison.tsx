"use client";

import dynamic from "next/dynamic";
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
import { TransitionLink } from "../ui/TransitionLink";
import { StationOverlay, type Anchor } from "./StationOverlay";
import { ElapsedClock } from "./ElapsedClock";
import { ModeBadgeRow } from "./ModeBadgeRow";
import { StationList } from "./StationList";
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
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [live, setLive] = useState<{
    step: StepId | null;
    phase: "work" | "wait" | "transit" | null;
    waitDays: number;
    waitElapsedDays: number;
    elapsedDays: number;
    sp: StoryPoint | null;
    startStep: StepId;
    queues: number[];
  }>({
    step: null,
    phase: null,
    waitDays: 0,
    waitElapsedDays: 0,
    elapsedDays: 0,
    sp: null,
    startStep: "intake",
    queues: [3, 3, 3, 5],
  });
  const [announcement, setAnnouncement] = useState("");
  // null until hydration, so the server HTML and the first client paint agree.
  const detected = useBrowserValue(detectWebGL);
  const [forcedFallback, setForcedFallback] = useState(false);
  const use3d = forcedFallback ? false : detected;

  const sceneRef = useRef<ProcessSceneHandle | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const pointerDrag = useRef<StoryPoint | null>(null);

  const record = useCallback(
    (sp: StoryPoint, startStep: StepId, itemId: string) => {
      // The model is deterministic, so the same size entering at the same step
      // can only ever produce the same row. Repeating it would read as click
      // logging rather than analysis.
      setRuns((prev) =>
        [
          { itemId, sp, startStep },
          ...prev.filter((r) => !(r.sp === sp && r.startStep === startStep)),
        ].slice(0, 8),
      );
      const c = compare(sp, startStep);
      setAnnouncement(
        `${sp} story point item entered at ${STEP_LABEL[startStep]}. Traditional Agile ${c.traditional.totalDays.toFixed(1)} days, AI-driven delivery ${c.aiDriven.totalDays.toFixed(1)} days. ${c.ratio.toFixed(1)} times faster.`,
      );
    },
    [],
  );

  const place = useCallback(
    (sp: StoryPoint, step: StepId) => {
      const itemId = sceneRef.current?.dropItem(sp, step) ?? `wi-${Date.now()}`;
      record(sp, step, itemId);
      // phase must be set here too, or the first frame renders "Finished"
      // (phase === null) before the first progress event arrives.
      setLive((prev) => ({
        ...prev,
        sp,
        startStep: step,
        elapsedDays: 0,
        waitDays: 0,
        waitElapsedDays: 0,
        step,
        phase: "work",
      }));
      setArmed(null);
      setHovered(null);
      sceneRef.current?.setHoveredStep(null);
    },
    [record],
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
        // Nearest projected station to the release point.
        const local = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
        let best: { id: string; d: number } | null = null;
        for (const a of anchors) {
          if (a.id.startsWith("gap-")) continue;
          const d = Math.hypot(a.x - local.x, a.y - local.y);
          if (!best || d < best.d) best = { id: a.id, d };
        }
        place(held, (best?.id as StepId) ?? "intake");
      };

      target.addEventListener("pointermove", move);
      target.addEventListener("pointerup", up);
    },
    [anchors, place],
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
      <ModeToggle
        mode={mode}
        onChange={(next) => {
          setMode(next);
          // In-flight work is cancelled by a room change, so the clock must
          // stop describing it. Leaving it showed a run measured against the
          // other room's total, e.g. "35.5 d elapsed of 2.5 d total".
          setArmed(null);
          setHovered(null);
          setLive({
            step: null,
            phase: null,
            waitDays: 0,
            waitElapsedDays: 0,
            elapsedDays: 0,
            sp: null,
            startStep: "intake",
            queues: [3, 3, 3, 5],
          });
        }}
      />

      <ModeBadgeRow mode={mode} />

      <ElapsedClock
        mode={mode}
        sp={live.sp}
        startStep={live.startStep}
        elapsedDays={live.elapsedDays}
        phase={live.phase}
      />

      <div
        ref={surfaceRef}
        className="relative aspect-[3/2] w-full overflow-hidden border border-border bg-studio rounded-sharp lg:aspect-[5/2]"
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
            onAnchors={setAnchors}
            onBacklogChanged={(backlog) =>
              setLive((prev) => ({ ...prev, queues: [...backlog] }))
            }
            onItemProgress={(p) => {
              // The runtime cancels in-flight work inside a passive effect, so
              // frames for the room we just LEFT can still arrive after the
              // reset and freeze a stale readout there. Effect ordering is not
              // something to depend on; the frame says which room it is from.
              if (p.mode !== mode) return;
              setLive((prev) => {
                return {
                  ...prev,
                  step: p.station as StepId,
                  // transit is its own state. Folding it into null made the
                  // readout say "Finished" while the box was still moving.
                  phase:
                    p.phase === "waiting"
                      ? "wait"
                      : p.phase === "working"
                        ? "work"
                        : "transit",
                  // The wait at THIS gap, not the whole run so far. Showing
                  // the run total here made two different labels display the
                  // same number, which reads as decoration.
                  waitDays:
                    p.phase === "waiting" ? p.segmentDays : prev.waitDays,
                  waitElapsedDays:
                    p.phase === "waiting" ? p.segmentElapsedDays : 0,
                  elapsedDays: p.elapsedDays,
                  sp: p.sp,
                  // Mirror the whole array. Copying only the waiting gap meant
                  // the runtime's decay was never emitted, so a card and the
                  // pile it describes drifted apart permanently.
                  queues: [...p.backlog],
                };
              });
            }}
            onItemComplete={(r: WorkItemResult) => {
              if (r.mode !== mode) return;
              setLive((prev) => ({
                ...prev,
                step: null,
                phase: null,
                elapsedDays: r.totalDays,
              }));
              setAnnouncement(
                `${r.sp} story point item completed in ${r.totalDays.toFixed(1)} simulated days.`,
              );
            }}
            onUnavailable={() => setForcedFallback(true)}
            ariaLabel={
              mode === "traditional"
                ? "Traditional Agile floor: five workstations in a row with cardboard boxes queued between every hand-off."
                : "AI-driven floor: a continuous conveyor loop past automated checkpoints, with no queues."
            }
          />
        )}

        <StationOverlay
          anchors={anchors}
          mode={mode}
          hovered={hovered}
          armed={armed}
          activeStep={live.step}
          activePhase={live.phase}
          activeWaitDays={live.waitDays}
          activeWaitElapsedDays={live.waitElapsedDays}
          queueDepths={live.queues}
          onHover={(step) => {
            setHovered(step);
            sceneRef.current?.setHoveredStep(step);
          }}
          onDrop={(step, sp) => place(sp, step)}
        />
      </div>

      {/* Below lg the five cards cannot sit over the model without colliding,
          so the same content becomes a vertical list under it. */}
      <StationList
        mode={mode}
        armed={armed}
        activeStep={live.step}
        activePhase={live.phase}
        activeWaitDays={live.waitDays}
        activeWaitElapsedDays={live.waitElapsedDays}
        queueDepths={live.queues}
        onDrop={(step, sp) => place(sp, step)}
      />

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
          <span className="type-label">
            {armed} SP selected. Choose a station on the floor above, or
          </span>
          <button
            type="button"
            onClick={() => place(armed, "intake")}
            className="border border-border bg-studio px-3 py-2 type-caption rounded-sharp transition-colors duration-150 hover:border-crimson hover:text-crimson"
          >
            start at the beginning
          </button>
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
        <TransitionLink
          href="/process/quiz"
          className="inline-flex items-center gap-3 border border-crimson bg-crimson px-6 py-3 type-label text-studio rounded-sharp transition-colors duration-150 hover:border-charcoal hover:bg-charcoal"
        >
          Take Quiz
          <ArrowRight size={18} />
        </TransitionLink>
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
