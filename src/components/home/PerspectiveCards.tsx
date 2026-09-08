"use client";

import Link from "next/link";
import { PERSONAS, type PersonaId } from "@/lib/personas";
import { ArrowRight } from "../icons/ArrowRight";
import { useT } from "../shell/LocaleProvider";
import { SectionIntro } from "./SectionIntro";

const ART: Record<PersonaId, string> = {
  business: "/assets/spot/10-perspective-business.png",
  engineering: "/assets/spot/11-perspective-engineering.png",
  process: "/assets/spot/12-perspective-process.png",
};

/**
 * v2 gave the three perspectives a full screen of their own at /journeys. The
 * comps fold them into the home page as the closing band, which removes a click
 * without removing the choice, so the gateway route is gone and this replaces it.
 *
 * Two things changed when the rest of the page stopped being posters. The
 * persona title moved out of the photograph and into the card body, so the
 * three titles sit on one baseline instead of wherever each picture happened to
 * leave room. And the bare arrow disc became a labelled link: a circle in the
 * corner of a card is a decoration that happens to be clickable, which is not
 * the same as an affordance.
 */
export function PerspectiveCards() {
  const t = useT();
  return (
    <section className="bg-canvas">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-12 px-6 py-20 lg:flex-row lg:gap-20">
        <SectionIntro
          no="04"
          titleKey="home.04.title"
          subtitleKey="home.04.subtitle"
          bodyKey="home.04.body"
          href="/business"
          linkKey="home.04.link"
        />

        <ul className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-3">
          {PERSONAS.map((persona) => (
            <li key={persona.id}>
              <Link
                href={persona.href}
                className="group flex h-full flex-col overflow-hidden border border-border bg-studio rounded-card shadow-card transition-shadow duration-150 hover:shadow-raised"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ART[persona.id]}
                  alt={t(`home.04.alt.${persona.id}`)}
                  className="aspect-[4/3] w-full object-cover"
                />

                <div className="flex flex-1 flex-col gap-2 border-t border-border p-5">
                  <span className="type-overline text-muted">
                    {persona.no} {persona.title}
                  </span>
                  <span className="type-label">
                    {t(`home.04.${persona.id}`)}
                  </span>
                  <p className="type-caption">{t(persona.blurbKey)}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-4 type-caption text-crimson-ink underline underline-offset-4 transition-colors duration-150 group-hover:text-charcoal">
                    {t("home.04.cardCta")}
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
