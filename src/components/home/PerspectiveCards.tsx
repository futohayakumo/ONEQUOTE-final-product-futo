"use client";

import Link from "next/link";
import { PERSONAS, type PersonaId } from "@/lib/personas";
import { ArrowRight } from "../icons/ArrowRight";
import { useT } from "../shell/LocaleProvider";
import { SectionIntro } from "./SectionIntro";

const ART: Record<PersonaId, { src: string; alt: string }> = {
  business: {
    src: "/assets/spot/10-perspective-business.png",
    alt: "An executive on a walkway above a container terminal at dusk.",
  },
  engineering: {
    src: "/assets/spot/11-perspective-engineering.png",
    alt: "A service mesh of lit nodes on a dark field.",
  },
  process: {
    src: "/assets/spot/12-perspective-process.png",
    alt: "A yard supervisor among stacked containers.",
  },
};



/**
 * v2 gave the three perspectives a full screen of their own at /journeys. The
 * comps fold them into the home page as the closing band, which removes a
 * click without removing the choice, so the gateway route is gone and this is
 * what replaces it.
 */
export function PerspectiveCards() {
  const t = useT();
  return (
    <section className="bg-canvas">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-14 px-6 py-24 lg:flex-row lg:gap-20">
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
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ART[persona.id].src}
                    alt={ART[persona.id].alt}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <span aria-hidden className="absolute inset-0 scrim-b" />
                  <span className="absolute bottom-4 left-4 type-section text-studio">
                    {persona.title}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-5">
                  <span className="type-label">{t(`home.04.${persona.id}`)}</span>
                  <p className="type-caption">{t(persona.blurbKey)}</p>
                  <span
                    aria-hidden
                    className="mt-auto flex h-9 w-9 items-center justify-center self-end border border-crimson text-crimson rounded-full transition-colors duration-150 group-hover:bg-crimson group-hover:text-studio"
                  >
                    <ArrowRight size={16} />
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
