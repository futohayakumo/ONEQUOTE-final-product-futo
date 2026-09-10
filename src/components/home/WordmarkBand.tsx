"use client";

import { BRAND } from "@/lib/brand";
import { useT } from "../shell/LocaleProvider";
import { Plate } from "../ui/Plate";

/**
 * The closing band: the wordmark across the full width, centred, over a vessel
 * under way in daylight, with one line beneath it.
 *
 * The comp ends this way and it is the right place for a poster — everything
 * that had to be argued has been argued, and the last thing a reader passes is
 * the name. The word is decorative here; the real wordmark is in the nav and
 * the footer, both of which are links, so this one stays out of the
 * accessibility tree rather than being read a third time.
 *
 * The photograph does not exist. `banners/07-terminal-yard.png` was standing in
 * and is the wrong picture twice over: it is a yard rather than open water, it
 * is 935px wide against the ~2800 a full-bleed band wants, and its subject sits
 * hard right where the wordmark needs to run.
 */
export function WordmarkBand() {
  const t = useT();
  return (
    <section className="relative isolate flex min-h-[26rem] items-center overflow-hidden bg-charcoal">
      <Plate
        label="Container vessel under way, open water, bright daylight. Horizon low, sky clear across the top third, subject centre-left."
        spec="2800 × 1000"
        tone="dark"
        align="corner"
        className="absolute inset-0 -z-10"
      />

      <div className="mx-auto w-full max-w-[86rem] px-6 text-center">
        <p aria-hidden className="type-hero text-studio">
          {BRAND.full}
        </p>
        <p className="mt-6 type-overline text-border">{t("home.close.tag")}</p>
      </div>
    </section>
  );
}
