"use client";

/**
 * Navigation direction is written onto <html> just before a route change so the
 * template's enter animation can differ for going deeper versus coming back.
 * Reading it from the DOM rather than from React state keeps it available to
 * pure CSS, which is what actually plays the animation.
 */
export type NavDirection = "forward" | "back";

export function markNavDirection(direction: NavDirection) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.nav = direction;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type StartViewTransition = (cb: () => void | Promise<void>) => {
  finished: Promise<void>;
};

/**
 * Wraps a client navigation in a View Transition where the browser supports it,
 * which is what produces the OUTGOING half of the animation. Everything else
 * falls back to the template's enter animation alone — the page still moves,
 * it just does not cross-fade.
 */
export function runWithViewTransition(navigate: () => void) {
  const doc = document as Document & {
    startViewTransition?: StartViewTransition;
  };

  if (typeof doc.startViewTransition !== "function" || prefersReducedMotion()) {
    navigate();
    return;
  }

  doc.startViewTransition(() => {
    navigate();
    // Give React a paint to commit the new route before the browser captures
    // the "after" snapshot. Two frames is the reliable minimum.
    return new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
}
