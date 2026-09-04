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
