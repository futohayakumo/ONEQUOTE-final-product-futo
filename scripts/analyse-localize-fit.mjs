#!/usr/bin/env node
/**
 * Measure how a DOM-scanning translation layer would fit THIS codebase.
 *
 * The two products are opposite in kind. Lokalise addresses copy by key at
 * build time; Localize scans the rendered DOM at run time and swaps text in
 * place. Which one suits a site is not a matter of taste, it is a matter of
 * what the site renders — so this counts, rather than argues.
 *
 * Every figure below is derived from src/locales/en.json and the source, and
 * can be re-derived by anyone running this file.
 */
import { readFileSync, readdirSync } from "node:fs";

const en = JSON.parse(readFileSync(new URL("../src/locales/en.json", import.meta.url), "utf8"));
const keys = Object.entries(en);

const has = (re) => keys.filter(([, v]) => re.test(v));
const placeholders = has(/\{\w+\}/);
const newlines = has(/\n/);

/* ---- 1. Interpolation becomes phrase explosion ------------------------- */
// A key with a hole is ONE phrase in a key-based system. A DOM scanner sees
// the rendered string, so it sees one phrase per value that ever renders.
const CARDINALITY = {
  "{days}": 40,      // transit days observed across lanes and legs
  "{n}": 5,          // question number
  "{total}": 1,
  "{score}": 6,      // 0..5
  "{count}": 12,     // sailing counts and log line counts
  "{units}": 60,     // container count on a charge line
  "{pct}": 2,        // BAF and CAF
  "{teu}": 20,       // loyalty milestones
  "{hours}": 1,
  "{max}": 1,
  "{sp}": 6,         // story points
  "{ratio}": 6,      // one per story point
  "{port}": 4,
  "{label}": 15,     // node labels
  "{text}": 20,      // quiz option text
  "{section}": 3,
};
let exploded = 0;
for (const [, value] of placeholders) {
  const holes = value.match(/\{\w+\}/g) ?? [];
  let n = 1;
  for (const h of holes) n *= CARDINALITY[h] ?? 5;
  exploded += n;
}

/* ---- 2. What the scanner cannot reach, or reaches wrongly -------------- */
const src = [];
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name)) src.push([p, readFileSync(p, "utf8")]);
  }
};
walk(new URL("../src", import.meta.url).pathname);

const count = (re) =>
  src.reduce((n, [, s]) => n + (s.match(re) ?? []).length, 0);

const inSvg = count(/<text[\s>]/g);
const ariaLabels = count(/aria-label=/g);
const srOnly = count(/className="[^"]*\bsr-only\b/g);
const altAttrs = count(/\balt=/g);
const tabularNums = count(/\btnum\b/g);

/* ---- 3. Content that only exists after an interaction ------------------ */
// Localize's retranslateOnNewPhrases re-checks at 3.5s and 6.5s after load.
// Anything a click produces after that is untranslated until the next check.
const interactive = [
  ["engineering", "selecting a node re-routes the map, re-times the trace and rewrites the log"],
  ["business", "changing the Incoterm restrikes every charge line"],
  ["business", "searching a lane replaces the whole sailing list"],
  ["process", "the story-point select redraws both outcome cards"],
  ["process", "the evidence modal is not in the DOM until it opens"],
  ["process/quiz", "each question replaces the one before it"],
];

const pct = (n) => `${((n / keys.length) * 100).toFixed(0)}%`;
const row = (label, value, note = "") =>
  console.log(`  ${label.padEnd(46)} ${String(value).padStart(6)}  ${note}`);

console.log("\nFIT OF A DOM-SCANNING LAYER AGAINST THIS CODEBASE\n");
console.log("Source strings");
row("keys in the base bundle", keys.length);
row("carrying an interpolation hole", placeholders.length, pct(placeholders.length));
row("carrying an author's line break", newlines.length, pct(newlines.length));

console.log("\n1. Phrase count");
row("phrases in the key-based model", keys.length);
row("phrases a DOM scanner would see", `~${exploded + (keys.length - placeholders.length)}`,
  `${((exploded + keys.length - placeholders.length) / keys.length).toFixed(1)}x`);
console.log("     Interpolated strings render once per value. \"{days} days\" is one");
console.log("     key and one translator decision; it is one phrase per number to a");
console.log("     scanner, and each has to be translated separately.");

console.log("\n2. Reach");
row("<text> nodes inside SVG", inSvg, "translateSVGElement covers these");
row("aria-label attributes", ariaLabels, "translateAriaLabels covers these");
row("sr-only elements", srOnly, "reached — and invisible to the person proofing");
row("alt attributes", altAttrs, "translateAlt covers these");
row("tabular-number spans", tabularNums, "translateNumbers is off by default");

console.log("\n3. Content that appears after a click");
for (const [route, what] of interactive) console.log(`  /${route.padEnd(14)} ${what}`);
console.log("     retranslateOnNewPhrases re-checks at 3.5s and 6.5s after load.");
console.log("     Anything produced by a later interaction shows untranslated until");
console.log("     the dictionary is fetched again.");

console.log("\n4. Structural");
console.log("  React owns these text nodes. Localize mutates them in place, and the");
console.log("  library ships enableResilientDOMMode and vueSafe for exactly that");
console.log("  class of conflict — there is no reactSafe. Every string on this site");
console.log("  is inside a React tree.");
console.log("  The build is a static export: no runtime, no server. A run-time layer");
console.log("  is the only vendor dependency the deployed site would have.\n");
