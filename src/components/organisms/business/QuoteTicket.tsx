"use client";

import cn from "clsx";
import {
  formatDate,
  formatDecimal,
  formatMoney,
  formatWeekday,
  localiseVars,
} from "@/lib/localeFormat";
import {
  INCOTERMS,
  accountTotal,
  allInTotal,
  chargeSections,
  type Incoterm,
} from "@/lib/charges";
import type { RemoteQuotation } from "@/lib/quotationApi";
import { t, type Locale } from "@/lib/i18n";
import { CONTAINERS, LOYALTY_TIERS, PORTS } from "@/lib/pricing";
import { Flag } from "../../atoms/Flag";
import {
  cutOffsFor,
  legsFor,
  sailingAt,
  voyageOf,
  type Sailing,
} from "@/lib/sailings";
import type { ContainerType, PortCode, QuoteResult } from "@/types/quote";

/**
 * The quotation as a ticket.
 *
 * A ticket is the right form because a quotation IS one: a named party, a named
 * vessel, a date, a price, and a moment after which none of it holds. The stub
 * carries what you act on; the body carries what you are charged. The perforation
 * is where the two separate, which is also where the eye should split them.
 *
 * Charges are grouped origin / ocean / destination because that is how they are
 * invoiced and because the Incoterm decides which of the three is yours. A
 * section that is not on your account is shown, dimmed, with its money struck —
 * hiding it would make the same shipment look cheaper under EXW than under DDP,
 * which is exactly the confusion Incoterms exist to prevent.
 */
function RemoteLine({
  remote,
  allIn,
  locale,
}: {
  remote: RemoteQuotation | null | "unknown";
  allIn: number;
  locale: Locale;
}) {
  if (remote === "unknown") return null;
  if (remote === null) {
    return (
      <p className="border-t border-border pt-3 type-caption">
        {t("quote.remote.offline", locale)}
      </p>
    );
  }
  const ccy = locale === "ja" ? "JPY" : "EUR";
  const fx = remote.alsoIn[ccy];
  const agrees = Math.abs(remote.selected.allIn - allIn) < 0.005;
  return (
    <div className="flex flex-col gap-1 border-t border-border pt-3">
      {fx ? (
        <p className="flex items-baseline justify-between gap-6">
          <span className="type-caption">{t("quote.remote.alsoIn", locale, { ccy })}</span>
          <span className="type-label tnum">
            {ccy === "JPY"
              ? `¥${formatMoney(Math.round(fx.value), locale).replace(/[.,]00$/, "")}`
              : `€${formatMoney(fx.value, locale)}`}
          </span>
        </p>
      ) : null}
      <p className="type-caption">
        {agrees
          ? t("quote.remote.agrees", locale, { ref: remote.reference })
          : t("quote.remote.differs", locale, { ref: remote.reference })}
        {fx
          ? " " + t("quote.remote.fx", locale, { asOf: fx.asOf, source: fx.source.toUpperCase() })
          : ""}
      </p>
    </div>
  );
}

export function QuoteTicket({
  quote,
  sailing,
  pol,
  pod,
  containerType,
  incoterm,
  locale = "en",
  remote = null,
}: {
  quote: QuoteResult;
  sailing: Sailing;
  pol: PortCode;
  pod: PortCode;
  containerType: ContainerType;
  incoterm: Incoterm;
  locale?: Locale;
  /** The service's answer for the same inputs; null when it is not there. */
  remote?: RemoteQuotation | null | "unknown";
}) {
  const sections = chargeSections({
    pol,
    pod,
    containerType,
    units: quote.units,
    oceanFreight: quote.oceanFreight * sailing.rateFactor,
    incoterm,
  });
  const yours = accountTotal(sections);
  const discount = Math.round(yours * quote.discountRate * 100) / 100;
  const payable = Math.round((yours - discount) * 100) / 100;
  const allIn = allInTotal(sections);

  const arrival = sailing.departsInDays + sailing.transitDays;
  const legs = legsFor(sailing, PORTS[pol].city, PORTS[pod].city);
  const cutOffs = cutOffsFor(sailing);

  return (
    <article className="overflow-hidden border border-border bg-studio rounded-card shadow-card">
      {/* ── Stub ─────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-start justify-between gap-6 bg-charcoal px-6 py-6 sm:px-8">
        <div>
          <p className="type-overline text-border">{t("quote.title", locale)}</p>
          <p className="mt-2 type-page text-studio tnum">{quote.quoteId}</p>
          <p className="mt-1 type-caption text-border">
            {incoterm} — {t(INCOTERMS[incoterm].glossKey, locale)}
          </p>
        </div>
        <div className="text-right">
          <p className="type-overline text-border">
            {t("quote.validity", locale)}
          </p>
          <p className="mt-2 type-section text-studio tnum">
            {quote.validityHours}h
          </p>
          <p className="mt-1 type-caption text-border">
            {t("notes.surcharge", locale)}
          </p>
        </div>
      </header>

      {/* ── Journey ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-8 px-6 py-7 sm:px-8">
        <div className="flex flex-col gap-1">
          <span className="type-overline text-muted">
            {t("quote.departs", locale)}
          </span>
          <span className="type-section">{PORTS[pol].city}</span>
          <span className="type-label tnum">
            {formatDate(sailingAt(sailing.departsInDays), locale)}
          </span>
          <span className="type-caption tnum">
            {formatWeekday(sailingAt(sailing.departsInDays), locale)} ·{" "}
            <Flag country={PORTS[pol].country} /> {pol}
          </span>
        </div>

        <div className="flex min-w-[10rem] flex-1 flex-col items-center gap-2 pt-6">
          <span className="type-caption tnum whitespace-nowrap">
            {t("quote.transitDays", locale, { days: sailing.transitDays })} ·{" "}
            {sailing.via
              ? t("quote.viaPort", locale, { port: sailing.via })
              : t("quote.direct", locale)}
          </span>
          <span aria-hidden className="flex w-full items-center">
            <span className="h-2 w-2 shrink-0 bg-charcoal rounded-full" />
            <span className="h-px flex-1 bg-charcoal" />
            {sailing.via ? (
              <>
                <span className="h-2 w-2 shrink-0 border border-charcoal bg-studio rounded-full" />
                <span className="h-px flex-1 bg-charcoal" />
              </>
            ) : null}
            <span className="h-2 w-2 shrink-0 bg-charcoal rounded-full" />
          </span>
        </div>

        <div className="flex flex-col items-end gap-1 text-right">
          <span className="type-overline text-muted">
            {t("quote.arrives", locale)}
          </span>
          <span className="type-section">{PORTS[pod].city}</span>
          <span className="type-label tnum">{formatDate(sailingAt(arrival), locale)}</span>
          <span className="type-caption tnum">
            {formatWeekday(sailingAt(arrival), locale)} ·{" "}
            <Flag country={PORTS[pod].country} /> {pod}
          </span>
        </div>
      </div>

      <dl className="grid gap-x-8 gap-y-4 border-t border-border px-6 py-6 sm:grid-cols-4 sm:px-8">
        {[
          [t("quote.vessel", locale), sailing.vessel],
          [t("quote.voyage", locale), voyageOf(sailing)],
          [
            t("quote.container", locale),
            `${CONTAINERS[containerType].label} × ${quote.units}`,
          ],
          [t("quote.tier", locale), LOYALTY_TIERS[quote.tier].label],
        ].map(([term, value]) => (
          <div key={term} className="flex flex-col gap-0.5">
            <dt className="type-caption">{term}</dt>
            <dd className="type-label">{value}</dd>
          </div>
        ))}
      </dl>

      {legs.length > 1 ? (
        <ol className="flex flex-col gap-2 border-t border-border px-6 py-5 sm:px-8">
          {legs.map((leg, i) => (
            <li
              key={`${leg.from}-${leg.to}`}
              className="flex items-baseline justify-between gap-6"
            >
              <span className="type-body">
                <span className="type-caption">Leg {i + 1}</span> {leg.from} →{" "}
                {leg.to}
              </span>
              <span className="type-label tnum">
                {t("quote.transitDays", locale, { days: leg.days })}
              </span>
            </li>
          ))}
        </ol>
      ) : null}

      {/* ── Perforation ──────────────────────────────────────── */}
      <div className="relative">
        <span
          aria-hidden
          className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 border border-border bg-canvas rounded-full"
        />
        <span
          aria-hidden
          className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 border border-border bg-canvas rounded-full"
        />
        <span
          aria-hidden
          className="mx-8 block border-t border-dashed border-control"
        />
      </div>

      {/* ── Charges ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-7 px-6 py-7 sm:px-8">
        {sections.map((section) => (
          <section key={section.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3
                className={cn(
                  "type-overline",
                  section.onAccount ? "text-charcoal" : "text-muted",
                )}
              >
                {section.port
                  ? t("section.withPort", locale, {
                      section: t(section.titleKey, locale),
                      port: section.port,
                    })
                  : t(section.titleKey, locale)}
              </h3>
              <span
                className={cn(
                  "type-caption",
                  !section.onAccount && "text-muted",
                )}
              >
                {section.onAccount
                  ? t("quote.onYourAccount", locale)
                  : t("quote.counterpartyAccount", locale)}
              </span>
            </div>

            <dl className="mt-3 flex flex-col">
              {section.lines.map((line) => (
                <div
                  key={line.code}
                  className={cn(
                    "flex items-baseline justify-between gap-6 border-b border-border py-2.5",
                    !section.onAccount && "text-muted",
                  )}
                >
                  <dt className="type-body">
                    <span className="type-label tnum">{line.code}</span>{" "}
                    {t(line.labelKey, locale)}
                    <span className="type-caption">
                      {" "}
                      · {t(line.basisKey, locale, localiseVars(line.basisVars, locale))}
                    </span>
                  </dt>
                  <dd
                    className={cn(
                      "type-label tnum",
                      !section.onAccount && "line-through",
                    )}
                  >
                    ${formatMoney(line.amount, locale)}
                  </dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-6 pt-3">
                <dt className="type-label">{t("quote.subtotal", locale)}</dt>
                <dd
                  className={cn(
                    "type-label tnum",
                    !section.onAccount && "text-muted line-through",
                  )}
                >
                  ${formatMoney(section.subtotal, locale)}
                </dd>
              </div>
            </dl>
          </section>
        ))}
      </div>

      {/* ── Total ────────────────────────────────────────────── */}
      <footer className="flex flex-col gap-4 border-t-2 border-charcoal bg-canvas px-6 py-7 sm:px-8">
        <p className="type-caption">
          {t(INCOTERMS[incoterm].noteKey, locale)}
        </p>

        <div className="flex items-baseline justify-between gap-6">
          <span className="type-body">{t("quote.onYourAccount", locale)}</span>
          <span className="type-label tnum">${formatMoney(yours, locale)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-6">
          <span className="type-body">
            {LOYALTY_TIERS[quote.tier].label} ·{" "}
            {formatDecimal(quote.discountRate * 100, locale, 2)}%
          </span>
          <span className="type-label tnum">−${formatMoney(discount, locale)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-6 border-t border-border pt-4">
          <span className="type-section">{t("quote.total", locale)}</span>
          <span className="type-page tnum">${formatMoney(payable, locale)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-6">
          <span className="type-caption">{t("quote.allIn", locale)}</span>
          <span className="type-caption tnum">${formatMoney(allIn, locale)}</span>
        </div>
        {/* Two totals need one sentence between them, or a reader picks the
            wrong one. "Yours" is whichever side the Incoterm puts you on. */}
        <p className="type-caption">
          {t("quote.totalsNote", locale, { code: incoterm })}
        </p>

        {/*
          The one line the browser cannot produce on its own: the all-in total
          in the reader's currency at a rate the ECB actually published, from
          the quotation service. Absent when the service is not running, and
          it says so rather than showing a rate it made up.
        */}
        <RemoteLine remote={remote} allIn={allIn} locale={locale} />
        <p className="type-caption tnum">
          {quote.teuAccrued} TEU ·{" "}
          {t("quote.nextMilestone", locale, { teu: quote.nextMilestoneTeu })}
        </p>
      </footer>

      {/* ── Cut-offs and what is not in the price ────────────── */}
      <div className="grid gap-8 border-t border-border px-6 py-7 sm:px-8 lg:grid-cols-2">
        <div>
          <h3 className="type-label">{t("cutoff.title", locale)}</h3>
          <p className="mt-2 type-caption">{t("cutoff.lede", locale)}</p>
          <dl className="mt-4 flex flex-col">
            {cutOffs.map((cut) => (
              <div
                key={cut.labelKey}
                className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 last:border-b-0"
              >
                <dt className="type-body">{t(cut.labelKey, locale)}</dt>
                <dd className="type-label tnum">
                  {formatDate(sailingAt(cut.offsetDays), locale)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="type-label">{t("freetime.title", locale)}</h3>
          <p className="type-caption">{t("freetime.body", locale)}</p>
          <h3 className="mt-2 type-label">{t("notes.title", locale)}</h3>
          <ul className="flex list-disc flex-col gap-1.5 pl-4 type-caption">
            <li>{t("notes.estimates", locale)}</li>
            <li>
              {t("notes.validity", locale, { hours: quote.validityHours })}
            </li>
            {/* Under DDP the seller carries duties, so a flat "duties not
                included" under the DDP gloss was the ticket contradicting
                itself two lines apart. The note now says what is true of
                THIS quote: duties are the seller's, and are not priced here. */}
            <li>
              {t(
                incoterm === "DDP" ? "notes.excludedDdp" : "notes.excluded",
                locale,
              )}
            </li>
          </ul>
        </div>
      </div>
    </article>
  );
}
