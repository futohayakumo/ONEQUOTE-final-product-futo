"use client";

import { formatDate, formatDateTime, formatDecimal, formatMoney, formatWeekday, localiseVars } from "@/lib/localeFormat";
import { allInTotal, type ChargeSection } from "@/lib/charges";
import { t, type Locale } from "@/lib/i18n";
import { COMMODITIES, EQUIPMENT, LOYALTY_TIERS } from "@/lib/pricing";
import { portName } from "@/lib/ports";
import type { RemoteQuotation } from "@/lib/quotationApi";
import { cutOffsFor, legsFor, sailingAt, type Sailing } from "@/lib/sailings";
import { FREE_TIME_INCLUDED_DAYS, vasLines, vasTotal, type VasSelection } from "@/lib/vas";
import type { QuoteResult } from "@/types/quote";
import { Flag, HUB_COUNTRY } from "../../atoms/Flag";

/**
 * The quotation as a ticket.
 *
 * A ticket is the right form because a quotation IS one: a named party, a
 * named vessel, a date, a price, and a moment after which none of it holds.
 * The stub carries what you act on; the body carries what you are charged.
 *
 * Charges are grouped origin / ocean / destination because that is how they
 * are invoiced. There is one total. The earlier ticket split the sections by
 * Incoterm into "yours" and "the other party's" and printed two totals; a
 * carrier's quotation does not do that — the scope at each end (CY or Door)
 * decides which charges exist, and all of them are on the quotation.
 */

function RemoteLine({
  remote,
  payable,
  locale,
}: {
  remote: RemoteQuotation | null | "unknown";
  payable: number;
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
  const agrees = Math.abs(remote.selected.payable - payable) < 0.005;
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
          ? " " +
            (remote.provenance.exchangeRates.mode === "cached"
              ? t("quote.remote.fxCached", locale, {
                  asOf: fx.asOf,
                  source: fx.source.toUpperCase(),
                  storedAt: formatDateTime(Date.parse(fx.fetchedAt), locale),
                })
              : t("quote.remote.fx", locale, { asOf: fx.asOf, source: fx.source.toUpperCase() }))
          : ""}
      </p>
    </div>
  );
}

export function QuoteTicket({
  quote,
  sailing,
  sections,
  vas,
  locale = "en",
  remote = null,
}: {
  quote: QuoteResult;
  sailing: Sailing;
  sections: ChargeSection[];
  vas: VasSelection;
  locale?: Locale;
  /** The service's answer for the same inputs; null when it is not there. */
  remote?: RemoteQuotation | null | "unknown";
}) {
  const { pol, pod } = quote;
  const charges = allInTotal(sections);
  const discount = Math.round(quote.oceanFreight * sailing.rateFactor * quote.discountRate * 100) / 100;
  const extras = vasLines(vas, quote.units);
  const extrasTotal = vasTotal(vas, quote.units);
  const payable = Math.round((charges - discount + extrasTotal) * 100) / 100;

  const arrival = sailing.etdOffset + sailing.transitDays;
  const legs = legsFor(sailing, portName(pol), portName(pod));
  const cutOffs = cutOffsFor(sailing);

  return (
    <article className="overflow-hidden border border-border bg-studio rounded-card shadow-card">
      {/* ── Stub ─────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-start justify-between gap-6 bg-charcoal px-6 py-6 sm:px-8">
        <div>
          <p className="type-overline text-border">{t("quote.title", locale)}</p>
          <p className="mt-2 type-page text-studio tnum">{quote.quoteId}</p>
          <p className="mt-1 type-caption text-border">
            {t("quote.scopeLine", locale, {
              origin: t(`scope.${quote.originScope}`, locale),
              destination: t(`scope.${quote.destinationScope}`, locale),
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="type-overline text-border">{t("quote.validity", locale)}</p>
          <p className="mt-2 type-section text-studio tnum">{quote.validityHours}h</p>
          <p className="mt-1 max-w-[36ch] type-caption text-border">{t("notes.surcharge", locale)}</p>
        </div>
      </header>

      {/* ── Route ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-8 px-6 py-7 sm:px-8">
        <div className="flex flex-col gap-1">
          <span className="type-overline text-muted">{t("quote.departs", locale)}</span>
          <span className="type-section">{portName(pol)}</span>
          <span className="type-label tnum">{formatDate(sailingAt(sailing.etdOffset), locale)}</span>
          <span className="type-caption">
            {formatWeekday(sailingAt(sailing.etdOffset), locale)} · <Flag country={pol.slice(0, 2)} /> {pol}
          </span>
        </div>

        <div className="flex min-w-[10rem] flex-1 flex-col items-center gap-2 pt-6">
          <span className="type-caption">
            {t("quote.transitDays", locale, { days: sailing.transitDays })} ·{" "}
            {sailing.via ? t("quote.viaPort", locale, { port: sailing.via }) : t("quote.direct", locale)}
          </span>
          <span aria-hidden className="flex w-full items-center">
            <span className="h-2 w-2 bg-charcoal rounded-full" />
            <span className="h-px flex-1 bg-charcoal" />
            {sailing.via ? (
              <>
                <span className="h-2 w-2 border border-charcoal bg-studio rounded-full" />
                <span className="h-px flex-1 bg-charcoal" />
              </>
            ) : null}
            <span className="h-2 w-2 bg-charcoal rounded-full" />
          </span>
          {sailing.via ? (
            <span className="type-caption">
              {legs.map((l) => `${l.from} → ${l.to} ${t("quote.transitDays", locale, { days: l.days })}`).join(" · ")}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-1 text-right">
          <span className="type-overline text-muted">{t("quote.arrives", locale)}</span>
          <span className="type-section">{portName(pod)}</span>
          <span className="type-label tnum">{formatDate(sailingAt(arrival), locale)}</span>
          <span className="type-caption">
            {formatWeekday(sailingAt(arrival), locale)} · <Flag country={pod.slice(0, 2)} /> {pod}
          </span>
        </div>
      </div>

      {/* ── Facts ────────────────────────────────────────────── */}
      <dl className="grid gap-x-8 gap-y-4 border-t border-border px-6 py-6 sm:grid-cols-4 sm:px-8">
        {[
          [t("quote.vessel", locale), `${sailing.vessel} · ${sailing.voyage}`],
          [t("quote.serviceLane", locale), `${sailing.serviceLane} · ${t(sailing.serviceKey, locale)}`],
          [t("quote.commodity", locale), t(COMMODITIES[quote.commodity].labelKey, locale)],
          [t("quote.tier", locale), LOYALTY_TIERS[quote.tier].label],
        ].map(([term, value]) => (
          <div key={term} className="flex flex-col gap-0.5">
            <dt className="type-caption">{term}</dt>
            <dd className="type-label">{value}</dd>
          </div>
        ))}
      </dl>

      {/* ── Containers ───────────────────────────────────────── */}
      <ol className="flex flex-col gap-2 border-t border-border px-6 py-5 sm:px-8">
        {quote.rows.map((r) => (
          <li key={r.equipment} className="flex items-baseline justify-between gap-6">
            <span className="type-label">
              {r.quantity} × {EQUIPMENT[r.equipment].label}
              {r.reefer ? <span className="ml-2 type-caption">{t("quote.reefer", locale)}</span> : null}
              {r.overweight ? <span className="ml-2 type-caption text-crimson">{t("quote.overweight", locale)}</span> : null}
            </span>
            <span className="type-caption tnum">
              {formatDecimal(r.weightKg, locale, 0)} kg · {r.teu} TEU
            </span>
          </li>
        ))}
      </ol>

      {/* ── Charges ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-7 border-t border-border px-6 py-7 sm:px-8">
        {sections.map((section) => (
          <section key={section.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="type-overline text-charcoal">
                {section.port
                  ? t("section.withPort", locale, { section: t(section.titleKey, locale), port: section.port })
                  : t(section.titleKey, locale)}
                {section.scope ? <span className="ml-2 text-muted">· {t(`scope.${section.scope}`, locale)}</span> : null}
              </h3>
            </div>
            <dl className="mt-3 flex flex-col">
              {section.lines.map((line) => (
                <div
                  key={line.code}
                  className="flex items-baseline justify-between gap-6 border-b border-border py-2.5 last:border-b-0"
                >
                  <dt className="type-body">
                    <span className="type-label">{line.code}</span> {t(line.labelKey, locale)}
                    <span className="ml-2 type-caption">
                      · {t(line.basisKey, locale, localiseVars(line.basisVars, locale))}
                    </span>
                  </dt>
                  <dd className="type-label tnum">${formatMoney(line.amount, locale)}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-6 pt-3">
                <dt className="type-label">{t("quote.subtotal", locale)}</dt>
                <dd className="type-label tnum">${formatMoney(section.subtotal, locale)}</dd>
              </div>
            </dl>
          </section>
        ))}

        {extras.length ? (
          <section>
            <h3 className="type-overline text-charcoal">{t("vas.title", locale)}</h3>
            <dl className="mt-3 flex flex-col">
              {extras.map((line) => (
                <div key={line.id} className="flex items-baseline justify-between gap-6 border-b border-border py-2.5 last:border-b-0">
                  <dt className="type-body">
                    {t(line.labelKey, locale)}
                    <span className="ml-2 type-caption">· {t(line.basisKey, locale, localiseVars(line.basisVars, locale))}</span>
                  </dt>
                  <dd className="type-label tnum">${formatMoney(line.amount, locale)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>

      {/* ── Totals ───────────────────────────────────────────── */}
      <footer className="flex flex-col gap-3 border-t border-border bg-canvas px-6 py-6 sm:px-8">
        <div className="flex items-baseline justify-between gap-6">
          <span className="type-body">{t("quote.charges", locale)}</span>
          <span className="type-label tnum">${formatMoney(charges, locale)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-6">
          <span className="type-body">
            {LOYALTY_TIERS[quote.tier].label} · {formatDecimal(quote.discountRate * 100, locale, 2)}%{" "}
            <span className="type-caption">{t("quote.discountOn", locale)}</span>
          </span>
          <span className="type-label tnum">−${formatMoney(discount, locale)}</span>
        </div>
        {extrasTotal > 0 ? (
          <div className="flex items-baseline justify-between gap-6">
            <span className="type-body">{t("vas.title", locale)}</span>
            <span className="type-label tnum">${formatMoney(extrasTotal, locale)}</span>
          </div>
        ) : null}
        <div className="flex items-baseline justify-between gap-6 border-t border-border pt-4">
          <span className="type-section">{t("quote.total", locale)}</span>
          <span className="type-page tnum">${formatMoney(payable, locale)}</span>
        </div>
        <p className="type-caption tnum">
          {quote.teuAccrued} TEU · {t("quote.nextMilestone", locale, { teu: quote.nextMilestoneTeu })}
        </p>

        <RemoteLine remote={remote} payable={payable} locale={locale} />
      </footer>

      {/* ── Cut-offs and free time ───────────────────────────── */}
      <div className="grid gap-8 border-t border-border px-6 py-7 sm:px-8 lg:grid-cols-2">
        <div>
          <h3 className="type-label">{t("cutoff.title", locale)}</h3>
          <p className="mt-2 type-caption">{t("cutoff.lede", locale)}</p>
          <dl className="mt-4 flex flex-col">
            {cutOffs.map((cut) => (
              <div key={cut.id} className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 last:border-b-0">
                <dt className="type-body">{t(cut.labelKey, locale)}</dt>
                <dd className="type-label tnum">{formatDate(sailingAt(cut.offsetDays), locale)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="type-label">{t("freetime.title", locale, { days: FREE_TIME_INCLUDED_DAYS })}</h3>
          <p className="type-caption">{t("freetime.body", locale)}</p>
          <h3 className="mt-2 type-label">{t("notes.title", locale)}</h3>
          <ul className="flex list-disc flex-col gap-1.5 pl-4 type-caption">
            <li>{t("notes.estimates", locale)}</li>
            <li>{t("notes.validity", locale, { hours: quote.validityHours })}</li>
            <li>{t("notes.excluded", locale)}</li>
            <li>{t("notes.model", locale)}</li>
          </ul>
          {sailing.via && HUB_COUNTRY[sailing.via] ? (
            <p className="type-caption">
              {t("quote.viaPort", locale, { port: sailing.via })} <Flag country={HUB_COUNTRY[sailing.via]} />
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
