"use client";

import cn from "clsx";
import { useEffect, useMemo, useState } from "react";
import {
  FREIGHT_GROUPS,
  chargeSections,
  groupTotal,
  type ChargeLine,
  type ChargeSection,
  type FreightGroup,
  type TariffCurrency,
} from "@/lib/charges";
import { formatCurrency, formatDate, formatDateTime, formatMoney, formatWeekday } from "@/lib/localeFormat";
import { fetchRates, type FetchedRates } from "@/lib/quotationApi";
import { COMMODITIES, EQUIPMENT, PORTS } from "@/lib/pricing";
import { sailingAt, timelineFor, type Sailing } from "@/lib/sailings";
import type { QuoteResult } from "@/types/quote";
import { Flag, HUB_COUNTRY } from "../../atoms/Flag";
import { ArrowRight } from "../../atoms/icons/ArrowRight";
import { RouteLine } from "../../molecules/RouteLine";
import { useLocale, useT } from "../../providers/LocaleProvider";

/**
 * Page two of the real product: the options for the chosen departure.
 *
 * Observed 2026-09-11. Each option shows ETD and ETA, transhipments, transit
 * days, status, POL and POD, the service lane and vessel/voyage, a price
 * (the product calls it "budget") and an accept button, with a detail
 * toggle that opens a timeline of cut-offs, departure, transhipment and
 * arrival. Above the list: sort by ETD or ETA, a "freight view" of four
 * checkboxes that switch charge groups in and out of the price, and a
 * tariff/USD display toggle. To the left: a summary of the search and a
 * filter — POL, POD, route, service, price range.
 *
 * The price on every card is the sum of the checked groups. Untick origin
 * charges and every card drops by the same origin subtotal, which is how a
 * reader sees what a group costs without opening a ticket.
 */

const ALL_GROUPS: readonly FreightGroup[] = FREIGHT_GROUPS.map((g) => g.id);

type Sort = "etd" | "eta";
type Display = "usd" | "tariff";

export function OptionsList({
  quote,
  options,
  selectedId,
  onSelect,
  onAccept,
}: {
  quote: QuoteResult;
  options: Sailing[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAccept: (id: string) => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const [sort, setSort] = useState<Sort>("etd");
  const [groups, setGroups] = useState<Set<FreightGroup>>(new Set(ALL_GROUPS));
  const [display, setDisplay] = useState<Display>("usd");
  const [routes, setRoutes] = useState<Set<"direct" | "transship">>(new Set(["direct", "transship"]));
  const [services, setServices] = useState<Set<Sailing["serviceId"]>>(
    new Set(["direct", "transship", "express"]),
  );
  const [open, setOpen] = useState<string | null>(null);

  /*
   * The tariff display needs a rate per currency, and the site does not
   * carry one of its own: they come from the service, which fetched them
   * from the ECB. Until they arrive — or if they never do — the toggle
   * stays on USD and says why.
   */
  const [rates, setRates] = useState<FetchedRates | null | "unknown">("unknown");
  useEffect(() => {
    const ctrl = new AbortController();
    fetchRates(ctrl.signal).then((r) => {
      if (!ctrl.signal.aborted) setRates(r);
    });
    return () => ctrl.abort();
  }, []);
  const canShowTariff = rates !== "unknown" && rates !== null;

  /** A USD amount in the line's own currency, at the fetched rate. */
  const inTariff = (usd: number, ccy: TariffCurrency) =>
    ccy === "USD" || !canShowTariff ? usd : usd * (rates.usdTo[ccy] ?? 1);

  /** The card's price in tariff mode: one figure per currency present. */
  const byCurrency = (sections: ChargeSection[]) => {
    const sums = new Map<TariffCurrency, number>();
    for (const l of sections.flatMap((x) => x.lines)) {
      if (!groups.has(l.group)) continue;
      sums.set(l.currency, (sums.get(l.currency) ?? 0) + inTariff(l.amount, l.currency));
    }
    return [...sums.entries()];
  };

  // Sections per option, once. The same function the ticket calls.
  const priced = useMemo(
    () =>
      options.map((s) => ({
        sailing: s,
        sections: chargeSections({
          pol: quote.pol,
          pod: quote.pod,
          rows: quote.rows,
          originScope: quote.originScope,
          destinationScope: quote.destinationScope,
          oceanFreight: quote.oceanFreight * s.rateFactor,
        }),
      })),
    [options, quote],
  );

  const activeGroups = [...groups];
  const priceOf = (sections: ChargeSection[]) => groupTotal(sections, activeGroups);

  const prices = priced.map((p) => priceOf(p.sections));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const [priceCap, setPriceCap] = useState<number | null>(null);
  const cap = priceCap ?? maxPrice;

  const visible = priced
    .filter(({ sailing }) => routes.has(sailing.via ? "transship" : "direct"))
    .filter(({ sailing }) => services.has(sailing.serviceId))
    .filter(({ sections }) => priceOf(sections) <= cap)
    .sort((a, b) =>
      sort === "etd"
        ? a.sailing.etdOffset - b.sailing.etdOffset
        : a.sailing.etdOffset + a.sailing.transitDays - (b.sailing.etdOffset + b.sailing.transitDays),
    );

  const toggle = <T,>(set: Set<T>, v: T): Set<T> => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    return next;
  };

  const lineAmount = (l: ChargeLine) =>
    display === "usd"
      ? `$${formatMoney(l.amount, locale)}`
      : formatCurrency(inTariff(l.amount, l.currency), l.currency, locale);

  const check = (checked: boolean, onChange: () => void, label: string) => (
    <label className="inline-flex cursor-pointer items-center gap-2 type-caption text-charcoal">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-crimson" />
      {label}
    </label>
  );

  return (
    <section id="options" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="type-section">{t("options.title")}</h2>
          <p className="mt-1 type-caption">{t("options.lede", { n: visible.length })}</p>
        </div>

        {/* The three controls from the real page's header row. */}
        <div className="flex flex-wrap items-center gap-6">
          <fieldset className="flex items-center gap-3">
            <legend className="sr-only">{t("options.sort")}</legend>
            {(["etd", "eta"] as const).map((s) => (
              <label key={s} className="inline-flex cursor-pointer items-center gap-1.5 type-caption text-charcoal">
                <input type="radio" name="sort" checked={sort === s} onChange={() => setSort(s)} className="accent-crimson" />
                {t(`options.sort.${s}`)}
              </label>
            ))}
          </fieldset>
          <fieldset className="flex flex-wrap items-center gap-3">
            <legend className="sr-only">{t("options.freightView")}</legend>
            <span className="type-caption">{t("options.freightView")}:</span>
            {check(groups.size === ALL_GROUPS.length, () => setGroups(groups.size === ALL_GROUPS.length ? new Set() : new Set(ALL_GROUPS)), t("options.selectAll"))}
            {FREIGHT_GROUPS.map((g) => (
              <span key={g.id}>{check(groups.has(g.id), () => setGroups(toggle(groups, g.id)), t(g.labelKey))}</span>
            ))}
          </fieldset>
          <div className="flex flex-col items-end gap-1">
            <div role="radiogroup" aria-label={t("options.display")} className="flex overflow-hidden border border-control rounded-card">
              {(["usd", "tariff"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={display === d}
                  disabled={d === "tariff" && !canShowTariff}
                  onClick={() => setDisplay(d)}
                  className={cn(
                    "px-3 py-1.5 type-caption transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
                    display === d ? "bg-charcoal text-studio" : "bg-studio text-muted hover:text-charcoal",
                  )}
                >
                  {t(`options.display.${d}`)}
                </button>
              ))}
            </div>
            <span className="type-caption">
              {canShowTariff
                ? rates.mode === "cached"
                  ? t("options.tariffNoteCached", {
                      source: rates.source.toUpperCase(),
                      asOf: rates.asOf,
                      storedAt: formatDateTime(Date.parse(rates.fetchedAt), locale),
                    })
                  : t("options.tariffNote", { source: rates.source.toUpperCase(), asOf: rates.asOf })
                : rates === null
                  ? t("options.tariffOffline")
                  : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        {/* ── Summary and filter ─────────────────────────────── */}
        <aside className="flex flex-col gap-6">
          <div className="border border-border bg-studio p-5 rounded-card">
            <h3 className="type-overline text-muted">{t("options.summary")}</h3>
            <dl className="mt-3 flex flex-col gap-2 type-caption">
              {[
                [t("business.search.from"), `${PORTS[quote.pol].city} (${quote.pol})`],
                [t("business.search.to"), `${PORTS[quote.pod].city} (${quote.pod})`],
                [t("business.search.containers"), quote.rows.map((r) => `${r.quantity} × ${EQUIPMENT[r.equipment].label}`).join(", ")],
                [t("business.search.commodity"), t(COMMODITIES[quote.commodity].labelKey)],
                [t("options.etdFrom"), formatDate(sailingAt(options[0]?.etdOffset ?? 0), locale)],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-charcoal">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="border border-border bg-studio p-5 rounded-card">
            <h3 className="type-overline text-muted">{t("options.filter")}</h3>
            <div className="mt-3 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="type-caption">POL</span>
                <span className="type-label">{quote.pol}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="type-caption">POD</span>
                <span className="type-label">{quote.pod}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="type-caption">{t("options.route")}</span>
                {check(routes.has("direct"), () => setRoutes(toggle(routes, "direct")), t("sail.route.direct"))}
                {check(routes.has("transship"), () => setRoutes(toggle(routes, "transship")), t("sail.route.stops", { n: 1 }))}
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="type-caption">{t("options.service")}</span>
                {(["direct", "transship", "express"] as const).map((s) => (
                  <span key={s}>{check(services.has(s), () => setServices(toggle(services, s)), t(`service.id.${s}`))}</span>
                ))}
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="flex justify-between type-caption">
                  <span>{t("options.priceUpTo")}</span>
                  <span className="tnum">${formatMoney(cap, locale)}</span>
                </span>
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  step={1}
                  value={cap}
                  onChange={(e) => setPriceCap(Number(e.target.value))}
                  className="accent-crimson"
                />
                <span className="flex justify-between type-caption tnum">
                  <span>${formatMoney(minPrice, locale)}</span>
                  <span>${formatMoney(maxPrice, locale)}</span>
                </span>
              </label>
            </div>
          </div>
        </aside>

        {/* ── The options ────────────────────────────────────── */}
        <ul className="flex flex-col gap-4">
          {visible.length === 0 ? (
            <li className="border border-border p-6 type-caption rounded-card">{t("options.none")}</li>
          ) : null}
          {visible.map(({ sailing: s, sections }) => {
            const price = priceOf(sections);
            const isSelected = s.id === selectedId;
            const isOpen = open === s.id;
            const etd = sailingAt(s.etdOffset);
            const eta = sailingAt(s.etdOffset + s.transitDays);
            return (
              <li
                key={s.id}
                className={cn(
                  "border rounded-card transition-colors duration-150",
                  isSelected ? "border-crimson bg-tint shadow-raised" : "border-border bg-studio shadow-card",
                )}
              >
                <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,1.3fr)_minmax(0,0.9fr)_auto] lg:items-center">
                  <div className="flex flex-col gap-1.5">
                    {s.recommended ? <span className="type-eyebrow">{t("business.sailings.recommended")}</span> : null}
                    <span className="type-label">{s.vessel} {s.voyage}</span>
                    <span className="type-caption">
                      {s.serviceLane} · {t(s.serviceKey)}
                    </span>
                    <span
                      className={cn(
                        "w-fit whitespace-nowrap border px-2 py-0.5 type-caption rounded-sharp",
                        s.status === "available" ? "border-charcoal text-charcoal" : "border-control text-muted",
                      )}
                    >
                      {t(`status.${s.status}`)}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="type-caption">{t("quote.departs")}</span>
                    <span className="type-label tnum">{formatDate(etd, locale)}</span>
                    <span className="type-caption">
                      {formatWeekday(etd, locale)} · <Flag country={PORTS[quote.pol].country} /> {quote.pol}
                    </span>
                  </div>

                  <RouteLine pol={quote.pol} pod={quote.pod} via={s.via} transitDays={s.transitDays} />

                  <div className="flex flex-col">
                    <span className="type-caption">{t("quote.arrives")}</span>
                    <span className="type-label tnum">{formatDate(eta, locale)}</span>
                    <span className="type-caption">
                      {formatWeekday(eta, locale)} · <Flag country={PORTS[quote.pod].country} /> {quote.pod}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {display === "usd" ? (
                      <span className="type-section tnum">${formatMoney(price, locale)}</span>
                    ) : (
                      /* One figure per currency, as the tariffs are levied:
                         a reader sees what is yen, what is dollars, and that
                         they are not the same money. */
                      <span className="flex flex-col items-end">
                        {byCurrency(sections).map(([ccy, sum]) => (
                          <span key={ccy} className="type-label tnum">
                            {formatCurrency(sum, ccy, locale)}
                          </span>
                        ))}
                      </span>
                    )}
                    <span className="type-caption">{t("options.budget")}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : s.id)}
                        aria-expanded={isOpen}
                        className="border border-control bg-studio px-3 py-1.5 type-caption text-charcoal rounded-card transition-colors duration-150 hover:border-charcoal"
                      >
                        {t(isOpen ? "options.hideDetail" : "options.detail")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(s.id);
                          onAccept(s.id);
                        }}
                        disabled={s.status !== "available"}
                        className="inline-flex items-center gap-2 border border-crimson bg-crimson px-3 py-1.5 type-caption text-studio rounded-card transition-colors duration-150 hover:border-charcoal hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {t("options.accept")}
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {isOpen ? (
                  <div className="grid gap-8 border-t border-border p-5 lg:grid-cols-2">
                    {/* The timeline, in the order the product lists it. */}
                    <ol className="flex flex-col">
                      {timelineFor(s, quote.pol, quote.pod).map((e, i, all) => (
                        <li key={e.id} className="relative flex gap-4 pb-4 last:pb-0">
                          <span className="relative flex w-3 flex-col items-center">
                            <span
                              aria-hidden
                              className={cn(
                                "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                                e.id === "departure" || e.id === "arrival" ? "bg-charcoal" : "border border-charcoal bg-studio",
                              )}
                            />
                            {i < all.length - 1 ? <span aria-hidden className="w-px flex-1 bg-border" /> : null}
                          </span>
                          <span className="flex flex-1 items-baseline justify-between gap-4">
                            <span className="type-label">
                              {t(e.labelKey)}
                              {e.place ? (
                                <span className="ml-2 type-caption">
                                  {HUB_COUNTRY[e.place] ? <Flag country={HUB_COUNTRY[e.place]} /> : null} {e.place}
                                </span>
                              ) : null}
                            </span>
                            <span className="type-caption tnum">{formatDate(sailingAt(e.offsetDays), locale)}</span>
                          </span>
                        </li>
                      ))}
                    </ol>

                    {/* The charges, as the price on the card is made of them. */}
                    <dl className="flex flex-col gap-1.5">
                      {sections.flatMap((sec) =>
                        sec.lines.map((l) => (
                          <div
                            key={`${sec.id}-${l.code}`}
                            className={cn(
                              "flex items-baseline justify-between gap-4 type-caption",
                              groups.has(l.group) ? "text-charcoal" : "text-muted line-through",
                            )}
                          >
                            <dt>
                              <span className="type-label">{l.code}</span> {t(l.labelKey)}
                              <span className="ml-2">· {t(l.basisKey, l.basisVars)}</span>
                            </dt>
                            <dd className="tnum">{lineAmount(l)}</dd>
                          </div>
                        )),
                      )}
                      <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-border pt-2 type-label">
                        <dt>{t("options.budget")}</dt>
                        <dd className="flex flex-col items-end tnum">
                          {display === "usd"
                            ? `$${formatMoney(price, locale)}`
                            : byCurrency(sections).map(([ccy, sum]) => (
                                <span key={ccy}>{formatCurrency(sum, ccy, locale)}</span>
                              ))}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
