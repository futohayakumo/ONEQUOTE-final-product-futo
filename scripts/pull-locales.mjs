#!/usr/bin/env node
/**
 * Pull the translation bundles from Lokalise before a build.
 *
 * The app imports src/locales/*.json directly, so the running site has no
 * network dependency and no runtime token — a translation platform that can
 * take the site down when it has an outage is a worse deal than hard-coded
 * strings.
 *
 * A failed pull is not a failed build. The last good bundle stays on disk and
 * this exits 0 with a warning, because the alternative is that a translator's
 * outage blocks a deploy that has nothing to do with copy.
 *
 *   LOKALISE_API_TOKEN=… LOKALISE_PROJECT_ID=… node scripts/pull-locales.mjs
 */
import { writeFile } from "node:fs/promises";

const TOKEN = process.env.LOKALISE_API_TOKEN;
const PROJECT = process.env.LOKALISE_PROJECT_ID;
const LOCALES = ["en", "ja"];
const BASE = "en";

if (!TOKEN || !PROJECT) {
  console.log(
    "pull-locales: no LOKALISE_API_TOKEN/LOKALISE_PROJECT_ID — keeping the bundles on disk.",
  );
  process.exit(0);
}

async function pull() {
  const res = await fetch(
    `https://api.lokalise.com/api2/projects/${PROJECT}/keys?include_translations=1&limit=5000`,
    { headers: { "X-Api-Token": TOKEN } },
  );
  if (!res.ok) throw new Error(`Lokalise responded ${res.status}`);
  const { keys } = await res.json();

  const bundles = Object.fromEntries(LOCALES.map((l) => [l, {}]));
  for (const key of keys) {
    for (const tr of key.translations ?? []) {
      // An empty translation is not a translation. Leaving it out lets the
      // runtime fall back to the base locale instead of rendering a blank.
      if (!LOCALES.includes(tr.language_iso) || !tr.translation?.trim()) continue;
      bundles[tr.language_iso][key.key_name.web] = tr.translation;
    }
  }

  if (Object.keys(bundles[BASE]).length === 0) {
    throw new Error("base locale came back empty — refusing to overwrite");
  }

  for (const locale of LOCALES) {
    const path = new URL(`../src/locales/${locale}.json`, import.meta.url);
    const sorted = Object.fromEntries(
      Object.entries(bundles[locale]).sort(([a], [b]) => a.localeCompare(b)),
    );
    await writeFile(path, JSON.stringify(sorted, null, 2) + "\n");
    const missing =
      Object.keys(bundles[BASE]).length - Object.keys(sorted).length;
    console.log(
      `pull-locales: ${locale} — ${Object.keys(sorted).length} keys` +
        (missing > 0 ? `, ${missing} falling back to ${BASE}` : ""),
    );
  }
}

try {
  await pull();
} catch (error) {
  console.warn(`pull-locales: ${error.message} — keeping the bundles on disk.`);
  // Deliberately 0. See the note at the top.
  process.exit(0);
}
