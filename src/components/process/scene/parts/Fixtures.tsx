"use client";

import { Edges } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { G } from "../geometry";
import { EDGE_COLOR, EDGE_THRESHOLD, M } from "../materials";
import { CHECKPOINT_U, LOOP, STACK, seededJitter } from "../layout";

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
      <mesh geometry={G.gatePost} material={M.structure} position={[-0.9, 1.1, 0]} castShadow />
      <mesh geometry={G.gatePost} material={M.structure} position={[0.9, 1.1, 0]} castShadow />
      <mesh geometry={G.gateLintel} material={M.structure} position={[0, 2.2, 0]} castShadow />
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
          <mesh geometry={G.torso} material={M.person} position={[0, 1.05, 0]} castShadow />
          <mesh geometry={G.head} material={M.personHead} position={[0, 1.38, 0]} />
        </group>
      ))}
    </group>
  );
}

export function OutboundPallet({ position }: { position: [number, number, number] }) {
  return (
    <mesh geometry={G.pallet} material={M.secondary} position={position} receiveShadow>
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
        <group key={i} position={s.pos} rotation={[0, s.rot, 0]} scale={0.86}>
          <mesh geometry={G.boxBody} material={M.surface} castShadow receiveShadow />
          <mesh geometry={G.boxSeam} material={M.secondary} position={[0, 0.152, 0]} />
        </group>
      ))}
    </group>
  );
}

/** Builds the conveyor path once. A rounded rectangle at belt height. */
export function buildLoopCurve(): THREE.CurvePath<THREE.Vector3> {
  const { w, d, r, y } = LOOP;
  const hw = w / 2;
  const hd = d / 2;
  const path = new THREE.CurvePath<THREE.Vector3>();
  const v = (x: number, z: number) => new THREE.Vector3(x, y, z);

  path.add(new THREE.LineCurve3(v(-hw + r, -hd), v(hw - r, -hd)));
  path.add(new THREE.QuadraticBezierCurve3(v(hw - r, -hd), v(hw, -hd), v(hw, -hd + r)));
  path.add(new THREE.LineCurve3(v(hw, -hd + r), v(hw, hd - r)));
  path.add(new THREE.QuadraticBezierCurve3(v(hw, hd - r), v(hw, hd), v(hw - r, hd)));
  path.add(new THREE.LineCurve3(v(hw - r, hd), v(-hw + r, hd)));
  path.add(new THREE.QuadraticBezierCurve3(v(-hw + r, hd), v(-hw, hd), v(-hw, hd - r)));
  path.add(new THREE.LineCurve3(v(-hw, hd - r), v(-hw, -hd + r)));
  path.add(new THREE.QuadraticBezierCurve3(v(-hw, -hd + r), v(-hw, -hd), v(-hw + r, -hd)));

  return path;
}

export function ConveyorLoop({
  curve,
  steps,
  drawFraction = 1,
}: {
  curve: THREE.CurvePath<THREE.Vector3>;
  steps: number;
  /** 0..1 — the belt materialises along its own path during the transition. */
  drawFraction?: number;
}) {
  const beltGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.5, -0.03);
    shape.lineTo(0.5, -0.03);
    shape.lineTo(0.5, 0.03);
    shape.lineTo(-0.5, 0.03);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      extrudePath: curve,
      steps,
      bevelEnabled: false,
    });
  }, [curve, steps]);

  const legs = useMemo(() => {
    const out: [number, number, number][] = [];
    const total = curve.getLength();
    const n = Math.max(8, Math.floor(total / 1.2));
    for (let i = 0; i < n; i += 1) {
      const p = curve.getPointAt(i / n);
      out.push([p.x, 0.25, p.z]);
    }
    return out;
  }, [curve]);

  const visibleLegs = Math.floor(legs.length * drawFraction);

  // setDrawRange is near-zero cost and reads as the conveyor being laid down.
  // ExtrudeGeometry is NON-INDEXED, so geometry.index is null and reading
  // index.count yields 0 — which draws nothing at all. Fall back to the
  // position attribute.
  const count = beltGeo.index?.count ?? beltGeo.attributes.position.count;
  beltGeo.setDrawRange(0, Math.floor(count * drawFraction));

  return (
    <group>
      <mesh geometry={beltGeo} material={M.belt} castShadow receiveShadow />
      {legs.slice(0, visibleLegs).map((p, i) => (
        <mesh key={i} geometry={G.beltLeg} material={M.secondary} position={p} />
      ))}
    </group>
  );
}

export function CheckpointGate({
  curve,
  index,
  scanProgress = 0,
}: {
  curve: THREE.CurvePath<THREE.Vector3>;
  index: number;
  /** 0..1 — the scan bar sweeps down as an item passes. */
  scanProgress?: number;
}) {
  const u = CHECKPOINT_U[index];
  const point = useMemo(() => curve.getPointAt(u), [curve, u]);
  const tangent = useMemo(() => curve.getTangentAt(u), [curve, u]);
  const rotY = Math.atan2(tangent.x, tangent.z);

  return (
    <group position={[point.x, 0, point.z]} rotation={[0, rotY, 0]}>
      <mesh geometry={G.cpPost} material={M.structure} position={[-0.65, 0.78, 0]} castShadow />
      <mesh geometry={G.cpPost} material={M.structure} position={[0.65, 0.78, 0]} castShadow />
      <mesh geometry={G.cpLintel} material={M.structure} position={[0, 1.55, 0]} castShadow />
      <mesh
        geometry={G.scanBar}
        material={scanProgress > 0 ? M.success : M.secondary}
        position={[0, 1.45 - scanProgress * 0.83, 0]}
      />
    </group>
  );
}

/**
 * The reference render gives this a blue glow. Emissive and glow are both
 * forbidden, so authority is carried by a hexagonal dais, one crimson ring,
 * and dashed hairline links instead.
 */
export function AIOrchestrationNode({
  scale = 1,
  spinning = true,
}: {
  scale?: number;
  spinning?: boolean;
}) {
  const core = useRef<THREE.Mesh>(null);

  // The rotation never needs to reach React, so it is driven straight onto the
  // object3D here rather than threaded down as a per-frame prop.
  useFrame((_, dt) => {
    if (spinning && core.current) core.current.rotation.y += dt * 0.15;
  });
  const ringMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#E1127A",
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [],
  );

  if (scale <= 0.001) return null;

  return (
    <group scale={scale}>
      <mesh geometry={G.aiDais} material={M.belt} position={[0, 0.09, 0]} castShadow receiveShadow>
        <Edges threshold={EDGE_THRESHOLD} color={EDGE_COLOR} />
      </mesh>
      <mesh
        geometry={G.aiRing}
        material={ringMat}
        position={[0, 0.19, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <mesh
        ref={core}
        geometry={G.aiCore}
        material={M.structure}
        position={[0, 0.95, 0]}
        castShadow
      >
        <Edges threshold={1} color={EDGE_COLOR} />
      </mesh>
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
      <mesh geometry={G.truckBody} material={M.surface} position={[0, 1.35, 0]} castShadow>
        <Hairline />
      </mesh>
      <mesh geometry={G.truckCab} material={M.structure} position={[2.65, 1.25, 0]} castShadow>
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
        <mesh geometry={G.gateDoor} material={M.surface} scale={[0.03, 0.72, 1.0]}>
          <Hairline />
        </mesh>
      </group>
    </group>
  );
}
