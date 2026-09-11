"use client";

import cn from "clsx";
import { useEffect, useState } from "react";
import type { ChargeSection, Incoterm } from "@/lib/charges";
import { quoteDocumentJson, quoteDocumentText } from "@/lib/quoteDocument";
import type { Sailing } from "@/lib/sailings";
import type { QuoteResult } from "@/types/quote";
import { useT } from "../shell/LocaleProvider";

/**
 * The quotation in the two shapes it actually travels in.
 *
 * The ticket above is what a person reads. This is what a system receives and
 * what lands in a mail body — the deliverable asks for a sample document in
 * JSON or text, and a screen alone is not one.
 *
 * The document is English in both formats on purpose. The UI around it
 * translates; the payload does not, because a field name that changes with the
 * reader's locale is not a field name.
 */
const FORMATS = ["json", "text"] as const;
type Format = (typeof FORMATS)[number];

export function QuoteDocument(props: {
  quote: QuoteResult;
  sailing: Sailing;
  sections: ChargeSection[];
  incoterm: Incoterm;
}) {
  const t = useT();
  const [format, setFormat] = useState<Format>("json");
  const [copied, setCopied] = useState(false);

  const body =
    format === "json" ? quoteDocumentJson(props) : quoteDocumentText(props);

  // The confirmation has to clear itself, and it has to stop clearing itself
  // if the reader switches format first, or a stale timer wipes a fresh one.
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    /*
     * A <details>, closed by default, and the <pre> no longer scrolls inside
     * itself. Open, it was a 32rem black box that captured the wheel: both
     * non-engineer reviewers scrolled into it, stopped moving, and named it
     * as the point they wanted to leave the page. The panel is for the
     * integration partner, not the person reading the invoice.
     */
    <details className="group flex flex-col gap-5">
      <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-4 list-none">
        <span>
          <span className="type-section">{t("doc.title")}</span>
          <span className="mt-1 block type-caption">{t("doc.lede")}</span>
        </span>
        <span className="type-caption underline underline-offset-4 group-open:hidden">
          {t("doc.open")}
        </span>
      </summary>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">

        <div className="flex items-center gap-3">
          <div
            role="radiogroup"
            aria-label={t("doc.format")}
            className="flex overflow-hidden border border-control rounded-card"
          >
            {FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={format === f}
                onClick={() => {
                  setFormat(f);
                  setCopied(false);
                }}
                className={cn(
                  "px-4 py-2 type-caption transition-colors duration-150",
                  format === f
                    ? "bg-charcoal text-studio"
                    : "bg-studio text-muted hover:text-charcoal",
                )}
              >
                {t(`doc.${f}`)}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              // Not available over plain http on a LAN address, and not worth
              // an error dialog when it is not — the text is on screen anyway.
              navigator.clipboard?.writeText(body).then(
                () => setCopied(true),
                () => undefined,
              );
            }}
            className="border border-control bg-studio px-4 py-2 type-caption text-charcoal rounded-card transition-colors duration-150 hover:border-crimson hover:text-crimson"
          >
            {copied ? t("doc.copied") : t("doc.copy")}
          </button>
        </div>
      </div>

      <div className="overflow-hidden border border-charcoal rounded-card">
        <div className="flex items-center justify-between gap-4 border-b border-muted bg-console px-4 py-2">
          <span className="type-console text-border">
            {format === "json"
              ? "application/json"
              : "text/plain; charset=utf-8"}
          </span>
          <span className="type-console text-border">
            {format === "json" ? t("doc.jsonNote") : t("doc.textNote")}
          </span>
        </div>
        <pre className="overflow-x-auto bg-console px-4 py-4">
          <code className="type-console text-border">{body}</code>
        </pre>
      </div>
    </details>
  );
}
