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
      <div className="mx-auto grid max-w-[86rem] items-center gap-12 px-6 py-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,22rem)] lg:gap-16">
        <div style={{ perspective: "1600px" }}>
          <div
            className="overflow-hidden border border-border bg-studio rounded-card shadow-raised transform-gpu"
            style={{
              transform: "rotateY(-14deg) rotateX(3deg) scale(1.02)",
              transformOrigin: "left center",
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
