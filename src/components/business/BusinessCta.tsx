"use client";

import Link from "next/link";
import { ArrowRight } from "../icons/ArrowRight";
import { useT } from "../shell/LocaleProvider";

/**
 * Where to go after the invoice, not a poster.
 *
 * This band was a full-bleed terminal yard scrimmed to charcoal, closing a page
 * that is otherwise a working screen. The register change was the problem: a
 * reader who had just been reading a charge table hit an advertisement, and the
 * only thing the band offered was a sentence. It keeps the sentence and spends
 * the space on the three places the page actually leads.
 */
const NEXT = [
  { href: "/engineering", key: "eng", bodyKey: "engBody" },
  { href: "/process", key: "proc", bodyKey: "procBody" },
  { href: "/process/quiz", key: "quiz", bodyKey: "quizBody" },
] as const;

export function BusinessCta() {
  const t = useT();
  return (
    <section className="mt-16 border-t border-border bg-canvas">
      <div className="mx-auto flex max-w-[86rem] flex-col gap-10 px-6 py-16 lg:flex-row lg:gap-20">
        <div className="max-w-[27rem]">
          <p className="type-eyebrow">{t("business.next.title")}</p>
          <h2 className="mt-5 type-page">{t("business.cta.title")}</h2>
          <p className="mt-4 type-body text-muted">{t("business.cta.body")}</p>
        </div>

        <ul className="grid flex-1 gap-4 sm:grid-cols-3">
          {NEXT.map((n) => (
            <li key={n.href}>
              <Link
                href={n.href}
                className="group flex h-full flex-col gap-2 border border-border bg-studio p-5 rounded-card shadow-card transition-shadow duration-150 hover:shadow-raised"
              >
                <span className="type-label">{t(`business.next.${n.key}`)}</span>
                <p className="type-caption">{t(`business.next.${n.bodyKey}`)}</p>
                <span
                  aria-hidden
                  className="mt-auto inline-flex items-center gap-2 pt-3 type-caption text-crimson-ink transition-colors duration-150 group-hover:text-charcoal"
                >
                  <ArrowRight size={14} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
