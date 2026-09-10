"use client";

import Link from "next/link";
import { ArrowRight } from "../icons/ArrowRight";
import { useT } from "../shell/LocaleProvider";
import { Lines } from "../ui/Lines";
import { QuoteGlance } from "./QuoteGlance";

/**
 * The statement on the left, the evidence for it on the right.
 *
 * The comp this follows put a container ship behind an angled edge on the right
 * half, with the headline set large and dark on white to its left. That
 * arrangement is kept, and so is the angle — it is the one strong geometric
 * move on the page and it costs nothing but a clip.
 *
 * What changed is what sits in the right half. In the comp it was only the
 * photograph, under the words MAKE PROGRESS. Neither says what this site does,
 * and a hero that reads as an advertisement makes the real arithmetic further
 * down the page read as decoration too. So the photograph stays as ground and a
 * real quotation sits on it, priced on load from the same modules the business
 * screen runs. Anyone can put a ship here. The card is the part that cannot be
 * faked.
 */
export function Hero() {
  const t = useT();
  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-studio">
      {/*
        The photograph, cut on the diagonal.

        A clip, not a gradient — the one legal gradient on this site is a scrim
        over a photograph, and this is an edge rather than a fade. Below `lg`
        the angle is dropped and the picture goes full width behind the type,
        because a 12-degree cut across a 375px viewport is a smudge.
      */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 -z-20 hidden w-[56%] lg:block"
        style={{ clipPath: "polygon(14% 0, 100% 0, 100% 100%, 0 100%)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/banners/01-port-vessel-berth.png"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mx-auto grid max-w-[86rem] items-center gap-12 px-6 py-16 lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] lg:gap-16 lg:py-24">
        <div>
          {/* A short crimson rule over the eyebrow. The comp opens every
              section this way and it is the cheapest thing on it: one 2px
              mark that tells the eye where a section starts. */}
          <span aria-hidden className="block h-0.5 w-10 bg-crimson" />
          <p className="mt-5 type-eyebrow">
            <Lines text={t("home.hero.eyebrow")} />
          </p>

          <h1 className="mt-6 type-display">
            <Lines text={t("home.hero.title")} />
          </h1>

          <p className="mt-7 max-w-[44ch] type-body text-muted">
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

        {/* Sits over the seam on wide screens, and stands alone below `lg`
            where the photograph is not drawn at all. */}
        <div className="lg:justify-self-center">
          <QuoteGlance />
        </div>
      </div>
    </section>
  );
}
