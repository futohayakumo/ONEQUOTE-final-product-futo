"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { markNavDirection, type NavDirection } from "./navigation";

interface Props extends Omit<ComponentProps<typeof Link>, "onClick"> {
  direction?: NavDirection;
  children: ReactNode;
}

/**
 * An ordinary next/link that records which way it is travelling, so the
 * template's entrance animation can come from the right side going deeper and
 * from the left coming back.
 *
 * It does NOT intercept the navigation. An earlier version called
 * preventDefault and router.push inside a view transition, which cost four
 * seconds a click and threw away Link's prefetching for nothing.
 */
export function TransitionLink({ direction = "forward", ...rest }: Props) {
  return (
    <Link
      {...rest}
      onMouseDown={() => markNavDirection(direction)}
      onTouchStart={() => markNavDirection(direction)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          markNavDirection(direction);
        }
      }}
    />
  );
}
