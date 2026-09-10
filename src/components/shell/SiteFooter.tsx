"use client";

import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { Wordmark } from "../ui/Wordmark";
import { useT } from "./LocaleProvider";

/**
 * Four columns, a mark with one line under it, and a rule of social links —
 * the layout from the reference.
 *
 * The reference's columns are Product / Resources / Company / Legal, which is
 * a company's footer. This is a portfolio: there is no pricing page, no
 * careers page and no terms of service, and columns of dead links are worse
 * than three columns of live ones. The shape is kept and filled with what the
 * site actually contains — the screens, the domain ideas it explains, and how
 * it is built.
 */
const COLUMNS = [
  {
    titleKey: "footer.col.screens",
    links: [
      { href: "/business", key: "footer.quotation" },
      { href: "/engineering", key: "footer.systemMap" },
      { href: "/process", key: "footer.comparison" },
      { href: "/process/quiz", key: "footer.quiz" },
    ],
  },
  {
    titleKey: "footer.col.domain",
    links: [
      { href: "/business", key: "footer.incoterms" },
      { href: "/business", key: "footer.charges" },
      { href: "/business", key: "footer.cutoffs" },
      { href: "/business", key: "footer.loyalty" },
    ],
  },
  {
    titleKey: "footer.col.build",
    links: [
      { href: "/engineering", key: "footer.c4" },
      { href: "/engineering", key: "footer.trace" },
      { href: "/process", key: "footer.evidence" },
      { href: "/process#simulation", key: "footer.simulation" },
    ],
  },
] as const;

/* Drawn rather than imported: five glyphs at 18px do not justify a dependency,
   and an icon set would arrive with its own stroke weight. */
const SOCIAL = [
  { label: "GitHub", d: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 19.9 5a4.9 4.9 0 0 0-.1-3.6s-1.1-.3-3.7 1.4a12.7 12.7 0 0 0-6.6 0C6.9 1.1 5.8 1.4 5.8 1.4A4.9 4.9 0 0 0 5.7 5a5.2 5.2 0 0 0-1.4 3.6c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.6V22" },
  { label: "LinkedIn", d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM6 9H2v12h4zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
  { label: "X", d: "M4 3l7.6 9.9L4.4 21h2.2l6-6.6 5 6.6H20l-8-10.4L19.4 3h-2.2l-5.5 6.1L7.2 3z" },
] as const;

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="border-t border-border bg-studio">
      <div className="mx-auto grid max-w-[86rem] gap-12 px-6 py-16 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-[38ch] type-caption">{t("footer.tagline")}</p>

          <ul className="mt-7 flex items-center gap-5">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <span
                  aria-label={s.label}
                  title={s.label}
                  className="block text-muted transition-colors duration-150 hover:text-charcoal"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d={s.d} />
                  </svg>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-10 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.titleKey}>
              <h2 className="type-label">{t(col.titleKey)}</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="type-caption transition-colors duration-150 hover:text-crimson"
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p className="pb-10 text-center type-caption">
        {t("footer.copyright", { year: BRAND.year, brand: BRAND.full })}
      </p>
    </footer>
  );
}
