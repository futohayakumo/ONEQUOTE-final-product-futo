import type { SVGProps } from "react";

/**
 * The recurring crosshair / concentric motif from the reference comps,
 * redrawn flat: hairline circles, one quarter filled with a hatch, a crimson
 * axis stub. Decorative only — never carries information.
 */
export function BlueprintMark({
  className,
  ...rest
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 260 260"
      fill="none"
      className={className}
      aria-hidden
      focusable="false"
      {...rest}
    >
      <defs>
        <pattern
          id="bp-hatch"
          width="3"
          height="3"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 0v3" stroke="#cbd5e1" strokeWidth="0.6" />
        </pattern>
      </defs>

      {/* axes */}
      <path d="M130 8v244" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 4" />
      <path d="M8 130h244" stroke="#cbd5e1" strokeWidth="1" />

      {/* concentric hairlines */}
      <circle cx="130" cy="130" r="118" stroke="#cbd5e1" strokeWidth="1" />
      <circle
        cx="130"
        cy="130"
        r="86"
        stroke="#cbd5e1"
        strokeWidth="1"
        strokeDasharray="3 5"
      />

      {/* the one crimson ring */}
      <circle cx="130" cy="130" r="56" stroke="#e1127a" strokeWidth="1.25" />

      {/* hatched quadrant */}
      <path
        d="M130 74a56 56 0 0 1 56 56h-56z"
        fill="url(#bp-hatch)"
        stroke="none"
      />

      {/* axis terminal */}
      <circle cx="238" cy="130" r="4" fill="#e1127a" stroke="none" />
      <circle cx="130" cy="130" r="2" fill="#e1127a" stroke="none" />
    </svg>
  );
}
