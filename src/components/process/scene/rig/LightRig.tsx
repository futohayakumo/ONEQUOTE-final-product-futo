"use client";

import { Edges } from "@react-three/drei";
import { GROUND } from "../layout";
import { EDGE_COLOR, EDGE_THRESHOLD, M } from "../materials";
import { G } from "../geometry";

/**
 * One studio lamp plus fill. No point lights, no spots, no coloured rim, no
 * environment map — the look is a matte architectural maquette, not a product
 * render.
 *
 * The shadow camera is independent of the view camera; left at its default
 * frustum, shadows clip at the ends of the workstation row. It is fitted to
 * the scene footprint instead.
 */
export function LightRig() {
  return (
    <>
      <hemisphereLight args={["#FFFFFF", "#CBD5E1", 0.75]} />
      <ambientLight intensity={0.45} color="#FFFFFF" />
      <directionalLight
        position={[6, 10, 6]}
        intensity={1.6}
        color="#FFFFFF"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />
      {/* Fill. No shadow — a second shadow would break the single-lamp read. */}
      <directionalLight
        position={[-8, 5, -4]}
        intensity={0.3}
        color="#FFFFFF"
      />
    </>
  );
}

export function Ground() {
  return (
    <mesh
      geometry={G.plane}
      material={M.ground}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[GROUND.w, GROUND.d, 1]}
      receiveShadow
    >
      {/* The plinth edge. Without it the off-white floor vanishes into the
          white panel behind the canvas. */}
      <Edges threshold={EDGE_THRESHOLD} color={EDGE_COLOR} />
    </mesh>
  );
}
