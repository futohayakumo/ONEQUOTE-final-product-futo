"use client";

import Link from "next/link";
import { PERSONAS, type PersonaId } from "@/lib/personas";
import { ArrowRight } from "../icons/ArrowRight";
import { useT } from "../shell/LocaleProvider";

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
              <Link
                href={persona.href}
                className="group flex h-full flex-col gap-5 bg-canvas p-6 rounded-card transition-colors duration-150 hover:bg-tint"
              >
                <div>
                  <h3 className="type-section">
                    {t(`home.persp.${persona.id}`)}
                  </h3>
                  <p className="mt-2 type-caption">
                    {t(`home.persp.${persona.id}Body`)}
                  </p>
                </div>

                <div className="mx-auto w-full max-w-[15rem] overflow-hidden rounded-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ART[persona.id]}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                </div>

                <span className="mt-auto inline-flex items-center gap-2 type-label text-crimson transition-colors duration-150 group-hover:text-charcoal">
                  {t("home.persp.cardCta")}
                  <ArrowRight size={16} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
