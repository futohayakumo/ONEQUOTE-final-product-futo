"use client";

import { usePathname } from "next/navigation";

/**
 * Next creates a new template INSTANCE on every navigation, but React still
 * reconciles the identical <div> underneath it and reuses the same DOM node.
 * A CSS animation only starts when its element is created, so the entrance
 * played once on first load and never again — measured: the same node id and
 * `route-in-back@260ms/finished` across every subsequent navigation.
 *
 * Keying on the pathname forces a genuinely new element per route, which is
 * what restarts the animation.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="route-enter">
      {children}
    </div>
  );
}
