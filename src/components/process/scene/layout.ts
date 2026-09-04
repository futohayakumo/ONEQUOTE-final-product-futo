import type { ProcessMode, StepId } from "@/types/process-scene";

/**
 * Every coordinate and dimension for both rooms. One unit = one metre.
 *
 * Both rooms use the SAME five station positions on purpose. The comparison
 * only lands if the layouts are otherwise identical: same five steps, same
 * spacing, same camera — so the only visible differences are the ones that
 * matter (partition walls and queue piles on one side, a moving belt and AI
 * gantries on the other).
 *
 * Proportions were settled by sketching the desk and worker in OpenSCAD and
 * orbiting the result; see design/. Nothing from there ships.
 */

export const GROUND = { w: 22.5, d: 5.6 } as const;

export const STEP_ORDER: readonly StepId[] = [
  "intake",
  "analysis",
  "dev",
  "test",
  "deploy",
];

export const STATION_X = [-7.2, -3.6, 0, 3.6, 7.2] as const;
export const STATION_Z = -0.7;

/** Gaps between consecutive stations — where work piles up. */
export const GAP_X = [-5.4, -1.8, 1.8, 5.4] as const;
export const GAP_Z = 1.05;

export const WALL = { w: 0.05, h: 1.35, d: 2.4 } as const;

/** Slightly oversized: the pile is evidence, and it has to read from the
 *  camera distance without a label. */
export const STACK = { rise: 0.34, base: 0.17, capacity: 8, scale: 1.0 } as const;
/** Seeded backlog: the bottleneck is visible before the user touches anything. */
export const SEED_BACKLOG = [3, 3, 3, 5] as const;

export const GATE = { x: 9.6 } as const;
export const PALLET_X = 11.2;

export const DESK = { w: 1.6, h: 0.06, d: 0.8, top: 0.72, leg: 0.06 } as const;

/** AI-driven room: a straight conveyor running through the same five slots. */
export const BELT = {
  x0: -9.4,
  x1: 10.2,
  y: 0.55,
  width: 1.0,
  z: 0.15,
} as const;

export const TRUCK = { x: 11.3, z: 0.35, rotY: -1.15, scale: 0.6 } as const;
/** The single human console in the AI room, set back from the line. */
export const AI_CONSOLE = { x: 0, z: 3.0 } as const;

/** Where an item rests while a station works on it. */
export function workAnchor(index: number): [number, number, number] {
  return [STATION_X[index], 0.95, STATION_Z + 0.62];
}

/** Where an item sits while it waits. Index 0 is the pre-Intake inbox. */
export function waitAnchor(index: number): [number, number, number] {
  const x = index === 0 ? STATION_X[0] - 2.1 : GAP_X[index - 1];
  return [x, 0.42, GAP_Z];
}

/** Where an item rides in the AI room. */
export function beltAnchor(index: number): [number, number, number] {
  return [STATION_X[index], BELT.y + 0.22, BELT.z];
}

/**
 * A shallow azimuth, not a true isometric one.
 *
 * At 38 degrees the five stations climbed the screen diagonally, so the DOM
 * labels anchored to them collided with each other and buried the model. Near
 * head-on, the row projects to an almost horizontal line: the labels sit in a
 * clean band, and comparing station to station becomes a left-to-right read
 * rather than a diagonal one. Legibility is the whole point of this screen, so
 * it wins over the prettier angle.
 */
export const CAMERA: Record<
  ProcessMode,
  {
    position: [number, number, number];
    target: [number, number, number];
    worldWidth: number;
    worldHeight: number;
  }
> = {
  traditional: {
    position: [4.4, 8.4, 17.4],
    target: [1.6, 1.15, 0],
    worldWidth: 22,
    worldHeight: 8.4,
  },
  "ai-driven": {
    position: [4.4, 8.4, 17.4],
    target: [1.6, 1.15, 0],
    worldWidth: 22,
    worldHeight: 8.4,
  },
};

export const ZOOM_CLAMP = { min: 22, max: 90 } as const;

/** Box size encodes batch size without a word of explanation. */
export function boxScale(sp: number): number {
  return 0.72 + 0.055 * sp;
}

/** Deterministic jitter. Math.random() in render re-jitters every frame. */
export function seededJitter(a: number, b: number): number {
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}
