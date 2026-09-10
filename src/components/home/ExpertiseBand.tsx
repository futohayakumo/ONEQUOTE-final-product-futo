"use client";

import { useT } from "../shell/LocaleProvider";
import { Lines } from "../ui/Lines";

/**
 * A photograph cut on the opposite diagonal to the hero, with three words up
 * against its lower-left corner, and a dark label chip opening the copy on the
 * right. All three devices are from the comp.
 *
 * The chip is the useful one: charcoal fill, studio type, and it gives a
 * heading a hard left edge to start from without inventing a rule weight.
 */
export function ExpertiseBand() {
  const t = useT();
  return (
    <section className="bg-studio">
      <div className="mx-auto grid max-w-[86rem] items-center gap-10 px-6 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
        <div className="relative isolate">
          <div
            className="overflow-hidden"
            style={{ clipPath: "polygon(0 0, 100% 0, 88% 100%, 0 100%)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/banners/02-operations-floor.png"
              alt=""
              className="h-[22rem] w-full object-cover lg:h-[26rem]"
            />
            {/* Type over a picture needs a ramp, not a flat wash: a wash dark
                enough for the words would flatten the picture as well. */}
            <div aria-hidden className="absolute inset-0 scrim-b" />
          </div>
          <p className="absolute bottom-8 left-8 z-10 max-w-[14ch] type-page text-studio">
            <Lines text={t("home.expertise.over")} />
          </p>
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
