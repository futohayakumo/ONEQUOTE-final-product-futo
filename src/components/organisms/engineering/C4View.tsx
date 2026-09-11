"use client";

import { useState } from "react";
import { C4_LEVELS, C4_SOURCE } from "@/lib/c4";
import { useT } from "../../providers/LocaleProvider";
import { MermaidDiagram } from "../../molecules/MermaidDiagram";

/**
 * The C4 model, with its definitions quoted rather than paraphrased.
 *
 * The point of a shared notation is that everyone is using the same one, and a
 * paraphrase is a second notation with the same name. So each level carries the
 * source's own words for what it shows, what it is scoped to and who it is for,
 * attributed and linked; the prose beside them is only about how this system
 * fits those definitions.
 *
 * The Mermaid source sits behind a toggle on every diagram. That is not a
 * debugging affordance — it is the argument for text-based diagrams. One that
 * lives next to the code can be reviewed in a pull request; a PNG cannot.
 */
export function C4View() {
  const t = useT();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-10">
      <div className="max-w-[68ch]">
        <h2 className="type-section">{t("c4.title")}</h2>
        <p className="mt-2 type-caption">{t("c4.lede")}</p>

        {/* The hierarchy IS the model; the four diagrams are views of it. */}
        <blockquote className="mt-6 border-l-2 border-crimson pl-5">
          <p className="type-body">{t("c4.hierarchy")}</p>
          <cite className="mt-2 block type-caption not-italic">
            <a
              href={C4_SOURCE}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-crimson"
            >
              {t("c4.quoted")}
            </a>
          </cite>
        </blockquote>
        <p className="mt-4 type-caption">{t("c4.hierarchyNote")}</p>
      </div>

      {C4_LEVELS.map((level) => (
        <article
          key={level.id}
          className="grid gap-6 border-t border-border pt-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-10"
        >
          <div className="flex flex-col gap-4">
            <div>
              <span className="type-eyebrow tnum">{level.no}</span>
              <h3 className="mt-2 type-section">{t(level.titleKey)}</h3>
            </div>

            <blockquote className="border-l-2 border-border pl-4">
              <p className="type-caption text-charcoal">{t(level.quoteKey)}</p>
              <cite className="mt-1.5 block type-caption not-italic">
                {t("c4.quoted")}
              </cite>
            </blockquote>

            <dl className="flex flex-col gap-2">
              {[
                [t("c4.scope"), t(level.scopeKey)],
                [t("c4.audience"), t(level.audienceKey)],
              ].map(([term, value]) => (
                <div key={term} className="flex gap-3">
                  <dt className="w-[5.5rem] shrink-0 type-caption">{term}</dt>
                  <dd className="type-caption text-charcoal">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="type-caption">{t(level.bodyKey)}</p>

            {level.chart ? (
              <button
                type="button"
                onClick={() => setOpen(open === level.id ? null : level.id)}
                className="self-start type-caption text-crimson underline underline-offset-4 transition-colors duration-150 hover:text-charcoal"
              >
                {open === level.id ? t("c4.hideSource") : t("c4.showSource")}
              </button>
            ) : (
              <span className="self-start border border-border px-3 py-1.5 type-caption rounded-full">
                {t("c4.notDrawn")}
              </span>
            )}
          </div>

          {level.chart ? (
            <div className="flex min-w-0 flex-col gap-3">
              <MermaidDiagram chart={level.chart} label={t(level.titleKey)} />
              {open === level.id ? (
                <div className="overflow-hidden border border-charcoal rounded-sharp">
                  <div className="border-b border-muted bg-console px-4 py-2 type-console text-border">
                    {t("c4.source")}
                  </div>
                  <pre tabIndex={0} className="overflow-x-auto bg-console px-4 py-3">
                    <code className="type-console text-border">{level.chart}</code>
                  </pre>
                </div>
              ) : null}
            </div>
          ) : null}
        </article>
      ))}

      <p className="max-w-[76ch] border-t border-border pt-8 type-caption">
        {t("c4.supplementary")}
      </p>
    </section>
  );
}
