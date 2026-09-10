"use client";

import { useT } from "../shell/LocaleProvider";
import { Lines } from "../ui/Lines";

/**
 * The port inside a vessel-shaped cut-out, and a dark label chip opening the
 * copy beside it.
 *
 * The three words that sat on the hull are gone. The chip is the device worth
 * keeping: charcoal fill, studio type, and it gives a heading a hard left edge
 * to start from without inventing a rule weight.
 */
export function ExpertiseBand() {
  const t = useT();
  return (
    <section className="overflow-hidden bg-studio">
      <div className="mx-auto grid max-w-[86rem] items-center gap-10 px-6 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-12">
        {/*
          The cut-out runs off the left edge of the page.

          `w-[125%]` with a matching negative margin is the whole mechanism: the
          grid still reserves one column's worth of space, and the picture
          simply draws wider than the box it was given. The section clips it, so
          nothing scrolls sideways. The stern is the part that leaves — the
          bridge, the cranes and the bow, which is everything worth looking at,
          stay on the page.

          It arrives with its own alpha channel, so there is no mask to maintain
          here and no clip path to keep in step with the artwork.
        */}
        <div className="-ml-[18%] w-[118%] lg:-ml-[22%] lg:w-[125%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/spot/17-vessel-silhouette.png"
            alt=""
            className="w-full"
          />
        </div>

        <div>
          <span aria-hidden className="block h-0.5 w-10 bg-crimson" />
          <h2 className="mt-5 inline-block bg-charcoal px-4 py-2.5 type-section text-studio">
            <Lines text={t("home.expertise.title")} />
          </h2>
          <p className="mt-5 type-body text-muted">{t("home.expertise.body")}</p>
        </div>
      </div>
    </section>
  );
}
