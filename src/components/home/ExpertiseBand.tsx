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
          {/* The port, inside a vessel-shaped cut-out. It arrives with its
              own alpha channel, so there is no mask to maintain here and no
              clip path to keep in step with the artwork. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/spot/17-vessel-silhouette.png"
            alt=""
            className="w-full"
          />
          {/*
            Placed in percentages, over the hull.

            The cut-out has an alpha channel, so most of this box is the page
            showing through and white type would simply vanish there. The band
            from 5-35% across and 55-80% down is the containers and the hull:
            98% opaque, mean luminance 63. Anchoring in percentages keeps the
            words on that mass as the image scales, which a fixed bottom-left
            offset did not — at this width it put them below the waterline.
          */}
          <p className="absolute left-[7%] top-[54%] z-10 max-w-[12ch] type-section text-studio sm:type-page">
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
