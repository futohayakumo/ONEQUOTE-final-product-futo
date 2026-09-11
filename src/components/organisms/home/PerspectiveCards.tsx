"use client";

import Link from "next/link";
import { PERSONAS, type PersonaId } from "@/lib/personas";
import { ArrowRight } from "../../atoms/icons/ArrowRight";
import { useT } from "../../providers/LocaleProvider";

/**
 * Three tiles: a title and a line of copy above a circular photograph with the
 * title repeated across it — the comp's sixth section.
 *
 * The comp sets the word on the picture twice at two sizes, which reads as a
 * printing error. Here the circle carries the picture and nothing else, and
 * the label sits under it where it can be read. Everything else — the tinted
 * tile, the circle, the proportions — is as drawn.
 */
const ART: Record<PersonaId, string> = {
  business: "/assets/spot/10-perspective-business.png",
  engineering: "/assets/spot/11-perspective-engineering.png",
  process: "/assets/spot/12-perspective-process.jpg",
};

export function PerspectiveCards() {
  const t = useT();
  return (
    <section className="border-t border-border bg-studio">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-10 px-6 py-20">
        <div className="max-w-[46rem]">
          <span aria-hidden className="block h-0.5 w-10 bg-crimson" />
          <h2 className="mt-5 type-page">{t("home.persp.title")}</h2>
          <p className="mt-3 type-body text-muted">{t("home.persp.body")}</p>
        </div>

        <ul className="grid gap-6 sm:grid-cols-3">
          {PERSONAS.map((persona) => (
            <li key={persona.id}>
              {/*
                The card's foot is a half-round, and the photograph is a circle
                seated in it — the shape from the reference. `rounded-b-full`
                resolves from the same `--radius-full` the radio dots use, so
                this is the third radius applied to two corners rather than a
                fourth radius.
              */}
              <Link
                href={persona.href}
                className="group flex h-full flex-col items-center gap-4 overflow-hidden bg-canvas pt-8 text-center rounded-t-card rounded-b-full transition-colors duration-150 hover:bg-tint"
              >
                <h3 className="px-6 type-section">{t(`home.persp.${persona.id}`)}</h3>
                <p className="max-w-[30ch] px-6 type-caption">
                  {t(`home.persp.${persona.id}Body`)}
                </p>

                <span className="mt-auto inline-flex items-center gap-2 type-label text-crimson transition-colors duration-150 group-hover:text-charcoal">
                  {t("home.persp.cardCta")}
                  <ArrowRight size={16} />
                </span>

                {/*
                  Full card width, no horizontal padding — the circle IS the
                  foot. With `px-6` on the card the circle came out 48px
                  narrower than the curve it was meant to sit in, which left a
                  crescent of ground under it and read as a mistake.
                */}
                <div className="mt-6 w-full overflow-hidden rounded-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ART[persona.id]}
                    alt=""
                    className="aspect-square w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
