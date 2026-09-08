"use client";

import Link from "next/link";
import { Wordmark } from "../ui/Wordmark";
import { useT } from "./LocaleProvider";

const LINKS = [
  { href: "/business", key: "nav.business" },
  { href: "/engineering", key: "nav.engineering" },
  { href: "/process", key: "nav.process" },
] as const;

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="border-t border-border bg-studio">
      <div className="mx-auto flex max-w-[86rem] flex-wrap items-center gap-x-8 gap-y-4 px-6 py-8">
        <Wordmark size="sm" />
        <span className="type-caption">{t("nav.tagline")}</span>
        <ul className="ml-auto flex items-center gap-7">
          {LINKS.map((link) => (
            <li key={link.href}>
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
    </footer>
  );
}
