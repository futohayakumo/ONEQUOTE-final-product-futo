"use client";

import cn from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { Wordmark } from "../ui/Wordmark";
import { LocalePicker } from "./LocalePicker";
import { useT } from "./LocaleProvider";

const LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/business", key: "nav.business" },
  { href: "/engineering", key: "nav.engineering" },
  { href: "/process", key: "nav.process" },
] as const;

/**
 * v2 had no nav at all: six screens, each with a Back control, on the argument
 * that a linear walkthrough should not offer a way to skip ahead. The comps
 * put a persistent nav on every screen, and they are right for a different
 * reason -- a portfolio is read out of order by people who arrived from a link
 * to one screen, and stranding them there costs more than the tidiness gains.
 */
export function SiteNav() {
  const t = useT();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-studio">
      {/*
        Two rows on a phone, one from `md` up.

        A single flex row of four non-shrinking links plus the wordmark needs
        546px; at 375 it pushed the document 171px wider than the viewport, so
        every full-bleed band on every page stopped short with a gutter running
        down the side and two destinations sat off-screen. `min-w-0` does
        nothing about that — flex items only shrink if their content can.

        A disclosure menu would be the conventional answer and is the wrong one
        for four links: it hides the whole information architecture behind a
        tap to save one row of height.
      */}
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-[86rem] flex-col gap-1 px-6 py-3 md:h-16 md:flex-row md:items-center md:gap-10 md:py-0"
      >
        <Link href="/" className="shrink-0 py-1 md:py-0">
          <Wordmark />
          <span className="sr-only">{BRAND.full} — home</span>
        </Link>

        {/* -mx-6 px-6 so the scroll region bleeds to the viewport edge and the
            first and last links still clear the page gutter. */}
        <ul className="-mx-6 flex items-center gap-7 overflow-x-auto px-6 md:mx-0 md:overflow-visible md:px-0">
          {LINKS.map((link) => {
            // "/" must not match everything; every other route matches its
            // own subtree so the quiz keeps Process lit.
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-11 items-center whitespace-nowrap type-label transition-colors duration-150 md:h-16",
                    active ? "text-charcoal" : "text-muted hover:text-charcoal",
                  )}
                >
                  {t(link.key)}
                  {active ? (
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-crimson"
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-6">
          <span className="hidden type-caption lg:block">{t("nav.tagline")}</span>
          <LocalePicker />
        </div>
      </nav>
    </header>
  );
}
