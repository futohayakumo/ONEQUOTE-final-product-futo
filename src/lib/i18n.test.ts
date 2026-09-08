import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

/**
 * Every locale on disk, discovered rather than listed.
 *
 * The first version of this file imported en and ja by name and compared them
 * to each other. Adding Vietnamese would have passed without being checked at
 * all — a test suite that does not grow with the thing it guards is a suite
 * that quietly stops guarding it.
 */
const DIR = new URL("../locales/", import.meta.url);
const BASE = "en";

const BUNDLES: Record<string, Record<string, string>> = Object.fromEntries(
  readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => [
      f.replace(/\.json$/, ""),
      JSON.parse(readFileSync(new URL(f, DIR), "utf8")),
    ]),
);
const LOCALES = Object.keys(BUNDLES);
const TRANSLATIONS = LOCALES.filter((l) => l !== BASE);

function t(key: string, locale: string, vars?: Record<string, string | number>) {
  const raw = BUNDLES[locale]?.[key] ?? BUNDLES[BASE][key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (w, n: string) =>
    n in vars ? String(vars[n]) : w,
  );
}

test("the base locale exists and is not empty", () => {
  assert.ok(BUNDLES[BASE], `${BASE}.json must exist`);
  assert.ok(Object.keys(BUNDLES[BASE]).length > 0);
  assert.ok(TRANSLATIONS.length > 0, "there is nothing to check against");
});

test("a missing translation falls back to the base, never to blank", () => {
  for (const locale of TRANSLATIONS) {
    for (const key of Object.keys(BUNDLES[BASE])) {
      if (key in BUNDLES[locale]) continue;
      assert.equal(t(key, locale), BUNDLES[BASE][key], `${locale}:${key}`);
      assert.notEqual(t(key, locale), "");
    }
  }
});

test("an unknown key renders as the key, so the break is visible", () => {
  for (const locale of LOCALES) {
    assert.equal(t("quote.nonexistent", locale), "quote.nonexistent");
  }
});

test("no translation carries a key the base locale does not have", () => {
  const base = new Set(Object.keys(BUNDLES[BASE]));
  for (const locale of TRANSLATIONS) {
    const orphans = Object.keys(BUNDLES[locale]).filter((k) => !base.has(k));
    assert.deepEqual(orphans, [], `${locale} translates keys nobody reads`);
  }
});

test("every placeholder survives translation", () => {
  const holes = (s: string) => (s.match(/\{(\w+)\}/g) ?? []).sort();
  for (const locale of TRANSLATIONS) {
    for (const [key, value] of Object.entries(BUNDLES[BASE])) {
      const translated = BUNDLES[locale][key];
      if (!translated) continue;
      assert.deepEqual(
        holes(translated),
        holes(value),
        // A dropped {days} renders a literal brace on the page.
        `${locale}:${key} lost or invented a placeholder`,
      );
    }
  }
});

test("interpolation substitutes, and leaves an unsupplied hole alone", () => {
  for (const locale of LOCALES) {
    const filled = t("quote.transitDays", locale, { days: 12 });
    assert.ok(filled.includes("12"), `${locale}: ${filled}`);
    assert.ok(!filled.includes("{days}"), `${locale}: ${filled}`);
  }
  assert.equal(t("quote.transitDays", BASE, {}), "{days} days");
});

test("no translation is blank or untrimmed", () => {
  for (const [locale, bundle] of Object.entries(BUNDLES)) {
    for (const [key, value] of Object.entries(bundle)) {
      assert.ok(value.trim().length > 0, `${locale}:${key} is blank`);
      assert.equal(value, value.trim(), `${locale}:${key} has loose whitespace`);
    }
  }
});

test("coverage is reported, not enforced", () => {
  const total = Object.keys(BUNDLES[BASE]).length;
  for (const locale of TRANSLATIONS) {
    const have = Object.keys(BUNDLES[locale]).length;
    console.log(
      `  ${locale}: ${have}/${total} keys` +
        (have < total ? `, ${total - have} falling back to ${BASE}` : ""),
    );
  }
  // Deliberately no assertion on the count. A part-translated locale is the
  // normal state of a live Lokalise project, not a build failure.
  assert.ok(true);
});
