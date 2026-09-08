"use client";

import cn from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { Wordmark } from "../ui/Wordmark";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/business", label: "Business" },
  { href: "/engineering", label: "Engineering" },
  { href: "/process", label: "Process" },
] as const;

/**
 * v2 had no nav at all: six screens, each with a Back control, on the argument
 * that a linear walkthrough should not offer a way to skip ahead. The comps
 * put a persistent nav on every screen, and they are right for a different
 * reason -- a portfolio is read out of order by people who arrived from a link
 * to one screen, and stranding them there costs more than the tidiness gains.
 */
export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-studio">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-[86rem] items-center gap-10 px-6"
      >
        <Link href="/" className="shrink-0">
          <Wordmark />
          <span className="sr-only">{BRAND.full} — home</span>
        </Link>

        <ul className="flex min-w-0 items-center gap-7">
          {LINKS.map((link) => {
            // "/" must not match everything; every other route matches its
            // own subtree so the quiz keeps Process lit.
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-16 items-center type-label transition-colors duration-150",
                    active ? "text-charcoal" : "text-muted hover:text-charcoal",
                  )}
                >
                  {link.label}
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

        <span className="ml-auto hidden type-caption md:block">
          {BRAND.tagline}
        </span>
      </nav>
    </header>
  );
}
