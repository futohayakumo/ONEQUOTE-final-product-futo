"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { allInTotal, chargeSections } from "@/lib/charges";
import { calculateQuote, emptyRow, validateQuote } from "@/lib/pricing";
import { fetchQuotation, type RemoteQuotation } from "@/lib/quotationApi";
import { optionsFrom, scheduleFor, type Sailing } from "@/lib/sailings";
import { NO_VAS, type VasSelection } from "@/lib/vas";
import type { QuoteInput } from "@/types/quote";
import { ArrowRight } from "../../atoms/icons/ArrowRight";
import { useLocale, useT } from "../../providers/LocaleProvider";
import { OptionsList } from "./OptionsList";
import { QuoteDocument } from "./QuoteDocument";
import { QuoteTicket } from "./QuoteTicket";
import { SearchPanel, type SearchState } from "./SearchPanel";
import { VasPanel } from "./VasPanel";

/**
 * The three pages of the real ONE QUOTE flow, on one screen.
 *
 * Page one is the form. Page two, the options for the chosen departure,
 * appears under it on search. Page three — the accepted option restated,
 * the value-added services, the ticket and the document — appears under
 * that on accept. One route, statically rendered, and a reader who lands
 * here sees the form first, which is what the product does too.
 */

const INITIAL: SearchState = {
  pol: "JPYOK",
  pod: "SGSIN",
  containers: [emptyRow("DRY20")],
  commodity: "GENERAL",
  tier: "SILVER_SAIL",
  originScope: "CY",
  destinationScope: "CY",
  etdOffset: 0,
};

/** The form as a strict input, once validation has passed. */
type Strict = QuoteInput & {
  pol: Exclude<QuoteInput["pol"], "">;
  pod: Exclude<QuoteInput["pod"], "">;
  commodity: Exclude<QuoteInput["commodity"], "">;
  tier: Exclude<QuoteInput["tier"], "">;
  etdOffset: number;
};

export function QuotationScreen() {
  const [form, setForm] = useState<SearchState>(INITIAL);
  const [query, setQuery] = useState<Strict | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [accepted, setAccepted] = useState(false);
  const [vas, setVas] = useState<VasSelection>(NO_VAS);
  const [remote, setRemote] = useState<RemoteQuotation | null | "unknown">("unknown");
  const t = useT();
  const { locale } = useLocale();
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const confirmRef = useRef<HTMLDivElement | null>(null);

  const errors = validateQuote(form);
  const firstError =
    errors.pol ?? errors.pod ?? errors.containers ?? errors.commodity ?? errors.tier ?? errors.etd ?? null;
  const errorText = firstError ? t(firstError.key, firstError.vars) : null;

  /*
   * The calendar's price chips: the cheapest all-in on a day, for the
   * containers and scope as currently typed. Recomputed from the form, not
   * the query, so the chips answer "what would this cost" before search.
   */
  const formIsPriceable =
    !!form.pol && !!form.pod && form.pol !== form.pod && !!form.commodity && !!form.tier;
  const draft = formIsPriceable ? calculateQuote(form as Strict) : null;
  const priceForDay = (etdOffset: number): number | null => {
    if (!draft) return null;
    const day = scheduleFor(draft.pol, draft.pod).filter((s) => s.etdOffset === etdOffset);
    if (!day.length) return null;
    return Math.min(
      ...day.map((s) =>
        allInTotal(
          chargeSections({
            pol: draft.pol,
            pod: draft.pod,
            rows: draft.rows,
            originScope: draft.originScope,
            destinationScope: draft.destinationScope,
            oceanFreight: draft.oceanFreight * s.rateFactor,
          }),
        ),
      ),
    );
  };

  const quote = useMemo(() => (query ? calculateQuote(query) : null), [query]);
  const options = useMemo<Sailing[]>(
    () => (query ? optionsFrom(query.pol, query.pod, query.etdOffset) : []),
    [query],
  );
  const selected =
    options.find((s) => s.id === selectedId) ?? options.find((s) => s.recommended) ?? options[0];

  const sections = useMemo(
    () =>
      quote && selected
        ? chargeSections({
            pol: quote.pol,
            pod: quote.pod,
            rows: quote.rows,
            originScope: quote.originScope,
            destinationScope: quote.destinationScope,
            oceanFreight: quote.oceanFreight * selected.rateFactor,
          })
        : null,
    [quote, selected],
  );

  // The service's answer for the accepted option, when the service is there.
  useEffect(() => {
    if (!query || !selected || !accepted) return;
    const ctrl = new AbortController();
    Promise.resolve().then(() => {
      if (!ctrl.signal.aborted) setRemote("unknown");
    });
    fetchQuotation(
      {
        pol: query.pol,
        pod: query.pod,
        containers: query.containers,
        commodity: query.commodity,
        tier: query.tier,
        originScope: query.originScope,
        destinationScope: query.destinationScope,
        etdOffset: query.etdOffset,
        sailingId: selected.id,
        vas,
        alsoIn: ["JPY", "EUR"],
      },
      ctrl.signal,
    ).then((r) => {
      if (!ctrl.signal.aborted) setRemote(r);
    });
    return () => ctrl.abort();
  }, [query, selected, accepted, vas]);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) =>
    requestAnimationFrame(() =>
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );

  return (
    <div className="flex flex-col gap-14">
      <SearchPanel
        value={form}
        error={errorText}
        onChange={(next) => {
          setForm(next);
        }}
        onSearch={() => {
          if (firstError) return;
          setQuery(form as Strict);
          setSelectedId("");
          setAccepted(false);
          setVas(NO_VAS);
          scrollTo(optionsRef);
        }}
        priceForDay={priceForDay}
      />

      {quote && options.length ? (
        <div ref={optionsRef} className="scroll-mt-20">
          <OptionsList
            quote={quote}
            options={options}
            selectedId={selected?.id ?? ""}
            onSelect={setSelectedId}
            onAccept={() => {
              setAccepted(true);
              scrollTo(confirmRef);
            }}
          />
        </div>
      ) : null}

      {quote && selected && sections && accepted ? (
        <div ref={confirmRef} className="flex scroll-mt-20 flex-col gap-10">
          <div>
            <p className="type-eyebrow">{t("confirm.eyebrow")}</p>
            <h2 className="mt-4 type-page">{t("confirm.title")}</h2>
            <p className="mt-3 max-w-[60ch] type-body text-muted">{t("confirm.lede")}</p>
          </div>

          <VasPanel value={vas} units={quote.units} onChange={setVas} />

          <QuoteTicket
            quote={quote}
            sailing={selected}
            sections={sections}
            vas={vas}
            locale={locale}
            remote={remote}
          />

          <div className="flex flex-wrap items-center justify-between gap-6 border border-border bg-studio p-6 rounded-card">
            <p className="max-w-[60ch] type-caption">{t("confirm.bookingNote")}</p>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-3 border border-charcoal bg-charcoal px-6 py-3 type-label text-studio rounded-card opacity-60"
            >
              {t("confirm.book")}
              <ArrowRight size={18} />
            </button>
          </div>

          <QuoteDocument quote={quote} sailing={selected} sections={sections} vas={vas} />
        </div>
      ) : null}
    </div>
  );
}
