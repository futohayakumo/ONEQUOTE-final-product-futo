import Link from "next/link";
import { ArrowRight } from "../icons/ArrowRight";

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
  title,
  subtitle,
  body,
  href,
  linkLabel,
  tone = "light",
}: {
  no: string;
  title: React.ReactNode;
  subtitle: string;
  body: React.ReactNode;
  href: string;
  linkLabel: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div className="flex max-w-[27rem] flex-col">
      <span className={`type-eyebrow tnum ${dark ? "text-crimson-lift" : ""}`}>
        {no}
      </span>
      <h2
        className={`mt-5 type-page ${dark ? "text-studio" : "text-charcoal"}`}
      >
        {title}
      </h2>
      <p
        className={`mt-3 type-caption tracking-[0.14em] uppercase ${dark ? "text-border" : ""}`}
      >
        {subtitle}
      </p>
      <div className={`mt-7 type-body ${dark ? "text-border" : "text-muted"}`}>
        {body}
      </div>
      {/* Crimson as type, not as fill, so it takes the contrast-corrected
          pair: #E1127A is 4.39:1 on canvas and 3.88:1 on charcoal. */}
      <Link
        href={href}
        className={`mt-8 inline-flex items-center gap-2.5 type-label transition-colors duration-150 ${
          dark
            ? "text-crimson-lift hover:text-studio"
            : "text-crimson-ink hover:text-charcoal"
        }`}
      >
        {linkLabel}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
