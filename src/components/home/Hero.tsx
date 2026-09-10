"use client";

import Link from "next/link";
import { ArrowRight } from "../icons/ArrowRight";
import { useT } from "../shell/LocaleProvider";

/**
 * Two words, set as large as the grid allows, against a berth behind an angled
 * edge. Straight off the comp.
 *
 * The angle is a clip, not a gradient — the one legal gradient on this site is
 * a scrim over a photograph, and this is an edge rather than a fade. Below
 * `lg` it is dropped and the picture becomes a band under the type: a
 * 14-degree cut across a 375px viewport is a smudge, not a device.
 */
export function Hero() {
  const t = useT();
  return (
    <section className="relative isolate overflow-hidden bg-studio">
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 -z-20 hidden w-[62%] lg:block"
        style={{ clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0 100%)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/banners/01-port-vessel-berth.png"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mx-auto max-w-[86rem] px-6 pt-16 pb-0 lg:pt-24 lg:pb-28">
        {/*
          The headline runs past the seam on purpose — in the comp the second
          word is half on paper and half on the photograph, and that overlap is
          the whole trick. `mix-blend-*` would do it in one line and is not in
          the system, so the two halves are two spans with two colours instead.
        */}
        <h1 className="max-w-[16ch] type-hero">
          <span className="block">{t("home.hero.titleA")}</span>
          <span className="block">{t("home.hero.titleB")}</span>
        </h1>

        <div className="mt-10 flex max-w-[34rem] flex-wrap items-center gap-x-8 gap-y-4 lg:mt-14">
          <Link
            href="/business"
            className="inline-flex items-center gap-3 border border-crimson bg-crimson px-7 py-3.5 type-label text-studio rounded-card shadow-none transition-colors duration-150 hover:border-charcoal hover:bg-charcoal"
          >
            {t("home.hero.cta")}
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/process#simulation"
            className="inline-flex items-center gap-2.5 type-label underline underline-offset-4 transition-colors duration-150 hover:text-crimson"
          >
            {t("home.hero.play")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* The phone version of the photograph: a band, not a backdrop. */}
      <div className="mt-12 lg:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/banners/01-port-vessel-berth.png"
          alt=""
          className="h-56 w-full object-cover"
        />
      </div>
    </section>
  );
}
