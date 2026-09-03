"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { StepId } from "@/types/process-scene";
import { STEP_IDS } from "../../model/processModel";
import {
  CONSOLE_POS,
  GATE,
  PAD,
  PALLET_X,
  QUEUE_Z,
  STATION_X,
  STATION_Z,
  TRUCK,
  WALL_X,
} from "../layout";
import { G } from "../geometry";
import { M } from "../materials";
import { Chair, Desk, Monitor, PartitionWall, Worker } from "./Primitives";
import {
  AIOrchestrationNode,
  BoxStack,
  CheckpointGate,
  ContainerTruck,
  ConveyorLoop,
  OutboundPallet,
  SecurityGate,
} from "./Fixtures";

const SCREEN_KIND: Record<StepId, string> = {
  intake: "intake",
  analysis: "chart",
  dev: "code",
  test: "check",
  deploy: "cloud",
};

/** Invisible but raycastable. A ray skips `visible={false}`, so opacity 0 it is. */
export function DropPad({
  step,
  index,
  hovered,
}: {
  step: StepId;
  index: number;
  hovered: boolean;
}) {
  return (
    <mesh
      name={`droppad:${step}`}
      geometry={G.plane}
      material={hovered ? M.padHover : M.pad}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[STATION_X[index], PAD.y, STATION_Z + 1.0]}
      scale={[PAD.w, PAD.d, 1]}
    />
  );
}

export function TraditionalRoom({
  backlog,
  hoveredStep,
  workerPhase,
  visible,
}: {
  backlog: number[];
  hoveredStep: StepId | null;
  workerPhase: number;
  visible: boolean;
}) {
  return (
    <group visible={visible}>
      {STEP_IDS.map((step, i) => (
        <group key={step}>
          <Desk position={[STATION_X[i], 0, STATION_Z]} />
          <Monitor position={[STATION_X[i], 0.78, STATION_Z - 0.15]} kind={SCREEN_KIND[step]} />
          <Chair position={[STATION_X[i], 0, STATION_Z - 0.85]} />
          <Worker
            position={[STATION_X[i], 0, STATION_Z - 0.85]}
            armPhase={workerPhase + i * 0.17}
          />
          <DropPad step={step} index={i} hovered={hoveredStep === step} />
        </group>
      ))}

      {/* High partition walls. The room is divided before anything moves. */}
      {WALL_X.map((x, i) => (
        <PartitionWall key={i} position={[x, 0, STATION_Z]} />
      ))}

      {/* The pile-ups, seeded so the bottleneck is visible at rest. */}
      {WALL_X.map((x, i) => (
        <BoxStack key={i} origin={[x, 0, QUEUE_Z]} count={backlog[i] ?? 0} gapIndex={i} />
      ))}

      <SecurityGate position={[GATE.x, 0, STATION_Z]} approvers={2} />
      <OutboundPallet position={[PALLET_X, 0.05, STATION_Z]} />
    </group>
  );
}

export function AIRoom({
  curve,
  beltSteps,
  spinning,
  visible,
}: {
  curve: THREE.CurvePath<THREE.Vector3>;
  beltSteps: number;
  spinning: boolean;
  visible: boolean;
}) {
  const linkGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (const p of CONSOLE_POS) {
      pts.push(new THREE.Vector3(0, 0.6, 0), new THREE.Vector3(p[0], 0.6, p[2]));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  const linkMat = useMemo(
    () => new THREE.LineDashedMaterial({ color: "#CBD5E1", dashSize: 0.28, gapSize: 0.2 }),
    [],
  );

  const links = useMemo(() => {
    const seg = new THREE.LineSegments(linkGeo, linkMat);
    seg.computeLineDistances();
    return seg;
  }, [linkGeo, linkMat]);

  return (
    <group visible={visible}>
      <ConveyorLoop curve={curve} steps={beltSteps} />
      {[0, 1, 2].map((i) => (
        <CheckpointGate key={i} curve={curve} index={i} />
      ))}

      <AIOrchestrationNode spinning={spinning} />
      <primitive object={links} />

      {CONSOLE_POS.map((p, i) => {
        const facing = Math.atan2(-p[0], -p[2]);
        return (
          <group key={i} position={[p[0], 0, p[2]]} rotation={[0, facing, 0]}>
            <Desk position={[0, 0, 0]} />
            <Monitor position={[0, 0.78, -0.15]} kind="cloud" />
            <Chair position={[0, 0, -0.85]} />
            <Worker position={[0, 0, -0.85]} armPhase={i * 0.31} />
          </group>
        );
      })}

      <ContainerTruck
        position={[TRUCK.x, 0, TRUCK.z]}
        rotationY={TRUCK.rotY}
        scale={TRUCK.scale}
      />

      {/* One floor-sized pad. The claim is that there is nothing to aim at. */}
      <mesh
        name="droppad:intake"
        geometry={G.plane}
        material={M.pad}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        scale={[20, 12, 1]}
      />
    </group>
  );
}

/** Drives the worker arm hinge without ever touching React state. */
export function useWorkerPhase(enabled: boolean) {
  const ref = useRef(0);
  useFrame((_, dt) => {
    if (enabled) ref.current = (ref.current + dt * 0.55) % 1;
  });
  return ref;
}
