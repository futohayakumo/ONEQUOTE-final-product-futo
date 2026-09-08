"use client";

import Link from "next/link";
import { ArrowRight } from "../icons/ArrowRight";
import { useT } from "../shell/LocaleProvider";
import { Lines } from "../ui/Lines";
import { QuoteGlance } from "./QuoteGlance";

/**
 * Two columns: the claim, and the thing the claim is about.
 *
 * This was a full-bleed photograph of a berth at 1672px, scrimmed to charcoal,
 * with a column of five words — People, Systems, Logistics, A brighter,
 * Tomorrow — running up the right edge. It read as a brand film still. The
 * words carried no information and went nowhere, the CTA sat on top of a ship,
 * and nothing in the first screenful said what the site computes.
 *
 * The photography has not been thrown away; it moved to the two places where a
 * picture is the content rather than the backdrop. What sits here instead is a
 * real quotation, priced on load — which is the honest version of the same
 * argument the photograph was making.
 */
export function Hero() {
  const t = useT();
  return (
    <section className="border-b border-border bg-studio">
      <div className="mx-auto grid max-w-[86rem] items-center gap-12 px-6 py-14 lg:grid-cols-[minmax(0,31rem)_minmax(0,1fr)] lg:gap-16 lg:py-18">
        <div>
          <p className="type-eyebrow">{t("home.hero.eyebrow")}</p>

          <h1 className="mt-6 type-display">
            <Lines text={t("home.hero.title")} />
          </h1>

          <p className="mt-7 max-w-[46ch] type-body text-muted">
            {t("home.hero.body")}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="/business"
              className="inline-flex items-center gap-3 border border-crimson bg-crimson px-6 py-3.5 type-label text-studio rounded-card shadow-none transition-colors duration-150 hover:border-charcoal hover:bg-charcoal"
            >
              {t("home.hero.cta")}
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/process#simulation"
              className="inline-flex items-center gap-2.5 type-label underline underline-offset-4 transition-colors duration-150 hover:text-crimson-ink"
            >
              {t("home.hero.play")}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <QuoteGlance />
      </div>
    </section>
  );
}
