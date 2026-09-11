"use client";

import { usePathname } from "next/navigation";

/**
 * The closing poster: a vessel alongside in daylight with the wordmark set
 * across the sky, supplied as one image.
 *
 * The lettering is part of the photograph rather than DOM type on top of it.
 * That is the right call for this one element and the wrong call almost
 * everywhere else — it cannot be translated, selected or resized, and it is
 * the reason every other headline on this site is text. Here the word is the
 * picture: it is a full-bleed brand plate at the foot of the page, the name is
 * already in the nav and the footer as real links, and the alternative is
 * fighting a 2000px composition for the exact baseline the artwork already has.
 *
 * Its top edge is dissolved into the footer rather than butted against it, so
 * the sky emerges out of the page instead of starting on a rule.
 *
 * It hangs below the footer, which is where the reference puts it: the columns
 * sit on paper and the plate runs underneath them. That means it lives in the
 * layout rather than in the page, and gates itself on the route — a brand
 * poster under the quotation screen would be an advertisement at the end of a
 * working page, which is the register change this site keeps getting wrong.
 */
export function WordmarkBand() {
  if (usePathname() !== "/") return null;

  return (
    /*
     * Pulled up under the footer rather than stacked below it.
     *
     * The top of the picture is transparent, so the footer's last rows read
     * straight through it and the two do not so much meet as overlap. The
     * negative margin is the whole mechanism: `relative` and a z-index are not
     * needed, because a transparent pixel hides nothing.
     *
     * The section carries NO background of its own. It had `bg-studio`, which
     * is an opaque white fill painted over the footer — so the picture's
     * transparent top revealed that fill rather than the copyright line
     * underneath it, and the overlap did nothing at all.
     */
    <section className="-mt-40 lg:-mt-52">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/banners/08-vessel-wordmark.jpg"
        alt="ONE QUOTE"
        className="w-full object-cover photo-join-t"
      />
    </section>
  );
}
