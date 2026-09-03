import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

/**
 * Every icon in this app is hand-drawn on a 24x24 grid with a 1.25 stroke and
 * SQUARE caps / MITER joins — the same hard-edge law the containers obey.
 * Round caps would read soft against a 1px hairline system.
 */
export function iconAttrs(size = 24) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "square" as const,
    strokeLinejoin: "miter" as const,
    "aria-hidden": true,
    focusable: false,
  };
}
