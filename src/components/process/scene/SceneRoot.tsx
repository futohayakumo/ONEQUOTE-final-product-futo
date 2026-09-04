"use client";

import { OrthographicCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { easing } from "maath";
import type { ProcessMode, StepId, StoryPoint } from "@/types/process-scene";
import { STEP_IDS } from "../model/processModel";
import {
  BELT,
  CAMERA,
  STATION_X,
  ZOOM_CLAMP,
  beltAnchor,
  outboundAnchor,
  waitAnchor,
  workAnchor,
} from "./layout";
import { AIRoom, TraditionalRoom } from "./parts/Rooms";
import { CardboardBox } from "./parts/Primitives";
import { Ground, LightRig } from "./rig/LightRig";
import type { WorkItem, WorkItemRuntime } from "./useWorkItems";

// Module-scope scratch. Zero allocation inside useFrame.
const scratchTarget = new THREE.Vector3();
const scratchPos = new THREE.Vector3();
const scratchFrom = new THREE.Vector3();
const scratchTo = new THREE.Vector3();
const projectV = new THREE.Vector3();

/** Screen-space position of a world point, in CSS pixels of the canvas. */
export interface Anchor {
  id: string;
  x: number;
  y: number;
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Fraction of a work segment spent travelling to the station. The remaining
 * 84% the item sits STILL on the desk being worked on.
 *
 * This ratio is the whole fix for "it just looked like cargo being carried":
 * an item now visibly stops, and the length of the stop is the story point
 * cost. Continuous motion across the segment made every run look identical.
 */
const APPROACH_FRACTION = 0.16;

/**
 * Fraction of an AI-driven segment spent moving to the next gantry; the rest
 * is spent held under it while the scan runs. Nothing queues, but the work is
 * still visibly happening somewhere specific.
 */
const AI_TRAVEL_FRACTION = 0.58;

export function SceneRoot({
  runtime,
  items,
  mode,
  reduced,
  onAnchors,
  onModeSettled,
  onReady,
}: {
  runtime: WorkItemRuntime;
  items: WorkItem[];
  mode: ProcessMode;
  reduced: boolean;
  /** Projected screen positions for the DOM label and drop-zone overlay. */
  onAnchors?: (anchors: Anchor[]) => void;
  onModeSettled?: (m: ProcessMode) => void;
  onReady?: () => void;
}) {
  const camRef = useRef<THREE.OrthographicCamera>(null);
  const itemsRef = useRef<Map<string, THREE.Group>>(new Map());
  const settled = useRef<ProcessMode | null>(null);
  const lastAnchorPublish = useRef(0);
  const lastAnchorKey = useRef("");
  const { size, invalidate } = useThree();

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    runtime.setMode(mode);
    settled.current = null;
    lastAnchorKey.current = "";
    invalidate();
  }, [mode, runtime, invalidate]);

  // Ortho zoom fits BOTH axes; the tighter one wins, or a wide canvas crops
  // the room vertically and a tall one crops it horizontally.
  const zoom = useMemo(() => {
    const cfg = CAMERA[mode];
    const raw = Math.min(
      size.width / cfg.worldWidth,
      size.height / cfg.worldHeight,
    );
    return Math.min(ZOOM_CLAMP.max, Math.max(ZOOM_CLAMP.min, raw));
  }, [size.width, size.height, mode]);

  useFrame((_, dt) => {
    const cam = camRef.current;
    const now = performance.now();

    // Advance the state machine FIRST: it is what retires finished items,
    // maintains the busy-station set the meshes read, grows the backlog, and
    // emits progress to the 2D panel.
    runtime.tick(dt, now, invalidate);

    if (cam) {
      const base = CAMERA[mode].position;
      const t0 = CAMERA[mode].target;

      // The camera is fixed. An earlier pointer parallax slid every station
      // label horizontally with it, and continuously drifting body text costs
      // more legibility than the effect is worth on a screen whose whole job is
      // being read. Its trigonometry is gone too: it round-tripped back to
      // `base` and then added the target on top, so the camera settled roughly
      // 1.6 units from the position the prop declared.
      scratchPos.set(base[0], base[1], base[2]);
      easing.damp3(cam.position, scratchPos, reduced ? 0 : 0.3, dt);
      easing.damp(cam, "zoom", zoom, reduced ? 0 : 0.28, dt);

      // Set the frustum explicitly rather than trusting the size the camera
      // was created with. The canvas is lazily mounted inside a subtree that
      // is mid route-transition, so its first measured size can be the 300x150
      // default — and an ortho camera that keeps that frustum points the
      // projection at nothing.
      cam.left = -size.width / 2;
      cam.right = size.width / 2;
      cam.top = size.height / 2;
      cam.bottom = -size.height / 2;
      cam.updateProjectionMatrix();
      cam.lookAt(scratchTarget.set(t0[0], t0[1], t0[2]));
      cam.updateMatrixWorld();

      if (settled.current !== mode) {
        settled.current = mode;
        onModeSettled?.(mode);
      }

      // Publish the projected station positions so the DOM overlay can sit
      // exactly on top of them. This is what makes the drop targets line up
      // with the model instead of floating over a guessed grid.
      if (onAnchors && now - lastAnchorPublish.current > 120) {
        lastAnchorPublish.current = now;
        const out: Anchor[] = [];
        const half = { w: size.width / 2, h: size.height / 2 };

        STEP_IDS.forEach((step, i) => {
          const p = mode === "traditional" ? workAnchor(i) : beltAnchor(i);
          projectV.set(p[0], p[1] + 0.5, p[2]).project(cam);
          out.push({
            id: step,
            x: (projectV.x + 1) * half.w,
            y: (1 - projectV.y) * half.h,
          });
        });

        // Published in BOTH rooms. The AI room needs the same four positions
        // so it can state, at the exact spot the other room has a pile, that
        // there is no queue here. An empty space says nothing.
        for (let i = 0; i < 4; i += 1) {
          const p = waitAnchor(i + 1);
          projectV.set(p[0], p[1] + 0.45, p[2]).project(cam);
          out.push({
            id: `gap-${i}`,
            x: (projectV.x + 1) * half.w,
            y: (1 - projectV.y) * half.h,
          });
        }

        const key = out.map((a) => `${a.id}:${a.x | 0}:${a.y | 0}`).join("|");
        if (key !== lastAnchorKey.current) {
          lastAnchorKey.current = key;
          onAnchors(out);
        }
      }
    }

    // Move every in-flight item. Direct transform mutation — never setState.
    for (const item of runtime.items) {
      const group = itemsRef.current.get(item.id);
      if (!group) continue;
      const { seg, local, outbound, outboundLocal } = runtime.locate(item, now);
      const index = Math.max(0, STEP_IDS.indexOf(seg.stepId));

      if (outbound) {
        // The visible ending: carried onto the pallet, or loaded into the truck.
        const from =
          item.mode === "ai-driven" ? beltAnchor(4) : workAnchor(4);
        const to = outboundAnchor(item.mode);
        scratchFrom.set(from[0], from[1], from[2]);
        scratchTo.set(to[0], to[1], to[2]);
        const e = easeInOutCubic(outboundLocal);
        group.position.lerpVectors(scratchFrom, scratchTo, e);
        group.position.y += 0.45 * 4 * e * (1 - e);
        group.rotation.y = e * 0.8;
      } else if (item.mode === "ai-driven") {
        const from =
          index === 0
            ? [BELT.x0 + 1.2, BELT.y + 0.22, BELT.z]
            : beltAnchor(index - 1);
        const to = beltAnchor(index);
        scratchFrom.set(from[0], from[1], from[2]);
        scratchTo.set(to[0], to[1], to[2]);
        // Travel, then HOLD under the gantry while it works. The hold is what
        // makes five separate stations readable; without it the run is one
        // continuous slide and the fast side says nothing at all.
        const travel = Math.min(1, local / AI_TRAVEL_FRACTION);
        group.position.lerpVectors(
          scratchFrom,
          scratchTo,
          easeInOutCubic(travel),
        );
        group.rotation.y = 0;
      } else if (seg.kind === "wait") {
        // Parked in the queue, dead still, on top of the pile.
        const p = waitAnchor(index);
        group.position.set(p[0], p[1] + 0.18, p[2]);
        group.rotation.y = 0.08;
      } else if (local < APPROACH_FRACTION) {
        // A short hand-off hop from the pile onto the desk.
        const from = waitAnchor(index);
        const to = workAnchor(index);
        scratchFrom.set(from[0], from[1] + 0.18, from[2]);
        scratchTo.set(to[0], to[1], to[2]);
        const e = easeInOutCubic(local / APPROACH_FRACTION);
        group.position.lerpVectors(scratchFrom, scratchTo, e);
        group.position.y += 0.5 * 4 * e * (1 - e);
        group.rotation.y = e * 0.5;
      } else {
        // Being worked on: STILL, on the desk, while the worker's arms move.
        const p = workAnchor(index);
        group.position.set(p[0], p[1], p[2]);
        group.rotation.y = 0.5;
      }
    }
  });

  // Read per frame by the meshes themselves. The runtime maintains the set in
  // tick(), so nothing here is computed during render.
  const isBusy = useCallback(
    (step: StepId) => runtime.busyStations.has(step),
    [runtime],
  );
  const anyBusy = useCallback(() => runtime.busyStations.size > 0, [runtime]);

  return (
    <>
      <OrthographicCamera
        ref={camRef}
        makeDefault
        position={CAMERA[mode].position}
        zoom={zoom}
        near={0.1}
        far={80}
      />
      <LightRig />
      <Ground />

      <TraditionalRoom
        visible={mode === "traditional"}
        backlog={runtime.backlog}
        isBusy={isBusy}
      />

      <AIRoom
        visible={mode === "ai-driven"}
        isBusy={isBusy}
        anyBusy={anyBusy}
      />

      {items.map((item) => (
        <group
          key={item.id}
          ref={(el) => {
            if (el) itemsRef.current.set(item.id, el);
            else itemsRef.current.delete(item.id);
          }}
        >
          <CardboardBox
            position={[0, 0, 0]}
            sp={item.sp as StoryPoint}
            active
          />
        </group>
      ))}
    </>
  );
}

export { STATION_X };
