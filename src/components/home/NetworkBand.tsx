"use client";

import {
  CONTAINER_ORDER,
  LANE_BASE_USD,
  PORT_ORDER,
  TIER_ORDER,
} from "@/lib/pricing";
import { useT } from "../shell/LocaleProvider";
import { SectionIntro } from "./SectionIntro";

/**
 * Two columns of figures, and the difference between them stated out loud.
 *
 * This was a full-bleed night-side globe with magenta arcs across it, carrying
 * three statistics — one of which was "Opportunities: Endless", a figure with
 * no number in it. The picture claimed a scale the site does not implement,
 * and the reader had no way to tell which half was which.
 *
 * The right-hand column is counted from the pricing tables at module scope, so
 * it cannot overstate what is here: add a lane and the number moves on its own.
 */
const NETWORK = [
  { figure: "180+", key: "home.02.countries" },
  { figure: "500+", key: "home.02.ports" },
] as const;

const MODELLED = [
  { figure: PORT_ORDER.length, key: "home.02.ports" },
  { figure: Object.keys(LANE_BASE_USD).length, key: "home.02.lanes" },
  { figure: CONTAINER_ORDER.length, key: "home.02.containers" },
  { figure: TIER_ORDER.length, key: "home.02.tiers" },
] as const;

function Figure({ figure, label }: { figure: string | number; label: string }) {
  return (
    <div className="border-t border-border pt-4">
      <dd className="type-page tnum">{figure}</dd>
      <dt className="mt-1 type-caption">{label}</dt>
    </div>
  );
}

export function NetworkBand() {
  const t = useT();
  return (
    <section className="border-b border-border bg-studio">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-12 px-6 py-20 lg:flex-row lg:gap-20">
        <SectionIntro
          no="02"
          titleKey="home.02.title"
          subtitleKey="home.02.subtitle"
          bodyKey="home.02.body"
          href="/engineering"
          linkKey="home.02.link"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <div className="grid gap-8 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-12">
            <section>
              <h3 className="type-overline text-muted">
                {t("home.02.networkTitle")}
              </h3>
              <dl className="mt-5 grid grid-cols-2 gap-x-8">
                {NETWORK.map((s) => (
                  <Figure key={s.key} figure={s.figure} label={t(s.key)} />
                ))}
              </dl>
            </section>

            {/* The tint ground is the only thing separating the two columns.
                A rule would read as a table; a card would make the modelled
                slice look like the more important of the two, which it is not. */}
            <section className="bg-tint p-6 rounded-card">
              <h3 className="type-overline text-muted">
                {t("home.02.modelTitle")}
              </h3>
              <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
                {MODELLED.map((s) => (
                  <Figure key={s.key} figure={s.figure} label={t(s.key)} />
                ))}
              </dl>
            </section>
          </div>

          <p className="max-w-[74ch] type-caption">{t("home.02.scope")}</p>
        </div>
      </div>
    </section>
  );
}
