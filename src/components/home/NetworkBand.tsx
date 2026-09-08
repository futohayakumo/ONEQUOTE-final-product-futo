"use client";

import { useT } from "../shell/LocaleProvider";
import { SectionIntro } from "./SectionIntro";

const STATS = [
  { figure: "180+", key: "home.02.countries" },
  { figure: "500+", key: "home.02.ports" },
  { figure: null, key: "home.02.opportunities" },
] as const;

export function NetworkBand() {
  const t = useT();
  return (
    <section className="relative isolate overflow-hidden border-y border-charcoal bg-charcoal">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/banners/03-global-network.png"
        alt=""
        aria-hidden
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div aria-hidden className="absolute inset-0 -z-10 scrim-l" />

      <div className="mx-auto flex max-w-[86rem] flex-col gap-14 px-6 py-24 lg:flex-row lg:items-center">
        <SectionIntro
          tone="dark"
          no="02"
          titleKey="home.02.title"
          subtitleKey="home.02.subtitle"
          bodyKey="home.02.body"
          href="/engineering"
          linkKey="home.02.link"
        />

        <dl className="ml-auto flex shrink-0 flex-col gap-8 border-l border-muted pl-10">
          {STATS.map((stat) => (
            <div key={stat.key}>
              <dt className="type-caption text-border">{t(stat.key)}</dt>
              <dd className="mt-1 type-section tnum text-studio">
                {stat.figure ?? t("home.02.endless")}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
