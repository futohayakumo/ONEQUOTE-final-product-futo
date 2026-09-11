"use client";

import Link from "next/link";
import { ArrowRight } from "../icons/ArrowRight";
import { useT } from "../shell/LocaleProvider";
import { Lines } from "../ui/Lines";

/**
 * Three tall pills and one very large disc, the disc overlapping the third
 * pill and running off the right edge of the page.
 *
 * The disc is absolutely positioned on the section rather than being the copy
 * column's background, because it has to be far wider than that column, to sit
 * *behind* the pill next to it, and to leave the page on the right. Anchored
 * 14rem past the right edge, roughly a third of it is always off-screen. It
 * grows again at `xl`: anchored from the right, a fixed diameter drifts away
 * from the pills as the viewport widens, and the overlap with the third one is
 * the point of the arrangement.
 *
 * The copy is held to `28rem` and centred in the visible part. A circle
 * narrows towards its top and bottom, so a paragraph as wide as the disc's
 * diameter would cross the curve and hang outside it — the one thing the
 * reference is explicit about not wanting.
 */
const STEPS = [
  { id: "quote", src: "/assets/scenes/13-quote-laptop.png" },
  { id: "booking", src: "/assets/scenes/12-booking-laptop.jpg" },
  { id: "delivery", src: "/assets/spot/12-perspective-process.jpg" },
] as const;

export function JourneyStrip() {
  const t = useT();
  return (
    <section className="relative isolate overflow-hidden border-t border-border bg-studio">
      {/*
        On the SECTION, not inside the centred container.

        It has to leave the page on the right, and a child of a `max-w-[86rem]`
        box cannot: past 1600px the container stops short of the viewport and
        the disc came to rest inside it as a floating circle with a gap beyond.
        Anchored from the right edge instead, it bleeds at every width.
      */}
      <div
        aria-hidden
        className="absolute top-1/2 -right-[14rem] -z-10 hidden h-[46rem] w-[46rem] -translate-y-1/2 bg-mist rounded-full lg:block xl:h-[56rem] xl:w-[56rem]"
      />

      <div className="relative mx-auto max-w-[86rem] px-6 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.95fr)_minmax(0,1fr)] lg:gap-6">
          <ol className="grid gap-5 sm:grid-cols-3 sm:gap-6">
            {STEPS.map((step) => (
              <li key={step.id} className="flex flex-col">
                <div className="overflow-hidden bg-studio rounded-full shadow-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={step.src}
                    alt=""
                    className="aspect-[1/2] w-full object-cover"
                  />
                </div>
                <h3 className="mt-6 type-section">
                  {t(`home.journey.${step.id}`)}
                </h3>
                <p className="mt-2 type-caption">
                  {t(`home.journey.${step.id}Body`)}
                </p>
              </li>
            ))}
          </ol>

          <div className="max-w-[28rem] lg:pl-6">
            <span aria-hidden className="block h-0.5 w-10 bg-crimson" />
            <h2 className="mt-5 type-page">
              <Lines text={t("home.journey.title")} />
            </h2>
            <p className="mt-4 type-body text-muted">{t("home.journey.body")}</p>
            <Link
              href="/business"
              className="mt-6 inline-flex items-center gap-2.5 type-label text-crimson transition-colors duration-150 hover:text-charcoal"
            >
              {t("home.journey.link")}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
