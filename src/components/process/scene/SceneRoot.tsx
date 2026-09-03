"use client";

import { OrthographicCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { easing } from "maath";
import type { ProcessMode, StepId, StoryPoint } from "@/types/process-scene";
import { STEP_IDS } from "../model/processModel";
import {
  BELT_STEPS_HIGH,
  BELT_STEPS_LOW,
  CAMERA,
  STATION_X,
  STATION_Z,
  ZOOM_CLAMP,
} from "./layout";
import { buildLoopCurve } from "./parts/Fixtures";
import { AIRoom, TraditionalRoom, useWorkerPhase } from "./parts/Rooms";
import { CardboardBox } from "./parts/Primitives";
import { Ground, LightRig } from "./rig/LightRig";
import type { WorkItem, WorkItemRuntime } from "./useWorkItems";

// Module-scope scratch. Zero allocation inside useFrame.
const scratchTarget = new THREE.Vector3();
const scratchPos = new THREE.Vector3();
const scratchFrom = new THREE.Vector3();
const scratchTo = new THREE.Vector3();

function stationAnchor(step: StepId, out: THREE.Vector3) {
  const i = Math.max(0, STEP_IDS.indexOf(step));
  return out.set(STATION_X[i], 0.95, STATION_Z + 0.55);
}

function queueAnchor(step: StepId, out: THREE.Vector3) {
  const i = Math.max(0, STEP_IDS.indexOf(step));
  const x = i === 0 ? STATION_X[0] - 1.6 : (STATION_X[i - 1] + STATION_X[i]) / 2;
  return out.set(x, 0.6, 0.75);
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function SceneRoot({
  runtime,
  items,
  mode,
  reduced,
  quality,
  hoveredStep,
  onModeSettled,
  onReady,
}: {
  runtime: WorkItemRuntime;
  /** Owned by ProcessScene as React state. Changes only on add/remove. */
  items: WorkItem[];
  mode: ProcessMode;
  reduced: boolean;
  quality: "high" | "low";
  hoveredStep: StepId | null;
  onModeSettled?: (m: ProcessMode) => void;
  onReady?: () => void;
}) {
  const camRef = useRef<THREE.OrthographicCamera>(null);
  const itemsRef = useRef<Map<string, THREE.Group>>(new Map());
  const pointer = useRef({ x: 0, y: 0 });
  const settled = useRef<ProcessMode | null>(null);
  const { size, invalidate } = useThree();

  const curve = useMemo(() => buildLoopCurve(), []);
  const beltSteps = quality === "low" ? BELT_STEPS_LOW : BELT_STEPS_HIGH;
  const workerPhase = useWorkerPhase(!reduced);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    runtime.setMode(mode);
    settled.current = null;
    invalidate();
  }, [mode, runtime, invalidate]);

  // Ortho zoom is resolution-dependent. Fit BOTH axes and take the tighter of
  // the two, or a wide canvas crops the room vertically and a tall one crops it
  // horizontally.
  const zoom = useMemo(() => {
    const cfg = CAMERA[mode];
    const byWidth = size.width / cfg.worldWidth;
    const byHeight = size.height / cfg.worldHeight;
    const raw = Math.min(byWidth, byHeight);
    return Math.min(ZOOM_CLAMP.max, Math.max(ZOOM_CLAMP.min, raw));
  }, [size.width, size.height, mode]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, dt) => {
    const cam = camRef.current;
    const now = performance.now();

    if (cam) {
      const base = CAMERA[mode].position;
      // Damped parallax, not OrbitControls. Free orbit would destroy the
      // composition and void the "<10% crimson" guarantee.
      const ax = reduced ? 0 : pointer.current.x * 0.18;
      const ay = reduced ? 0 : -pointer.current.y * 0.06;
      const radius = Math.hypot(base[0], base[2]);
      const theta = Math.atan2(base[0], base[2]) + ax;

      const t0 = CAMERA[mode].target;
      scratchPos.set(
        t0[0] + Math.sin(theta) * radius,
        base[1] * (1 + ay),
        t0[2] + Math.cos(theta) * radius,
      );
      easing.damp3(cam.position, scratchPos, reduced ? 0 : 0.35, dt);
      easing.damp(cam, "zoom", zoom, reduced ? 0 : 0.3, dt);
      cam.updateProjectionMatrix();

      const t = CAMERA[mode].target;
      cam.lookAt(scratchTarget.set(t[0], t[1], t[2]));

      if (settled.current !== mode) {
        settled.current = mode;
        onModeSettled?.(mode);
      }
    }

    // Move every in-flight item. Direct mutation of object3D transforms —
    // never setState in here.
    for (const item of runtime.items) {
      const group = itemsRef.current.get(item.id);
      if (!group) continue;
      const { seg, local } = runtime.locate(item, now);

      if (item.mode === "ai-driven") {
        // A single continuous parametric sweep. The motion vocabulary itself
        // is the message: no stops, no hand-offs, no dead time.
        const u = Math.min(0.999, runtime.locate(item, now).overall);
        const p = curve.getPointAt(u);
        group.position.set(p.x, p.y + 0.24, p.z);
        const tan = curve.getTangentAt(u);
        group.rotation.y = Math.atan2(tan.x, tan.z);
      } else if (seg.kind === "wait") {
        // Parked in the queue. It sits, and the pile beside it grows.
        queueAnchor(seg.stepId, scratchTo);
        group.position.copy(scratchTo);
        group.rotation.y = 0.08;
      } else {
        // A hand-off: eased lerp plus a parabolic hop, so it reads as an
        // intentional pass rather than a slide.
        queueAnchor(seg.stepId, scratchFrom);
        stationAnchor(seg.stepId, scratchTo);
        const e = easeInOutCubic(local);
        group.position.lerpVectors(scratchFrom, scratchTo, e);
        group.position.y += 0.55 * 4 * e * (1 - e);
        group.rotation.y = e * 0.4;
      }
    }

    if (runtime.items.length > 0) invalidate();
    void state;
  });

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
        hoveredStep={hoveredStep}
        workerPhase={workerPhase.current}
      />

      <AIRoom
        visible={mode === "ai-driven"}
        curve={curve}
        beltSteps={beltSteps}
        spinning={!reduced}
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
