"use client";

import Link from "next/link";
import { ArrowRight } from "../icons/ArrowRight";
import { useT } from "../shell/LocaleProvider";
import { Lines } from "../ui/Lines";

/**
 * Three tall pills and one very large disc, the disc overlapping the third
 * pill and running off the right edge of the page.
 *
 * The disc is absolutely positioned rather than being the copy column's
 * background, because it has to be far wider than the column and to sit
 * *behind* the pill next to it. `left-[58%]` puts its own left edge back over
 * that pill; being square and `rounded-full` at 46rem, roughly a third of it
 * leaves the page on the right, which is what the reference draws.
 *
 * The copy is held to `28rem` and centred in the visible part. A circle
 * narrows towards its top and bottom, so a paragraph as wide as the disc's
 * diameter would cross the curve and hang outside it — the one thing the
 * reference is explicit about not wanting.
 */
const STEPS = [
  { id: "quote", src: "/assets/scenes/11-quote-phone.jpg" },
  { id: "booking", src: "/assets/scenes/12-booking-laptop.jpg" },
  { id: "delivery", src: "/assets/spot/12-perspective-process.jpg" },
] as const;

export function JourneyStrip() {
  const t = useT();
  return (
    <section className="relative isolate overflow-hidden border-t border-border bg-studio">
      <div className="relative mx-auto max-w-[86rem] px-6 py-20">
        {/* Sits under everything in the band, including the third pill. */}
        <div
          aria-hidden
          className="absolute top-1/2 left-[58%] -z-10 hidden h-[46rem] w-[46rem] -translate-y-1/2 bg-mist rounded-full lg:block"
        />

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
