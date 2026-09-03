"use client";

import { Edges } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import type { StoryPoint } from "@/types/process-scene";
import { G, screenTexture, spLabelTexture } from "../geometry";
import { EDGE_COLOR, EDGE_THRESHOLD, M } from "../materials";
import { DESK, WALL, boxScale } from "../layout";

/**
 * The 1px hairline outline. drei's <Edges> draws LineSegments along hard
 * geometric edges — literally the design system's "1px solid #CBD5E1" rule
 * applied in three dimensions. WebGL cannot draw linewidth > 1, which here is
 * exactly what the spec asks for.
 *
 * Known limitation: <Edges> reads a single mesh's geometry and does NOT work
 * on <Instances>. Hero objects get real edges; instanced background boxes rely
 * on silhouette against #F8FAFC plus their slate seam.
 */
function Hairline() {
  return <Edges threshold={EDGE_THRESHOLD} color={EDGE_COLOR} />;
}

export function Desk({
  position,
  rotationY = 0,
}: {
  position: [number, number, number];
  rotationY?: number;
}) {
  const half = { x: DESK.w / 2 - 0.09, z: DESK.d / 2 - 0.09 };
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh
        geometry={G.deskTop}
        material={M.surface}
        position={[0, DESK.top, 0]}
        castShadow
        receiveShadow
      >
        <Hairline />
      </mesh>
      {[
        [-half.x, -half.z],
        [half.x, -half.z],
        [-half.x, half.z],
        [half.x, half.z],
      ].map(([x, z], i) => (
        <mesh
          key={i}
          geometry={G.deskLeg}
          material={M.structure}
          position={[x, DESK.top / 2, z]}
          castShadow
        />
      ))}
    </group>
  );
}

export function Monitor({
  position,
  rotationY = 0,
  kind = "code",
}: {
  position: [number, number, number];
  rotationY?: number;
  kind?: string;
}) {
  const screenMat = useMemo(() => {
    const map = screenTexture(kind);
    return new THREE.MeshBasicMaterial({ map: map ?? undefined, toneMapped: false });
  }, [kind]);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={G.monBase} material={M.structure} position={[0, 0.01, 0]} />
      <mesh geometry={G.monStem} material={M.structure} position={[0, 0.12, 0]} />
      <group position={[0, 0.4, 0]} rotation={[-0.14, 0, 0]}>
        <mesh geometry={G.monPanel} material={M.structure} castShadow>
          <Hairline />
        </mesh>
        <mesh geometry={G.plane} material={screenMat} position={[0, 0, 0.017]} scale={[0.52, 0.3, 1]} />
      </group>
    </group>
  );
}

export function Chair({
  position,
  rotationY = 0,
}: {
  position: [number, number, number];
  rotationY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={G.chairFoot} material={M.secondary} position={[0, 0.02, 0]} />
      <mesh geometry={G.chairCol} material={M.secondary} position={[0, 0.24, 0]} />
      <mesh geometry={G.chairSeat} material={M.secondary} position={[0, 0.45, 0]} castShadow />
      <mesh
        geometry={G.chairBack}
        material={M.secondary}
        position={[0, 0.72, -0.19]}
        castShadow
      />
    </group>
  );
}

export function Worker({
  position,
  rotationY = 0,
  armPhase = 0,
}: {
  position: [number, number, number];
  rotationY?: number;
  /** 0..1. Drives the elbow hinge, which is the whole point of not using STL. */
  armPhase?: number;
}) {
  const lift = Math.sin(armPhase * Math.PI * 2) * 0.16;
  const lift2 = Math.sin(armPhase * Math.PI * 2 + 1.1) * 0.16;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={G.torso} material={M.person} position={[0, 0.95, 0]} castShadow>
        <Hairline />
      </mesh>
      <mesh geometry={G.head} material={M.personHead} position={[0, 1.28, 0]} castShadow />

      {/* Shoulder pivots. The nesting IS the hinge — no origin hunting. */}
      <group position={[-0.2, 1.1, 0]} rotation={[-0.5 + lift, 0, 0]}>
        <mesh geometry={G.upperArm} material={M.person} position={[0, 0, 0.13]} />
        <group position={[0, 0, 0.26]} rotation={[-0.5 - lift, 0, 0]}>
          <mesh geometry={G.foreArm} material={M.person} position={[0, 0, 0.12]} />
        </group>
      </group>

      <group position={[0.2, 1.1, 0]} rotation={[-0.5 + lift2, 0, 0]}>
        <mesh geometry={G.upperArm} material={M.person} position={[0, 0, 0.13]} />
        <group position={[0, 0, 0.26]} rotation={[-0.5 - lift2, 0, 0]}>
          <mesh geometry={G.foreArm} material={M.person} position={[0, 0, 0.12]} />
        </group>
      </group>
    </group>
  );
}

/**
 * The reference render uses tan cardboard. Tan is not in the palette, so a box
 * is a WHITE body with a #CBD5E1 hairline and a #64748B lid seam. Its
 * "cardboard-ness" is carried by the seam and the label, not by hue.
 */
export function CardboardBox({
  position,
  rotationY = 0,
  sp,
  active = false,
  scale = 1,
}: {
  position: [number, number, number];
  rotationY?: number;
  sp?: StoryPoint;
  active?: boolean;
  scale?: number;
}) {
  const s = sp !== undefined ? boxScale(sp) * scale : scale;
  const label = useMemo(() => (sp !== undefined ? spLabelTexture(sp) : null), [sp]);

  const labelMat = useMemo(() => {
    if (!label) return null;
    return new THREE.MeshBasicMaterial({
      map: label,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      toneMapped: false,
    });
  }, [label]);

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={s}>
      <mesh
        geometry={G.boxBody}
        material={active ? M.accent : M.surface}
        castShadow
        receiveShadow
      >
        <Hairline />
      </mesh>
      <mesh geometry={G.boxSeam} material={M.secondary} position={[0, 0.152, 0]} />
      {labelMat ? (
        <>
          <mesh geometry={G.labelQuad} material={labelMat} position={[0, 0, 0.181]} />
          <mesh
            geometry={G.labelQuad}
            material={labelMat}
            position={[0.181, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
          />
        </>
      ) : null}
    </group>
  );
}

export function PartitionWall({
  position,
  collapse = 0,
}: {
  position: [number, number, number];
  /** 0 = standing, 1 = flat. Anchored at the base. */
  collapse?: number;
}) {
  const h = 1 - collapse;
  if (h <= 0.001) return null;
  return (
    <mesh
      geometry={G.wall}
      material={M.surface}
      position={[position[0], (WALL.h / 2) * h, position[2]]}
      scale={[1, h, 1]}
      castShadow
      receiveShadow
    >
      <Hairline />
    </mesh>
  );
}
