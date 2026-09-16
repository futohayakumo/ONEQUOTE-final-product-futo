import { t, type Locale } from "@/lib/i18n";

/**
 * Dates and numbers, formatted from the bundle rather than from Intl.
 *
 * Two reasons, and the second is the one that matters.
 *
 * `toLocaleDateString` is a hydration hazard here: these strings render on the
 * server and again in the browser, and a Node built without full ICU falls
 * back to a different set of month abbreviations than Chrome ships. That was
 * already fixed once by hard-coding English tables — which then made every
 * date English no matter what language the page was in.
 *
 * The better answer is that date ORDER and number SEPARATORS are translation
 * decisions, not engineering ones. English writes 18 Sep 2026, Japanese writes
 * 2026年9月18日, and Vietnamese groups thousands with a full stop and marks
 * decimals with a comma. A translator knows that about their own language;
 * an `Intl` call guesses, and cannot be corrected without a release.
 */
export function formatDate(ms: number, locale: Locale): string {
  const d = new Date(ms);
  return t("date.pattern", locale, {
    d: String(d.getUTCDate()).padStart(2, "0"),
    mon: t(`month.${d.getUTCMonth() + 1}`, locale),
    y: d.getUTCFullYear(),
  });
}

/** The date plus the clock, UTC, for an instant a reader may want to check against a log. */
export function formatDateTime(ms: number, locale: Locale): string {
  const d = new Date(ms);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${formatDate(ms, locale)} ${hh}:${mm} UTC`;
}

export function formatWeekday(ms: number, locale: Locale): string {
  return t(`weekday.${new Date(ms).getUTCDay()}`, locale);
}

/** Money, grouped and pointed the way the locale writes it. */
export function formatMoney(n: number, locale: Locale): string {
  const group = t("number.group", locale);
  const decimal = t("number.decimal", locale);
  const [whole, frac] = Math.abs(n).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  return `${n < 0 ? "−" : ""}${grouped}${decimal}${frac}`;
}

/**
 * A decimal for display. Vietnamese swaps the two separators against English,
 * so "3.8 d" has to become "3,8 ngày" — a number printed with `toFixed` alone
 * is not locale-neutral, it is English.
 */
export function formatDecimal(n: number, locale: Locale, digits = 1): string {
  const decimal = t("number.decimal", locale);
  const group = t("number.group", locale);
  const [whole, frac] = Math.abs(n).toFixed(digits).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  const sign = n < 0 ? "−" : "";
  return frac ? `${sign}${grouped}${decimal}${frac}` : `${sign}${grouped}`;
}

/**
 * Re-print the numbers inside an interpolation payload.
 *
 * `t()` stringifies whatever it is handed, which means a number arrives on the
 * page as JavaScript spells it: "2.5" in a Vietnamese sentence that needs
 * "2,5". Charge bases are built in a locale-free module, so they hand over
 * numbers and the renderer decides how to write them — each one keeping the
 * decimals it actually has, so a count stays "3" and a rate stays "2,5".
 */
export function localiseVars(
  vars: Record<string, string | number> | undefined,
  locale: Locale,
): Record<string, string | number> | undefined {
  if (!vars) return vars;
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(vars)) {
    if (typeof v !== "number") {
      out[k] = v;
      continue;
    }
    const decimals = (String(v).split(".")[1] ?? "").length;
    out[k] = formatDecimal(v, locale, decimals);
  }
  return out;
}

/**
 * An amount in one of the tariff currencies, with that currency's own
 * conventions: yen and won have no minor unit, the rest have two. The symbol is the
 * one a freight invoice prints, so Singapore dollars are S$ and not $.
 */
export function formatCurrency(
  n: number,
  currency: "USD" | "JPY" | "SGD" | "EUR" | "KRW",
  locale: Locale,
): string {
  const symbol = { USD: "$", JPY: "¥", SGD: "S$", EUR: "€", KRW: "₩" }[currency];
  if (currency === "JPY" || currency === "KRW") {
    return `${symbol}${formatMoney(Math.round(n), locale).replace(/[.,]00$/, "")}`;
  }
  return `${symbol}${formatMoney(n, locale)}`;
}
