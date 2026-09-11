/**
 * The two outside sources this service actually fetches.
 *
 * Both are free, need no key, and are the primary publisher or a faithful
 * mirror of one. Nothing here is scraped from a site whose terms forbid it;
 * the things that would have needed that — carrier rates, bunker prices —
 * are not fetched, and the quotation says so where it uses a modelled figure
 * instead.
 *
 * Pure functions over `fetch`, no Nest, so they can be run from the CLI and
 * unit-tested against a canned response.
 */

/** ECB reference rates, via Frankfurter (an open mirror of the ECB feed). */
export const ECB_URL = "https://api.frankfurter.dev/v1/latest";
export const ECB_SOURCE = "ecb";
/** The currencies the site formats money in, plus the euro the ECB quotes against. */
export const ECB_SYMBOLS = ["JPY", "EUR", "SGD"] as const;

export interface FetchedRate {
  source: string;
  key: string;
  value: number;
  asOf: Date;
  url: string;
}

export async function fetchEcbRates(
  fetchImpl: typeof fetch = fetch,
): Promise<FetchedRate[]> {
  const url = `${ECB_URL}?base=USD&symbols=${ECB_SYMBOLS.join(",")}`;
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`ECB fetch failed: ${res.status}`);
  const body = (await res.json()) as {
    base: string;
    date: string;
    rates: Record<string, number>;
  };
  return Object.entries(body.rates).map(([ccy, value]) => ({
    source: ECB_SOURCE,
    key: `${body.base}/${ccy}`,
    value,
    asOf: new Date(`${body.date}T00:00:00Z`),
    url,
  }));
}

/** UN/LOCODE, the UNECE code list, via the Frictionless Data mirror on GitHub. */
export const UNLOCODE_URL =
  "https://raw.githubusercontent.com/datasets/un-locode/main/data/code-list.csv";
export const UNLOCODE_SOURCE = "unlocode";
/** The countries the site's ports and transhipment hubs are in. */
export const UNLOCODE_COUNTRIES = ["JP", "SG", "NL", "KR", "TW", "LK", "AE"] as const;

export interface FetchedPort {
  unlocode: string;
  country: string;
  name: string;
  lat: number | null;
  lon: number | null;
  url: string;
}

/**
 * "4230N 00131E" -> [42.5, 1.5167]. The list writes coordinates as degrees
 * and minutes with no separator; a missing field is common and stays null.
 */
export function parseCoordinates(s: string): [number, number] | null {
  const m = /^(\d{2})(\d{2})([NS])\s+(\d{3})(\d{2})([EW])$/.exec(s.trim());
  if (!m) return null;
  const lat = (Number(m[1]) + Number(m[2]) / 60) * (m[3] === "S" ? -1 : 1);
  const lon = (Number(m[4]) + Number(m[5]) / 60) * (m[6] === "W" ? -1 : 1);
  return [Math.round(lat * 10000) / 10000, Math.round(lon * 10000) / 10000];
}

/** A minimal CSV line splitter: the list quotes a field only when it holds a comma. */
export function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

/**
 * Keep the rows that are ports in the countries we route through. The
 * Function column is eight positions; position 1 set to "1" means a seaport.
 */
export function parseUnlocode(csv: string): FetchedPort[] {
  const lines = csv.split(/\r?\n/);
  const header = splitCsvLine(lines[0]);
  const col = (name: string) => header.indexOf(name);
  const iCountry = col("Country");
  const iLoc = col("Location");
  const iName = col("NameWoDiacritics");
  const iFn = col("Function");
  const iCoord = col("Coordinates");
  const wanted = new Set<string>(UNLOCODE_COUNTRIES);
  const ports: FetchedPort[] = [];
  for (const line of lines.slice(1)) {
    if (!line) continue;
    const f = splitCsvLine(line);
    const country = f[iCountry];
    if (!wanted.has(country) || !f[iLoc]) continue;
    if ((f[iFn] ?? "")[0] !== "1") continue;
    const coords = parseCoordinates(f[iCoord] ?? "");
    ports.push({
      unlocode: `${country}${f[iLoc]}`,
      country,
      name: f[iName],
      lat: coords?.[0] ?? null,
      lon: coords?.[1] ?? null,
      url: UNLOCODE_URL,
    });
  }
  return ports;
}

export async function fetchUnlocodePorts(
  fetchImpl: typeof fetch = fetch,
): Promise<FetchedPort[]> {
  const res = await fetchImpl(UNLOCODE_URL);
  if (!res.ok) throw new Error(`UN/LOCODE fetch failed: ${res.status}`);
  return parseUnlocode(await res.text());
}
