"use client";

import type { StepId } from "@/types/process-scene";
import { STEP_IDS } from "../../model/processModel";
import {
  AI_CONSOLE_Z,
  BELT,
  GAP_X,
  GAP_Z,
  GATE,
  PALLET_X,
  STATION_X,
  STATION_Z,
  TRUCK,
} from "../layout";
import { STATIONS } from "../stations";
import { Chair, Desk, Monitor, PartitionWall, Worker } from "./Primitives";
import {
  AIGantry,
  BoxStack,
  ContainerTruck,
  OutboundPallet,
  SecurityGate,
  StraightConveyor,
} from "./Fixtures";

const SCREEN_KIND: Record<StepId, string> = {
  po: "po",
  design: "chart",
  dev: "code",
  qa: "check",
  review: "cloud",
};

/**
 * Both rooms occupy the SAME five slots. Everything that differs between them
 * is therefore a real difference in how the work moves, not a difference in
 * how it was drawn.
 */

export function TraditionalRoom({
  backlog,
  isBusy,
  visible,
}: {
  backlog: number[];
  /** Read per frame, so an item arriving never triggers a React render. */
  isBusy: (step: StepId) => boolean;
  visible: boolean;
}) {
  return (
    <group visible={visible}>
      {STEP_IDS.map((step, i) => (
        <group key={step}>
          <Desk position={[STATION_X[i], 0, STATION_Z]} />
          <Monitor
            position={[STATION_X[i], 0.78, STATION_Z - 0.15]}
            kind={SCREEN_KIND[step]}
          />
          <Chair position={[STATION_X[i], 0, STATION_Z - 0.85]} />
          <Worker
            position={[STATION_X[i], 0, STATION_Z - 0.85]}
            seed={i * 0.9}
            isBusy={() => isBusy(step)}
          />
        </group>
      ))}

      {/* High partition walls: the room is divided before anything moves. */}
      {GAP_X.map((x, i) => (
        <PartitionWall key={i} position={[x, 0, STATION_Z]} />
      ))}

      {/* The pile-ups. Seeded, so the bottleneck is visible at rest. */}
      {GAP_X.map((x, i) => (
        <BoxStack
          key={i}
          origin={[x, 0, GAP_Z]}
          count={backlog[i] ?? 0}
          gapIndex={i}
        />
      ))}

      <SecurityGate position={[GATE.x, 0, STATION_Z]} approvers={2} />
      <OutboundPallet position={[PALLET_X, 0.05, STATION_Z]} />
    </group>
  );
}

export function AIRoom({
  isBusy,
  visible,
}: {
  isBusy: (step: StepId) => boolean;
  visible: boolean;
}) {
  return (
    <group visible={visible}>
      <StraightConveyor />

      {/* One gantry per station. A human-only step renders none at all, so the
          gaps in the row are themselves information. */}
      {STEP_IDS.map((step, i) => (
        <AIGantry
          key={step}
          x={STATION_X[i]}
          z={BELT.z}
          isActive={() => isBusy(step)}
          agency={STATIONS[step].agency["ai-driven"]}
        />
      ))}

      {/*
        A person at the AI-ASSISTED stations, and only there.

        Derived from the same agency data the labels are, so the two can never
        disagree: where the caption says AI automation the seat is empty, and
        where it says AI-assisted somebody is sitting at it. A single console
        parked at the far left was contradicting every caption above it.

        The people did not vanish — they moved to the two steps that still need
        a decision.
      */}
      {STEP_IDS.map((step, i) =>
        STATIONS[step].agency["ai-driven"] === "assisted" ? (
          <group
            key={`console-${step}`}
            position={[STATION_X[i], 0, AI_CONSOLE_Z]}
          >
            <Desk position={[0, 0, 0]} />
            {/* Monitor pushed to one side of the desk. Centred, it sat directly
                between the camera and the person, so the one thing this
                console exists to show — that somebody is still here — was
                hidden behind a screen. */}
            <Monitor position={[-0.46, 0.78, -0.12]} kind="chart" />
            <Chair position={[0.2, 0, -0.85]} />
            <Worker
              position={[0.2, 0, -0.85]}
              seed={i * 1.3}
              isBusy={() => isBusy(step)}
            />
          </group>
        ) : null,
      )}

      <ContainerTruck
        position={[TRUCK.x, 0, TRUCK.z]}
        rotationY={TRUCK.rotY}
        scale={TRUCK.scale}
      />
    </group>
  );
}
