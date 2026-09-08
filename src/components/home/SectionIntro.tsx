"use client";

import Link from "next/link";
import { ArrowRight } from "../icons/ArrowRight";
import { useT } from "../shell/LocaleProvider";
import { Lines } from "../ui/Lines";

/**
 * The left column of every band on the home page: a number, a two-line
 * heading, an all-caps subtitle, a paragraph, and one link out.
 *
 * It repeats four times with nothing varying but the words, so it is one
 * component rather than four near-copies — the alternative is four places for
 * the rhythm to drift.
 *
 * The `tone="dark"` variant is gone with the two charcoal photo bands it
 * existed for. Every band is now a light ground, which is the point: a page
 * that changes its whole visual language every 800px reads as four posters
 * rather than one document.
 */
export function SectionIntro({
  no,
  titleKey,
  subtitleKey,
  bodyKey,
  href,
  linkKey,
  emphasis = "quiet",
}: {
  no: string;
  titleKey: string;
  subtitleKey: string;
  bodyKey: string;
  href: string;
  linkKey: string;
  /**
   * Only one band per page should carry the accent. Four crimson "See the X →"
   * links of identical weight is four equal exits, which is none.
   */
  emphasis?: "quiet" | "accent";
}) {
  const t = useT();
  return (
    <div className="flex max-w-[27rem] flex-col">
      <span className="type-eyebrow tnum">{no}</span>
      <h2 className="mt-5 type-page">
        <Lines text={t(titleKey)} />
      </h2>
      <p className="mt-3 type-overline text-muted">{t(subtitleKey)}</p>
      <div className="mt-7 type-body text-muted">{t(bodyKey)}</div>
      {/* Crimson as type, not as fill, so it takes the contrast-corrected
          value: #E1127A measures 4.39:1 on canvas and fails. */}
      <Link
        href={href}
        className={`mt-8 inline-flex items-center gap-2.5 type-label underline underline-offset-4 transition-colors duration-150 ${
          emphasis === "accent"
            ? "text-crimson-ink hover:text-charcoal"
            : "text-muted hover:text-charcoal"
        }`}
      >
        {t(linkKey)}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
