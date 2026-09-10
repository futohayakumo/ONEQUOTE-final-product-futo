"use client";

import Link from "next/link";
import { ArrowRight } from "../icons/ArrowRight";
import { useT } from "../shell/LocaleProvider";
import { Lines } from "../ui/Lines";

/**
 * The product, tilted away from the reader — the comp's fifth section, and the
 * one place a screenshot earns its keep.
 *
 * The tilt is a real perspective transform rather than a pre-rendered image:
 * `perspective` on the wrapper and `rotateY` on the panel, so the right edge
 * recedes and the left stays square to the page. Doing it in CSS keeps the
 * screenshot a screenshot — it can be replaced when the screen changes, and it
 * stays sharp on a retina display, which a baked 3D render would not.
 *
 * `transform-gpu` is deliberate. Without it Safari composites the rotated
 * layer on the CPU and the type inside the image goes soft.
 */
export function PlatformBand() {
  const t = useT();
  return (
    <section className="overflow-hidden border-t border-border bg-canvas">
      <div className="mx-auto grid max-w-[86rem] items-center gap-14 px-6 py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-20">
        <div className="lg:pr-8" style={{ perspective: "1800px" }}>
          <div
            className="overflow-hidden border border-border bg-studio rounded-card transform-gpu"
            style={{
              /* The RIGHT edge goes back. Positive rotateY pushes +X away from
                 the viewer; the first pass had this negative and the panel
                 leaned the wrong way, with its far edge nearer than its near
                 one. Origin on the left so the near edge stays put and the
                 column keeps its left alignment with everything above it. */
              transform: "rotateY(24deg)",
              transformOrigin: "left center",
              /*
               * Thickness, as one shadow rather than a second element.
               *
               * The first two stops are a hard edge a few pixels down and
               * right — the slab — and the third is the cast shadow it throws.
               * A real extruded side would need a second rotated face and its
               * own lighting, and would still be wrong the moment the panel
               * animated. This reads as depth at every size and costs nothing.
               */
              boxShadow:
                "2px 3px 0 rgb(203 213 225), 5px 7px 0 rgb(226 232 240), 18px 26px 44px rgb(15 23 42 / 0.16)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/scenes/10-quotation-screen.jpg"
              alt={t("home.platform.title").replace("\n", " ")}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <span aria-hidden className="block h-0.5 w-10 bg-crimson" />
          <h2 className="mt-5 type-page">
            <Lines text={t("home.platform.title")} />
          </h2>
          <p className="mt-4 type-body text-muted">{t("home.platform.body")}</p>
          <Link
            href="/business"
            className="mt-6 inline-flex items-center gap-2.5 type-label text-crimson transition-colors duration-150 hover:text-charcoal"
          >
            {t("home.platform.link")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
