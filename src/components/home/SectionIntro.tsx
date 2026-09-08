"use client";

import Link from "next/link";
import { ArrowRight } from "../icons/ArrowRight";
import { useT } from "../shell/LocaleProvider";
import { Lines } from "../ui/Lines";

/**
 * The left column of every band on the home page: a number, a two-line
 * heading, an all-caps English subtitle, a paragraph, and one link out.
 *
 * It repeats four times with nothing varying but the words and the tone, so it
 * is one component rather than four near-copies — the alternative is four
 * places for the rhythm to drift.
 */
export function SectionIntro({
  no,
  titleKey,
  subtitleKey,
  bodyKey,
  href,
  linkKey,
  tone = "light",
  emphasis = "quiet",
}: {
  no: string;
  titleKey: string;
  subtitleKey: string;
  bodyKey: string;
  href: string;
  linkKey: string;
  tone?: "light" | "dark";
  /**
   * Only one band per page should carry the accent. Four crimson "See the X →"
   * links of identical weight is four equal exits, which is none.
   */
  emphasis?: "quiet" | "accent";
}) {
  const t = useT();
  const dark = tone === "dark";
  return (
    <div className="flex max-w-[27rem] flex-col">
      <span className={`type-eyebrow tnum ${dark ? "text-crimson-lift" : ""}`}>
        {no}
      </span>
      <h2
        className={`mt-5 type-page ${dark ? "text-studio" : "text-charcoal"}`}
      >
        <Lines text={t(titleKey)} />
      </h2>
      <p
        className={`mt-3 type-overline ${dark ? "text-border" : "text-muted"}`}
      >
        {t(subtitleKey)}
      </p>
      <div className={`mt-7 type-body ${dark ? "text-border" : "text-muted"}`}>
        {t(bodyKey)}
      </div>
      {/* Crimson as type, not as fill, so it takes the contrast-corrected
          pair: #E1127A is 4.39:1 on canvas and 3.88:1 on charcoal. */}
      <Link
        href={href}
        className={`mt-8 inline-flex items-center gap-2.5 type-label underline underline-offset-4 transition-colors duration-150 ${
          emphasis === "accent"
            ? dark
              ? "text-crimson-lift hover:text-studio"
              : "text-crimson-ink hover:text-charcoal"
            : dark
              ? "text-border hover:text-studio"
              : "text-muted hover:text-charcoal"
        }`}
      >
        {t(linkKey)}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
