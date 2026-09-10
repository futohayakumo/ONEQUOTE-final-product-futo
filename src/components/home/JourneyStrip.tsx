"use client";

import Link from "next/link";
import { ArrowRight } from "../icons/ArrowRight";
import { useT } from "../shell/LocaleProvider";
import { Lines } from "../ui/Lines";

/**
 * Three arch-topped photographs and a paragraph, on a canvas ground with one
 * very large soft shape behind the copy — the comp's arrangement.
 *
 * The arch is `rounded-t-full`, which resolves from the same `--radius-full`
 * the radio dots use. It is not a fourth radius; it is the third one applied
 * to two corners.
 */
const STEPS = [
  { id: "quote", src: "/assets/scenes/06-dashboard-display.png" },
  { id: "booking", src: "/assets/scenes/08-document-sharing.png" },
  { id: "delivery", src: "/assets/spot/12-perspective-process.jpg" },
] as const;

export function JourneyStrip() {
  const t = useT();
  return (
    <section className="relative isolate overflow-hidden border-t border-border bg-canvas">
      {/* The pale disc behind the right-hand copy. Flat fill, no gradient. */}
      <div
        aria-hidden
        className="absolute -right-40 top-10 -z-10 hidden h-[38rem] w-[38rem] bg-studio rounded-full lg:block"
      />

      <div className="mx-auto grid max-w-[86rem] items-center gap-12 px-6 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-16">
        <ol className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.id} className="flex flex-col">
              <div className="overflow-hidden bg-studio rounded-t-full rounded-b-card shadow-card">
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

        <div>
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
