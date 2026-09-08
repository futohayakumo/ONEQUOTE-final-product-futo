"use client";

import { formatMoney } from "@/lib/localeFormat";
import { useLocale, useT } from "../shell/LocaleProvider";

/**
 * The four figures worth losing your place over, pinned under the nav.
 *
 * The ticket below runs to roughly three screenfuls: charges in three sections,
 * a discount line, cut-offs and notes. By the time a reader is reading the
 * destination charges, the quotation reference, the payable total and the
 * Incoterm that decides which half of the invoice is theirs have all scrolled
 * off — and those are exactly the values every one of those lines is relative
 * to.
 *
 * `top-16` clears the site nav, which is `h-16` from `md` up. Below that the
 * nav is two rows and this bar stops sticking rather than covering the links:
 * a summary that hides the navigation is not a summary.
 */
export function QuoteSummaryBar({
  reference,
  incoterm,
  transitDays,
  total,
}: {
  reference: string;
  incoterm: string;
  transitDays: number;
  total: number;
}) {
  const t = useT();
  const { locale } = useLocale();

  const cells = [
    { label: t("quote.ref"), value: reference },
    { label: t("quote.incoterm"), value: incoterm },
    { label: t("quote.transit"), value: t("quote.transitDays", { days: transitDays }) },
  ];

  return (
    <div
      aria-label={t("business.summary.aria")}
      className="z-30 flex flex-wrap items-baseline gap-x-10 gap-y-3 border border-border bg-studio px-6 py-4 rounded-card shadow-card md:sticky md:top-16"
    >
      {cells.map((c) => (
        <div key={c.label} className="flex items-baseline gap-3">
          <span className="type-caption">{c.label}</span>
          <span className="type-label tnum">{c.value}</span>
        </div>
      ))}
      {/* "On your account", not "Total": the sailing list above prices the
          whole port-to-port move, and under FOB the buyer pays a fraction of
          it. Two figures labelled Total, differing by $3,300, would read as an
          arithmetic error rather than as the Incoterm doing its job. */}
      <div className="ml-auto flex items-baseline gap-3">
        <span className="type-caption">{t("quote.onYourAccount")}</span>
        <span className="type-section tnum">${formatMoney(total, locale)}</span>
      </div>
    </div>
  );
}
