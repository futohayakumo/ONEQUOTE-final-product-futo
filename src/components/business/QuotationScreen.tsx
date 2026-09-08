"use client";

import { useMemo, useState } from "react";
import { CONTAINERS, calculateQuote, validateQuote } from "@/lib/pricing";
import { quoteForSailing, sailingsFor } from "@/lib/sailings";
import { INCOTERM_ORDER, INCOTERMS, type Incoterm } from "@/lib/charges";
import { LOCALES, type Locale } from "@/lib/i18n";
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
  const [locale, setLocale] = useState<Locale>("en");

  // pricing.ts owns the rules and the limit. The screen used to restate both,
  // so changing MAX_CBM moved the constant and the tested validator while the
  // two live copies -- this comparison and the input's max -- stayed at 2000.
  const errors = validateQuote({ ...form, cbm: form.cbm === "" ? "" : form.cbm });
  const error = errors.pod ?? errors.cbm ?? null;

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

  // Same function the breakdown uses. Two formulas for one number is two
  // numbers, eventually.
  const priceFor = (s: (typeof sailings)[number]) =>
    quoteForSailing(
      { ...quote, containerLabel: CONTAINERS[quote.containerType].label },
      s,
    ).total;

  return (
    <div className="flex flex-col gap-14">
      <SearchPanel
        value={form}
        error={error}
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
        <h2 className="type-section">Your quotation</h2>

        <div className="flex flex-wrap items-end gap-6">
          <label className="flex flex-col gap-2">
            <span className="type-caption">Incoterm</span>
            <select
              value={incoterm}
              onChange={(e) => setIncoterm(e.target.value as Incoterm)}
              className="w-72 border border-control bg-studio px-4 py-2.5 type-label rounded-card"
            >
              {INCOTERM_ORDER.map((term) => (
                <option key={term} value={term}>
                  {INCOTERMS[term].label}
                </option>
              ))}
            </select>
          </label>

          {/* The bundles are pulled from Lokalise at build time; this only
              chooses which one resolves. See src/lib/i18n.ts. */}
          <label className="flex flex-col gap-2">
            <span className="type-caption">Language</span>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="w-32 border border-control bg-studio px-4 py-2.5 type-label rounded-card"
            >
              {LOCALES.map((l) => (
                <option key={l} value={l}>
                  {l === "en" ? "English" : "日本語"}
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
    </div>
  );
}
