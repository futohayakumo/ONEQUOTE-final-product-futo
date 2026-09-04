"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft } from "../icons/ArrowLeft";
import { canGoBackInApp, markNavDirection } from "./navigation";

/**
 * A control labelled "Back" has to actually go back.
 *
 * It used to be an ordinary link to the parent route, which PUSHES a new
 * history entry. So the stack grew /journeys, /journeys/business, /journeys —
 * and the browser's own back button then returned to the page you had just
 * left. Pressing back twice to leave one screen is not a transition problem,
 * it is a broken affordance.
 *
 * It stays an anchor with a real href, so middle-click, right-click and screen
 * readers all behave. Only the plain left click is redirected to history.back(),
 * and only when this session actually has an in-app entry to return to — a
 * visitor who deep-linked onto an inner screen still gets a normal link.
 */
export function BackBar({
  href,
  label = "Back",
}: {
  href: string;
  label?: string;
}) {
  const router = useRouter();

  // A browser back gesture should animate like a back, not like a forward.
  useEffect(() => {
    const onPop = () => markNavDirection("back");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <Link
      href={href}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }
        markNavDirection("back");
        if (!canGoBackInApp()) return; // let the link push, as a first landing
        event.preventDefault();
        router.back();
      }}
      className="group/back inline-flex items-center gap-3 type-label text-crimson transition-colors duration-150 hover:text-charcoal"
    >
      <ArrowLeft
        size={18}
        className="transition-transform duration-150 group-hover/back:-translate-x-1"
      />
      <span>{label}</span>
    </Link>
  );
}
