"use client";

import { BRAND } from "@/lib/brand";
import { useT } from "../shell/LocaleProvider";

/**
 * The closing band: the wordmark set across the full width of a berth at
 * daylight, with one line under it. The comp ends this way and it is the right
 * place for a poster — everything that had to be argued has been argued, and
 * the last thing a reader passes is the name.
 *
 * The word is decorative here. The real wordmark is in the nav and the footer,
 * both of which are actual links, so this one is hidden from the accessibility
 * tree rather than read out a third time.
 */
export function WordmarkBand() {
  const t = useT();
  return (
    <section className="relative isolate flex min-h-[22rem] items-end overflow-hidden bg-charcoal">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/banners/07-terminal-yard.png"
        alt=""
        aria-hidden
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div aria-hidden className="absolute inset-0 -z-10 scrim-b" />

      <div className="mx-auto w-full max-w-[86rem] px-6 pb-10">
        <p aria-hidden className="type-hero text-studio">
          {BRAND.full}
        </p>
        <p className="mt-4 type-overline text-border">{t("home.close.tag")}</p>
      </div>
    </section>
  );
}
