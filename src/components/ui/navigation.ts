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

/**
 * How many in-app navigations this session has made.
 *
 * The "Back" control has to know whether there is anywhere to go back TO. A
 * visitor who deep-linked straight onto an inner screen has nothing behind
 * them, and history.back() would take them off the site.
 *
 * This lives on `window`, not in a module variable. The two callers — the
 * links that increment it and the Back control that reads it — are code-split
 * into different chunks, and a module-scoped counter is only shared if the
 * bundler happens to give them the same module instance. It did not: Back kept
 * reading zero and pushing a new entry, so the stack grew and the browser's own
 * back button returned to the page you had just left.
 */
const COUNTER = "__portfolioInAppNavigations";

type NavWindow = Window & { [COUNTER]?: number };

export function noteInAppNavigation() {
  if (typeof window === "undefined") return;
  const w = window as NavWindow;
  w[COUNTER] = (w[COUNTER] ?? 0) + 1;
}

export function canGoBackInApp() {
  if (typeof window === "undefined") return false;
  return ((window as NavWindow)[COUNTER] ?? 0) > 0;
}

/*
 * There is deliberately no View Transitions API here any more.
 *
 * Wrapping the navigation in document.startViewTransition() deadlocked: the
 * update callback has to resolve before the browser will capture the new
 * state, but Next's router.push is asynchronous, so the callback returned a
 * promise that waited a frame — and frames do not run while a view transition
 * is holding rendering. Every navigation sat on the API's 4-second timeout.
 * Measured: 4034, 4038, 4026, 4036, 4031, 4033 ms.
 *
 * The outgoing half of the animation is not worth four seconds. The template
 * remount already plays a directional entrance in CSS at no cost, and Next
 * keeps the old route on screen until the new one is ready, so the perceived
 * transition is intact.
 */
