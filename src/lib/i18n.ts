import en from "@/locales/en.json";
import ja from "@/locales/ja.json";

/**
 * Copy lives outside the components, in key-value bundles Lokalise owns.
 *
 * The point is not that this app has two languages. It is that the strings are
 * addressed by key and resolved at the edge of the tree, so a wording change is
 * a translation-memory edit rather than a pull request — which is the whole
 * argument for a managed localisation platform and the reason the Translation
 * API sits in the service map.
 *
 * The bundles are imported, not fetched. `scripts/pull-locales.mjs` writes them
 * from the Lokalise API before the build, so the running app has no network
 * dependency and no runtime token, and a failed pull leaves the last good
 * bundle in place rather than an empty screen.
 *
 * Missing keys fall back to the base locale and then to the key itself. A UI
 * that renders `quote.total` is obviously broken; one that renders an empty
 * string is quietly broken, and the quiet failure is the expensive one.
 */
export const LOCALES = ["en", "ja"] as const;
export type Locale = (typeof LOCALES)[number];
export const BASE_LOCALE: Locale = "en";

const BUNDLES: Record<Locale, Record<string, string>> = { en, ja };

export function t(
  key: string,
  locale: Locale = BASE_LOCALE,
  vars?: Record<string, string | number>,
): string {
  const raw = BUNDLES[locale]?.[key] ?? BUNDLES[BASE_LOCALE][key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}

/** Keys present in the base bundle but missing from a translation. */
export function missingKeys(locale: Locale): string[] {
  return Object.keys(BUNDLES[BASE_LOCALE]).filter(
    (k) => !(k in (BUNDLES[locale] ?? {})),
  );
}

export function allKeys(): string[] {
  return Object.keys(BUNDLES[BASE_LOCALE]);
}
