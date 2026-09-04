import * as THREE from "three";

/**
 * Palette-locked materials.
 *
 * MeshLambertMaterial everywhere for lit surfaces. MeshStandardMaterial is PBR
 * and always carries a specular lobe; with no environment map (which the design
 * system forbids) that reads as dead rather than matte, and pushes toward an
 * HDRI we are not allowed to use. Lambert has zero specular by construction and
 * its diffuse-only falloff is exactly "matte architectural model".
 * MeshToonMaterial was rejected: hard banding reads comic, not editorial.
 */

export const P = {
  white: "#FFFFFF",
  offWhite: "#F8FAFC",
  border: "#CBD5E1",
  charcoal: "#0F172A",
  slate: "#64748B",
  crimson: "#E1127A",
  tint: "#FDF2F8",
} as const;

/*
 * Terminal Green is deliberately absent from this palette. It is a console
 * token — 1.75:1 on white — and the guard that keeps it confined greps CSS
 * class names, which cannot see a colour set on a three.js material. Leaving
 * it defined here as unused "just in case" is how that guard gets bypassed.
 */

const lambert = (color: string, flatShading = false) =>
  new THREE.MeshLambertMaterial({ color, flatShading });

export const M = {
  /** Desk tops, box bodies, partition walls. */
  surface: lambert(P.white),
  /** Legs, frames, monitor bezels, gate posts. */
  structure: lambert(P.charcoal),
  /** Chairs, box lid seams, belt legs. */
  secondary: lambert(P.slate),
  ground: lambert(P.offWhite),
  belt: lambert(P.border),
  person: lambert(P.white, true),
  personHead: lambert(P.border, true),
  /**
   * ACTIVE WORK ITEM ONLY. Queued and backlog boxes are white with grey edges,
   * never crimson — that is what keeps the accent under 10% of the frame.
   */
  accent: lambert(P.crimson),
  accentTint: lambert(P.tint),
  /** Invisible but raycastable. `visible={false}` would be skipped by the ray. */
  pad: new THREE.MeshBasicMaterial({
    color: P.tint,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  }),
  padHover: new THREE.MeshBasicMaterial({
    color: P.tint,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  }),
  /**
   * A real directional shadow onto a plane, not a ContactShadows blob. A
   * physical maquette under one studio lamp casts a single directional,
   * colourless shadow; an omni-directional blur is product-render vocabulary
   * and contradicts the lit geometry above it. At 10% on #F8FAFC the darkest
   * value lands near #E0E4EA — just above the border token, so it reads as a
   * drawn tone rather than a render.
   */
  shadow: new THREE.ShadowMaterial({ color: P.charcoal, opacity: 0.1 }),
} as const;

/** The 1px #CBD5E1 border rule, applied in 3D. */
export const EDGE_COLOR = P.border;
export const EDGE_THRESHOLD = 15;
