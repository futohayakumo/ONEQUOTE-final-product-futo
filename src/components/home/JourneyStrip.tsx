"use client";

import Link from "next/link";
import { ArrowRight } from "../icons/ArrowRight";
import { useT } from "../shell/LocaleProvider";
import { Lines } from "../ui/Lines";

/**
 * Three photographs cut as pills, and a paragraph seated inside a large disc —
 * the comp's arrangement.
 *
 * Both shapes are `rounded-full` resolving from the same `--radius-full` the
 * radio dots use. Nothing new: the pill is that radius on a 3:4 box, and the
 * disc is that radius on a square one.
 *
 * The disc sits UNDER the copy rather than beside it, and it is darker than
 * the page rather than lighter. The first cut had a studio disc on a canvas
 * ground — a shape lighter than what it sits on, which is a shape nobody can
 * see — and the paragraph fell outside it entirely.
 */
/*
 * Three photographs of the same kind — a phone mid-quote, a laptop showing a
 * confirmation, a yard worker among the stacks. The row's one job is that they
 * read as one set, which is why the flat illustrations that stood in here
 * before did not work beside the third.
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
      <div className="mx-auto grid max-w-[86rem] items-center gap-12 px-6 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
        <ol className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.id} className="flex flex-col">
              <div className="overflow-hidden bg-studio rounded-full shadow-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={step.src}
                  alt=""
                  className="aspect-[3/4] w-full object-cover"
                />
              </div>
              <h3 className="mt-5 type-section">{t(`home.journey.${step.id}`)}</h3>
              <p className="mt-2 type-caption">
                {t(`home.journey.${step.id}Body`)}
              </p>
            </li>
          ))}
        </ol>

        {/* The disc is the copy's own ground, so it moves with the column and
            cannot drift off it at some width. `-inset-*` lets it bleed past
            the text on every side without changing what the grid reserves. */}
        <div className="relative isolate">
          <div
            aria-hidden
            className="absolute -inset-x-10 -inset-y-16 -z-10 hidden bg-mist rounded-full lg:block"
          />
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
    </section>
  );
}
