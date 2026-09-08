"use client";

import { useT } from "../shell/LocaleProvider";
import { SectionIntro } from "./SectionIntro";

export function SystemsBand() {
  const t = useT();
  return (
    <section className="relative isolate overflow-hidden border-t border-charcoal bg-charcoal">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/banners/02-operations-floor.png"
        alt=""
        aria-hidden
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      {/*
        Charcoal, full width, and light type over it.

        This was built as charcoal type on a white scrim, on the reading that
        the comps put dark type over a bright office. The photograph that
        arrived is a dark operations floor whose right half is lit monitors, so
        the white scrim lifted only the left and the statistics on the right sat
        as charcoal on a busy dark image — unreadable. The scrim has to be
        chosen for the picture, not for the plan.
      */}
      <div aria-hidden className="absolute inset-0 -z-10 scrim-full" />

      <div className="mx-auto grid max-w-[86rem] items-center gap-14 px-6 py-24 lg:grid-cols-[minmax(0,27rem)_minmax(0,1fr)]">
        <SectionIntro
          tone="dark"
          no="03"
          titleKey="home.03.title"
          subtitleKey="home.03.subtitle"
          bodyKey="home.03.body"
          href="/engineering"
          linkKey="home.03.link"
        />

        {/* The band was one 432px text block in a 1376px container with no
            second grid child. These are the three things the systems screen
            actually shows, so the empty two-thirds now carries the promise the
            heading makes. */}
        <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-3">
          {["layers", "services", "traced"].map((k) => (
            <div key={k} className="border-t border-muted pt-4">
              <dt className="type-label text-studio">{t(`home.03.${k}`)}</dt>
              <dd className="mt-2 type-caption text-border">
                {t(`home.03.${k}Body`)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
