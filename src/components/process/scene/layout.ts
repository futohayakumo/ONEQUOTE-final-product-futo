import type { ProcessMode } from "@/types/process-scene";

/**
 * Every coordinate and dimension for both rooms. One unit = one metre.
 *
 * The two rooms share the span and the camera, not the station count. Five
 * roles with a queue between each pair on one side; four Bolt phases with
 * nothing between them on the other. Everything else — spacing envelope,
 * ground, lighting, angle — is held identical, so the differences that show
 * are the ones being argued about.
 *
 * Proportions were settled by sketching the desk and worker in OpenSCAD and
 * orbiting the result; see design/. Nothing from there ships.
 */

/** Deep enough to hold the seated worker at the AI console, who sits 0.85
 *  BEHIND the desk — and the desk group is rotated, so that is +z. */
export const GROUND = { w: 22.5, d: 6.6 } as const;

/**
 * Where each room's stations stand.
 *
 * The two rooms no longer hold the same number of them, so they cannot share
 * one array. They still share the span: five roles at 3.6m spacing and four
 * Bolt phases at 4.4m cover the same floor, so the camera does not move and
 * the comparison stays a like-for-like read across the same width. Fewer,
 * wider stations is itself the difference being shown.
 */
export const STATION_X: Record<ProcessMode, readonly number[]> = {
  traditional: [-7.2, -3.6, 0, 3.6, 7.2],
  "ai-dlc": [-6.6, -2.2, 2.2, 6.6],
};

export function stationX(mode: ProcessMode, index: number): number {
  const xs = STATION_X[mode];
  return xs[Math.min(Math.max(index, 0), xs.length - 1)];
}

export const STATION_Z = -0.7;

/** Gaps between consecutive stations — where work piles up. */
export const GAP_X = [-5.4, -1.8, 1.8, 5.4] as const;
export const GAP_Z = 1.05;

export const WALL = { w: 0.05, h: 1.35, d: 2.4 } as const;

/** Slightly oversized: the pile is evidence, and it has to read from the
 *  camera distance without a label. */
export const STACK = {
  rise: 0.34,
  base: 0.17,
  capacity: 8,
  scale: 1.0,
} as const;
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
/**
 * Where a person sits in the AI room.
 *
 * There is no single "human console" any more. A console appears at exactly
 * the stations whose agency is AI-ASSISTED, and nowhere else — so the presence
 * or absence of a person reads as the same fact the label above it states. An
 * automated station with somebody sitting at it was contradicting its own
 * caption.
 *
 * Set behind the belt so the line stays unobstructed from the camera, and well
 * clear of the queue cards, which sit in front of it.
 */
export const AI_CONSOLE_Z = -2.0;

/** Where an item rests while a station works on it. */
export function workAnchor(
  mode: ProcessMode,
  index: number,
): [number, number, number] {
  return [stationX(mode, index), 0.95, STATION_Z + 0.62];
}

/** Where an item sits while it waits. Index 0 is the pre-Intake inbox. */
export function waitAnchor(index: number): [number, number, number] {
  const x = index === 0 ? STATION_X.traditional[0] - 2.1 : GAP_X[index - 1];
  return [x, 0.42, GAP_Z];
}

/**
 * Where a completed item ends up. The run needs a visible ending: previously
 * the box simply disappeared in mid-air at the last station.
 */
export function outboundAnchor(mode: ProcessMode): [number, number, number] {
  return mode === "traditional"
    ? [PALLET_X, 0.32, STATION_Z]
    : [TRUCK.x - 1.1, 1.05, TRUCK.z];
}

/** Where an item rides in the AI-DLC room. */
export function beltAnchor(index: number): [number, number, number] {
  return [stationX("ai-dlc", index), BELT.y + 0.22, BELT.z];
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
  "ai-dlc": {
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
