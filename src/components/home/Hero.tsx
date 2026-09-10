"use client";

import { useT } from "../shell/LocaleProvider";

/**
 * Two words, as large as the grid allows, half of the second one crossing onto
 * a berth behind an angled edge.
 *
 * The crossing is done with `mix-blend-mode: difference` on white type, which
 * is the only way to get it in one element: over the white left half the
 * difference of white against white is black, and over the photograph every
 * letter inverts whatever it lands on. Two spans in two colours would need the
 * seam's exact x-position, which moves with the viewport, the font and the
 * language — this needs none of them.
 *
 * The angle is a clip, not a gradient. Below `lg` both are dropped: at 375px a
 * 14-degree cut is a smudge, and there is nothing for the type to invert
 * against.
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
          and at 1920 it fell past the end of PROGRESS. Starting 6rem left of
          centre keeps the cut at the same point in the word at every width.
        */
        className="absolute inset-y-0 right-0 left-[calc(50%-6rem)] hidden lg:block"
        style={{ clipPath: "polygon(16% 0, 100% 0, 100% 100%, 0 100%)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/banners/01-port-vessel-berth.png"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mx-auto max-w-[86rem] px-6 py-16 lg:py-28">
        <h1 className="type-hero text-studio mix-blend-difference">
          <span className="block">{t("home.hero.titleA")}</span>
          <span className="block">{t("home.hero.titleB")}</span>
        </h1>
      </div>

      {/* The phone version of the photograph: a band, not a backdrop, and no
          blend — there is nothing behind the type to invert. */}
      <div className="lg:hidden">
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
