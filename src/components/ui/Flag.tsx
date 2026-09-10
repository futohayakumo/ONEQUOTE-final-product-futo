/**
 * A country flag as an emoji, sized to sit beside a port code.
 *
 * Regional-indicator pairs rather than 44 SVG files: every platform this site
 * runs on already has the glyphs, they scale with the type, they cost nothing
 * to download, and they translate themselves — a flag is the same picture in
 * every locale.
 *
 * `aria-hidden` on purpose. The port is always named in text next to it, and a
 * screen reader announcing "flag of Japan, Yokohama (JPYOK)" is reading the
 * decoration twice. The `title` gives a pointer user the country name without
 * putting it in the accessibility tree.
 */
const OFFSET = 0x1f1e6 - "A".charCodeAt(0);

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

/**
 * The bare glyph.
 *
 * A native `<option>` renders text and nothing else — an element inside one is
 * dropped — so the port select cannot use the component and takes this instead.
 */
export function flagGlyph(country: string): string {
  const cc = country.toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  return String.fromCodePoint(
    cc.charCodeAt(0) + OFFSET,
    cc.charCodeAt(1) + OFFSET,
  );
}

export function Flag({
  country,
  className,
}: {
  /** ISO 3166-1 alpha-2, e.g. "JP". */
  country: string;
  className?: string;
}) {
  const cc = country.toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return null;

  const glyph = String.fromCodePoint(
    cc.charCodeAt(0) + OFFSET,
    cc.charCodeAt(1) + OFFSET,
  );

  return (
    <span
      aria-hidden
      title={COUNTRY[cc] ?? cc}
      className={className ?? "text-[1em] leading-none"}
    >
      {glyph}
    </span>
  );
}
