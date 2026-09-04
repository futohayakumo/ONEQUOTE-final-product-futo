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

interface ViewTransition {
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  ready: Promise<void>;
  skipTransition(): void;
}

type StartViewTransition = (cb: () => void | Promise<void>) => ViewTransition;

let active: ViewTransition | null = null;

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

  // A transition still running when the next one starts throws
  // InvalidStateError. Skipping it first is cheaper than queueing.
  active?.skipTransition();

  const transition = doc.startViewTransition(() => {
    navigate();
    // Give React one paint to commit the new route before the browser
    // captures the "after" snapshot. Resolving on the next frame stays well
    // inside the update budget; waiting for a heavy subtree (the WebGL scene)
    // to finish mounting does not, and blows the 4s timeout.
    return new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
  });

  active = transition;

  /*
   * A View Transition exposes three promises and skipTransition() rejects
   * `ready` as well as the others. Any of them left unhandled surfaces as an
   * uncaught rejection and puts the dev overlay's error badge on screen during
   * a demo.
   *
   * All three failures are cosmetic: the navigation itself already happened
   * inside the callback. So every one is swallowed deliberately.
   */
  transition.ready.catch(() => {});
  transition.updateCallbackDone.catch(() => {});
  transition.finished
    .catch(() => {})
    .finally(() => {
      if (active === transition) active = null;
    });
}
