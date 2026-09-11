"use client";

import { useT } from "../shell/LocaleProvider";

/**
 * Two lines, as large as the grid allows, the end of the second one crossing
 * onto a photograph behind an angled edge.
 *
 * The photograph is a quotation on a laptop — the thing the site is about,
 * on the screen it is used on. It replaced a vessel at berth, and the swap
 * took the blend mode with it: `mix-blend-mode: difference` inverted white
 * type against dark water beautifully and inverts it against a white laptop
 * screen into black letters over a cyan button. Charcoal, sitting on the
 * picture, is the version that survives both.
 *
 * The angle is a clip, not a gradient. Below `lg` it is dropped: at 375px a
 * 14-degree cut is a smudge.
 */
export function Hero() {
  const t = useT();
  return (
    <section className="relative isolate overflow-hidden bg-studio">
      <div
        aria-hidden
        /*
          Anchored to the CONTAINER's centre line, not to a fraction of the
          viewport.
          
          `w-[64%]` was viewport-relative while the headline is container-
          relative and its size is capped, so past about 1600px the two drifted
          apart: the seam kept marching right while the words stopped growing,
          and at 1920 it fell past the end of the second line. Starting 6rem left of
          centre keeps the cut at the same point in the word at every width.
        */
        className="absolute inset-y-0 right-0 left-[calc(50%-6rem)] hidden lg:block"
        style={{ clipPath: "polygon(16% 0, 100% 0, 100% 100%, 0 100%)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/banners/09-quote-on-laptop.png"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      <div className="relative mx-auto max-w-[86rem] px-6 py-16 lg:py-28">
        {/*
          Solid charcoal, no blend. `mix-blend-difference` was built for the
          berth photograph, where the second line crossed dark water and came
          out white. This photograph is a laptop, and its screen is white: the
          same blend turned the letters crossing it black and the red button
          under them cyan. The type still crosses the picture — that is the
          composition — but it sits on it now rather than inverting it.
        */}
        <h1 className="type-hero text-charcoal">
          <span className="block">{t("home.hero.titleA")}</span>
          <span className="block">{t("home.hero.titleB")}</span>
        </h1>
      </div>

      {/* The phone version of the photograph: a band, not a backdrop, and no
          blend — there is nothing behind the type to invert. */}
      <div className="lg:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/banners/09-quote-on-laptop.png"
          alt=""
          className="h-56 w-full object-cover"
        />
      </div>
    </section>
  );
}
