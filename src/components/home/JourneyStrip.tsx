"use client";

import { CONTAINER_ORDER, LANE_BASE_USD, RATE_VALIDITY_HOURS, TIER_ORDER } from "@/lib/pricing";
import { useT } from "../shell/LocaleProvider";
import { SectionIntro } from "./SectionIntro";

/**
 * The three stages, with the artefact each one actually produces.
 *
 * The stage names alone — Quote, Booking, Delivery — are the kind of caption
 * that could sit under any logistics picture ever taken. The fact line under
 * each is what makes the step falsifiable: the counts come out of the pricing
 * tables, so "6 lanes" stops being true the moment it stops being true.
 */
const STEPS = [
  { id: "quote", no: "01" },
  { id: "booking", no: "02" },
  { id: "delivery", no: "03" },
] as const;

const FACT_VARS: Record<string, Record<string, string | number>> = {
  quote: {
    lanes: Object.keys(LANE_BASE_USD).length,
    containers: CONTAINER_ORDER.length,
    hours: RATE_VALIDITY_HOURS,
  },
  booking: {},
  delivery: { tiers: TIER_ORDER.length },
};

export function JourneyStrip() {
  const t = useT();
  return (
    <section className="border-b border-border bg-canvas">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-12 px-6 py-20">
        <div className="flex flex-col gap-14 lg:flex-row lg:items-center lg:gap-20">
          <SectionIntro
            no="01"
            titleKey="home.01.title"
            subtitleKey="home.01.subtitle"
            bodyKey="home.01.body"
            href="/business"
            linkKey="home.01.link"
            emphasis="accent"
          />

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
            className="min-w-0 flex-1"
          />
        </div>

        <ol className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.id}
              className="flex flex-col gap-3 border border-border bg-studio p-6 rounded-card shadow-card"
            >
              <span className="type-eyebrow tnum">{step.no}</span>
              <span className="type-label">{t(`home.01.${step.id}`)}</span>
              <p className="type-caption">{t(`home.01.${step.id}Blurb`)}</p>
              <p className="mt-auto border-t border-border pt-3 type-caption tnum text-charcoal">
                {t(`home.01.${step.id}Fact`, FACT_VARS[step.id])}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
