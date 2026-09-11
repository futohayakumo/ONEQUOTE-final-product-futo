/**
 * A country flag, drawn — a rectangle at 3:2 with the national design inside,
 * sized to sit beside a port code.
 *
 * These were emoji. Regional-indicator pairs are free and self-translating,
 * but they are also whatever the platform decides: Apple's are glossy and
 * rounded, Windows renders them as two letters, and none of them agree with
 * a page whose every other mark is a flat rectangle with a 1px hairline. A
 * flag here is a small illustration, so it is drawn to the same rules as the
 * rest of the illustrations — flat, hard-edged, one thin border.
 *
 * The colours are the flags' own and are the one place on the site outside
 * the palette, for the same reason a photograph is: a flag in the wrong red is
 * a different flag. Where a device is too fine to draw at 16px — Sri Lanka's
 * lion, Korea's trigram strokes — it is simplified to its silhouette rather
 * than left off, so the flag still reads as itself at a glance.
 *
 * `aria-hidden` on purpose. The port is always named in text next to it, and a
 * screen reader announcing "flag of Japan, Yokohama (JPYOK)" is reading the
 * decoration twice. The `<title>` gives a pointer user the country name.
 */

const COUNTRY: Record<string, string> = {
  JP: "Japan",
  SG: "Singapore",
  NL: "Netherlands",
  KR: "South Korea",
  TW: "Taiwan",
  LK: "Sri Lanka",
  AE: "United Arab Emirates",
};

/** Transhipment hubs arrive as a city name, not a port code. */
export const HUB_COUNTRY: Record<string, string> = {
  Busan: "KR",
  Kaohsiung: "TW",
  Colombo: "LK",
  "Jebel Ali": "AE",
};

/** Every flag is drawn on this box. 3:2, the most common national ratio. */
const W = 24;
const H = 16;

/** Twelve rays around a disc — the sun on Taiwan's canton. */
function sunRays(cx: number, cy: number, r: number, R: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 24; i += 1) {
    const a = (Math.PI * 2 * i) / 24 - Math.PI / 2;
    const rad = i % 2 === 0 ? R : r;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

/** A trigram: three short bars, some of them split — the corners of Korea's. */
function trigram(x: number, y: number, split: [boolean, boolean, boolean]) {
  return split.map((broken, i) => {
    const yy = y + i * 1.1;
    return broken ? (
      <g key={i}>
        <rect x={x} y={yy} width={1.15} height={0.6} fill="#000" />
        <rect x={x + 1.55} y={yy} width={1.15} height={0.6} fill="#000" />
      </g>
    ) : (
      <rect key={i} x={x} y={yy} width={2.7} height={0.6} fill="#000" />
    );
  });
}

const DESIGNS: Record<string, React.ReactNode> = {
  JP: (
    <>
      <rect width={W} height={H} fill="#FFFFFF" />
      <circle cx={W / 2} cy={H / 2} r={H * 0.3} fill="#BC002D" />
    </>
  ),

  SG: (
    <>
      <rect width={W} height={H / 2} fill="#EF3340" />
      <rect y={H / 2} width={W} height={H / 2} fill="#FFFFFF" />
      {/* Crescent: a white disc with a red one cut back into it. */}
      <circle cx={5.2} cy={4} r={2.6} fill="#FFFFFF" />
      <circle cx={6.2} cy={4} r={2.2} fill="#EF3340" />
      {[
        [7.6, 2.3],
        [9.3, 3.3],
        [8.7, 5.2],
        [6.6, 5.2],
        [6.0, 3.3],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={0.5} fill="#FFFFFF" />
      ))}
    </>
  ),

  NL: (
    <>
      <rect width={W} height={H / 3} fill="#AE1C28" />
      <rect y={H / 3} width={W} height={H / 3} fill="#FFFFFF" />
      <rect y={(H * 2) / 3} width={W} height={H / 3} fill="#21468B" />
    </>
  ),

  KR: (
    <>
      <rect width={W} height={H} fill="#FFFFFF" />
      {/* Taegeuk: red over blue, the boundary an S of two half-discs. */}
      <g transform={`rotate(-33 ${W / 2} ${H / 2})`}>
        <path
          d={`M ${W / 2 - 4} ${H / 2} A 4 4 0 0 1 ${W / 2 + 4} ${H / 2} Z`}
          fill="#CD2E3A"
        />
        <path
          d={`M ${W / 2 - 4} ${H / 2} A 4 4 0 0 0 ${W / 2 + 4} ${H / 2} Z`}
          fill="#0047A0"
        />
        <circle cx={W / 2 - 2} cy={H / 2} r={2} fill="#CD2E3A" />
        <circle cx={W / 2 + 2} cy={H / 2} r={2} fill="#0047A0" />
      </g>
      {trigram(2.2, 2.2, [false, false, false])}
      {trigram(19.1, 2.2, [true, false, true])}
      {trigram(2.2, 10.6, [false, true, false])}
      {trigram(19.1, 10.6, [true, true, true])}
    </>
  ),

  TW: (
    <>
      <rect width={W} height={H} fill="#FE0000" />
      <rect width={W / 2} height={H / 2} fill="#000095" />
      <polygon points={sunRays(6, 4, 1.7, 2.9)} fill="#FFFFFF" />
      <circle cx={6} cy={4} r={1.5} fill="#000095" />
      <circle cx={6} cy={4} r={1.15} fill="#FFFFFF" />
    </>
  ),

  LK: (
    <>
      <rect width={W} height={H} fill="#FFBE29" />
      <rect x={1} y={1} width={3.4} height={H - 2} fill="#005F37" />
      <rect x={4.4} y={1} width={3.4} height={H - 2} fill="#FF5000" />
      <rect x={8.8} y={1} width={W - 9.8} height={H - 2} fill="#8D153A" />
      {/* The lion, as a silhouette; the four bo leaves as their corners. */}
      <path
        d="M 12.4 10.6 L 12.4 6.9 Q 13.4 5.6 14.9 5.9 L 17.9 6.4 Q 19.6 6.9 19.6 8.4 L 19.6 10.6 Z"
        fill="#FFBE29"
      />
      {[
        [10.2, 2.4],
        [21.8, 2.4],
        [10.2, 13.6],
        [21.8, 13.6],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={0.75} fill="#FFBE29" />
      ))}
    </>
  ),

  AE: (
    <>
      <rect width={W} height={H / 3} fill="#00732F" />
      <rect y={H / 3} width={W} height={H / 3} fill="#FFFFFF" />
      <rect y={(H * 2) / 3} width={W} height={H / 3} fill="#000000" />
      <rect width={W / 4} height={H} fill="#FF0000" />
    </>
  ),
};

export function Flag({
  country,
  className,
}: {
  /** ISO 3166-1 alpha-2, e.g. "JP". */
  country: string;
  className?: string;
}) {
  const cc = country.toUpperCase();
  const design = DESIGNS[cc];
  if (!design) return null;

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      // A fixed size, not an em. Sized to the type, the flag beside a 13px
      // caption was two-thirds of the one beside a 15px label, and at that
      // size a crescent or a taegeuk is a smudge. One flag, one size, drawn
      // 1:1 on its own box so the hairline lands on whole pixels.
      width={W}
      height={H}
      className={className ?? "inline-block align-[-0.2em]"}
    >
      <title>{COUNTRY[cc] ?? cc}</title>
      {design}
      {/* The hairline every other rectangle on the site has. Without it a
          white field — Japan, most of Korea — has no edge on a white page. */}
      <rect
        x={0.5}
        y={0.5}
        width={W - 1}
        height={H - 1}
        fill="none"
        stroke="#CBD5E1"
        strokeWidth={1}
      />
    </svg>
  );
}
