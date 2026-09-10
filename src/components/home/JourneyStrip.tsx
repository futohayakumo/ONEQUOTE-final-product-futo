"use client";

import Link from "next/link";
import { ArrowRight } from "../icons/ArrowRight";
import { Plate } from "../ui/Plate";
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
/*
 * The comp puts three photographs here — a phone mid-booking, a laptop showing
 * a confirmation, a container coming down onto a truck with a yard worker in
 * frame. Only the third exists. The other two were standing in as the flat
 * magenta-era illustrations, which read as clip art beside a photograph and
 * broke the row's one job: three pictures of the same kind.
 */
const STEPS = [
  {
    id: "quote",
    src: null,
    want: "Hands on a phone, a rate request part-filled. Screen legible, no real brand.",
  },
  {
    id: "booking",
    src: null,
    want: "A laptop on a desk showing a confirmation. Over the shoulder, shallow depth.",
  },
  { id: "delivery", src: "/assets/spot/12-perspective-process.jpg", want: null },
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
                {step.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={step.src}
                    alt=""
                    className="aspect-[3/4] w-full object-cover"
                  />
                ) : (
                  <Plate label={step.want ?? ""} spec="900 × 1200" ratio="3 / 4" />
                )}
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
