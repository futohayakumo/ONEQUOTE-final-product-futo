import assert from "node:assert/strict";
import test from "node:test";
import en from "../locales/en.json" with { type: "json" };
import ja from "../locales/ja.json" with { type: "json" };

const BUNDLES: Record<string, Record<string, string>> = { en, ja };
const BASE = "en";

/** The runtime resolver, duplicated here so the test does not need @/ aliases. */
function t(key: string, locale: string, vars?: Record<string, string | number>) {
  const raw = BUNDLES[locale]?.[key] ?? BUNDLES[BASE][key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (w, n: string) =>
    n in vars ? String(vars[n]) : w,
  );
}

test("a missing translation falls back to the base locale, not to blank", () => {
  const missing = Object.keys(en).filter((k) => !(k in ja));
  assert.ok(missing.length > 0, "the fixture needs at least one gap to test");
  for (const key of missing) {
    assert.equal(t(key, "ja"), (en as Record<string, string>)[key]);
    assert.notEqual(t(key, "ja"), "");
  }
});

test("an unknown key renders as the key, so the break is visible", () => {
  assert.equal(t("quote.nonexistent", "en"), "quote.nonexistent");
});

test("every placeholder in the base locale exists in each translation", () => {
  const holes = (s: string) => (s.match(/\{(\w+)\}/g) ?? []).sort();
  for (const [key, value] of Object.entries(en as Record<string, string>)) {
    const translated = (ja as Record<string, string>)[key];
    if (!translated) continue;
    assert.deepEqual(
      holes(translated),
      holes(value),
      `${key}: a dropped placeholder renders a literal brace at runtime`,
    );
  }
});

test("interpolation substitutes and leaves unknown holes alone", () => {
  assert.equal(t("quote.transitDays", "en", { days: 12 }), "12 days");
  assert.equal(t("quote.transitDays", "ja", { days: 12 }), "12日");
  assert.equal(t("quote.transitDays", "en", {}), "{days} days");
});

test("no translation is an empty string", () => {
  for (const [locale, bundle] of Object.entries(BUNDLES)) {
    for (const [key, value] of Object.entries(bundle)) {
      assert.ok(value.trim().length > 0, `${locale}:${key} is blank`);
    }
  }
});
