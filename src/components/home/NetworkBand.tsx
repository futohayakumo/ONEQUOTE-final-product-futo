"use client";

import Link from "next/link";
import { ArrowRight } from "../icons/ArrowRight";
import { useT } from "../shell/LocaleProvider";

/**
 * The one dark band, centred, over the night-side network photograph — the
 * comp's fourth section, kept as it was drawn.
 *
 * The button is outlined rather than filled. A crimson fill on a charcoal
 * ground would be the only warm mass on the page and would pull harder than
 * the primary call to action twelve hundred pixels above it.
 */
export function NetworkBand() {
  const t = useT();
  return (
    /*
     * `group` + `overflow-hidden` is the whole trick: the picture scales
     * inside a box that does not, so the band keeps its height and its
     * neighbours never move. Scaling the section itself would reflow the
     * page on a mouse-over.
     */
    <section className="group relative isolate overflow-hidden bg-charcoal">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/banners/03-global-network.png"
        alt=""
        aria-hidden
        className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <div aria-hidden className="absolute inset-0 -z-10 scrim-full" />

      <div className="mx-auto flex max-w-[52rem] flex-col items-center gap-6 px-6 py-24 text-center">
        <h2 className="type-page text-studio">{t("home.net.title")}</h2>
        <p className="max-w-[56ch] type-body text-border">{t("home.net.body")}</p>
        <Link
          href="/engineering"
          className="mt-2 inline-flex items-center gap-3 border border-studio px-7 py-3.5 type-label text-studio rounded-card transition-colors duration-150 hover:bg-studio hover:text-charcoal"
        >
          {t("home.net.cta")}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
