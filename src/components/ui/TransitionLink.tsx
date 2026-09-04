"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, type ComponentProps, type ReactNode } from "react";
import {
  markNavDirection,
  runWithViewTransition,
  type NavDirection,
} from "./navigation";

interface Props extends Omit<ComponentProps<typeof Link>, "onClick"> {
  direction?: NavDirection;
  children: ReactNode;
}

/**
 * A next/link that announces its direction and, where supported, animates the
 * outgoing page as well as the incoming one. Falls back to an ordinary link:
 * modified clicks and non-left buttons are left entirely to the browser.
 */
export function TransitionLink({
  direction = "forward",
  href,
  children,
  ...rest
}: Props) {
  const router = useRouter();

  return (
    <Link
      {...rest}
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
        event.preventDefault();
        markNavDirection(direction);
        runWithViewTransition(() =>
          startTransition(() => router.push(String(href))),
        );
      }}
    >
      {children}
    </Link>
  );
}
