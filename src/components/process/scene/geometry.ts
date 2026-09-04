import * as THREE from "three";
import type { StoryPoint } from "@/types/process-scene";
import { WALL } from "./layout";

/**
 * Module-scope geometry singletons, created once and shared by reference.
 * Never build geometry inside a component body or useFrame.
 *
 * All of it is primitives: a desk is a slab plus legs, a person is a capsule
 * and an icosahedron, a box is a cube with a seam. That is not a compromise —
 * it is precisely what the flat, hard-edged design system asks for, and it is
 * what makes every part independently animatable.
 */
export const G = {
  deskTop: new THREE.BoxGeometry(1.6, 0.06, 0.8),
  deskLeg: new THREE.BoxGeometry(0.06, 0.72, 0.06),

  monPanel: new THREE.BoxGeometry(0.56, 0.34, 0.03),
  monStem: new THREE.BoxGeometry(0.04, 0.22, 0.04),
  monBase: new THREE.BoxGeometry(0.3, 0.02, 0.18),

  torso: new THREE.CapsuleGeometry(0.16, 0.34, 4, 8),
  head: new THREE.IcosahedronGeometry(0.11, 1),
  upperArm: new THREE.BoxGeometry(0.07, 0.07, 0.26),
  foreArm: new THREE.BoxGeometry(0.06, 0.06, 0.24),

  chairSeat: new THREE.BoxGeometry(0.42, 0.05, 0.42),
  chairBack: new THREE.BoxGeometry(0.42, 0.5, 0.05),
  chairCol: new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8),
  chairFoot: new THREE.BoxGeometry(0.46, 0.04, 0.46),

  boxBody: new THREE.BoxGeometry(0.36, 0.3, 0.36),
  boxSeam: new THREE.BoxGeometry(0.365, 0.006, 0.365),

  wall: new THREE.BoxGeometry(WALL.w, WALL.h, WALL.d),

  gatePost: new THREE.BoxGeometry(0.1, 2.2, 0.1),
  gateLintel: new THREE.BoxGeometry(1.8, 0.12, 0.1),
  gateDoor: new THREE.BoxGeometry(1.6, 1.8, 0.06),

  cpPost: new THREE.BoxGeometry(0.08, 1.6, 0.08),
  aiHead: new THREE.IcosahedronGeometry(0.17, 0),
  unitBox: new THREE.BoxGeometry(1, 1, 1),
  cpLintel: new THREE.BoxGeometry(1.3, 0.1, 0.08),
  scanBar: new THREE.BoxGeometry(1.1, 0.03, 0.03),

  beltLeg: new THREE.BoxGeometry(0.08, 0.5, 0.08),

  truckBody: new THREE.BoxGeometry(4.0, 1.3, 1.2),
  truckCab: new THREE.BoxGeometry(1.3, 1.1, 1.2),
  wheel: new THREE.CylinderGeometry(0.32, 0.32, 0.2, 10),

  pallet: new THREE.BoxGeometry(1.2, 0.1, 1.0),
  labelQuad: new THREE.PlaneGeometry(0.3, 0.3),
  plane: new THREE.PlaneGeometry(1, 1),
} as const;

/**
 * Story-point labels drawn to a canvas. Six textures ever, cached forever —
 * far cheaper than pulling in a text mesh library and a font file for this.
 */
const labelCache = new Map<StoryPoint, THREE.CanvasTexture>();

export function spLabelTexture(sp: StoryPoint): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const cached = labelCache.get(sp);
  if (cached) return cached;

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "#CBD5E1";
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, size - 16, size - 16);

  ctx.fillStyle = "#0F172A";
  ctx.font = "700 96px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(String(sp), size / 2, size / 2 + 22);

  ctx.fillStyle = "#64748B";
  ctx.font = "500 34px Inter, system-ui, sans-serif";
  ctx.fillText("SP", size / 2, size / 2 + 68);

  const tex = new THREE.CanvasTexture(canvas);
  // Without this the label renders washed out against the sRGB output.
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  labelCache.set(sp, tex);
  return tex;
}

/** Screen content for the monitors — abstract, never readable text. */
const screenCache = new Map<string, THREE.CanvasTexture>();

export function screenTexture(kind: string): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const cached = screenCache.get(kind);
  if (cached) return cached;

  const w = 224;
  const h = 136;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#0F172A";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#64748B";
  const rows = 7;
  for (let i = 0; i < rows; i += 1) {
    const y = 18 + i * 15;
    const len = 40 + ((i * 53 + kind.length * 17) % 120);
    ctx.fillRect(16, y, len, 5);
  }
  ctx.fillStyle = "#E1127A";
  ctx.fillRect(16, 18 + 3 * 15, 34, 5);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  screenCache.set(kind, tex);
  return tex;
}
