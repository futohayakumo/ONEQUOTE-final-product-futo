"use client";

import { Edges } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { G } from "../geometry";
import { EDGE_COLOR, EDGE_THRESHOLD, M } from "../materials";
import { BELT, STACK, seededJitter } from "../layout";

function Hairline() {
  return <Edges threshold={EDGE_THRESHOLD} color={EDGE_COLOR} />;
}

/** The PR / approval gate. The bottleneck, made physical. */
export function SecurityGate({
  position,
  doorLift = 0,
  approvers = 0,
}: {
  position: [number, number, number];
  doorLift?: number;
  approvers?: number;
}) {
  return (
    <group position={position}>
      <mesh
        geometry={G.gatePost}
        material={M.structure}
        position={[-0.9, 1.1, 0]}
        castShadow
      />
      <mesh
        geometry={G.gatePost}
        material={M.structure}
        position={[0.9, 1.1, 0]}
        castShadow
      />
      <mesh
        geometry={G.gateLintel}
        material={M.structure}
        position={[0, 2.2, 0]}
        castShadow
      />
      <mesh
        geometry={G.gateDoor}
        material={M.surface}
        position={[0, 1.0 + doorLift * 1.05, 0]}
        castShadow
      >
        <Hairline />
      </mesh>

      {/* Two approvals are required, so two people have to actually turn up. */}
      {Array.from({ length: approvers }).map((_, i) => (
        <group key={i} position={[1.9 + i * 0.75, 0, -0.5 + i * 1.0]}>
          <mesh
            geometry={G.torso}
            material={M.person}
            position={[0, 1.05, 0]}
            castShadow
          />
          <mesh
            geometry={G.head}
            material={M.personHead}
            position={[0, 1.38, 0]}
          />
        </group>
      ))}
    </group>
  );
}

export function OutboundPallet({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <mesh
      geometry={G.pallet}
      material={M.secondary}
      position={position}
      receiveShadow
    >
      <Hairline />
    </mesh>
  );
}

/**
 * A queue pile. Slot jitter is seeded on (gap, slot) rather than random, or it
 * would re-jitter on every single frame.
 */
export function BoxStack({
  origin,
  count,
  gapIndex,
}: {
  origin: [number, number, number];
  count: number;
  gapIndex: number;
}) {
  const slots = useMemo(() => {
    const out: { pos: [number, number, number]; rot: number }[] = [];
    for (let i = 0; i < Math.min(count, STACK.capacity * 2); i += 1) {
      const column = Math.floor(i / STACK.capacity);
      const row = i % STACK.capacity;
      out.push({
        pos: [
          origin[0] + column * 0.42 + seededJitter(gapIndex, i) * 0.04,
          STACK.base + row * STACK.rise,
          origin[2] + seededJitter(gapIndex + 7, i) * 0.04,
        ],
        rot: seededJitter(gapIndex + 13, i) * 0.07,
      });
    }
    return out;
  }, [count, gapIndex, origin]);

  return (
    <group>
      {slots.map((s, i) => (
        <group
          key={i}
          position={s.pos}
          rotation={[0, s.rot, 0]}
          scale={STACK.scale}
        >
          <mesh
            geometry={G.boxBody}
            material={M.surface}
            castShadow
            receiveShadow
          />
          <mesh
            geometry={G.boxSeam}
            material={M.secondary}
            position={[0, 0.152, 0]}
          />
        </group>
      ))}
    </group>
  );
}

/**
 * A straight conveyor running through the same five station slots the
 * traditional room uses. It replaced a rounded-rectangle loop: a loop looked
 * decorative and made the five steps impossible to line up against the other
 * room, which is the only comparison this screen exists to make.
 */
export function StraightConveyor({
  drawFraction = 1,
}: {
  drawFraction?: number;
}) {
  const length = BELT.x1 - BELT.x0;
  const legs = useMemo(() => {
    const out: number[] = [];
    const n = Math.max(4, Math.round(length / 1.3));
    for (let i = 0; i <= n; i += 1) out.push(BELT.x0 + (length * i) / n);
    return out;
  }, [length]);

  const shown = Math.max(0.001, drawFraction);
  const visibleLegs = Math.floor(legs.length * shown);

  return (
    <group>
      <mesh
        geometry={G.unitBox}
        material={M.belt}
        position={[BELT.x0 + (length * shown) / 2, BELT.y, BELT.z]}
        scale={[length * shown, 0.08, BELT.width]}
        castShadow
        receiveShadow
      >
        <Hairline />
      </mesh>
      {/* Side rails, so the belt reads as a machine rather than a road. */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          geometry={G.unitBox}
          material={M.secondary}
          position={[
            BELT.x0 + (length * shown) / 2,
            BELT.y + 0.07,
            BELT.z + side * (BELT.width / 2 + 0.02),
          ]}
          scale={[length * shown, 0.06, 0.05]}
        />
      ))}
      {legs.slice(0, visibleLegs).map((x, i) => (
        <mesh
          key={i}
          geometry={G.beltLeg}
          material={M.secondary}
          position={[x, 0.25, BELT.z]}
        />
      ))}
    </group>
  );
}

/**
 * The AI unit that stands over a station in the AI-driven room. It is the
 * visible answer to "where does AI actually touch this?" — a gantry with a
 * scan bar that flashes as an item passes underneath, and no queue in front
 * of it.
 */
export function AIGantry({
  x,
  z,
  isActive,
  agency,
}: {
  x: number;
  z: number;
  isActive: () => boolean;
  agency: "human" | "assisted" | "automated";
}) {
  const bar = useRef<THREE.Mesh>(null);
  const sweep = useRef(0);

  useFrame((_, dt) => {
    if (!bar.current) return;
    sweep.current = isActive()
      ? Math.min(1, sweep.current + dt * 5)
      : Math.max(0, sweep.current - dt * 4);
    bar.current.position.y = 1.5 - sweep.current * 0.78;
    bar.current.visible = sweep.current > 0.02;
  });

  // A human-only step gets no gantry at all — the absence is the information.
  if (agency === "human") return null;

  return (
    <group position={[x, 0, z]}>
      <mesh
        geometry={G.cpPost}
        material={M.structure}
        position={[-0.72, 0.8, 0]}
        castShadow
      />
      <mesh
        geometry={G.cpPost}
        material={M.structure}
        position={[0.72, 0.8, 0]}
        castShadow
      />
      <mesh
        geometry={G.cpLintel}
        material={M.structure}
        position={[0, 1.6, 0]}
        castShadow
      >
        <Hairline />
      </mesh>
      {/* Automated stations carry a solid head; assisted ones a hollow one, so
          the two levels of AI involvement are distinguishable in the model. */}
      <mesh
        geometry={G.aiHead}
        material={agency === "automated" ? M.accent : M.surface}
        position={[0, 1.42, 0]}
        castShadow
      >
        <Edges
          threshold={1}
          color={agency === "automated" ? "#E1127A" : EDGE_COLOR}
        />
      </mesh>
      <mesh
        ref={bar}
        geometry={G.scanBar}
        material={M.accent}
        position={[0, 1.5, 0]}
      />
    </group>
  );
}

export function ContainerTruck({
  position,
  rotationY = 0,
  doorOpen = 0,
  scale = 1,
}: {
  position: [number, number, number];
  rotationY?: number;
  doorOpen?: number;
  scale?: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh
        geometry={G.truckBody}
        material={M.surface}
        position={[0, 1.35, 0]}
        castShadow
      >
        <Hairline />
      </mesh>
      <mesh
        geometry={G.truckCab}
        material={M.structure}
        position={[2.65, 1.25, 0]}
        castShadow
      >
        <Hairline />
      </mesh>
      {[-1.4, 0, 1.4, 2.6].map((x) =>
        [-0.62, 0.62].map((z) => (
          <mesh
            key={`${x}:${z}`}
            geometry={G.wheel}
            material={M.structure}
            position={[x, 0.32, z]}
            rotation={[0, 0, Math.PI / 2]}
          />
        )),
      )}
      <group position={[-2.0, 1.35, 0]} rotation={[0, doorOpen * 1.9, 0]}>
        <mesh
          geometry={G.gateDoor}
          material={M.surface}
          scale={[0.03, 0.72, 1.0]}
        >
          <Hairline />
        </mesh>
      </group>
    </group>
  );
}
