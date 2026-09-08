"use client";

import { useMemo, useState } from "react";
import { CONTAINERS, calculateQuote } from "@/lib/pricing";
import { quoteForSailing, sailingsFor } from "@/lib/sailings";
import { QuoteBreakdown } from "./QuoteBreakdown";
import { RouteDetails } from "./RouteDetails";
import { SailingList } from "./SailingList";
import { SearchPanel, type SearchState } from "./SearchPanel";

const INITIAL: SearchState = {
  pol: "JPYOK",
  pod: "SGSIN",
  containerType: "20GP",
  tier: "SILVER_SAIL",
  cbm: 90,
};

export function QuotationScreen() {
  const [form, setForm] = useState<SearchState>(INITIAL);
  const [query, setQuery] = useState<SearchState>(INITIAL);
  const [sailingId, setSailingId] = useState<string>("");

  const error =
    form.pol === form.pod
      ? "Origin and destination must be different ports."
      : form.cbm < 1 || form.cbm > 2000
        ? "Volume must be between 1 and 2000 CBM."
        : null;

  const sailings = useMemo(
    () => sailingsFor(query.pol, query.pod),
    [query.pol, query.pod],
  );

  const quote = useMemo(
    () =>
      calculateQuote({
        pol: query.pol,
        pod: query.pod,
        cbm: query.cbm,
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

      <RouteDetails
        sailing={selected}
        pol={query.pol}
        pod={query.pod}
        containerType={query.containerType}
        units={quote.units}
      />

      <QuoteBreakdown
        quote={quote}
        sailing={selected}
        pol={query.pol}
        pod={query.pod}
      />
    </div>
  );
}
