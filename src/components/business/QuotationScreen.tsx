"use client";

import { useMemo, useState } from "react";
import { calculateQuote, validateQuote } from "@/lib/pricing";
import { sailingsFor } from "@/lib/sailings";
import {
  INCOTERM_ORDER,
  INCOTERMS,
  allInTotal,
  chargeSections,
  type Incoterm,
} from "@/lib/charges";
import { useLocale, useT } from "../shell/LocaleProvider";
import { QuoteDocument } from "./QuoteDocument";
import { QuoteTicket } from "./QuoteTicket";
import { SailingList } from "./SailingList";
import { SearchPanel, type SearchState } from "./SearchPanel";

const INITIAL: SearchState = {
  pol: "JPYOK",
  pod: "SGSIN",
  containerType: "20GP",
  tier: "SILVER_SAIL",
  cbm: 90 as number | "",
};

export function QuotationScreen() {
  const [form, setForm] = useState<SearchState>(INITIAL);
  const [query, setQuery] = useState<SearchState>(INITIAL);
  const [sailingId, setSailingId] = useState<string>("");
  const [incoterm, setIncoterm] = useState<Incoterm>("FOB");
  /*
   * The locale comes from the nav, not from this screen.
   *
   * There was a second <select> right here, which is how the site ended up
   * with two language controls that disagreed: switching in the nav left the
   * ticket English, and switching here left the rest of the page English.
   * One control, one locale.
   */
  const t = useT();
  const { locale } = useLocale();

  // pricing.ts owns the rules and the limit. The screen used to restate both,
  // so changing MAX_CBM moved the constant and the tested validator while the
  // two live copies -- this comparison and the input's max -- stayed at 2000.
  const errors = validateQuote({ ...form, cbm: form.cbm === "" ? "" : form.cbm });
  const error = errors.pod ?? errors.cbm ?? null;
  const errorText = error ? t(error.key, error.vars) : null;

  const sailings = useMemo(
    () => sailingsFor(query.pol, query.pod),
    [query.pol, query.pod],
  );

  const quote = useMemo(
    () =>
      calculateQuote({
        pol: query.pol,
        pod: query.pod,
        cbm: query.cbm === "" ? 1 : query.cbm,
        containerType: query.containerType,
        tier: query.tier,
      }),
    [query],
  );

  // Falling back to the recommended sailing rather than storing it means a new
  // search never leaves a selection pointing at a sailing on the old lane.
  const selected =
    sailings.find((s) => s.id === sailingId) ??
    sailings.find((s) => s.recommended) ??
    sailings[0];

  // The SAME figure the ticket prints as its all-in total, built by the same
  // function from the same arguments. It used to be pricing.ts's `total` —
  // freight, THC, documentation and BAF — while the ticket below itemised
  // origin, ocean and destination in full, so a reader saw $4,008 on the
  // card and $4,937 on the invoice for one sailing and had no way to know
  // which was the price. Two formulas for one number is two numbers.
  const priceFor = (s: (typeof sailings)[number]) =>
    allInTotal(
      chargeSections({
        pol: query.pol,
        pod: query.pod,
        containerType: query.containerType,
        units: quote.units,
        oceanFreight: quote.oceanFreight * s.rateFactor,
        incoterm,
      }),
    );

  /*
   * The charge sections, built here and passed to both renderings.
   *
   * The ticket derives them from the same three arguments, so a second call is
   * not a second source of truth — but the document must be the SAME object
   * the reader is looking at, not a re-derivation that could drift if the
   * ticket's arguments ever change shape.
   */
  const sections = chargeSections({
    pol: query.pol,
    pod: query.pod,
    containerType: query.containerType,
    units: quote.units,
    oceanFreight: quote.oceanFreight * selected.rateFactor,
    incoterm,
  });

  return (
    <div className="flex flex-col gap-14">
      <SearchPanel
        value={form}
        error={errorText}
        onChange={setForm}
        onSearch={() => {
          if (error) return;
          setQuery(form);
          setSailingId("");
        }}
      />

      <SailingList
        sailings={sailings}
        pol={query.pol}
        pod={query.pod}
        selectedId={selected.id}
        priceFor={priceFor}
        onSelect={setSailingId}
      />

      <div className="flex flex-wrap items-end justify-between gap-6">
        <h2 className="type-section">{t("business.quotation")}</h2>

        <div className="flex flex-wrap items-end gap-6">
          <label className="flex flex-col gap-2">
            <span className="type-caption">{t("quote.incoterm")}</span>
            <select
              value={incoterm}
              onChange={(e) => setIncoterm(e.target.value as Incoterm)}
              className="w-72 border border-control bg-studio px-4 py-2.5 type-label rounded-card"
            >
              {INCOTERM_ORDER.map((term) => (
                <option key={term} value={term}>
                  {term} — {t(INCOTERMS[term].glossKey)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <QuoteTicket
        quote={quote}
        sailing={selected}
        pol={query.pol}
        pod={query.pod}
        containerType={query.containerType}
        incoterm={incoterm}
        locale={locale}
      />

      <QuoteDocument
        quote={quote}
        sailing={selected}
        sections={sections}
        incoterm={incoterm}
      />
    </div>
  );
}
