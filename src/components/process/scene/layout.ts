import type { StepId } from "@/types/process-scene";

/**
 * Every coordinate and dimension for both rooms. One unit = one metre.
 * Ground footprint 22 x 14.
 *
 * These proportions were settled by sketching the desk and worker in OpenSCAD
 * and orbiting the result, then transcribing the numbers here. The .scad files
 * live in design/ as a record of intent — nothing from them ships.
 */

/** The plinth. Sized to the content, not to an imaginary warehouse. */
export const GROUND = { w: 21.5, d: 10.5 } as const;

export const STEP_ORDER: readonly StepId[] = [
  "intake",
  "analysis",
  "dev",
  "test",
  "deploy",
];

/** Traditional room: five workstations in a row. */
export const STATION_X = [-6.4, -3.2, 0, 3.2, 6.4] as const;
export const STATION_Z = -0.6;

/** Four partition walls, one in each gap between stations. */
export const WALL_X = [-4.8, -1.6, 1.6, 4.8] as const;
/** Tall enough to read as a partition, low enough not to hide the people
 *  it is dividing — the point is that the workers are separated, not absent. */
export const WALL = { w: 0.05, h: 1.35, d: 2.4 } as const;

/** Queue pile-ups sit in the same gaps, in front of the partitions. */
export const QUEUE_Z = 0.75;
export const STACK = { rise: 0.31, base: 0.15, capacity: 8 } as const;
/** Seeded backlog. The bottleneck is visible before the user does anything. */
export const SEED_BACKLOG = [3, 3, 3, 5] as const;

export const GATE = { x: 8.9, doorLift: 1.05 } as const;
export const PALLET_X = 10.6;

export const DESK = { w: 1.6, h: 0.06, d: 0.8, top: 0.72, leg: 0.06 } as const;

/** AI-driven room: a rounded-rectangle conveyor loop. */
export const LOOP = { w: 12.0, d: 6.4, r: 1.6, y: 0.55 } as const;
export const BELT_STEPS_HIGH = 420;
export const BELT_STEPS_LOW = 260;
export const CHECKPOINT_U = [0.18, 0.45, 0.72] as const;

/** Consoles sit outside the loop, facing the orchestration node. */
export const CONSOLE_POS = [
  [-5.4, 0, -3.1],
  [5.4, 0, -3.1],
  [-5.4, 0, 3.1],
  [1.2, 0, 3.6],
] as const;

/** Just outside the belt loop, scaled down so it reads as part of the
 *  model rather than dominating it. */
export const TRUCK = { x: 7.9, z: 0.3, rotY: -0.55, scale: 0.72 } as const;

/** Drop pads. Invisible but raycastable — see ProcessScene. */
export const PAD = { w: 1.8, d: 2.6, y: 0.012 } as const;

/**
 * Elevation ~30 degrees, azimuth ~38 degrees — deliberately NOT true isometric
 * (35.264/45), which reads as rigid game art.
 *
 * `worldWidth`/`worldDepth` are the PROJECTED extents the camera must fit, not
 * the raw footprint: a 22 x 14 floor seen at this angle projects far wider than
 * 22, so fitting to the footprint alone crops the room.
 */
export const CAMERA = {
  traditional: {
    position: [13.5, 9.5, 13.5] as [number, number, number],
    target: [1.9, 0.9, 0] as [number, number, number],
    worldWidth: 21,
    worldHeight: 9.2,
  },
  "ai-driven": {
    position: [11, 12, 11] as [number, number, number],
    target: [0, 0.6, 0] as [number, number, number],
    worldWidth: 25,
    worldHeight: 13.5,
  },
} as const;

export const ZOOM_CLAMP = { min: 22, max: 90 } as const;

/** Box size encodes batch size without a word of explanation. */
export function boxScale(sp: number): number {
  return 0.72 + 0.055 * sp;
}

/** Deterministic jitter. Math.random() in render would re-jitter every frame. */
export function seededJitter(a: number, b: number): number {
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}
