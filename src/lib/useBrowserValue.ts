"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Reads a browser-only value without a hydration mismatch and without a
 * setState-in-effect. The server snapshot is null, so the first paint matches
 * the server HTML and the real value arrives on hydration.
 *
 * Use this for constant capabilities (WebGL support, matchMedia at mount).
 * State the user can change belongs in ordinary useState.
 */
export function useBrowserValue<T>(read: () => T): T | null {
  return useSyncExternalStore(noopSubscribe, read, () => null);
}

let webglSupport: boolean | null = null;

export function detectWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    webglSupport = Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}
