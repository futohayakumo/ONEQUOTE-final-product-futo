"use client";

import { useT } from "../shell/LocaleProvider";
import { SectionIntro } from "./SectionIntro";

const STEPS = ["quote", "booking", "delivery"] as const;

export function JourneyStrip() {
  const t = useT();
  return (
    <section className="bg-studio">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-14 px-6 py-24 lg:flex-row lg:items-center lg:gap-20">
        <SectionIntro
          no="01"
          titleKey="home.01.title"
          subtitleKey="home.01.subtitle"
          bodyKey="home.01.body"
          href="/business"
          linkKey="home.01.link"
          emphasis="accent"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {/*
            One picture, not three tiles with connectors drawn between them.
            The three stages and the arrows are in the artwork, so building the
            same relationship a second time in CSS would only give it a chance
            to disagree with the image at some viewport.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/spot/quote-to-delivery.png"
            alt={t("home.01.alt")}
            className="w-full"
          />

          {/* The labels are DOM, not baked into the picture: they carry the
              type scale, they translate, and they stay legible when the image
              is scaled down on a phone. */}
          <ol className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-3">
            {STEPS.map((step) => (
              <li
                key={step}
                className="flex flex-col border-t border-border pt-4"
              >
                <span className="type-overline text-charcoal">
                  {t(`home.01.${step}`)}
                </span>
                <p className="mt-2 type-caption">
                  {t(`home.01.${step}Blurb`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
